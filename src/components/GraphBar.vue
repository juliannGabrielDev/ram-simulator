<template>
  <div class="graph-bar-container" :class="{ mounted: isMounted }">
    <div class="free-space" :style="{ height: freeSpacePercentage + '%' }"></div>
    <div v-for="(process, index) in processes"
         :key="process.name"
         class="process-segment"
         :style="{ height: getSegmentHeight(process), backgroundColor: getColor(index) }"
         :title="`${process.name} (${process.size} MB)`">
      <img v-if="process.icon && (process.size / totalSize * 300) > 30"
           :src="getIconUrl(process.icon)"
           :alt="process.name"
           class="icon" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Process } from '../types';
import { defineProps, computed, type PropType, onMounted, ref } from 'vue';

const props = defineProps({
  processes: {
    type: Array as PropType<Process[]>,
    required: true,
  },
  totalSize: {
    type: Number,
    required: true,
  },
});

const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
});

const colors = ['#4caf50', '#f44336', '#2196f3', '#ff9800', '#9c27b0', '#009688', '#e91e63', '#673ab7', '#ffeb3b', '#cddc39'];

const getColor = (index: number) => {
  return colors[index % colors.length];
};

const getSegmentHeight = (process: Process) => {
  if (props.totalSize === 0) return '0%';
  const percentage = (process.size / props.totalSize) * 100;
  return `${percentage}%`;
};

const usedSize = computed(() => {
  return props.processes.reduce((total, process) => total + process.size, 0);
});

const freeSpacePercentage = computed(() => {
  if (props.totalSize === 0) return 100;
  const percentage = ((props.totalSize - usedSize.value) / props.totalSize) * 100;
  return Math.max(0, percentage); // Ensure it's not negative
});

const getIconUrl = (iconName: string) => {
  return new URL(`../assets/images/icons/${iconName}`, import.meta.url).href;
};

</script>

<style scoped>
.graph-bar-container {
  width: 60px;
  height: 300px;
  background-color: #e0e0e0;
  border-radius: 5px;
  display: flex;
  flex-direction: column; /* stack items vertically */
  overflow: hidden;
  margin: 0 auto; /* Center the bar */
}

@keyframes grow-up {
  from {
    transform: scaleY(0);
    transform-origin: bottom;
  }
  to {
    transform: scaleY(1);
    transform-origin: bottom;
  }
}

.process-segment {
  width: 100%;
  transition: height 0.5s ease-in-out;
  border-top: 1px solid #fff; /* Add a separator between segments */
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.mounted .process-segment {
  animation: grow-up 0.5s ease-in-out forwards;
}

.free-space {
  width: 100%;
  background-color: transparent;
}

.icon {
  width: 24px;
  height: 24px;
  opacity: 0.8;
}
</style>