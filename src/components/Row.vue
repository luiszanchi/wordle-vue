<script setup lang="ts">
import type { GameRow } from '../composables/useWordle'
import Tile from './Tile.vue'

defineProps<{
  row: GameRow
  rowIndex: number
}>()
</script>

<template>
  <div
    class="row"
    :class="{ shake: row.status === 'invalid' }"
    role="row"
    :aria-label="`Attempt ${rowIndex + 1}`"
  >
    <Tile
      v-for="(tile, i) in row.tiles"
      :key="i"
      :letter="tile.letter"
      :state="tile.state"
      :revealed="tile.revealed"
      :index="i"
    />
  </div>
</template>

<style scoped>
.row {
  display: flex;
  gap: 5px;
}

/* Shake animation fires when the submitted word is invalid */
.row.shake {
  animation: shake 0.6s ease;
}

@keyframes shake {
  0%,100% { transform: translateX(0);     }
  10%,50%  { transform: translateX(-6px);  }
  30%,70%  { transform: translateX(6px);   }
  90%      { transform: translateX(-3px);  }
}
</style>
