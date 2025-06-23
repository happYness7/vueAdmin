<template>
    <div class="blog-home">
        <div class="content-container">
            <div class="main-content">
                <div ref="articleListAnchor" class="article-container">
                    <ArticleList :articles="articles" :loading="loading" />
                </div>
                <Pagination :total="total" :page-size="pageSize" :current-page="currentPage"
                    @page-change="handlePageChange" />
            </div>
            <div class="sidebar">
                <AboutCard :blog-config="blogConfig" :article-total="articleTotal" :category-total="categoryTotal"
                    :tag-total="tagTotal" />
                <NoticeCard :notice="blogConfig.blog_notice" />
                <TagCloud :tags="tags" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import requestUtil from '@/utils/request'
import { useStatsStore } from '@/store/stats'
import { nextTick } from 'vue'

// 导入组件
import ArticleList from '../components/ArticleList.vue'
import AboutCard from '../components/AboutCard.vue'
import NoticeCard from '../components/NoticeCard.vue'
import TagCloud from '../components/TagCloud.vue'
import Pagination from '../components/Pagination.vue'


// 统计数据store
const statsStore = useStatsStore()

// 统计数据
const articleTotal = computed(() => statsStore.articleTotal)
const categoryTotal = computed(() => statsStore.categoryTotal)
const tagTotal = computed(() => statsStore.tagTotal)
const articleListAnchor = ref(null)
// 博客配置信息
const blogConfig = ref({
    blog_name: '',
    blog_avatar: '',
    personal_say: '',
    blog_notice: '',
    qq_link: '',
    we_chat_link: '',
    github_link: '',
    git_ee_link: ''
})

// 文章列表数据
const articles = ref([])
const categories = ref([])
const tags = ref([])
const loading = ref(true)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(5)

// 获取文章列表
const fetchArticles = async () => {
    loading.value = true
    const params = {
        pageNum: currentPage.value,
        pageSize: pageSize.value
    }
    try {
        const response = await requestUtil.get('/blog/articles/', params)
        articles.value = response.data.articleList || []
        total.value = response.data.total || 0
    } catch (error) {
        console.error('获取文章列表失败:', error)
    } finally {
        loading.value = false
    }
}

// 获取分类列表
const fetchCategories = async () => {
    try {
        const response = await requestUtil.get('/blog/categories')
        categories.value = response.data || []
    } catch (error) {
        console.error('获取分类列表失败:', error)
    }
}

// 获取标签列表
const fetchTags = async () => {
    try {
        const response = await requestUtil.get('/blog/tags')
        tags.value = response.data || []
    } catch (error) {
        console.error('获取标签列表失败:', error)
    }
}

// 获取博客配置信息
const fetchBlogConfig = async () => {
    try {
        const response = await requestUtil.get('/blog/configs')
        if (response.status === 200 && response.data.length > 0) {
            blogConfig.value = response.data[0]
        }
    } catch (error) {
        console.error('获取博客配置信息失败:', error)
    }
}
const handlePageChange = async (newPage) => {
    currentPage.value = newPage
    await fetchArticles()

    // 等待DOM更新和数据加载完成
    nextTick(() => {
        const target = articleListAnchor.value
        if (target) {
            // 获取容器距顶部的距离（考虑fixed header的情况）
            const offset = target.getBoundingClientRect().top + window.pageYOffset - 100
            window.scrollTo({
                top: offset,
                behavior: 'smooth'
            })
        }
    })
}

onMounted(() => {
    fetchArticles()
    fetchCategories()
    fetchTags()
    fetchBlogConfig()
    statsStore.fetchStats()
})
</script>

<style lang="scss" scoped>
.blog-home {
    position: relative;
    min-height: 100vh;

    .main-content {
        flex: 1;
        max-width: 800px;
        margin-right: 1.5rem;
    }
    .article-container {
            transition: opacity 0.3s ease;
        }

    .content-container {
        position: relative;
        width: 100%;
        min-height: 100vh;
        display: flex;
        gap: 0.1rem;
        padding-top: 10px;
        background: transparent;
        z-index: 1;

        .sidebar {
            padding: 0.5rem;
            width: 300px;

            :deep(.sidebar-card) {
                background-color: rgba(255, 255, 255, 0.9);
                border-radius: 12px;
                padding: 0.7rem;
                margin-bottom: 0.5rem;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

                .card-title {
                    font-size: 0.5rem;
                    margin-top: 0;
                    margin-bottom: 0.3rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 1px solid #f0f0f0;
                    position: relative;
                    font-weight: 600;
                }
            }
        }
    }
}
</style>
