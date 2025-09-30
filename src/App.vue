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
  { name: 'Microsoft Word', size: 1200, location: 'Inactive', icon: 'ms-word.svg' },
  { name: 'VSCode', size: 1800, location: 'Inactive', icon: 'visual-studio-code.svg' },
  { name: 'Google Chrome', size: 1150, location: 'Inactive', icon: 'google-chrome.svg' },
  { name: 'Spotify', size: 1700, location: 'Inactive', icon: 'spotify-client.svg' },
  { name: 'Docker Desktop', size: 2500, location: 'Inactive', icon: 'docker.svg' },
  { name: 'Android Studio', size: 3000, location: 'Inactive', icon: 'android-studio.svg' },
  { name: 'VMWare Workstation', size: 2700, location: 'Inactive', icon: 'vmware-workstation.svg' },
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

const ramProcesses = computed(() => {
  return loadedApps.value.filter(p => p.location === 'RAM');
});

const virtualRamProcesses = computed(() => {
  return loadedApps.value.filter(p => p.location === 'Virtual');
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
      alert('Ya existe un programa con este nombre.');
      return;
    }

    const newApp: Process = {
      name: newAppName.value,
      size: newAppSize.value,
      location: 'Inactive',
      icon: 'generic-program.svg',
    };
    installedApps.value.push(newApp);
    newAppName.value = '';
    newAppSize.value = null;
  } else {
    alert('Por favor, introduce un nombre y tamaño válidos para el nuevo programa.');
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
      alert('No hay suficiente memoria virtual para hacer espacio en la RAM.');
      return;
    }
  }

  // If we are here, we have tried paging out all processes in RAM that could fit in virtual memory,
  // but it was still not enough to fit the new app.
  // Revert any changes.
  for (const p of processesSuccessfullyPaged) {
    p.location = 'RAM';
  }
  alert('No hay suficiente RAM para cargar el programa. Se intentó mover todos los programas posibles a la memoria virtual.');
};

const unloadApp = (app: Process) => {
  app.location = 'Inactive';
  loadedApps.value = loadedApps.value.filter(p => p.name !== app.name);
  installedApps.value.push(app);
};
</script>

<template>
  <main>
    <h1>Simulador de <span>Ram</span></h1>

    <div class="add-app-form my-4 p-4 border rounded-lg shadow-md">
      <h2 class="text-xl font-bold mb-4 text-center">Añadir Nuevo Programa</h2>
      <form @submit.prevent="addNewApp" class="flex items-center justify-center gap-4">
        <input type="text" v-model="newAppName" placeholder="Nombre del Programa" class="p-2 border rounded w-1/3" required>
        <input type="number" v-model.number="newAppSize" placeholder="Tamaño (MB)" class="p-2 border rounded w-1/4" required min="1">
        <button type="submit" class="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Añadir Programa</button>
      </form>
    </div>
    
    <div class="grid grid-cols-2 gap-4">
      <div class="graphics">
        <div class="flex justify-center items-end gap-4">
          <div class="text-center">
            <h2>RAM (8GB)</h2>
            <p class="text-sm text-gray-600">{{ ramStatus }}</p>
            <GraphBar :processes="ramProcesses" :total-size="ramSize" />
          </div>
          <div class="text-center">
            <h2>Memoria Virtual (4GB)</h2>
            <p class="text-sm text-gray-600">{{ virtualRamStatus }}</p>
            <GraphBar :processes="virtualRamProcesses" :total-size="virtualRamSize" />
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
    animation: pulse 2s infinite;

    span {
      @apply bg-gradient-to-r from-blue-600 to-sky-400 text-transparent bg-clip-text;
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.9;
    }
  }
  .graphics {
    @apply my-4;
  }
</style>
