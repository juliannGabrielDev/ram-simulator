<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { gsap } from 'gsap';

const emit = defineEmits<{
  complete: []
}>();

const overlay = ref<HTMLElement | null>(null);
const revealMask = ref<HTMLElement | null>(null);

onMounted(() => {
  const maxSize = Math.max(window.innerWidth, window.innerHeight) * 2;

  const timeline = gsap.timeline({
    onComplete: () => {
      emit('complete');
    }
  });

  // Animar el tamaño de la máscara de 50px al tamaño completo
  timeline.to(revealMask.value, {
    width: maxSize,
    height: maxSize,
    duration: 0.75,
    ease: "power2.inOut"
  });
});
</script>

<template>
  <div ref="overlay" class="page-reveal">
    <div class="content-wrapper">
      <div ref="revealMask" class="reveal-mask">
        <svg
          class="mask-svg"
          viewBox="0 0 300 300"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <path
            d="M231.309 231.31C161.705 300.91 68.8765 320.94 23.9707 276.03C-20.9352 231.12 -0.913322 138.29 68.6908 68.6899C138.295 -0.91011 231.123 -20.9401 276.029 23.9699C320.935 68.8799 300.913 161.71 231.309 231.31Z"
            fill="white"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-reveal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #000000;
  z-index: 9999;
  pointer-events: none;
}

.content-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.reveal-mask {
  position: absolute;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mask-svg {
  width: 100%;
  height: 100%;
}
</style>
