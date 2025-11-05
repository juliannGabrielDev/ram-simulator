<script setup lang="ts">
// Componente: Popup
// Muestra un modal centrado con un icono, un mensaje y un botón para cerrar.
// Props:
// - message: texto a mostrar
// - type: tipo de popup para ajustar color e icono ('info' por defecto)
// - isVisible: controla la visibilidad del popup
// Emits:
// - close: evento emitido cuando el usuario cierra el popup

import { computed } from 'vue';
import BaseButton from './BaseButton.vue';

interface Props {
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  isVisible: boolean;
}

// Definimos las props con valores por defecto (type = 'info')
const props = withDefaults(defineProps<Props>(), {
  type: 'info'
});

// Emitir eventos hacia el padre (solo 'close' en este componente)
const emit = defineEmits<{
  close: []
}>();

// Clase de color de fondo según el tipo de mensaje
const bgColorClass = computed(() => {
  switch (props.type) {
    case 'error': return 'bg-red-500';
    case 'warning': return 'bg-yellow-500';
    case 'success': return 'bg-green-500';
    default: return 'bg-blue-500'; // info por defecto
  }
});

// Path del trazado SVG usado para el icono que aparece en el encabezado
const iconPath = computed(() => {
  switch (props.type) {
    case 'error': return 'M6 18L18 6M6 6l12 12';
    case 'warning': return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z';
    case 'success': return 'M5 13l4 4L19 7';
    default: return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
  }
});
</script>

<template>
  <Transition name="popup">
    <!-- Overlay: fondo semitransparente que cubre toda la pantalla.
         Al hacer click en el overlay se emite 'close' para que el padre cierre el popup. -->
    <div v-if="isVisible" class="popup-overlay" @click="emit('close')">
      <!-- Container: caja centrada del popup. @click.stop evita que clicks dentro cierren el overlay -->
      <div class="popup-container" @click.stop>
        <!-- Header: área superior con color e icono según el tipo de mensaje -->
        <div class="popup-header" :class="bgColorClass">
          <!-- Icono SVG: la ruta (d) se calcula en iconPath según el tipo -->
          <svg class="popup-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="iconPath" />
          </svg>
        </div>
        <!-- Contenido: mensaje principal y botón para cerrar -->
        <div class="popup-content">
          <p class="popup-message">{{ message }}</p>
          <!-- Botón reutilizable que emite el evento 'close' al ser pulsado -->
          <BaseButton @click="emit('close')" class="popup-button">OK</BaseButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Estilos del Popup
   - Uso de utilidades (Tailwind) mediante @apply en el preprocesador.
   - Las reglas están comentadas para explicar cada bloque. */

/* Referencia a Tailwind (uso según configuración del proyecto) */
@reference 'tailwindcss';

/* Overlay: cubre toda la pantalla y centra el contenido */
.popup-overlay {
  @apply fixed inset-0 flex items-center justify-center z-50;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

/* Contenedor principal del popup: fondo, esquinas redondeadas y sombra */
.popup-container {
  @apply bg-white rounded-2xl shadow-2xl overflow-hidden;
  max-width: 400px;
  width: 90%;
  animation: popup-bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

/* Cabecera: área donde aparece el icono y el color según el tipo */
.popup-header {
  @apply flex items-center justify-center py-4;
}

/* Icono SVG: tamaño y color (hereda color de texto) */
.popup-icon {
  @apply w-12 h-12 text-white;
}

/* Contenido: mensaje y botón centrados */
.popup-content {
  @apply p-6 text-center;
}

/* Mensaje principal: tamaño y familia tipográfica */
.popup-message {
  @apply text-gray-800 text-lg mb-4;
  font-family: var(--font-geist);
}

/* Botón: centrado horizontalmente */
.popup-button {
  @apply mx-auto;
}

/* Transiciones de entrada/salida del popup */
.popup-enter-active {
  transition: opacity 0.3s ease;
}

.popup-leave-active {
  transition: opacity 0.2s ease;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
}

.popup-enter-active .popup-container {
  animation: popup-bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.popup-leave-active .popup-container {
  animation: popup-fade 0.2s ease-out;
}

/* Keyframes usados para animar la aparición/desaparición */
@keyframes popup-bounce {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes popup-fade {
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.9);
    opacity: 0;
  }
}
</style>
