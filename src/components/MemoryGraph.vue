<script setup lang="ts">
import type { Process } from '../types';
import GraphSection from './GraphSection.vue';

interface Props {
  title: string;
  programs: Process[];
  totalMemory: number;
  usedMemory: number;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'bg-blue-300'
});

const emit = defineEmits<{
  closeProgram: [program: Process]
}>();

const isFirst = (index: number) => index === 0;
const isLast = (index: number) => index === props.programs.length - 1;
const getRoundedClass = (index: number) => {
  const first = isFirst(index);
  const last = isLast(index);

  if (first && last) {
    return 'rounded-l-[44px] rounded-r-[44px]';
  } else if (first) {
    return 'rounded-l-[44px]';
  } else if (last) {
    return 'rounded-r-[44px]';
  }
  return '';
};

const handleCloseProgram = (program: Process) => {
  emit('closeProgram', program);
};
</script>

<template>
  <div class="memory-graph">
    <h3 class="text-xl font-bitcount mb-2">
      {{ title }}: {{ usedMemory }} / {{ totalMemory }} MB
    </h3>
    <div class="graph w-full h-12 rounded-full bg-neutral-800 p-2 flex gap-2 overflow-visible relative">
      <GraphSection
        v-for="(program, index) in programs"
        :key="program.name"
        :program="program"
        :total-memory="totalMemory"
        :color="color"
        :rounded-class="getRoundedClass(index)"
        @close="handleCloseProgram"
      />
    </div>
  </div>
</template>

<style scoped>
.memory-graph {
  margin-bottom: 1.5rem;
  position: relative;
}

.memory-graph:last-child {
  margin-bottom: 0;
}

.graph {
  overflow: visible !important;
}
</style>
