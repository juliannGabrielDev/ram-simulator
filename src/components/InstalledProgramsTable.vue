<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { gsap } from 'gsap';
import type { Process } from '../types';
import BaseButton from './BaseButton.vue';

const props = defineProps<{ programs: Process[] }>();
const emit = defineEmits<{(e: 'add-program', program: Process): void;}>();

const tbody = ref<HTMLElement | null>(null);
const tableRoot = ref<HTMLElement | null>(null);

const onAddClick = (program: Process) => {
  emit('add-program', program);
};

watch(() => props.programs.length, async () => {
  await nextTick();
  if (tbody.value) {
    const rows = tbody.value.querySelectorAll('tr');
    gsap.from(rows, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      stagger: 0.05,
      ease: "power2.out"
    });
  }
});

defineExpose({
  tableRoot
});
</script>

<template>
  <div class="table-wrapper">
    <table class="col-span-2" ref="tableRoot">
      <thead>
        <tr>
          <th>Program</th>
          <th>Size (MB)</th>
          <th>Priority</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody ref="tbody">
        <tr v-for="program in programs" :key="program.name">
          <td>
            <div class="flex items-center gap-2">
              <img :src="program.icon" :alt="program.name" class="w-6 h-6">
              <span class="whitespace-nowrap">{{ program.name }}</span>
            </div>
          </td>
          <td>{{ program.size }}</td>
          <td>
            <span class="priority-badge" :class="`priority-${program.priority}`">
              {{ program.priority }}
            </span>
          </td>
          <td>
            <BaseButton variant="secondary" @click="onAddClick(program)">Add</BaseButton>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
@reference 'tailwindcss';

.table-wrapper {
  @apply w-full overflow-x-auto;
  -webkit-overflow-scrolling: touch;
}

table {
  @apply w-full rounded-lg overflow-hidden;
  height: fit-content;
  border-collapse: collapse;
  border: 2px solid rgb(156 163 175);
  min-width: 600px;

  @media (min-width: 768px) {
    min-width: auto;
  }
}

th,
td {
  @apply px-2 sm:px-3 py-2 text-left text-sm;
  border-bottom: 2px solid rgb(156 163 175);
  border-right: 2px solid rgb(156 163 175);

  @media (min-width: 640px) {
    @apply text-base;
  }
}

th {
  @apply bg-neutral-100 font-semibold;
  font-family: var(--font-bitcount);
}

th:last-child,
td:last-child {
  border-right: 0;
}

tbody tr:last-child td {
  border-bottom: 0;
}

.priority-badge {
  @apply inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm;
}

.priority-1 {
  @apply bg-red-100 text-red-700;
}

.priority-2 {
  @apply bg-orange-100 text-orange-700;
}

.priority-3 {
  @apply bg-yellow-100 text-yellow-700;
}

.priority-4 {
  @apply bg-blue-100 text-blue-700;
}

.priority-5 {
  @apply bg-green-100 text-green-700;
}
</style>
