import { ref, computed } from 'vue'
import { ANSWERS } from '../words/answers'
import { VALID_WORDS } from '../words/valid'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LetterState = 'correct' | 'present' | 'absent' | 'empty' | 'tbd'

export interface Tile {
  letter: string
  state: LetterState
  revealed: boolean
}

export interface GameRow {
  tiles: Tile[]
  status: 'idle' | 'invalid' | 'submitted'
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_ATTEMPTS = 6

// ---------------------------------------------------------------------------
// Duplicate-safe letter scoring
// ---------------------------------------------------------------------------
/**
 * Two-pass algorithm — see CLAUDE.md for the full explanation.
 * Length-agnostic: uses guess.length, not a hardcoded constant.
 */
export function scoreGuess(guess: string, answer: string): LetterState[] {
  const n = guess.length
  const result: LetterState[] = Array(n).fill('absent')
  const remaining = answer.split('')

  // Pass 1: greens
  for (let i = 0; i < n; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 'correct'
      remaining[i] = ''
    }
  }

  // Pass 2: yellows
  for (let i = 0; i < n; i++) {
    if (result[i] === 'correct') continue
    const idx = remaining.indexOf(guess[i])
    if (idx !== -1) {
      result[i] = 'present'
      remaining[idx] = ''
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

export function useWordle(initialLength: number = 5) {
  const wordLength = ref(initialLength)

  // Filtered word pools — recomputed whenever wordLength changes
  const answersForLength = computed(() =>
    ANSWERS.filter((w) => w.length === wordLength.value),
  )
  const allValid = computed(
    () =>
      new Set([
        ...answersForLength.value,
        ...VALID_WORDS.filter((w) => w.length === wordLength.value),
      ]),
  )

  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------

  const answer = ref(pickWord(answersForLength.value))
  const rows = ref<GameRow[]>(Array.from({ length: MAX_ATTEMPTS }, () => makeRow(wordLength.value)))
  const currentRow = ref(0)
  const currentInput = ref('')
  const gameOver = ref(false)
  const won = ref(false)
  const keyStates = ref<Record<string, LetterState>>({})

  const isLastRow = computed(() => currentRow.value === MAX_ATTEMPTS - 1)

  // -------------------------------------------------------------------------
  // Input handling
  // -------------------------------------------------------------------------

  function addLetter(letter: string) {
    if (gameOver.value) return
    if (currentInput.value.length >= wordLength.value) return
    currentInput.value += letter.toLowerCase()
    syncInputToRow()
  }

  function removeLetter() {
    if (gameOver.value) return
    currentInput.value = currentInput.value.slice(0, -1)
    syncInputToRow()
  }

  function syncInputToRow() {
    const row = rows.value[currentRow.value]
    for (let i = 0; i < wordLength.value; i++) {
      row.tiles[i].letter = currentInput.value[i] ?? ''
      row.tiles[i].state = currentInput.value[i] ? 'tbd' : 'empty'
    }
  }

  // -------------------------------------------------------------------------
  // Submission
  // -------------------------------------------------------------------------

  async function submitGuess() {
    if (gameOver.value) return
    const guess = currentInput.value

    if (guess.length < wordLength.value) return

    if (!allValid.value.has(guess)) {
      shakeRow(currentRow.value)
      return
    }

    const row = rows.value[currentRow.value]
    const states = scoreGuess(guess, answer.value)

    for (let i = 0; i < wordLength.value; i++) {
      row.tiles[i].state = states[i]
    }
    row.status = 'submitted'

    // Stagger tile reveals
    for (let i = 0; i < wordLength.value; i++) {
      await delay(i * 300)
      row.tiles[i].revealed = true
    }

    // Update keyboard — only upgrade key state, never downgrade
    for (let i = 0; i < wordLength.value; i++) {
      const letter = guess[i]
      const current = keyStates.value[letter]
      const next = states[i]
      if (current !== 'correct' && (current !== 'present' || next === 'correct')) {
        keyStates.value[letter] = next
      }
    }

    if (guess === answer.value) {
      won.value = true
      gameOver.value = true
      return
    }

    if (isLastRow.value) {
      gameOver.value = true
      return
    }

    currentRow.value++
    currentInput.value = ''
  }

  // -------------------------------------------------------------------------
  // Shake animation
  // -------------------------------------------------------------------------

  function shakeRow(rowIndex: number) {
    const row = rows.value[rowIndex]
    row.status = 'invalid'
    setTimeout(() => { row.status = 'idle' }, 650)
  }

  // -------------------------------------------------------------------------
  // Reset & length change
  // -------------------------------------------------------------------------

  function resetGame() {
    const pool = answersForLength.value
    const currentIdx = pool.indexOf(answer.value)
    answer.value = pool[(currentIdx + 1) % pool.length]
    rows.value = Array.from({ length: MAX_ATTEMPTS }, () => makeRow(wordLength.value))
    currentRow.value = 0
    currentInput.value = ''
    gameOver.value = false
    won.value = false
    keyStates.value = {}
  }

  function setWordLength(n: number) {
    wordLength.value = n
    // Pick a fresh answer from the new pool and fully reset state
    answer.value = pickWord(answersForLength.value)
    rows.value = Array.from({ length: MAX_ATTEMPTS }, () => makeRow(n))
    currentRow.value = 0
    currentInput.value = ''
    gameOver.value = false
    won.value = false
    keyStates.value = {}
  }

  return {
    answer,
    rows,
    currentRow,
    currentInput,
    gameOver,
    won,
    keyStates,
    wordLength,
    addLetter,
    removeLetter,
    submitGuess,
    resetGame,
    setWordLength,
    MAX_ATTEMPTS,
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRow(length: number): GameRow {
  return {
    tiles: Array.from({ length }, () => ({ letter: '', state: 'empty', revealed: false })),
    status: 'idle',
  }
}

function pickWord(pool: string[]): string {
  if (pool.length === 0) return 'error'
  const now = new Date()
  const elapsed = Math.floor(
    (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
      new Date('2024-01-01T00:00:00Z').getTime()) /
      86_400_000,
  )
  return pool[Math.abs(elapsed) % pool.length]
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}
