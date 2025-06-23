<template>
  <div class="wave-container">
    <svg class="waves" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
      <defs>
        <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"></path>
      </defs>
      <g class="parallax">
        <use xlink:href="#gentle-wave" x="48" y="0" :fill="waveColors[0]"></use>
        <use xlink:href="#gentle-wave" x="48" y="3" :fill="waveColors[1]"></use>
        <use xlink:href="#gentle-wave" x="48" y="5" :fill="waveColors[2]"></use>
        <use xlink:href="#gentle-wave" x="48" y="7" :fill="waveColors[3]"></use>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  waveColors: {
    type: Array,
    default: () => [
      'rgba(255,255,255,0.7)',
      'rgba(255,255,255,0.5)',
      'rgba(255,255,255,0.3)',
      '#fff'
    ]
  },
  height: {
    type: String,
    default: '6rem'
  }
});
</script>

<style lang="scss" scoped>
.wave-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50px;
  min-height: 10px;
  overflow: hidden;
  z-index: 2;
}

.waves {
  width: 100%;
  height: 100%;
  position: relative;
}

.parallax > use {
  animation: move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite;
}
.parallax > use:nth-child(1) {
  animation-delay: -2s;
  animation-duration: 7s;
}
.parallax > use:nth-child(2) {
  animation-delay: -3s;
  animation-duration: 10s;
}
.parallax > use:nth-child(3) {
  animation-delay: -4s;
  animation-duration: 13s;
}
.parallax > use:nth-child(4) {
  animation-delay: -5s;
  animation-duration: 20s;
}

@keyframes move-forever {
  0% {
    transform: translate3d(-90px,0,0);
  }
  100% { 
    transform: translate3d(85px,0,0);
  }
}
</style>