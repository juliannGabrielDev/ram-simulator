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

const getIconUrl = (iconName: string) => {
  return new URL(`../assets/images/icons/${iconName}`, import.meta.url).href;
};

const translateLocation = (location: 'RAM' | 'Virtual' | 'Inactive') => {
  switch (location) {
    case 'RAM':
      return 'RAM';
    case 'Virtual':
      return 'Virtual';
    case 'Inactive':
      return 'Inactivo';
  }
};

</script>

<template>
  <div>
    <h2>Programas Instalados</h2>
    <table>
      <thead>
        <tr>
          <th>Icono</th>
          <th>Nombre del Proceso</th>
          <th>Tamaño (MB)</th>
          <th>Ubicación</th>
          <th></th>
        </tr>
      </thead>
      <transition-group name="fade" tag="tbody">
        <tr v-for="app in installedApps" :key="app.name">
          <td>
            <img v-if="app.icon" :src="getIconUrl(app.icon)" :alt="app.name" class="w-6 h-6 mx-auto">
          </td>
          <td>{{ app.name }}</td>
          <td>{{ app.size }}</td>
          <td>{{ translateLocation(app.location) }}</td>
          <td>
            <button @click="loadApp(app)">Cargar</button>
          </td>
        </tr>
      </transition-group>
    </table>

    <h2 class="mt-4">Programas Cargados</h2>
    <table class="loaded-apps-table">
      <thead>
        <tr>
          <th>Icono</th>
          <th>Nombre del Proceso</th>
          <th>Tamaño (MB)</th>
          <th>Ubicación</th>
          <th></th>
        </tr>
      </thead>
      <transition-group name="fade" tag="tbody">
        <tr v-for="app in loadedApps" :key="app.name">
          <td>
            <img v-if="app.icon" :src="getIconUrl(app.icon)" :alt="app.name" class="w-6 h-6 mx-auto">
          </td>
          <td>{{ app.name }}</td>
          <td>{{ app.size }}</td>
          <td>{{ translateLocation(app.location) }}</td>
          <td>
            <button @click="unloadApp(app)">Descargar</button>
          </td>
        </tr>
      </transition-group>
    </table>
  </div>
</template>

<style scoped>
@reference "tailwindcss";

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes slide-up-fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

table {
  @apply w-full border-collapse mt-1;
  animation: slide-up-fade-in 0.5s ease-out forwards;
}

.loaded-apps-table {
  animation-delay: 0.2s;
}
th, td {
  @apply border border-gray-400 p-2 text-center;
}
th {
  @apply bg-gray-100;
}
button {
  @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded;
}
</style>
