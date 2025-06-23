<template>
  <div class="tag-card">
    <h3 class="card-title">标签</h3>
    <div class="tag-cloud">
      <router-link v-for="tag in tags" :key="tag.id" :to="`/blog/tag/detail/${tag.id}`"
        class="tag-item" :style="{ color: getRandomColor(), fontSize: getRandomSize() }">
        {{ tag.tag_name }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import requestUtil from '@/utils/request'

const tags = ref([])

// 获取标签列表
const fetchTags = async () => {
  try {
    const response = await requestUtil.get('/blog/tags/')
    tags.value = response.data || []
  } catch (error) {
    console.error('获取标签列表失败:', error)
  }
}

const getRandomColor = () => {
  const hues = [0, 30, 60, 120, 240, 270] // 色相范围
  return `hsl(${hues[Math.floor(Math.random() * hues.length)]}deg, 70%, 50%)`
}

const getRandomSize = () => {
  return (Math.random() * 0.3 + 0.3).toFixed(2) + 'rem'
}

// 组件挂载时获取数据
onMounted(() => {
  fetchTags()
})
</script>

<style lang="scss" scoped>
@keyframes slideIn {
  0% {
    transform: translateY(50px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.tag-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 0.5rem 0.5rem;
  width: 800px;
  margin: 30px auto;
  animation: slideIn 0.8s ease-out forwards;

  .card-title {
    font-size: 0.8rem;
    text-align: center;
    margin: 0 0 0.5rem;
    color: #333;
  }

  .tag-cloud {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem;

    .tag-item {
      text-decoration: none;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 0.2rem;

      &:hover {
        transform: scale(1.1);
      }
    }
  }

  color: #666;
  transition: all 0.3s;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
</style>