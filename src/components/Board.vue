<script setup lang="ts">
import type { GameRow } from '../composables/useWordle'
import Row from './Row.vue'

defineProps<{
  rows: GameRow[]
  wordLength: number
}>()
</script>

<template>
  <div
    class="board"
    role="grid"
    aria-label="Wordle board"
    :style="{ '--word-length': wordLength }"
  >
    <Row
      v-for="(row, i) in rows"
      :key="i"
      :row="row"
      :row-index="i"
    />
  </div>
</template>

<style scoped>
.board {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px 0;
}
</style>
