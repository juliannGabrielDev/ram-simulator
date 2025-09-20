<script setup lang="ts">
import type { Process } from '../types';

defineProps<{
  installedApps: Process[];
  loadedApps: Process[];
}>();

const emit = defineEmits(['load-app', 'unload-app']);

const loadApp = (app: Process) => {
  emit('load-app', app);
};

const unloadApp = (app: Process) => {
  emit('unload-app', app);
};
</script>

<template>
  <div>
    <h2>Installed Programs</h2>
    <table>
      <thead>
        <tr>
          <th>Process Name</th>
          <th>Size (MB)</th>
          <th>Location</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="app in installedApps" :key="app.name">
          <td>{{ app.name }}</td>
          <td>{{ app.size }}</td>
          <td>{{ app.location }}</td>
          <td>
            <button @click="loadApp(app)">Load</button>
          </td>
        </tr>
      </tbody>
    </table>

    <h2 class="mt-4">Loaded Programs</h2>
    <table>
      <thead>
        <tr>
          <th>Process Name</th>
          <th>Size (MB)</th>
          <th>Location</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="app in loadedApps" :key="app.name">
          <td>{{ app.name }}</td>
          <td>{{ app.size }}</td>
          <td>{{ app.location }}</td>
          <td>
            <button @click="unloadApp(app)">Unload</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

table {
  @apply w-full border-collapse mt-1;
}
th, td {
  @apply border border-gray-400 p-2;
}
th {
  @apply bg-gray-100;
}
button {
  @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded;
}
</style>
