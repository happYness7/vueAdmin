<template>
  <div class="category-card">
    <h3 class="card-title">分类</h3>
    <div class="category-cloud">
      <router-link v-for="category in categories" :key="category.id" :to="`/blog/category/detail/${category.id}`"
        class="category-item" :style="{ color: getRandomColor(), fontSize: getRandomSize() }">
        {{ category.category_name }}
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import requestUtil from '@/utils/request'

const categories = ref([])

// 获取分类列表
const fetchCategories = async () => {
  try {
    const response = await requestUtil.get('/blog/categories/')
    categories.value = response.data || []
  } catch (error) {
    console.error('获取分类列表失败:', error)
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
  fetchCategories()
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

.category-card {
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

  .category-cloud {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.5rem;

    .category-item {
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
  // background-color: #f5f5f5;
  transition: all 0.3s;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}




.loading-container,
.empty-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.articles {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.article-card {
  display: flex;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  }

  .article-cover {
    width: 200px;
    height: 150px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s;

      &:hover {
        transform: scale(1.05);
      }
    }
  }

  .article-info {
    flex: 1;
    padding: 1rem;
    display: flex;
    flex-direction: column;
  }

  .article-title {
    margin-top: 0;
    margin-bottom: 0.5rem;

    a {
      color: #333;
      text-decoration: none;
      transition: color 0.3s;

      &:hover {
        color: #409eff;
      }
    }
  }

  .article-desc {
    color: #666;
    margin-bottom: 1rem;
    flex: 1;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .article-meta {
    display: flex;
    gap: 1rem;
    color: #999;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
  }

  .article-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    .tag-item {
      font-size: 0.8rem;
      padding: 0.2rem 0.5rem;
      background-color: #f0f9ff;
      color: #409eff;
      border-radius: 4px;
      text-decoration: none;
      transition: background-color 0.3s;

      &:hover {
        background-color: #ecf5ff;
      }
    }
  }
}

.pagination-container {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}



@media (max-width: 768px) {
  .category-page {
    .article-card {
      flex-direction: column;

      .article-cover {
        width: 100%;
        height: 200px;
      }
    }
  }
}
</style>