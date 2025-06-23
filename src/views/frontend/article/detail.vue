<template>
  <div class="article-detail">
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="15" animated />
    </div>

    <template v-else>
      <div class="article-main">
        <div class="article-content markdown-body"  ref="markdownContent">
          <MdPreview :modelValue="article.article_content" :showCodeRowNumber="true" @onHtmlChanged="parseToc" />
        </div>
        <div class="article-footer">
          <div class="article-navigation">
            <router-link 
              v-if="prevArticle.id" 
              :to="`/blog/article/${prevArticle.id}`" 
              class="nav-item prev-article"
            >
              <div class="nav-info">
                <span class="nav-label">上一篇</span>
                <div class="nav-title">{{ prevArticle.article_title }}</div>
              </div>
            </router-link>
            <router-link 
              v-if="nextArticle.id" 
              :to="`/blog/article/${nextArticle.id}`" 
              class="nav-item next-article"
            >
              <div class="nav-info">
                <span class="nav-label">下一篇</span>
                <div class="nav-title">{{ nextArticle.article_title }}</div>
              </div>
            </router-link>
          </div>
        </div>
      </div>
      
      <div class="article-sidebar" v-if="tocItems.length > 0">
        <div class="article-toc">
          <div class="toc-title">目录</div>
          <div class="toc-content">
            <div v-for="(item, index) in tocItems" :key="index" 
                class="toc-item" 
                :class="{
                  'level-1': item.level === 1,
                  'level-2': item.level === 2,
                  'level-3': item.level === 3,
                  'active': activeHeading === item.id
                }" 
                @click="scrollToHeading(item.id)">
              {{ item.text }}
            </div>
          </div>
        </div>
      </div>


    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Calendar, Folder, View, Clock } from '@element-plus/icons-vue'
import { MdPreview } from 'md-editor-v3'
import 'highlight.js/styles/github.css' // 优先加载
import 'github-markdown-css/github-markdown.css'
import 'md-editor-v3/lib/style.css' // 最后加载
import requestUtil from '@/utils/request'

const markdownContent = ref(null)
const tocItems = ref([])
const activeHeading = ref('')
let observer = null

const route = useRoute()
const loading = ref(true)
const article = ref({})
const prevArticle = ref({})
const nextArticle = ref({})

// 获取文章详情
const fetchArticleDetail = async () => {
  const articleId = route.params.id
  if (!articleId) return
  loading.value = true
  try {
    const response = await requestUtil.get(`/blog/articles/${articleId}`)
    article.value = response.data || {}

    // 获取上一篇和下一篇文章
    await fetchAdjacentArticles(articleId)

    // // 增加文章阅读量
    // try {
    //   await incrementViewCount(articleId)
    // } catch (error) {
    //   console.error('增加阅读量失败:', error)
    // }
  } catch (error) {
    console.error('获取文章详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 获取上一篇和下一篇文章
const fetchAdjacentArticles = async (articleId) => {
  try {
    const response = await requestUtil.get(`/blog/articles/${articleId}/adjacent-articles/`)
    // 检查响应结构
    if (response && response.data) {
      // 如果响应中有 data.data 结构（后端返回的数据包含在 data 字段中）
      if (response.data.data) {
        prevArticle.value = response.data.data.prev || {}
        nextArticle.value = response.data.data.next || {}
      } 
      // 如果响应中直接是 data 结构
      else if (response.data.prev !== undefined || response.data.next !== undefined) {
        prevArticle.value = response.data.prev || {}
        nextArticle.value = response.data.next || {}
      }
    }
  } catch (error) {
    console.error('获取相邻文章失败:', error)
    prevArticle.value = {}
    nextArticle.value = {}
  }
}

// // 增加文章阅读量
// const incrementViewCount = async (articleId) => {
//   try {
//     await requestUtil.post(`/blog/articles/${articleId}/increment-view/`)
//   } catch (error) {
//     console.error('增加阅读量请求失败:', error)
//     throw error
//   }
// }

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

// 解析文章内容中的标题，生成目录
const parseToc = () => {
  // 确保容器存在
  if (!markdownContent.value) {
    console.error('Markdown container not found')
    return
  }

  // 等待 MdPreview 内部渲染
  nextTick(() => {
    // 添加微任务延迟
    Promise.resolve().then(() => {
      const headings = markdownContent.value.querySelectorAll('h1, h2, h3')
      tocItems.value = Array.from(headings).map(heading => ({
        id: heading.id,
        text: heading.textContent,
        level: parseInt(heading.tagName.charAt(1))
      }))

      // 清理旧 observer
      if (observer) observer.disconnect()
      
      // 创建新 observer
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              activeHeading.value = entry.target.id
            }
          })
        },
        { rootMargin: '-70px 0px -70% 0px' }
      )

      headings.forEach(heading => observer.observe(heading))
    })
  })
}

// 滚动到指定标题
const scrollToHeading = (id) => {
  const heading = document.getElementById(id)
  if (heading) {
    heading.scrollIntoView({ behavior: 'smooth' })
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchArticleDetail()
})

// 在文章内容更新后解析目录
watch(() => article.value.article_content, (newContent) => {
  if (newContent) {
    // 确保DOM已经更新后再解析目录
    nextTick(() => {
      parseToc()
    })
  }
}, { immediate: false })

// 组件卸载时清理 observer
onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      fetchArticleDetail()
    }
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.article-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 40px;

  @media screen and (max-width: 991px) {
    display: block;
  }

  .loading-container {
    padding: 20px;
    width: 100%;
  }

  .article-main {
    min-width: 0;
  }

  .article-tags {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 20px;

    .tag-item {
      padding: 4px 12px;
      background-color: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
      border-radius: 16px;
        text-decoration: none;
        transition: all 0.3s;
        font-size: 0.9em;

        &:hover {
          background-color: var(--el-color-primary-light-8);
          transform: translateY(-1px);
        }
      }
    }
  }

  .article-content {
    line-height: 1.8;
    color: var(--el-text-color-primary);
    background-color: var(--el-bg-color);
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 32px;

    :deep(.md-editor-preview) {
      overflow-x: auto;
      
      pre {
        border-radius: 0px !important;
        padding: 0 !important;
      }
    }
    
    // .markdown-body  {
    //   pre {
    //     padding: 0
    //   }
    //  }
  }

  .article-sidebar {
    width: 280px;

    .article-toc {
      position: sticky;
      top: 80px;
      max-height: calc(100vh - 120px);
      overflow-y: auto;
      padding: 24px;
      background-color: var(--el-bg-color);
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background-color: var(--el-border-color-lighter);
        border-radius: 2px;
      }

      .toc-title {
        font-size: 1.1em;
        font-weight: 600;
        margin-bottom: 16px;
        color: var(--el-text-color-primary);
        padding-bottom: 12px;
        border-bottom: 1px solid var(--el-border-color-lighter);
      }

      .toc-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-size: 0.95em;

        .toc-item {
          cursor: pointer;
          color: var(--el-text-color-regular);
          transition: all 0.3s;
          line-height: 1.6;
          padding: 6px 0;

          &:hover {
            color: var(--el-color-primary);
          }

          &.active {
            color: var(--el-color-primary);
            font-weight: 500;
          }

          &.level-1 {
            padding-left: 0;
          }

          &.level-2 {
            padding-left: 16px;
            font-size: 0.95em;
          }

          &.level-3 {
            padding-left: 32px;
            font-size: 0.9em;
          }
        }
      }
    }
  }


@media screen and (max-width: 1200px) {
  .article-detail {
    padding: 16px;
    gap: 24px;

    .article-content {
      padding: 24px;
    }
  }
}

@media screen and (max-width: 991px) {
  .article-detail {
    .article-sidebar {
      width: 100%;
      margin-top: 24px;

      .article-toc {
        position: static;
        max-height: none;
      }
    }
  }
}

@media screen and (max-width: 576px) {
  .article-detail {
    padding: 12px;

    .article-content {
      padding: 16px;
    }

    .article-header {
      .article-title {
        font-size: 1.8em;
      }

      .article-meta {
        flex-wrap: wrap;
        gap: 16px;
      }
    }

    .article-navigation {
      flex-direction: column;
      gap: 16px;

      .nav-item {
        width: 100%;
      }
    }
  }
}

.article-footer {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid var(--el-border-color-lighter);

  .article-navigation {
    display: flex;
    justify-content: space-between;
    gap: 24px;

    .nav-item {
      flex: 1;
      padding: 16px 20px;
      background-color: var(--el-bg-color);
      border-radius: 8px;
      border: 1px solid var(--el-border-color);
      text-decoration: none;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        border-color: var(--el-color-primary);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .nav-info {
        .nav-label {
          display: block;
          font-size: 0.9em;
          color: var(--el-text-color-secondary);
          margin-bottom: 8px;
        }

        .nav-title {
          color: var(--el-text-color-primary);
          font-size: 1.1em;
          font-weight: 500;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.5;
        }

        .nav-date {
          font-size: 0.85em;
          color: var(--el-text-color-secondary);
        }
      }

      &.prev-article {
        text-align: left;
      }

      &.next-article {
        text-align: right;
      }
    }
  }
}
</style>