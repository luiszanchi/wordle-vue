# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start Vite dev server at http://localhost:5173
npm run build     # tsc type-check + Vite production bundle → dist/
npm run preview   # serve the dist/ bundle locally
npx tsc --noEmit  # type-check without emitting (no separate lint script)
```

There are no tests. TypeScript strict mode (`noUnusedLocals`, `noUnusedParameters`) is the primary correctness gate — run `npx tsc --noEmit` before committing.

## Architecture

All game logic lives in a single composable: **`src/composables/useWordle.ts`**. Components are purely presentational — they receive props and emit events; they hold no state of their own. `App.vue` is the only file that calls `useWordle` and wires the returned refs/functions down to child components.

```
useWordle(initialLength?)
  ├─ rows: GameRow[]          → Board → Row → Tile
  ├─ keyStates: Record<…>     → Keyboard
  ├─ wordLength: Ref<number>  → Board (:word-length) + LengthPicker (v-model)
  ├─ gameOver / won           → Modal (v-if)
  ├─ addLetter / removeLetter → Keyboard (@letter / @backspace)
  ├─ submitGuess / resetGame  → Keyboard (@enter) / Modal (@play-again)
  └─ setWordLength(n)         → LengthPicker (@update:modelValue)
```

See `docs/component-tree.mmd` for the component hierarchy and `docs/data-flow.mmd` for the full data-flow graph.

## Key invariants to preserve

### Duplicate-letter scoring (`scoreGuess`)
Two-pass algorithm — **green first, then yellow**. Pass 1 marks exact matches and consumes those answer-letter slots. Pass 2 scans the remaining (unconsumed) answer letters for yellows. This guarantees a letter is never awarded more yellows than its count in the answer. Do not simplify this to a single pass. The function is length-agnostic — it uses `guess.length`, not a hardcoded constant. See `docs/score-guess.mmd` for a flowchart.

### Animation stagger
`submitGuess` is `async`. It sets all tile `state` values at once (synchronously), then loops `await delay(i * 300)` to flip `tile.revealed = true` one tile at a time. The CSS `@keyframes flip` reads the already-set state on the back face. **Never move the colour state assignment inside the staggered loop** — the tile needs to know its final colour before it starts rotating.

### Key-state upgrade rule
`keyStates` in the composable only moves forward: `empty → absent → present → correct`. A key already green is never downgraded by a later guess. This is enforced in the `submitGuess` loop — preserve this logic when editing that section.

### Word length change
`setWordLength(n)` in the composable changes `wordLength`, picks a fresh answer from the filtered pool, and fully resets all game state. Components re-render automatically because everything derives from the same refs. Do not call `resetGame` separately after `setWordLength` — it would pick the wrong word from the wrong pool.

### Daily word selection
`pickWord(pool)` counts days elapsed since `2024-01-01` and indexes into the filtered pool for the current length. "Play Again" calls `resetGame`, which cycles to the next word in that same pool.

## Word lists

Both `src/words/answers.ts` and `src/words/valid.ts` export a **single flat array** containing words of all supported lengths (3–8). `useWordle` filters each list to the active `wordLength` via `computed`. Do not split into per-length files — the flat array + runtime filter is the intended pattern.

To ship: replace the arrays with complete word lists; the shape (`export const X: string[]`) must stay the same.

## Tile sizing

Tile size is computed entirely in CSS using two custom properties:
- `--word-length` — set as an inline style on `.board`, inherited by all `.tile` descendants
- `--size` — derived in `Tile.vue` as `min(62px, (board_width - gaps) / word_length)`

Never hardcode tile dimensions for a specific word length. Adjust the formula in `Tile.vue` if the board max-width changes.

## Styling

All colour tokens are CSS custom properties on `:root` in `src/style.css`. The game is always dark-themed (no system-preference toggle). Component styles are scoped. There is no external UI library — do not add one.

## Diagrams

- `docs/component-tree.mmd` — component hierarchy
- `docs/data-flow.mmd` — state flow from composable to components
- `docs/score-guess.mmd` — duplicate-safe scoring algorithm
