<template>
    <div class="article-list">
        <div v-if="loading" class="loading-container">
            <el-skeleton :rows="5" animated />
        </div>

        <div v-else-if="articles.length === 0" class="empty-container">
            <el-empty description="暂无文章" />
        </div>

        <div v-else class="articles">
            <div v-for="(article, index) in articles" :key="article.id"
                :class="['article-card', index % 2 === 1 ? 'reverse' : '']"
                :style="{'--i': index}">
                <template v-if="article.article_cover">
                    <div class="article-cover">
                        <img :src="article.article_cover" :alt="article.article_title">
                    </div>
                </template>
                <div class="article-info">
                    <h3 class="article-title">
                        <router-link :to="`/blog/article/${article.id}`">{{ article.article_title }}</router-link>
                        <el-icon v-if="article.is_top === 1" class="top-icon">
                            <Top />
                        </el-icon>
                    </h3>
                    <div class="article-meta">
                        <span class="meta-item">
                            <el-icon><Calendar /></el-icon>
                            {{ formatDate(article.created_at) }}
                        </span>
                        <span class="meta-divider">|</span>
                        <span class="meta-item">
                            <el-icon><Clock /></el-icon>
                            {{ formatDate(article.updated_at) }}
                        </span>
                        <span class="meta-divider">|</span>
                        <span class="meta-item" v-if="article.category">
                            <el-icon><Folder /></el-icon>
                            <router-link :to="`/blog/category/${article.category.id}`">{{ article.category.category_name }}</router-link>
                        </span>
                        <span class="meta-divider">|</span>
                        <span class="meta-item">
                            <el-icon><View /></el-icon>
                            {{ article.view_count || 0 }} 阅读
                        </span>
                    </div>
                    <div class="article-tags" v-if="article.tags && article.tags.length > 0">
                        <el-icon><Discount /></el-icon>
                        <router-link v-for="(tag, index) in article.tags" :key="tag.id" :to="`/blog/tag/${tag.id}`" class="tag-item">
                            {{ tag.tag_name }}{{ index < article.tags.length - 1 ? '、' : '' }}
                        </router-link>
                    </div>
                    <p class="article-desc">{{ article.article_description }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Calendar, Folder, View, Discount, Top, Clock } from '@element-plus/icons-vue'

defineProps({
    articles: {
        type: Array,
        default: () => []
    },
    loading: {
        type: Boolean,
        default: false
    }
})

const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
</script>

<style lang="scss" scoped>
.article-list {
    flex: 1;

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

    .loading-container,
    .empty-container {
        padding: 2rem 0;
    }

    .articles {
        display: flex;
        flex-direction: column;
        padding: 0.5rem;
    }

    .article-title {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .meta-divider {
        margin: 0 4px;
        color: #909399;
    }

    .article-card {
        width: 850px;
        display: flex;
        background-color: #fff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: transform 0.3s, box-shadow 0.3s;
        margin-bottom: 0.5rem;
        height: 250px;
        animation: slideIn 0.8s ease-out calc(var(--i) * 0.1s) forwards;

        &.reverse {
            flex-direction: row-reverse;
        }

        &:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }

        .article-cover {
            width: 350px;
            height: 289.5px;
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
            flex-direction: column;
        }

        .article-title {
            margin-top: 0;
            margin-bottom: 0.6rem;
            font-size: 0.5rem;
            font-weight: 600;
            position: relative;
            display: flex;
            align-items: center;

            .top-icon {
                color: #ff5722;
                margin-right: 8px;
                font-size: 18px;
                transform: translateY(-1px);
            }

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
            margin-bottom: 0.8rem;
            flex: 1;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            font-size: 0.4rem;
            line-height: 1.5;
        }

        .article-meta {
            display: flex;
            color: #999;
            font-size: 100%;
            font-weight: 500;
            margin-bottom: 0.3rem;

            .meta-item {
                display: flex;
                align-items: center;
                gap:0.1rem;

                a {
                    color: #999;
                    text-decoration: none;

                    &:hover {
                        color: #999;
                    }
                }
            }
        }

        .article-tags {
            display: flex;
            color: #999;
            margin-bottom: 0.3rem;
            gap:0.1rem;

            .tag-item {
                font-size: 0.3rem;
                text-decoration: none;
                color: #999;
                transition: all 0.3s;
                gap:0.1rem;
            }
        }
    }
}
</style>