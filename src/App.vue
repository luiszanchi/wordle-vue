<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import Board from './components/Board.vue'
import Keyboard from './components/Keyboard.vue'
import Modal from './components/Modal.vue'
import LengthPicker from './components/LengthPicker.vue'
import { useWordle } from './composables/useWordle'

const {
  answer,
  rows,
  currentRow,
  won,
  gameOver,
  keyStates,
  wordLength,
  addLetter,
  removeLetter,
  submitGuess,
  resetGame,
  setWordLength,
} = useWordle()

const attemptsUsed = computed(() => currentRow.value + (gameOver.value ? 1 : 0))

// -------------------------------------------------------------------------
// Physical keyboard listener
// -------------------------------------------------------------------------
function onKeydown(e: KeyboardEvent) {
  if (e.ctrlKey || e.metaKey || e.altKey) return
  if (e.key === 'Enter') submitGuess()
  else if (e.key === 'Backspace') removeLetter()
  else if (/^[a-zA-Z]$/.test(e.key)) addLetter(e.key)
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="app">
    <!-- ── Header ──────────────────────────────────────────────── -->
    <header class="header" role="banner">
      <h1 class="header__title">Wordle</h1>
    </header>

    <!-- ── Length picker ─────────────────────────────────────── -->
    <div class="picker-bar">
      <LengthPicker
        :model-value="wordLength"
        @update:model-value="setWordLength"
      />
    </div>

    <main class="main" role="main">
      <!-- ── Board ──────────────────────────────────────────────── -->
      <Board :rows="rows" :word-length="wordLength" />

      <!-- ── Keyboard ───────────────────────────────────────────── -->
      <Keyboard
        :key-states="keyStates"
        @letter="addLetter"
        @enter="submitGuess"
        @backspace="removeLetter"
      />
    </main>

    <!-- ── Win / Loss modal ───────────────────────────────────── -->
    <Modal
      v-if="gameOver"
      :won="won"
      :answer="answer"
      :attempts="attemptsUsed"
      @play-again="resetGame"
    />
  </div>
</template>

<style scoped>
.app {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  width: 100%;
  max-width: 500px;
  border-bottom: 1px solid var(--color-border);
  padding: 0 1rem;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header__title {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-text);
  margin: 0;
}

.picker-bar {
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: center;
  padding: 8px 1rem 4px;
  border-bottom: 1px solid var(--color-border);
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: clamp(0.25rem, 1.5dvh, 1rem) 0 clamp(0.25rem, 1.5dvh, 1.5rem);
  width: 100%;
  gap: clamp(0.25rem, 1dvh, 1rem);
  overflow: hidden;
  min-height: 0;
}
</style>
