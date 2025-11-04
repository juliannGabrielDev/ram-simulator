<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import type { Process } from './types';
import BaseButton from './components/BaseButton.vue';
import InstalledProgramsTable from './components/InstalledProgramsTable.vue';
import RunningProgramsTable from './components/RunningProgramsTable.vue';
import MemoryGraph from './components/MemoryGraph.vue';
import Popup from './components/Popup.vue';
import PageReveal from './components/PageReveal.vue';

const h1 = ref<HTMLElement | null>(null);
const logo = ref<HTMLElement | null>(null);
const githubLink = ref<HTMLElement | null>(null);
const mainContent = ref<HTMLElement | null>(null);
const formSection = ref<HTMLElement | null>(null);
const graphsSection = ref<HTMLElement | null>(null);
const installedTable = ref<any>(null);
const runningTable = ref<any>(null);
const contentVisible = ref(false);

const TOTAL_RAM_MB = 8 * 1024; // 16GB
const TOTAL_VIRTUAL_MB = 4 * 1024; // 8GB

const popupMessage = ref('');
const popupType = ref<'info' | 'warning' | 'error' | 'success'>('info');
const showPopup = ref(false);
const showReveal = ref(true);
const revealComplete = ref(false);

const displayPopup = (message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
  popupMessage.value = message;
  popupType.value = type;
  showPopup.value = true;
};

const closePopup = () => {
  showPopup.value = false;
};

const onRevealComplete = () => {
  revealComplete.value = true;
  setTimeout(() => {
    showReveal.value = false;
  }, 400);
};

const newProgramName = ref('');
const newProgramSize = ref<number | null>(null);
const newProgramPriority = ref<1 | 2 | 3 | 4 | 5>(3);

const BASE_URL = import.meta.env.BASE_URL;

const installedPrograms = ref<Process[]>([
  { name: 'Chrome', size: 1024, location: 'Inactive', icon: `${BASE_URL}assets/img/icons/google-chrome.svg`, priority: 2 },
  { name: 'VSCode', size: 1768, location: 'Inactive', icon: `${BASE_URL}assets/img/icons/visual-studio-code.svg`, priority: 2 },
  { name: 'Docker', size: 2048, location: 'Inactive', icon: `${BASE_URL}assets/img/icons/docker.svg`, priority: 3 },
  { name: 'Spotify', size: 1512, location: 'Inactive', icon: `${BASE_URL}assets/img/icons/spotify-client.svg`, priority: 4 },
  { name: 'Edge', size: 1950, location: 'Inactive', icon: `${BASE_URL}assets/img/icons/edge.svg`, priority: 3 },
  { name: 'Claude AI', size: 1050, location: 'Inactive', icon: `${BASE_URL}assets/img/icons/claude-ai-icon.svg`, priority: 2 },
  { name: 'Notion', size: 1600, location: 'Inactive', icon: `${BASE_URL}assets/img/icons/notion.svg`, priority: 3 },
  { name: 'WhatsApp', size: 1800, location: 'Inactive', icon: `${BASE_URL}assets/img/icons/whatsapp.svg`, priority: 4 },
  { name: 'IntelliJ IDEA', size: 3500, location: 'Inactive', icon: `${BASE_URL}assets/img/icons/intellijidea.svg`, priority: 1 },
  { name: 'Figma', size: 850, location: 'Inactive', icon: `${BASE_URL}assets/img/icons/figma.svg`, priority: 3 },
]);

const ramPrograms = ref<Process[]>([]);
const virtualPrograms = ref<Process[]>([]);

const runningPrograms = computed(() => [...ramPrograms.value, ...virtualPrograms.value]);

const usedRam = computed(() => ramPrograms.value.reduce((total, p) => total + p.size, 0));
const usedVirtualMemory = computed(() => virtualPrograms.value.reduce((total, p) => total + p.size, 0));

const moveToVirtual = (program: Process) => {
  program.location = 'Virtual';
  ramPrograms.value = ramPrograms.value.filter(p => p.name !== program.name);
  virtualPrograms.value.push(program);
};

const closeProgram = (program: Process) => {
  if (program.location === 'RAM') {
    ramPrograms.value = ramPrograms.value.filter(p => p.name !== program.name);
  } else if (program.location === 'Virtual') {
    virtualPrograms.value = virtualPrograms.value.filter(p => p.name !== program.name);
  }
  program.location = 'Inactive';
  installedPrograms.value.push(program);
  installedPrograms.value.sort((a, b) => a.name.localeCompare(b.name));
};

const addProgramToRam = (programToAdd: Process) => {
  if (runningPrograms.value.some(p => p.name === programToAdd.name)) {
    displayPopup(`${programToAdd.name} ya se está ejecutando.`, 'warning');
    return;
  }

  const spaceNeeded = programToAdd.size;

  // Intentar agregarlo a RAM directamente
  if (usedRam.value + spaceNeeded <= TOTAL_RAM_MB) {
    programToAdd.location = 'RAM';
    ramPrograms.value.push(programToAdd);
    installedPrograms.value = installedPrograms.value.filter(p => p.name !== programToAdd.name);
    return;
  }

  // RAM está llena, intentar liberar espacio moviendo programas de menor prioridad a Virtual
  const allPrograms = [...ramPrograms.value, ...virtualPrograms.value, programToAdd];
  allPrograms.sort((a, b) => a.priority - b.priority); // Ordenar por prioridad (menor número = mayor prioridad)

  let spaceFreed = 0;
  const programsToMove: Process[] = [];

  // Buscar programas de menor prioridad en RAM para mover a Virtual
  for (const program of ramPrograms.value) {
    if (program.priority > programToAdd.priority) {
      programsToMove.push(program);
      spaceFreed += program.size;
      if (spaceFreed >= spaceNeeded) break;
    }
  }

  // Si logramos liberar suficiente espacio en RAM
  if (spaceFreed >= spaceNeeded) {
    // Verificar que hay espacio en Virtual para los programas movidos
    const virtualSpaceNeeded = programsToMove.reduce((sum, p) => sum + p.size, 0);
    if (usedVirtualMemory.value + virtualSpaceNeeded <= TOTAL_VIRTUAL_MB) {
      programsToMove.forEach(moveToVirtual);
      programToAdd.location = 'RAM';
      ramPrograms.value.push(programToAdd);
      installedPrograms.value = installedPrograms.value.filter(p => p.name !== programToAdd.name);
      displayPopup(`Se movió ${programsToMove.map(p => p.name).join(', ')} a Memoria Virtual para liberar espacio.`, 'info');
      return;
    }
  }

  // Si no se pudo en RAM, intentar en Virtual
  if (usedVirtualMemory.value + spaceNeeded <= TOTAL_VIRTUAL_MB) {
    programToAdd.location = 'Virtual';
    virtualPrograms.value.push(programToAdd);
    installedPrograms.value = installedPrograms.value.filter(p => p.name !== programToAdd.name);
    return;
  }

  // Virtual también está llena, intentar cerrar programas de menor prioridad
  const programsToClose: Process[] = [];
  let totalSpaceFreed = 0;

  for (const program of [...virtualPrograms.value, ...ramPrograms.value].sort((a, b) => b.priority - a.priority)) {
    if (program.priority > programToAdd.priority) {
      programsToClose.push(program);
      totalSpaceFreed += program.size;
      if (totalSpaceFreed >= spaceNeeded) break;
    }
  }

  if (totalSpaceFreed >= spaceNeeded) {
    programsToClose.forEach(closeProgram);
    programToAdd.location = 'RAM';
    ramPrograms.value.push(programToAdd);
    installedPrograms.value = installedPrograms.value.filter(p => p.name !== programToAdd.name);
    displayPopup(`Se cerró ${programsToClose.map(p => p.name).join(', ')} por memoria insuficiente.`, 'warning');
    return;
  }

  displayPopup(`No se puede ejecutar ${programToAdd.name}. No hay suficiente memoria incluso después de cerrar programas de menor prioridad.`, 'error');
};

const removeProgram = (programToRemove: Process) => {
  if (programToRemove.location === 'RAM') {
    ramPrograms.value = ramPrograms.value.filter(p => p.name !== programToRemove.name);
  } else if (programToRemove.location === 'Virtual') {
    virtualPrograms.value = virtualPrograms.value.filter(p => p.name !== programToRemove.name);
  }

  programToRemove.location = 'Inactive';
  installedPrograms.value.push(programToRemove);
  installedPrograms.value.sort((a, b) => a.name.localeCompare(b.name));
};

const installProgram = () => {
  if (!newProgramName.value || !newProgramSize.value) {
    displayPopup('Por favor, proporciona un nombre y tamaño para el programa.', 'warning');
    return;
  }
  if (installedPrograms.value.some(p => p.name === newProgramName.value) || runningPrograms.value.some(p => p.name === newProgramName.value)) {
    displayPopup('Ya existe un programa con este nombre.', 'warning');
    return;
  }

  const newProgram: Process = {
    name: newProgramName.value,
    size: newProgramSize.value,
    location: 'Inactive',
    icon: `${BASE_URL}assets/img/icons/generic-program.svg`,
    priority: newProgramPriority.value
  };

  installedPrograms.value.push(newProgram);
  installedPrograms.value.sort((a, b) => a.name.localeCompare(b.name));

  newProgramName.value = '';
  newProgramSize.value = null;
  newProgramPriority.value = 3;
};


onMounted(() => {
  gsap.registerPlugin(TextPlugin);

  // Ocultar contenido inicialmente
  gsap.set([logo.value, h1.value, githubLink.value], {
    opacity: 0
  });

  gsap.set([formSection.value, graphsSection.value], {
    opacity: 0,
    y: 50
  });

  const installedTableEl = installedTable.value?.$el || installedTable.value?.tableRoot;
  const runningTableEl = runningTable.value?.$el || runningTable.value?.tableRoot;

  if (installedTableEl) {
    gsap.set(installedTableEl, { opacity: 0, y: 50 });
  }
  if (runningTableEl) {
    gsap.set(runningTableEl, { opacity: 0, y: 50 });
  }

  // Esperar a que termine la animación de revelación
  const startAnimations = () => {
    contentVisible.value = true;

    gsap.set(logo.value, { scale: 0 });

    gsap.to(logo.value, {
      duration: 1,
      scale: 1,
      opacity: 1,
      ease: "power3.out",
    });

    gsap.to(h1.value, {
      duration: 2,
      text: "Simulador de RAM",
      opacity: 1,
      ease: "none",
      delay: .5
    });

    gsap.to(githubLink.value, {
      duration: 0.8,
      opacity: 1,
      x: 0,
      ease: "power3.out",
      delay: 1.2
    });

    // Animar elementos del main
    const timeline = gsap.timeline({ delay: 0.8 });

    const installedTableEl = installedTable.value?.$el || installedTable.value?.tableRoot;
    const runningTableEl = runningTable.value?.$el || runningTable.value?.tableRoot;

    timeline.to(formSection.value, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: "power2.out"
    })
      .to(graphsSection.value, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.4");

    if (installedTableEl) {
      timeline.to(installedTableEl, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.4");
    }

    if (runningTableEl) {
      timeline.to(runningTableEl, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.4");
    }
  };

  // Esperar a que termine la revelación
  setTimeout(() => {
    if (revealComplete.value) {
      startAnimations();
    }
  }, 1150);
});
</script>

<template>
  <header class="header">
    <div class="header-content">
      <img class="header__logo" src="/assets/img/oval.svg" alt="Logo" ref="logo">
      <h1 class="h1" ref="h1"></h1>
      <a href="https://github.com/juliannGabrielDev/ram-simulator" target="_blank" rel="noopener noreferrer" class="ml-auto" ref="githubLink">
        <img src="./assets/img/icons/github_light.svg" alt="GitHub" class="w-5 h-5 sm:w-6 sm:h-6" />
      </a>
    </div>
  </header>
  <main class="main grid-rows-[auto_auto]" ref="mainContent">
    <div class="form-section" ref="formSection">
      <h2 class="form-section__title">Agregar un programa</h2>
      <form class="form" @submit.prevent="installProgram">
        <label class="label" for="input-name">Nombre:</label>
        <input class="input" id="input-name" type="text" placeholder="ej., Chrome" v-model="newProgramName">
        <label class="label" for="input-size">Tamaño (MB):</label>
        <input class="input form__size" id="input-size" type="number" placeholder="ej., 1024"
          v-model.number="newProgramSize">
        <label class="label" for="input-priority">Prioridad (1-5):</label>
        <select class="input form__priority" id="input-priority" v-model.number="newProgramPriority">
          <option :value="1">1 - Más alta</option>
          <option :value="2">2 - Alta</option>
          <option :value="3">3 - Media</option>
          <option :value="4">4 - Baja</option>
          <option :value="5">5 - Más baja</option>
        </select>
        <BaseButton type="submit" class="w-fit mx-auto mt-4">Agregar</BaseButton>
      </form>
    </div>
    <div class="graphs bg-neutral-900 col-span-1 md:col-span-2 lg:col-span-3 rounded-2xl text-white px-4 sm:px-8 py-4 pt-20" ref="graphsSection">
      <h3 class="text-xl sm:text-2xl font-bitcount mb-4">Gráficos</h3>
      <MemoryGraph title="RAM" :programs="ramPrograms" :total-memory="TOTAL_RAM_MB" :used-memory="usedRam"
        color="bg-blue-300" @close-program="removeProgram" />
      <MemoryGraph title="Virtual" :programs="virtualPrograms" :total-memory="TOTAL_VIRTUAL_MB"
        :used-memory="usedVirtualMemory" color="bg-purple-300" @close-program="removeProgram" />
    </div>
    <InstalledProgramsTable ref="installedTable" :programs="installedPrograms" @add-program="addProgramToRam"
      class="col-span-1 md:col-span-2" />
    <RunningProgramsTable ref="runningTable" :programs="runningPrograms" @remove-program="removeProgram"
      class="col-span-1 md:col-span-2" />
  </main>
  <footer class="footer">
    <p>Julián Alejandro Gabriel Isidro</p>
  </footer>
  <Popup :message="popupMessage" :type="popupType" :is-visible="showPopup" @close="closePopup" />
  <PageReveal v-if="showReveal" @complete="onRevealComplete" />
</template>

<style scoped>
@reference 'tailwindcss';

.header {
  @apply p-3 sm:p-6 max-w-7xl;
  margin: 0 auto;

  .header-content {
    @apply p-2 sm:p-4 gap-2 sm:gap-3;
    display: flex;
    align-items: center;
    justify-content: left;

    .header__logo {
      width: 20px;

      @media (min-width: 640px) {
        width: 24px;
      }
    }

    .h1 {
      font-size: 1.25rem;
      font-family: var(--font-bitcount);
      line-height: 1;

      @media (min-width: 640px) {
        font-size: 1.5rem;
      }
    }
  }
}

.main {
  @apply px-3 sm:px-6 pb-6 grid grid-cols-1 gap-4 max-w-7xl mx-auto;

  @media (min-width: 768px) {
    @apply grid-cols-2;
  }

  @media (min-width: 1024px) {
    @apply grid-cols-4;
  }

  .form-section {
    @apply bg-cover bg-no-repeat bg-center rounded-2xl p-4 relative;
    background-image: url('/assets/img/bg.png');

    @media (min-width: 1024px) {
      @apply col-span-1;
    }

    .form-section__title {
      @apply text-white text-2xl mb-3;
      font-family: var(--font-bitcount);
    }

    .form {
      @apply flex flex-col gap-2;
    }

    .form__size {
      @apply w-full;

      @media (min-width: 640px) {
        @apply w-32;
      }
    }

    .form__priority {
      @apply w-full;

      @media (min-width: 640px) {
        @apply w-40;
      }
    }

    .label {
      @apply bg-white text-black px-2 py-0.5 rounded-md w-fit text-sm font-semibold;
      font-family: var(--font-geist);
    }

    .input {
      @apply bg-white py-3 px-5 rounded-lg border-2 border-transparent;
      font-family: var(--font-geist);
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .input:focus {
      @apply outline-none border-blue-500;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      transform: translateY(-1px);
    }

    .input:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    select.input {
      @apply cursor-pointer;
      background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23000' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 1rem center;
      padding-right: 3rem;
      appearance: none;
    }
  }
}

.footer {
  @apply bg-neutral-900 text-white p-5 text-right;

  p {
    @apply max-w-7xl mx-auto;
    font-family: var(--font-bitcount);
  }
}
</style>