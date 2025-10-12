<script setup lang="ts">
// Importa los componentes y utilidades necesarios de Vue y otros archivos.
import ProcessTable from './components/ProcessTable.vue';
import GraphBar from './components/GraphBar.vue';
import Button from './components/Button.vue';
import { ref, computed } from 'vue';
import type { Process } from './types';

// Define variables reactivas para el nombre y tamaño de la nueva aplicación.
const newAppName = ref('');
const newAppSize = ref<number | null>(null);

// Define el tamaño de la RAM y la RAM virtual en MB.
const ramSize = 8000; // 8GB en MB
const virtualRamSize = 4000; // 4GB en MB

// Define una lista reactiva de aplicaciones instaladas con datos de ejemplo.
const installedApps = ref<Process[]>([
  { name: 'Microsoft Word', size: 1200, location: 'Inactive', icon: 'ms-word.svg' },
  { name: 'VSCode', size: 1800, location: 'Inactive', icon: 'visual-studio-code.svg' },
  { name: 'Google Chrome', size: 1150, location: 'Inactive', icon: 'google-chrome.svg' },
  { name: 'Spotify', size: 1700, location: 'Inactive', icon: 'spotify-client.svg' },
  { name: 'Docker Desktop', size: 2500, location: 'Inactive', icon: 'docker.svg' },
  { name: 'Android Studio', size: 3000, location: 'Inactive', icon: 'android-studio.svg' },
  { name: 'VMWare Workstation', size: 2700, location: 'Inactive', icon: 'vmware-workstation.svg' },
]);

// Define una lista reactiva para las aplicaciones cargadas en memoria.
const loadedApps = ref<Process[]>([]);

// Calcula el uso actual de la RAM sumando el tamaño de las aplicaciones en la RAM.
const ramUsage = computed(() => {
  return loadedApps.value
    .filter(p => p.location === 'RAM')
    .reduce((total, process) => total + process.size, 0);
});

// Calcula el uso actual de la RAM virtual sumando el tamaño de las aplicaciones en la memoria virtual.
const virtualRamUsage = computed(() => {
  return loadedApps.value
    .filter(p => p.location === 'Virtual')
    .reduce((total, process) => total + process.size, 0);
});

// Obtiene una lista de los procesos que se encuentran actualmente en la RAM.
const ramProcesses = computed(() => {
  return loadedApps.value.filter(p => p.location === 'RAM');
});

// Obtiene una lista de los procesos que se encuentran actualmente en la memoria virtual.
const virtualRamProcesses = computed(() => {
  return loadedApps.value.filter(p => p.location === 'Virtual');
});

// Calcula el estado de la RAM en formato "GB usados / GB totales".
const ramStatus = computed(() => {
  const usageGB = (ramUsage.value / 1000).toFixed(1);
  const totalGB = (ramSize / 1000).toFixed(1);
  return `${usageGB} GB / ${totalGB} GB`;
});

// Calcula el estado de la memoria virtual en formato "GB usados / GB totales".
const virtualRamStatus = computed(() => {
  const usageGB = (virtualRamUsage.value / 1000).toFixed(1);
  const totalGB = (virtualRamSize / 1000).toFixed(1);
  return `${usageGB} GB / ${totalGB} GB`;
});

// Función para añadir una nueva aplicación a la lista de aplicaciones instaladas.
const addNewApp = () => {
  if (newAppName.value && newAppSize.value && newAppSize.value > 0) {
    // Comprueba si ya existe una aplicación con el mismo nombre.
    const existingApp = installedApps.value.find(app => app.name.toLowerCase() === newAppName.value.toLowerCase()) || loadedApps.value.find(app => app.name.toLowerCase() === newAppName.value.toLowerCase());
    if (existingApp) {
      alert('Ya existe un programa con este nombre.');
      return;
    }

    // Crea el nuevo objeto de proceso para la aplicación.
    const newApp: Process = {
      name: newAppName.value,
      size: newAppSize.value,
      location: 'Inactive',
      icon: 'generic-program.svg',
    };
    // Añade la nueva aplicación a la lista de instaladas y resetea los campos del formulario.
    installedApps.value.push(newApp);
    newAppName.value = '';
    newAppSize.value = null;
  } else {
    alert('Por favor, introduce un nombre y tamaño válidos para el nuevo programa.');
  }
};

// Función para cargar una aplicación en la memoria.
const loadApp = (app: Process) => {
  // Intenta cargar la aplicación directamente en la RAM si hay espacio.
  if (ramUsage.value + app.size <= ramSize) {
    app.location = 'RAM';
    installedApps.value = installedApps.value.filter(p => p.name !== app.name);
    loadedApps.value.push(app);
    return;
  }

  // Si no hay suficiente RAM, intenta paginar procesos de la RAM a la memoria virtual.
  const ramProcesses = loadedApps.value.filter(p => p.location === 'RAM');
  const processesToTryPaging = [...ramProcesses]; // El orden FIFO se preserva de loadedApps.
  const processesSuccessfullyPaged: Process[] = [];

  for (const processToPage of processesToTryPaging) {
    // Comprueba si hay suficiente memoria virtual para este proceso.
    if (virtualRamUsage.value + processToPage.size <= virtualRamSize) {
      // Mueve el proceso a la memoria virtual.
      processToPage.location = 'Virtual';
      processesSuccessfullyPaged.push(processToPage);

      // Comprueba si ahora hay suficiente espacio para la nueva aplicación.
      if (ramUsage.value + app.size <= ramSize) {
        // Sí, hay espacio. Carga la aplicación.
        app.location = 'RAM';
        installedApps.value = installedApps.value.filter(p => p.name !== app.name);
        loadedApps.value.push(app);
        return; // Terminado.
      }
    } else {
      // No hay suficiente memoria virtual para continuar paginando.
      // Es posible que ya se hayan paginado algunos procesos, pero aún no hay espacio suficiente.
      // Revierte los procesos paginados.
      for (const p of processesSuccessfullyPaged) {
        p.location = 'RAM';
      }
      alert('No hay suficiente memoria virtual para hacer espacio en la RAM.');
      return;
    }
  }

  // Si llegamos aquí, hemos intentado paginar todos los procesos en la RAM que cabían en la memoria virtual,
  // pero aún no fue suficiente para la nueva aplicación.
  // Revierte cualquier cambio.
  for (const p of processesSuccessfullyPaged) {
    p.location = 'RAM';
  }
  alert('No hay suficiente RAM para cargar el programa. Se intentó mover todos los programas posibles a la memoria virtual.');
};

// Función para descargar una aplicación de la memoria.
const unloadApp = (app: Process) => {
  app.location = 'Inactive';
  loadedApps.value = loadedApps.value.filter(p => p.name !== app.name);
  installedApps.value.push(app);
};
</script>

<template>
  <main>
    <h1 class="font-anton">Simulador de <span>Ram</span></h1>

    <div class="add-app-form my-4 p-4 border rounded-lg shadow-md">
      <h2 class="text-xl font-bold mb-4 text-center">Añadir Nuevo Programa</h2>
      <form @submit.prevent="addNewApp" class="flex items-center justify-center gap-4">
        <input type="text" v-model="newAppName" placeholder="Nombre del Programa" class="p-2 border rounded w-1/3" required>
        <input type="number" v-model.number="newAppSize" placeholder="Tamaño (MB)" class="p-2 border rounded w-1/4" required min="1">
        <Button type="submit">Añadir</Button>
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
    @apply text-center text-5xl font-bold;
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