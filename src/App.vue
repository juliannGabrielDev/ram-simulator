<script setup lang="ts">
import ProcessTable from './components/ProcessTable.vue';
import GraphBar from './components/GraphBar.vue';
import { ref, computed } from 'vue';
import type { Process } from './types';

const newAppName = ref('');
const newAppSize = ref<number | null>(null);

const ramSize = 8000; // 8GB in MB
const virtualRamSize = 4000; // 4GB in MB

const installedApps = ref<Process[]>([
  { name: 'Microsoft Word', size: 1200, location: 'Inactive' },
  { name: 'VSCode', size: 1800, location: 'Inactive' },
  { name: 'Google Chrome', size: 1150, location: 'Inactive' },
  { name: 'Spotify', size: 1700, location: 'Inactive' },
  { name: 'Docker Desktop', size: 2500, location: 'Inactive' },
  { name: 'Android Studio', size: 3000, location: 'Inactive' },
  { name: 'VMWare Workstation', size: 2700, location: 'Inactive' },
]);

const loadedApps = ref<Process[]>([]);

const ramUsage = computed(() => {
  return loadedApps.value
    .filter(p => p.location === 'RAM')
    .reduce((total, process) => total + process.size, 0);
});

const virtualRamUsage = computed(() => {
  return loadedApps.value
    .filter(p => p.location === 'Virtual')
    .reduce((total, process) => total + process.size, 0);
});

const ramPercentage = computed(() => {
  return (ramUsage.value / ramSize) * 100;
});

const virtualRamPercentage = computed(() => {
  return (virtualRamUsage.value / virtualRamSize) * 100;
});

const ramStatus = computed(() => {
  const usageGB = (ramUsage.value / 1000).toFixed(1);
  const totalGB = (ramSize / 1000).toFixed(1);
  return `${usageGB} GB / ${totalGB} GB`;
});

const virtualRamStatus = computed(() => {
  const usageGB = (virtualRamUsage.value / 1000).toFixed(1);
  const totalGB = (virtualRamSize / 1000).toFixed(1);
  return `${usageGB} GB / ${totalGB} GB`;
});

const addNewApp = () => {
  if (newAppName.value && newAppSize.value && newAppSize.value > 0) {
    // Check if app with same name already exists
    const existingApp = installedApps.value.find(app => app.name.toLowerCase() === newAppName.value.toLowerCase()) || loadedApps.value.find(app => app.name.toLowerCase() === newAppName.value.toLowerCase());
    if (existingApp) {
      alert('A program with this name already exists.');
      return;
    }

    const newApp: Process = {
      name: newAppName.value,
      size: newAppSize.value,
      location: 'Inactive',
    };
    installedApps.value.push(newApp);
    newAppName.value = '';
    newAppSize.value = null;
  } else {
    alert('Please provide a valid name and size for the new program.');
  }
};

const loadApp = (app: Process) => {
  // Attempt to load directly into RAM if there's space
  if (ramUsage.value + app.size <= ramSize) {
    app.location = 'RAM';
    installedApps.value = installedApps.value.filter(p => p.name !== app.name);
    loadedApps.value.push(app);
    return;
  }

  // Not enough RAM, try to page out processes from RAM to virtual memory
  const ramProcesses = loadedApps.value.filter(p => p.location === 'RAM');
  const processesToTryPaging = [...ramProcesses]; // FIFO order is preserved from loadedApps
  const processesSuccessfullyPaged: Process[] = [];

  for (const processToPage of processesToTryPaging) {
    // Check if there's enough virtual memory for this process
    if (virtualRamUsage.value + processToPage.size <= virtualRamSize) {
      // Move it to virtual memory
      processToPage.location = 'Virtual';
      processesSuccessfullyPaged.push(processToPage);

      // Check if there is enough space for the new app now
      if (ramUsage.value + app.size <= ramSize) {
        // Yes, there is space. Load the app.
        app.location = 'RAM';
        installedApps.value = installedApps.value.filter(p => p.name !== app.name);
        loadedApps.value.push(app);
        return; // Done
      }
    } else {
      // Not enough virtual memory to continue paging.
      // We might have paged some processes already, but still not enough space.
      // Revert the paged processes.
      for (const p of processesSuccessfullyPaged) {
        p.location = 'RAM';
      }
      alert('Not enough virtual memory to make space in RAM.');
      return;
    }
  }

  // If we are here, we have tried paging out all processes in RAM that could fit in virtual memory,
  // but it was still not enough to fit the new app.
  // Revert any changes.
  for (const p of processesSuccessfullyPaged) {
    p.location = 'RAM';
  }
  alert('Not enough RAM to load the program. Tried moving all possible programs to virtual memory.');
};

const unloadApp = (app: Process) => {
  app.location = 'Inactive';
  loadedApps.value = loadedApps.value.filter(p => p.name !== app.name);
  installedApps.value.push(app);
};
</script>

<template>
  <main>
    <h1><span>Ram</span> Simulator</h1>

    <div class="add-app-form my-4 p-4 border rounded-lg shadow-md">
      <h2 class="text-xl font-bold mb-4 text-center">Add New Program</h2>
      <form @submit.prevent="addNewApp" class="flex items-center justify-center gap-4">
        <input type="text" v-model="newAppName" placeholder="Program Name" class="p-2 border rounded w-1/3" required>
        <input type="number" v-model.number="newAppSize" placeholder="Size (MB)" class="p-2 border rounded w-1/4" required min="1">
        <button type="submit" class="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Add Program</button>
      </form>
    </div>
    
    <div class="grid grid-cols-2 gap-4">
      <div class="graphics">
        <div class="flex justify-center items-end gap-4">
          <div class="text-center">
            <h2>RAM (8GB)</h2>
            <p class="text-sm text-gray-600">{{ ramStatus }}</p>
            <GraphBar :percentage="ramPercentage" />
          </div>
          <div class="text-center">
            <h2>Virtual Memory (4GB)</h2>
            <p class="text-sm text-gray-600">{{ virtualRamStatus }}</p>
            <GraphBar :percentage="virtualRamPercentage" />
          </div>
        </div>
      </div>
      <div class="table">
        <ProcessTable
          :installed-apps="installedApps"
          :loaded-apps="loadedApps"
          @load-app="loadApp"
          @unload-app="unloadApp"
        />
      </div>
    </div>
  </main>
</template>

<style scoped>
  @reference "tailwindcss";
  main {
    @apply p-6;
  }
  h1 {
    @apply text-center text-4xl font-bold;

    span {
      @apply bg-gradient-to-r from-blue-600 to-sky-400 text-transparent bg-clip-text;
    }
  }
  .graphics {
    @apply my-4;
  }
</style>
