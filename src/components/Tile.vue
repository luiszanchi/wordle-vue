<script setup lang="ts">
import type { LetterState } from '../composables/useWordle'

defineProps<{
  letter: string
  state: LetterState
  /** When true the flip animation plays */
  revealed: boolean
  /** Zero-based column index — drives the stagger delay via CSS var */
  index: number
}>()
</script>

<template>
  <div
    class="tile"
    :class="[state, { flip: revealed, pop: letter && state === 'tbd' }]"
    :style="{ '--tile-index': index }"
    :aria-label="`${letter || 'empty'}, ${state}`"
    role="cell"
  >
    <span aria-hidden="true">{{ letter }}</span>
  </div>
</template>

<style scoped>
.tile {
  /*
    Tile size scales so all tiles fit within the 500 px board at any word length.
    --word-length is set on .board and inherited by every tile.
    Formula: (board_width - gaps) / count, capped at 62 px.
      gaps  = (word-length - 1) * 5px
      board = min(90vw, 492px)  (492 ≈ 500 - 8px padding)
  */
  --_max: calc(
    (min(90vw, 492px) - (var(--word-length, 5) - 1) * 5px) /
    var(--word-length, 5)
  );
  --size: min(var(--_max), 62px);

  width: var(--size);
  height: var(--size);
  border: 2px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1rem, calc(var(--size) * 0.48), 2rem);
  font-weight: 700;
  text-transform: uppercase;
  user-select: none;
  color: var(--color-text);
  background: var(--color-bg);
  transition: border-color 0.05s;
  /* perspective so the 3-D flip looks right */
  perspective: 250px;
  transform-style: preserve-3d;
}

/* Letter entered but row not yet submitted */
.tile.tbd {
  border-color: var(--color-border-tbd);
  animation: pop 0.1s ease;
}

/* ---- Flip reveal --------------------------------------------------------- */
/*
  We use a CSS custom property --tile-index to stagger each tile.
  The composable sets `revealed = true` at staggered JS timeouts so each tile
  flips in sequence, but the CSS handles the actual 3-D animation.
*/
.tile.flip {
  animation: flip 0.55s forwards;
  animation-delay: calc(var(--tile-index, 0) * 0ms); /* JS already staggers — delay = 0 */
}

/* Color states (applied before flip so the back face shows the right colour) */
.tile.correct  { --face-bg: var(--color-correct);  --face-border: var(--color-correct); }
.tile.present  { --face-bg: var(--color-present);  --face-border: var(--color-present); }
.tile.absent   { --face-bg: var(--color-absent);   --face-border: var(--color-absent);  }

.tile.flip.correct,
.tile.flip.present,
.tile.flip.absent {
  color: #fff;
  border-color: var(--face-border);
  background: var(--face-bg);
}

@keyframes flip {
  0%   { transform: rotateX(0);       background: var(--color-bg); border-color: var(--color-border-tbd); color: var(--color-text); animation-timing-function: ease-in;  }
  50%  { transform: rotateX(-90deg);  background: var(--color-bg); border-color: var(--color-border-tbd); color: var(--color-text); animation-timing-function: ease-out; }
  100% { transform: rotateX(0);       background: var(--face-bg);  border-color: var(--face-border);       color: #fff; }
}

@keyframes pop {
  0%   { transform: scale(1);    }
  50%  { transform: scale(1.12); }
  100% { transform: scale(1);    }
}
</style>
