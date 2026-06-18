<script setup lang="ts">
defineProps<{
  won: boolean
  answer: string
  attempts: number
}>()

const emit = defineEmits<{ playAgain: [] }>()
</script>

<template>
  <Transition name="modal">
    <div
      class="overlay"
      role="dialog"
      aria-modal="true"
      :aria-label="won ? 'You won!' : 'Game over'"
      @click.self="() => {}"
    >
      <div class="modal">
        <h2 class="title">{{ won ? '🎉 Brilliant!' : '😔 Better luck next time' }}</h2>

        <p v-if="won" class="body">
          You got it in
          <strong>{{ attempts }} {{ attempts === 1 ? 'guess' : 'guesses' }}</strong>!
        </p>

        <p class="body">
          The word was
          <span class="answer">{{ answer.toUpperCase() }}</span>
        </p>

        <button
          class="btn-play-again"
          autofocus
          @click="emit('playAgain')"
        >
          Play Again
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: var(--color-modal-bg);
  border-radius: 12px;
  padding: 2rem 2.5rem;
  max-width: 360px;
  width: 90%;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.title {
  font-size: 1.6rem;
  margin: 0 0 1rem;
  color: var(--color-text);
}

.body {
  color: var(--color-text-muted);
  margin: 0 0 0.75rem;
  font-size: 1rem;
}

.answer {
  font-weight: 700;
  font-size: 1.3rem;
  color: var(--color-correct);
  letter-spacing: 0.15em;
}

.btn-play-again {
  margin-top: 1.25rem;
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 6px;
  background: var(--color-correct);
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  letter-spacing: 0.05em;
  transition: filter 0.15s;
}

.btn-play-again:hover,
.btn-play-again:focus-visible {
  filter: brightness(1.12);
  outline: 3px solid var(--color-correct);
  outline-offset: 2px;
}

/* Fade + scale entrance */
.modal-enter-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.modal-leave-active { transition: opacity 0.2s ease,  transform 0.2s ease; }
.modal-enter-from,
.modal-leave-to    { opacity: 0; transform: scale(0.9); }
</style>
