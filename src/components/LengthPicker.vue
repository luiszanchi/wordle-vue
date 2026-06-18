<script setup lang="ts">
defineProps<{ modelValue: number }>()
defineEmits<{ 'update:modelValue': [n: number] }>()

const lengths = [3, 4, 5, 6, 7, 8]
</script>

<template>
  <div class="picker" role="group" aria-label="Choose word length">
    <span class="label" aria-hidden="true">Letters</span>
    <div class="buttons">
      <button
        v-for="n in lengths"
        :key="n"
        class="btn"
        :class="{ active: n === modelValue }"
        :aria-pressed="n === modelValue"
        :aria-label="`${n} letters`"
        @click="$emit('update:modelValue', n); ($event.currentTarget as HTMLElement).blur()"
      >
        {{ n }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.picker {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
}

.label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.buttons {
  display: flex;
  gap: 5px;
}

.btn {
  width: 34px;
  height: 34px;
  border: 2px solid var(--color-border);
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.btn:hover:not(.active) {
  border-color: var(--color-border-tbd);
  color: var(--color-text);
}

.btn.active {
  border-color: var(--color-text);
  background: var(--color-text);
  color: var(--color-bg);
}

.btn:focus-visible {
  outline: 3px solid var(--color-present);
  outline-offset: 2px;
}
</style>
