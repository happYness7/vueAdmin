<template>
  <section class="hero-section" :style="{ height: backgroundHeight + 'px' }">
    <div class="hero-background" :style="{ backgroundImage: `url(${backgroundUrl})` }"></div>
    <div class="hero-overlay" :class="{ 'detail-overlay': isArticleDetail }"></div>
    <div class="hero-content">
      <template v-if="isHome">
        <h1 class="hero-title">happYness7's Blog</h1>
        <p class="hero-subtitle">Happiness is a butterfly</p>
        <div class="scroll-down" @click="scrollToContent">
          <span class="arrow"></span>
        </div>
      </template>
      <template v-else>
        <div class="hero-meta" v-if="articleMeta">
          <h1 class="meta-title">{{ articleMeta.article_title }}</h1>
          <div class="meta-items-row">
            <span class="meta-item">
              <el-icon>
                <Calendar />
              </el-icon>
              {{ articleMeta.createdAt }}
            </span>
            <span class="meta-divider">|</span>
            <span class="meta-item" v-if="articleMeta.updatedAt">
              <el-icon>
                <Clock />
              </el-icon>
              {{ articleMeta.updatedAt }}
            </span>
            <span class="meta-divider" v-if="articleMeta.updatedAt">|</span>
            <span class="meta-item" v-if="articleMeta.author">
              <el-icon>
                <User />
              </el-icon>
              {{ articleMeta.author }}
            </span>
            <span class="meta-divider" v-if="articleMeta.author">|</span>

            <span class="meta-item" v-if="articleMeta.type">
              <el-icon>
                <InfoFilled />
              </el-icon>
              {{ articleMeta.type }}
            </span>
            <span class="meta-divider" v-if="articleMeta.type">|</span>
            <span class="meta-item" v-if="articleMeta.category">
              <el-icon>
                <Folder />
              </el-icon>
              {{ articleMeta.category }}
            </span>
            <span class="meta-divider" v-if="articleMeta.category">|</span>
          </div>
        </div>
        <div class="article-tags" v-if="articleMeta && articleMeta.tags && articleMeta.tags.length > 0">
          <el-icon>
            <Discount />
          </el-icon>
          <router-link v-for="tag in articleMeta.tags" :key="tag.id" :to="`/blog/tag/detail/${tag.id}`" class="tag-item">
            {{ tag.tag_name }}
          </router-link>
        </div>
        <h1 class="hero-subtitle" v-if="title">{{ title }}</h1>
        
        <!-- 留言页面的发送按钮插槽 -->
        <slot name="message-input"></slot>
      </template>
    </div>
    <Wave />
  </section>
</template>

<script setup>
import { computed } from 'vue'
import Wave from '@/views/frontend/components/Wave/index.vue'
import { Calendar, Folder, User, InfoFilled, Clock, Discount } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isArticleDetail = computed(() => {
  return /^\/blog\/article\/\d+$/.test(route.path)
})

const props = defineProps({
  isHome: {
    type: Boolean,
    required: true
  },
  backgroundUrl: {
    type: String,
    default: 'https://pub-d470eef1ae124f929afa0d8350e779c7.r2.dev/background/Flower.jpg'
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  articleMeta: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['scroll-to-content'])

const backgroundHeight = computed(() => {
  const isMessage = route.path.startsWith('/blog/message')
  return props.isHome || isMessage ? window.innerHeight : 350
})

const scrollToContent = () => {
  emit('scroll-to-content')
}
</script>

<style lang="scss" scoped>
.hero-section {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  transform: scale(1.1);
  transition: transform 0.3s ease;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  // background-color: rgba(0, 0, 0, 0.3);
  z-index: 1;
  // transition: background-color 0.3s ease;

  &.detail-overlay {
    background-color: rgba(0, 0, 0, 0.6);
  }
}

.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #fff;
  text-align: center;
  padding: 0 1rem;
}

.hero-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s ease forwards;
}

.hero-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 10px 0 15px;
  font-size: 0.9rem;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s ease 0.1s forwards;
  flex-direction: column;

  .meta-title {
    font-size: 1.5rem; // 适当放大标题
    margin-bottom: 0.3rem; // 移除原有间距
  }

  .meta-items-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap; // 允许换行
    gap: 8px; // 替代原有的 margin 间距
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.4rem;
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  }

  .meta-divider {
    margin: 0 8px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.4rem;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  }
}

.article-tags {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 15px;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s ease 0.15s forwards;

  .tag-item {
    padding: 4px 12px;
    background-color: rgba(255, 255, 255, 0.2);
    color: #fff;
    border-radius: 16px;
    text-decoration: none;
    transition: all 0.3s;
    font-size: 0.9em;

    &:hover {
      background-color: rgba(255, 255, 255, 0.3);
      transform: translateY(-1px);
    }
  }
}

.hero-subtitle {
  font-size: 0.7rem;
  max-width: 700px;
  margin: 0 auto;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s ease 0.2s forwards;
}

.scroll-down {
  position: absolute;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  animation: bounce 2s infinite;
}

.arrow {
  display: block;
  width: 20px;
  height: 20px;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
  transform: rotate(45deg);
  transition: all 0.3s;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {

  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateX(-50%) translateY(0);
  }

  40% {
    transform: translateX(-50%) translateY(-10px);
  }

  60% {
    transform: translateX(-50%) translateY(-5px);
  }
}
</style>