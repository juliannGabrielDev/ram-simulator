<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'danger';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
});

// Common classes for all buttons: transitions, font, and border-radius
const commonClasses = 'cursor-pointer transition-all active:scale-95 ease-in-out duration-300 font-bitcount rounded-full';

const buttonClass = computed(() => {
  let variantClass = '';
  switch (props.variant) {
    case 'secondary':
      // Blue, smaller padding for tables
      variantClass = 'bg-neutral-900 hover:bg-blue-500 text-white py-1 px-3';
      break;
    case 'danger':
      // Red, smaller padding for tables
      variantClass = 'bg-neutral-900 hover:bg-red-700 text-white py-1 px-3';
      break;
    case 'primary':
    default:
      // Black, larger padding for main CTA
      variantClass = 'bg-neutral-900 hover:bg-neutral-800 text-white py-2 px-6';
      break;
  }
  // Combine common styles with variant-specific styles
  return `${commonClasses} ${variantClass}`;
});
</script>

<template>
  <button :class="buttonClass">
    <slot></slot>
  </button>
</template>

<style scoped>
@reference 'tailwindcss';
</style>
