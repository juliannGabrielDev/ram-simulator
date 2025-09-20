<template>
  <div class="graph-bar-container">
    <div class="graph-bar" :style="{ height: percentage + '%' }"></div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  percentage: {
    type: Number,
    required: true,
  },
});
</script>

<style scoped>
.graph-bar-container {
  width: 60px;
  height: 300px;
  background-color: #e0e0e0;
  border-radius: 5px;
  display: flex;
  align-items: flex-end;
  margin: 0 auto; /* Center the bar */
}

.graph-bar {
  width: 100%;
  background-color: #4caf50;
  border-radius: 5px;
  transition: height 0.5s ease-in-out;
}
</style>
