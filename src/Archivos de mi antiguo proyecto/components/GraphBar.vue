<template>
  <!-- Contenedor principal de la barra de gráficos. -->
  <div class="graph-bar-container" :class="{ mounted: isMounted }">
    <!-- Espacio libre en la barra, calculado como un porcentaje. -->
    <div class="free-space" :style="{ height: freeSpacePercentage + '%' }"></div>
    <!-- Itera sobre los procesos para mostrar cada segmento en la barra. -->
    <div v-for="(process, index) in processes"
         :key="process.name"
         class="process-segment"
         :style="{ height: getSegmentHeight(process), backgroundColor: getColor(index) }"
         :title="`${process.name} (${process.size} MB)`">
      <!-- Muestra el icono del proceso si existe y si el segmento es lo suficientemente grande. -->
      <img v-if="process.icon && (process.size / totalSize * 300) > 30"
           :src="getIconUrl(process.icon)"
           :alt="process.name"
           class="icon" />
    </div>
  </div>
</template>

<script setup lang="ts">
// Importa las dependencias necesarias de Vue y los tipos.
import type { Process } from '../types';
import { defineProps, computed, type PropType, onMounted, ref } from 'vue';

// Define las propiedades que el componente espera recibir.
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

// Variable reactiva para controlar la animación de montaje.
const isMounted = ref(false);

// Se ejecuta después de que el componente se ha montado en el DOM.
onMounted(() => {
  isMounted.value = true;
});

// Define una paleta de colores para los segmentos de la barra.
const colors = ['oklch(92.5% 0.084 155.995)', 'oklch(89.2% 0.058 10.001)', 'oklch(91.7% 0.08 205.041)', 'oklch(90.1% 0.076 70.697)', 'oklch(81.1% 0.111 293.571)', 'oklch(94.5% 0.129 101.54)', 'oklch(93.8% 0.127 124.321)'];

// Devuelve un color de la paleta basado en el índice del proceso.
const getColor = (index: number) => {
  return colors[index % colors.length];
};

// Calcula la altura del segmento de un proceso en porcentaje.
const getSegmentHeight = (process: Process) => {
  if (props.totalSize === 0) return '0%';
  const percentage = (process.size / props.totalSize) * 100;
  return `${percentage}%`;
};

// Calcula el tamaño total utilizado por todos los procesos.
const usedSize = computed(() => {
  return props.processes.reduce((total, process) => total + process.size, 0);
});

// Calcula el porcentaje de espacio libre en la barra.
const freeSpacePercentage = computed(() => {
  if (props.totalSize === 0) return 100;
  const percentage = ((props.totalSize - usedSize.value) / props.totalSize) * 100;
  return Math.max(0, percentage); // Asegura que no sea un valor negativo.
});

// Construye la URL para el icono de un proceso.
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