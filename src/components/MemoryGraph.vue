<script setup lang="ts">
/*
  MemoryGraph.vue
  ----------------
  Componente que muestra una barra de memoria (gráfico) compuesta por secciones
  para cada programa en ejecución. Cada sección es un subcomponente
  `GraphSection` que recibe el tamaño del programa y renderiza su porción
  proporcional dentro de la barra.

  Comentarios en español para facilitar mantenimiento y comprensión.
*/

// Importar tipos y subcomponentes
import type { Process } from '../types';
import GraphSection from './GraphSection.vue';

// Definición de las props esperadas por el componente
interface Props {
  // Título a mostrar encima del gráfico (por ejemplo: "Memoria usada")
  title: string;
  // Lista de procesos/programas que ocupan memoria
  programs: Process[];
  // Memoria total disponible (en MB)
  totalMemory: number;
  // Memoria actualmente usada (en MB)
  usedMemory: number;
  // Clase de color para las secciones (opcional, con valor por defecto)
  color?: string;
}

// Definir props con valores por defecto usando la API de <script setup>
const props = withDefaults(defineProps<Props>(), {
  // Clase Tailwind (o clase CSS) por defecto si no se suministra `color`
  color: 'bg-blue-300'
});

// Emit events: el componente puede solicitar cerrar/unload de un programa
const emit = defineEmits<{
  // Evento `closeProgram` con el programa a cerrar como payload
  closeProgram: [program: Process]
}>();

// -------------------------
// Funciones utilitarias
// -------------------------
// Determina si el índice es el primero en el array (para aplicar bordes redondeados)
const isFirst = (index: number) => index === 0;

// Determina si el índice es el último (para aplicar bordes redondeados)
const isLast = (index: number) => index === props.programs.length - 1;

// Devuelve clases CSS para redondear las esquinas de la primera/última sección
// Esto permite que la barra tenga extremos redondeados cuando corresponda.
const getRoundedClass = (index: number) => {
  const first = isFirst(index);
  const last = isLast(index);

  if (first && last) {
    // Solo un elemento en la lista: redondear ambos extremos
    return 'rounded-l-[44px] rounded-r-[44px]';
  } else if (first) {
    // Primer elemento: redondear a la izquierda
    return 'rounded-l-[44px]';
  } else if (last) {
    // Último elemento: redondear a la derecha
    return 'rounded-r-[44px]';
  }
  // Elementos del medio: sin bordes redondeados
  return '';
};

// Manejador que reemite el evento de cierre del programa hacia el padre
const handleCloseProgram = (program: Process) => {
  emit('closeProgram', program);
};
</script>

<template>
  <div class="memory-graph">
    <!-- Título con el nombre del gráfico y el resumen de memoria usada/total -->
    <h3 class="text-xl font-bitcount mb-2">
      {{ title }}: {{ usedMemory }} / {{ totalMemory }} MB
    </h3>

    <!--
      Contenedor del gráfico principal.
      Cada `GraphSection` representa la porción de memoria ocupada por un programa.
      Props usadas por `GraphSection`:
        - program: objeto Process con nombre y tamaño
        - total-memory: número para calcular la proporción
        - color: clase CSS para colorear la sección
        - rounded-class: clases para redondear los extremos (primero/último)
      Evento importante:
        - @close: se emite cuando se cierra el programa desde la sección
    -->
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
/* Estilos locales para `MemoryGraph`.
   Usamos scoped para evitar fugas de estilo a otros componentes.
*/
.memory-graph {
  margin-bottom: 1.5rem;
  position: relative;
}

.memory-graph:last-child {
  margin-bottom: 0;
}

.graph {
  /* Asegurar que elementos posicionados o tooltip puedan desbordar el contenedor */
  overflow: visible !important;
}
</style>
