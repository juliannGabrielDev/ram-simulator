<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';

const h1 = ref<HTMLElement | null>(null);
const logo = ref<HTMLElement | null>(null);
const mainContent = ref<HTMLElement | null>(null);
const button = ref<HTMLElement | null>(null);

onMounted(() => {
  gsap.registerPlugin(TextPlugin);

  gsap.set(logo.value, { scale: 0 });

  gsap.to(logo.value, {
    duration: 1,
    scale: 1,
    ease: "power3.out",
  });

  gsap.to(h1.value, {
    duration: 2,
    text: "RAM Simulator",
    ease: "none",
    delay: .5
  });

  gsap.from(mainContent.value, {
    duration: 1,
    opacity: 0,
    y: 100,
    stagger: 0.2,
    delay: .7
  });
});
</script>

<template>
  <header class="header">
    <div class="header-content">
      <img class="header__logo" src="./assets/img/oval.svg" alt="Logo" ref="logo">
      <h1 class="h1" ref="h1"></h1>
    </div>
  </header>
  <main class="main" ref="mainContent">
    <div class="form-section">
      <h2 class="form-section__title">Add a program</h2>
      <form class="form">
        <label class="label" for="input-name">Name:</label>
        <input class="input" id="input-name" type="text" placeholder="e.g., Chrome">
        <label class="label" for="input-size">Size (MB):</label>
        <input class="input form__size" id="input-size" type="number" placeholder="e.g., 1024">
        <button ref="button" @click.prevent class="button">Add</button>
      </form>
    </div>
    <div class="graphs bg-neutral-900 col-span-3 h-[400px] rounded-2xl text-white px-8 py-4">
      <h3 class="text-2xl font-bitcount">Graphs</h3>
      <h3 class="text-xl font-bitcount">RAM</h3>
      <div class="graph w-full h-12 rounded-4xl bg-neutral-800 mb-6 p-2 flex gap-2">
        <div class="graph__section bg-blue-300 h-full w-[250px] rounded-l-[44px] rounded-r-[8px]"></div>
        <div class="graph__section bg-blue-300 h-full w-[150px] rounded-[8px]"></div>
        <div class="graph__section bg-blue-300 h-full w-[150px] rounded-l-[8px] rounded-r-[44px]"></div>
      </div>
      <h3 class="text-xl font-bitcount">Virtual</h3>
      <div class="graph w-full h-12 rounded-4xl bg-neutral-800 p-2">
        <div class="graph__section bg-blue-300 h-full w-[150px] rounded-[44px]"></div>
      </div>
    </div>
    <table class="col-span-2">
      <tr>
        <th>Name</th>
        <th>Size (MB)</th>
      </tr>
      <tr>
        <td>Chrome</td>
        <td>1024</td>
      </tr>
    </table>
    <table class="col-span-2">
      <tr>
        <th>Name</th>
        <th>Size (MB)</th>
      </tr>
      <tr>
        <td>Chrome</td>
        <td>1024</td>
      </tr>
    </table>
  </main>
  <footer class="footer">
    <p>Julián Alejandro Gabriel Isidro</p>
  </footer>
</template>

<style scoped>
@reference 'tailwindcss';

* {
  /* border: 1px solid red; */
}

.header {
  @apply p-6 max-w-7xl;
  margin: 0 auto;

  .header-content {
    @apply p-4 gap-3;
    display: flex;
    align-items: center;
    justify-content: left;

    .header__logo {
      width: 24px;
    }

    .h1 {
      font-size: 1.5rem;
      font-family: var(--font-bitcount);
      line-height: 1;
    }
  }
}

.main {
  @apply p-6 grid grid-cols-4 grid-rows-2 gap-4 max-w-7xl mx-auto;

  .form-section {
    @apply bg-cover bg-no-repeat bg-center rounded-2xl p-4 relative;
    background-image: url('./assets/img/bg.png');

    .form-section__title {
      @apply text-white text-2xl mb-3;
      font-family: var(--font-bitcount);
    }

    .form {
      @apply flex flex-col gap-2;
    }

    .form__size {
      @apply w-32;
    }

    .label {
      @apply bg-white text-black px-1 rounded-md w-fit text-sm;
    }

    .input {
      @apply bg-white py-3 px-5 rounded-lg outline-blue-500;
    }

    .button {
      @apply absolute bottom-6 right-6 bg-neutral-900 hover:bg-neutral-800 cursor-pointer transition-all active:scale-95 ease-in-out duration-300 text-white rounded-4xl w-fit h-fit py-2 px-6;
      font-family: var(--font-bitcount);
    }
  }

  table {
    @apply border border-gray-400 border-separate rounded-lg overflow-hidden;
  }

  th,
  td {
    @apply p-2;
  }

  th {
    @apply border-b border-gray-400;
  }

  td:first-child,
  th:first-child {
    @apply border-r border-gray-400;
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
