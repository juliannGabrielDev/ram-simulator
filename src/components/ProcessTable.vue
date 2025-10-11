<script setup lang="ts">
// Importa los tipos y componentes necesarios.
import type { Process } from '../types';
import Button from './Button.vue';

// Define las propiedades que el componente espera recibir.
defineProps<{
  installedApps: Process[];
  loadedApps: Process[];
}>();

// Define los eventos que el componente puede emitir.
const emit = defineEmits(['load-app', 'unload-app']);

// Emite el evento 'load-app' para cargar una aplicación.
const loadApp = (app: Process) => {
  emit('load-app', app);
};

// Emite el evento 'unload-app' para descargar una aplicación.
const unloadApp = (app: Process) => {
  emit('unload-app', app);
};

// Construye la URL para el icono de un proceso.
const getIconUrl = (iconName: string) => {
  return new URL(`../assets/images/icons/${iconName}`, import.meta.url).href;
};

// Traduce la ubicación de un proceso a español.
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
    <!-- Tabla de programas instalados -->
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
      <!-- Grupo de transición para animar la lista de aplicaciones instaladas. -->
      <transition-group name="fade" tag="tbody">
        <tr v-for="app in installedApps" :key="app.name">
          <td>
            <img v-if="app.icon" :src="getIconUrl(app.icon)" :alt="app.name" class="w-6 h-6 mx-auto">
          </td>
          <td>{{ app.name }}</td>
          <td>{{ app.size }}</td>
          <td>{{ translateLocation(app.location) }}</td>
          <td>
            <Button @click="loadApp(app)">Cargar</Button>
          </td>
        </tr>
      </transition-group>
    </table>

    <!-- Tabla de programas cargados -->
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
      <!-- Grupo de transición para animar la lista de aplicaciones cargadas. -->
      <transition-group name="fade" tag="tbody">
        <tr v-for="app in loadedApps" :key="app.name">
          <td>
            <img v-if="app.icon" :src="getIconUrl(app.icon)" :alt="app.name" class="w-6 h-6 mx-auto">
          </td>
          <td>{{ app.name }}</td>
          <td>{{ app.size }}</td>
          <td>{{ translateLocation(app.location) }}</td>
          <td>
            <Button @click="unloadApp(app)">Descargar</Button>
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
</style>