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
  gap: 6px;
}

.key {
  height: 58px;
  min-width: 43px;
  border: none;
  border-radius: 4px;
  background: var(--color-key-bg);
  color: var(--color-key-text);
  font-size: 0.85rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  max-width: 50px;
  transition: background 0.2s, color 0.2s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.key--wide {
  min-width: 65px;
  max-width: 65px;
  font-size: 0.75rem;
}

.key:active {
  filter: brightness(0.9);
}

/* Colour states — same palette as tiles */
.key.correct { background: var(--color-correct); color: #fff; }
.key.present { background: var(--color-present); color: #fff; }
.key.absent  { background: var(--color-absent);  color: #fff; }

@media (max-width: 380px) {
  .key { min-width: 30px; font-size: 0.75rem; height: 50px; }
  .key--wide { min-width: 50px; max-width: 50px; }
}
</style>
