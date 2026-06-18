# Wordle (Vue 3)

A faithful Wordle clone built with Vue 3 Composition API and Vite. Portfolio piece.

## Features

- 6×5 guess grid with 3-D tile-flip animations (staggered per letter)
- Shake animation on invalid words
- On-screen virtual keyboard + physical keyboard support
- Correct duplicate-letter scoring (a letter won't show yellow more times than it appears in the answer)
- Win/loss modal with "Play Again"
- Responsive — works on mobile and desktop
- Accessible: ARIA roles on grid, tiles, and keyboard keys

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build for production

```bash
npm run build
npm run preview
```

## Project structure

```
src/
├── composables/
│   └── useWordle.ts        # All game state and logic (ref/reactive, no store needed)
├── components/
│   ├── Board.vue           # 6-row grid container
│   ├── Row.vue             # One guess row + shake animation
│   ├── Tile.vue            # Single letter tile + flip animation
│   ├── Keyboard.vue        # On-screen keyboard
│   └── Modal.vue           # Win/loss overlay
├── words/
│   ├── answers.ts          # ~500 curated answer words (swap for full 2309-word NYT list)
│   └── valid.ts            # Extended valid-guess list (swap for full ~12 000-word list)
├── App.vue                 # Root — wires composable → components, physical keyboard listener
├── main.ts                 # Vue app mount
└── style.css               # Global reset + CSS design tokens
```

## Swapping in the full word lists

The sample lists in `src/words/` are intentionally small so the repo stays
readable. Before shipping, replace the arrays with the full lists:

- **answers.ts** — 2309 words from the original NYT Wordle puzzle list
- **valid.ts**   — ~12 000 accepted guesses from the same source

Both lists are freely available in public repositories. Keep them as plain
`export const ANSWERS: string[]` / `export const VALID_WORDS: string[]` arrays
and everything else will work without changes.

## Daily word logic

The answer is chosen deterministically from the `ANSWERS` list by counting days
elapsed since `EPOCH_DATE` in `useWordle.ts`. Change that constant to your
intended launch date so day 0 starts with the first word in your list.

## Duplicate-letter scoring

The tricky part of Wordle: a letter must not be awarded yellow more times than
it appears in the answer. The algorithm in `scoreGuess()` (composable) does
two passes:

1. **Green pass** — mark exact matches and remove those positions from the pool.
2. **Yellow pass** — for each remaining tile, scan the pool left-to-right;
   consume the first match found (yellow), or mark absent if none.

This mirrors the original game's behaviour exactly.
