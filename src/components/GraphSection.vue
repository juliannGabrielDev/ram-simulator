<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { gsap } from 'gsap';
import type { Process } from '../types';

interface Props {
  program: Process;
  totalMemory: number;
  color?: string;
  roundedClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'bg-blue-300',
  roundedClass: ''
});

const emit = defineEmits<{
  close: [program: Process]
}>();

const widthPercentage = ((props.program.size / props.totalMemory) * 100).toFixed(2);
const sectionRef = ref<HTMLElement | null>(null);
const showTooltip = ref(false);
const tooltipRef = ref<HTMLElement | null>(null);

const handleClose = (event: Event) => {
  event.stopPropagation();
  emit('close', props.program);
};

onMounted(() => {
  if (sectionRef.value) {
    gsap.from(sectionRef.value, {
      width: 0,
      duration: 0.6,
      ease: "power2.out"
    });
  }
});
</script>

<template>
  <div
    ref="sectionRef"
    class="graph__section h-full rounded-[8px] transition-all duration-300 hover:opacity-80 relative cursor-pointer"
    :class="[color, roundedClass]"
    :style="{ width: `${widthPercentage}%` }"
    @mouseenter="showTooltip = true"
    @mouseleave="showTooltip = false"
  >
    <Transition name="tooltip">
      <div
        v-if="showTooltip"
        ref="tooltipRef"
        class="tooltip"
        @click.stop
      >
        <div class="tooltip-content">
          <div class="tooltip-info">
            <p class="tooltip-name">{{ program.name }}</p>
            <p class="tooltip-size">{{ program.size }} MB</p>
          </div>
          <button
            class="tooltip-close"
            @click="handleClose"
            aria-label="Close program"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
@reference 'tailwindcss';

.graph__section {
  min-width: 4px;
}

.tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  pointer-events: auto;
}

.tooltip-content {
  @apply bg-white rounded-lg shadow-lg px-3 py-2 flex items-center gap-3 border border-gray-200;
  min-width: 150px;
  white-space: nowrap;
}

.tooltip-info {
  @apply flex flex-col gap-0.5;
}

.tooltip-name {
  @apply text-sm font-semibold text-gray-800;
  font-family: var(--font-bitcount);
}

.tooltip-size {
  @apply text-xs text-gray-600;
}

.tooltip-close {
  @apply flex items-center justify-center w-6 h-6 rounded-full hover:bg-red-100 text-gray-600 hover:text-red-600 transition-colors ml-auto;
}

/* Tooltip arrow */
.tooltip::after {
  content: '';
  @apply absolute top-full left-1/2 transform -translate-x-1/2;
  border: 6px solid transparent;
  border-top-color: white;
}

/* Transitions */
.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-5px);
}

.tooltip-enter-to,
.tooltip-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style>
