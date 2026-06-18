<script setup lang="ts">
import type { LetterState } from '../composables/useWordle'

const props = defineProps<{
  keyStates: Record<string, LetterState>
}>()

const emit = defineEmits<{
  letter: [key: string]
  enter: []
  backspace: []
}>()

const rows = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['Enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '⌫'],
]

function press(key: string) {
  if (key === 'Enter') emit('enter')
  else if (key === '⌫') emit('backspace')
  else emit('letter', key)
}

function stateFor(key: string): LetterState {
  return props.keyStates[key] ?? 'empty'
}
</script>

<template>
  <div class="keyboard" role="group" aria-label="On-screen keyboard">
    <div v-for="(row, ri) in rows" :key="ri" class="keyboard-row">
      <button
        v-for="key in row"
        :key="key"
        class="key"
        :class="[key.length > 1 ? 'key--wide' : '', stateFor(key)]"
        :aria-label="key === '⌫' ? 'Backspace' : key === 'Enter' ? 'Enter' : `Letter ${key.toUpperCase()}`"
        :aria-pressed="false"
        @click="press(key)"
      >
        {{ key.toUpperCase() }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.keyboard {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 500px;
  padding: 0 8px;
}

.keyboard-row {
  display: flex;
  justify-content: center;
  gap: clamp(4px, 1.2vw, 6px);
}

.key {
  /* Width: flex:1 + min-width:0 lets the browser divide available space evenly
     across all 10 keys in a row, so the keyboard never overflows the viewport. */
  flex: 1;
  min-width: 0;
  height: clamp(44px, 6.5dvh, 58px);
  border: none;
  border-radius: 4px;
  background: var(--color-key-bg);
  color: var(--color-key-text);
  font-size: clamp(0.65rem, 2vw, 0.85rem);
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* Enter and ⌫ take 1.5× the flex share of a regular key */
.key--wide {
  flex: 1.5;
  font-size: clamp(0.6rem, 1.8vw, 0.75rem);
}

.key:active {
  filter: brightness(0.9);
}

/* Colour states — same palette as tiles */
.key.correct { background: var(--color-correct); color: #fff; }
.key.present { background: var(--color-present); color: #fff; }
.key.absent  { background: var(--color-absent);  color: #fff; }
</style>
