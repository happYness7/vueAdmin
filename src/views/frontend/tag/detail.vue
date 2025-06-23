<template>
  <div class="tag-detail-page">
    <div class="article-grid">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-else-if="articles.length === 0" class="empty-container">
        <el-empty description="该标签下暂无文章" />
      </div>

      <div v-else class="articles">
        <div v-for="article in articles" :key="article.id" class="article-card" @click="goToArticle(article.id)">
          <div class="article-cover" v-if="article.article_cover">
            <img :src="article.article_cover" :alt="article.article_title">
          </div>
          <div class="article-info">
            
            <h3 class="article-title">{{ article.article_title }}</h3>
            <div class="article-meta">
              <span class="meta-item">
                <el-icon><Calendar /></el-icon>
                {{ formatDate(article.created_at) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="pagination-container" >
        <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
          :current-page="currentPage" @current-change="handlePageChange" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Calendar, View } from '@element-plus/icons-vue'
import requestUtil from '@/utils/request'

const router = useRouter()

const route = useRoute()
const loading = ref(true)
const articles = ref([])
const currentTag = ref(null)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(4)

// 获取当前标签ID
const tagId = computed(() => {
  return route.params.id ? parseInt(route.params.id) : null
})

// 获取标签信息
const fetchTagInfo = async () => {
  if (!tagId.value) return
  try {
    const response = await requestUtil.get(`/blog/tags/${tagId.value}/`)
    currentTag.value = response.data
  } catch (error) {
    console.error('获取标签信息失败:', error)
  }
}

// 获取文章列表
const fetchArticles = async () => {
  if (!tagId.value) return
  loading.value = true
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      tags: currentTag.value.tag_name,
      status: 1 // 只获取公开文章
    }
    const response = await requestUtil.get('/blog/articles/',  params )
    articles.value = response.data.articleList || []
    total.value = response.data.total || 0
  } catch (error) {
    console.error('获取文章列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 页码变化处理
const handlePageChange = (page) => {
  currentPage.value = page
  fetchArticles()
}

// 跳转到文章详情
const goToArticle = (articleId) => {
  router.push(`/blog/article/${articleId}`)
}

// 监听路由参数变化
watch(() => route.params.id, () => {
  currentPage.value = 1
  fetchTagInfo()
})

// 监听标签信息变化
watch(currentTag, (newTag) => {
  if (newTag) {
    fetchArticles(1)
  }
})

// 组件挂载时获取数据
onMounted(() => {
  fetchTagInfo()
})
</script>

<style lang="scss" scoped>
.tag-detail-page {
  .article-grid {
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all .3s;
    margin-top: 30px;
    
    @keyframes slideIn {
      0% {
        opacity: 0;
        transform: translateY(30px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .articles {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 0.3rem;
      padding: 0.3rem;

      .article-card {
        background-color: #fff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        cursor: pointer; /* 添加手型光标，表明可点击 */
        animation: slideIn 0.8s ease-out forwards;

        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .article-cover {
          position: relative;
          padding-top: 56.25%; // 16:9 比例

          img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .article-info {
          padding: 0.2rem;
          flex: 1;
          display: flex;
          flex-direction: column;

          .article-meta {
            margin-bottom: 0.2rem;
            color: #8c8c8c;
            font-size: 0.4rem;

            .meta-item {
              display: flex;
              align-items: center;
              gap: 0.3rem;

              .el-icon {
                font-size: 0.4rem;
              }
            }
          }

          .article-title {
            font-weight: bold;
            text-align: center;
            margin: 0 0 0.3rem;
            font-size: 0.6rem;
            color: #2c3e50;
          }
        }
      }
    }

    .pagination-container {
      display: flex;
      justify-content: center;
      padding: 0.2rem;
      background: #fff;
      border-radius: 8px;
      margin-bottom: 1.5rem;

      :deep(.el-pagination) {
        --el-pagination-hover-color: var(--el-color-primary);

        .el-pager li:not(.is-active):hover {
          color: var(--el-pagination-hover-color);
        }

        .el-pager li.is-active {
          background-color: var(--el-color-primary);
          color: #fff;
        }
      }
    }
  }
}
</style>