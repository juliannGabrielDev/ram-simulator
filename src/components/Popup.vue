<script setup lang="ts">
import { computed } from 'vue';
import BaseButton from './BaseButton.vue';

interface Props {
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  isVisible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info'
});

const emit = defineEmits<{
  close: []
}>();

const bgColorClass = computed(() => {
  switch (props.type) {
    case 'error': return 'bg-red-500';
    case 'warning': return 'bg-yellow-500';
    case 'success': return 'bg-green-500';
    default: return 'bg-blue-500';
  }
});

const iconPath = computed(() => {
  switch (props.type) {
    case 'error': return 'M6 18L18 6M6 6l12 12';
    case 'warning': return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
    case 'success': return 'M5 13l4 4L19 7';
    default: return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
  }
});
</script>

<template>
  <Transition name="popup">
    <div v-if="isVisible" class="popup-overlay" @click="emit('close')">
      <div class="popup-container" @click.stop>
        <div class="popup-header" :class="bgColorClass">
          <svg class="popup-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="iconPath" />
          </svg>
        </div>
        <div class="popup-content">
          <p class="popup-message">{{ message }}</p>
          <BaseButton @click="emit('close')" class="popup-button">OK</BaseButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
@reference 'tailwindcss';

.popup-overlay {
  @apply fixed inset-0 flex items-center justify-center z-50;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.popup-container {
  @apply bg-white rounded-2xl shadow-2xl overflow-hidden;
  max-width: 400px;
  width: 90%;
  animation: popup-bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.popup-header {
  @apply flex items-center justify-center py-4;
}

.popup-icon {
  @apply w-12 h-12 text-white;
}

.popup-content {
  @apply p-6 text-center;
}

.popup-message {
  @apply text-gray-800 text-lg mb-4;
  font-family: var(--font-geist);
}

.popup-button {
  @apply mx-auto;
}

/* Transitions */
.popup-enter-active {
  transition: opacity 0.3s ease;
}

.popup-leave-active {
  transition: opacity 0.2s ease;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
}

.popup-enter-active .popup-container {
  animation: popup-bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.popup-leave-active .popup-container {
  animation: popup-fade 0.2s ease-out;
}

@keyframes popup-bounce {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes popup-fade {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.9);
    opacity: 0;
  }
}
</style>
