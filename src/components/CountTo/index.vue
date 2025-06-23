<!-- components/CountTo/index.vue -->
<template>
  <span>{{ displayValue }}</span>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  startVal: {
    type: Number,
    default: 0
  },
  endVal: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    default: 1500
  }
})

const displayValue = ref(props.startVal)

const animate = () => {
  const startTime = Date.now()
  const update = () => {
    const progress = Math.min((Date.now() - startTime) / props.duration, 1)
    displayValue.value = Math.floor(props.startVal + progress * (props.endVal - props.startVal))
    if (progress < 1) requestAnimationFrame(update)
  }
  requestAnimationFrame(update)
}

watch(() => props.endVal, (newVal) => {
  animate()
})

onMounted(() => {
  animate()
})
</script>