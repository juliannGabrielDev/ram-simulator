<script setup lang="ts">
// Componente: RunningProgramsTable
// Muestra una tabla con los procesos/programas que están corriendo.
// Comentarios en español añadidos para documentar props, emits, refs y animaciones.
import { ref, watch, nextTick, computed } from 'vue';
import { gsap } from 'gsap';
import type { Process } from '../types';
import BaseButton from './BaseButton.vue';

// Props: recibimos un array de procesos desde el componente padre
const props = defineProps<{ programs: Process[] }>();
// Emits: evento para solicitar la eliminación de un programa
const emit = defineEmits<{(e: 'remove-program', program: Process): void;}>();

// Referencias al DOM: tbody para animar filas, tableRoot para exponer la tabla
const tbody = ref<HTMLElement | null>(null);
const tableRoot = ref<HTMLElement | null>(null);

// Handler para cuando se pulsa el botón de eliminar en una fila
const onRemoveClick = (program: Process) => {
  // Emitimos hacia el padre indicando qué programa eliminar
  emit('remove-program', program);
};

// Crea un ID computed basado en los nombres de los programas para un watcher fiable
const programId = computed(() => props.programs.map(p => p.name).join(''));

// Observador: cuando cambia la lista de programas (basado en programId), esperamos
// al siguiente tick y animamos las filas con GSAP (entrada suave desde arriba)
watch(programId, async () => {
  await nextTick();
  if (tbody.value) {
    const rows = tbody.value.querySelectorAll('tr');
    // Animación: aparecen con opacidad y desplazamiento en Y
    gsap.from(rows, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      stagger: 0.05,
      ease: "power2.out"
    });
  }
});

// Exponemos la referencia root de la tabla para que el componente padre pueda acceder
defineExpose({
  tableRoot
});
</script>

<template>
  <!-- Contenedor de la tabla con scroll horizontal en pantallas pequeñas -->
  <div class="table-wrapper">
    <!-- Tabla principal; se expone con ref="tableRoot" -->
    <table class="col-span-2" ref="tableRoot">
      <thead>
        <tr>
          <!-- Cabeceras: Nombre, Tamaño, Prioridad, Ubicación y Acción -->
          <th>Nombre</th>
          <th>Tamaño (MB)</th>
          <th>Prioridad</th>
          <th>Ubicación</th>
          <th>Acción</th>
        </tr>
      </thead>
      <!-- Cuerpo de la tabla: cada fila corresponde a un programa en `programs` -->
      <tbody ref="tbody">
        <tr v-for="program in programs" :key="program.name">
          <td>
            <!-- Icono y nombre del programa -->
            <div class="flex items-center gap-2">
              <img :src="program.icon" :alt="program.name" class="w-6 h-6">
              <span class="whitespace-nowrap">{{ program.name }}</span>
            </div>
          </td>
          <!-- Tamaño en MB (propiedad `size`) -->
          <td>{{ program.size }}</td>
          <td>
            <!-- Badge que indica la prioridad; la clase depende del valor `priority` -->
            <span class="priority-badge" :class="`priority-${program.priority}`">
              {{ program.priority }}
            </span>
          </td>
          <!-- Ubicación en memoria (propiedad `location`) -->
          <td>{{ program.location }}</td>
          <td>
            <!-- Botón para eliminar/solicitar eliminación del programa -->
            <BaseButton variant="danger" @click="onRemoveClick(program)">Remove</BaseButton>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* Estilos de la tabla de programas. Comentarios en español para facilitar mantenimiento. */
@reference 'tailwindcss';

.table-wrapper {
  /* Contenedor con scroll horizontal para pantallas pequeñas */
  @apply w-full overflow-x-auto;
  -webkit-overflow-scrolling: touch;
}

table {
  /* Estilo base de la tabla: ancho completo, bordes y esquinas */
  @apply w-full rounded-lg overflow-hidden;
  height: fit-content;
  border-collapse: collapse;
  border: 2px solid rgb(156 163 175);
  min-width: 700px;

  @media (min-width: 768px) {
    min-width: auto;
  }
}

th,
td {
  /* Espaciado y tipografía para celdas */
  @apply px-2 sm:px-3 py-2 text-left text-sm;
  border-bottom: 2px solid rgb(156 163 175);
  border-right: 2px solid rgb(156 163 175);

  @media (min-width: 640px) {
    @apply text-base;
  }
}

th {
  /* Cabeceras con fondo claro y fuente específica */
  @apply bg-neutral-100 font-semibold;
  font-family: var(--font-bitcount);
}

th:last-child,
td:last-child {
  /* Quitar borde derecho en la última columna */
  border-right: 0;
}

tbody tr:last-child td {
  /* Quitar borde inferior en la última fila */
  border-bottom: 0;
}

.priority-badge {
  /* Estilo base de los badges de prioridad (círculos con número) */
  @apply inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm;
}

/* Colores para las distintas prioridades (1 = mayor, 5 = menor) */
.priority-1 {
  @apply bg-red-100 text-red-700;
}

.priority-2 {
  @apply bg-orange-100 text-orange-700;
}

.priority-3 {
  @apply bg-yellow-100 text-yellow-700;
}

.priority-4 {
  @apply bg-blue-100 text-blue-700;
}

.priority-5 {
  @apply bg-green-100 text-green-700;
}
</style>
