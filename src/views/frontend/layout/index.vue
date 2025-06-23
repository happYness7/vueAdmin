<template>
  <div class="blog-container">
    <!-- 登录对话框组件 -->
    <LoginDialog ref="loginDialogRef" @login-success="currentUser = $event" />
    <HeroSection 
      :is-home="route.path === '/blog/home'"
      :title="getHeroTitle"
      :background-url="getHeroBackground"
      :article-meta="getArticleMeta"
      @scroll-to-content="scrollToContent"
    >
      <!-- 在留言页面的HeroSection中添加发送按钮 -->
      <template v-if="route.path.startsWith('/blog/message')" #message-input>
        <MessageSender ref="messageRef" />
      </template>
    </HeroSection>
    <header class="blog-header" :class="{ 'scrolled': isScrolled }">
      <div class="header-content">
        <div class="logo">
          <router-link to="/blog">
            <h1>happYness7</h1>
          </router-link>
        </div>
        <nav class="nav-menu">
          <ul>
            <li><router-link to="/blog">首页</router-link></li>
            <li><router-link to="/blog/category">分类</router-link></li>
            <li><router-link to="/blog/tag">标签</router-link></li>
            <li><router-link to="/blog/album">相册</router-link></li>
            <li><router-link to="/blog/message">留言</router-link></li>
            <li><a href="javascript:void(0)" @click="goToAdmin">后台</a></li>
            <li v-if="!currentUser.id">
              <a href="javascript:void(0)" @click="openLoginDialog">登录</a>
            </li>
            <li v-else class="user-avatar-item">
              <div class="user-avatar" @click="handleUserClick">
                <img v-if="currentUser.avatar" :src="currentUser.avatar" alt="用户头像">
                <div v-else class="avatar-placeholder">{{ currentUser.username?.charAt(0)?.toUpperCase() }}</div>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </header>

    <main class="blog-main">
      <router-view />
    </main>
    <!-- 新增回到顶部按钮 -->
    <el-tooltip content="回到顶部" placement="left">
      <transition name="el-fade-in">
        <div 
          v-show="showBackToTop"
          class="back-to-top"
          @click="scrollToTop"
        >
          <el-icon :size="24"><ArrowUpBold /></el-icon>
        </div>
      </transition>
    </el-tooltip>
    <footer class="blog-footer">
      <div class="footer-content">
        <p>© {{ new Date().getFullYear() }} 个人博客 | 版权所有</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowUpBold } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import HeroSection from '@/views/frontend/components/HeroSection.vue'
import MessageSender from '@/views/frontend/components/MessageSender.vue'
import LoginDialog from '@/views/frontend/components/LoginDialog.vue'
import requestUtil from '@/utils/request'
import store from '@/store'

const router = useRouter()
const showBackToTop = ref(false)


const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
  // 新增判断：当滚动超过200px时显示按钮
  showBackToTop.value = window.scrollY > 200
}
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
  
  // 兼容性备用方案
  if (typeof window.scrollY === 'undefined') {
    document.documentElement.scrollTop = 0
  }
}
// 返回后台管理页面，保持原有标签页状态
const goToAdmin = () => {
  // 获取当前激活的标签页
  const activeTab = store.state.editableTabsValue
  // 如果有激活的标签页且不是默认首页，则跳转到该标签页
  if (activeTab && activeTab !== '/admin/index') {
    router.push(activeTab)
  } else {
    // 否则跳转到后台首页
    router.push('/admin/index')
  }
}

const route = useRoute()
const isScrolled = ref(false)
const currentCategory = ref(null)
const currentTag = ref(null)
const currentAlbum = ref(null)

// 留言页面组件引用
const messageRef = ref(null)

// 登录对话框引用
const loginDialogRef = ref(null)

// 当前用户信息
const currentUser = ref({})

// 监听路由变化，处理留言页面
watch(() => route.path, (newPath) => {
  // 如果是留言页面，确保MessageSender组件可以正常工作
  if (newPath.startsWith('/blog/message')) {
    // 这里不需要额外处理，因为message/index.vue组件会自行初始化
  }
}, { immediate: true })

// 自动同步sessionStorage中的用户信息变化
watchEffect(() => {
  const sessionData = JSON.parse(sessionStorage.getItem('currentUser') || '{}')
  if (sessionData.id) {
    currentUser.value = sessionData
  }
})

// 打开登录对话框
const openLoginDialog = () => {
  loginDialogRef.value.openDialog()
}

// 处理用户头像点击事件
const handleUserClick = () => {
  // 使用 Element Plus 的确认对话框
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('currentUser')
    sessionStorage.removeItem('menuList')
    currentUser.value = {}
    ElMessage.success('已成功退出登录')
  }).catch(() => {
    // 用户点击取消，不做任何操作
  })
}




// 监听路由变化，获取分类信息
watch(() => route.path, async (newPath) => {
  if (newPath.startsWith('/blog/category/detail/')) {
    const categoryId = route.params.id
    try {
      const response = await requestUtil.get(`/blog/categories/${categoryId}/`)
      currentCategory.value = response.data
    } catch (error) {
      console.error('获取分类信息失败:', error)
      currentCategory.value = null
    }
  } else {
    currentCategory.value = null
  }
}, { immediate: true })





watch(() => route.path, async (newPath) => {
  if (newPath.startsWith('/blog/tag/detail/')) {
    const tagId = route.params.id
    try {
      const response = await requestUtil.get(`/blog/tags/${tagId}/`)
      currentTag.value = response.data
    } catch (error) {
      console.error('获取标签信息失败:', error)
      currentTag.value = null
    }
  } else {
    currentTag.value = null
  }
}, { immediate: true })

watch(() => route.path, async (newPath) => {
  if (newPath.startsWith('/blog/album/detail/')) {
    const albumId = route.params.id
    try {
      const response = await requestUtil.get(`/blog/albums/${albumId}/`)
      currentAlbum.value = response.data
    } catch (error) {
      console.error('获取相册信息失败:', error)
      currentAlbum.value = null
    }
  } else {
    currentAlbum.value = null
  }
}, { immediate: true })

// 根据路由获取 Hero 区域的背景图
// 获取当前路由的文章信息
const currentArticle = ref(null)

// 监听路由变化，获取文章信息
watch(() => route.path, async (newPath) => {
  if (newPath.startsWith('/blog/article/')) {
    const articleId = route.params.id
    try {
      const response = await requestUtil.get(`/blog/articles/${articleId}/`)
      currentArticle.value = response.data
    } catch (error) {
      console.error('获取文章信息失败:', error)
      currentArticle.value = null
    }
  } else {
    currentArticle.value = null
  }
}, { immediate: true })

const getHeroBackground = computed(() => {
  const path = route.path
  
  // 如果是文章详情页面且文章有封面，使用文章封面
  if (path.startsWith('/blog/article/') && currentArticle.value?.article_cover) {
    return currentArticle.value.article_cover
  }
  if (path.startsWith('/blog/category/detail/')) {
    return 'https://pub-d470eef1ae124f929afa0d8350e779c7.r2.dev/blog/photos/e8b00016a81d4a3db232c01e508b0805.png'
  }
  if (path.startsWith('/blog/tag/detail/')) {
    return 'https://pub-d470eef1ae124f929afa0d8350e779c7.r2.dev/blog/photos/a04f1940a1ed46ffbb6465a34156d2bc.png'
  }
  if (path.startsWith('/blog/album/detail/') && currentAlbum.value?.album_cover) {
    return currentAlbum.value.album_cover
  }
  
  // 其他页面使用预设的背景图
  const pathMap = {
    '/blog/category': 'https://pub-d470eef1ae124f929afa0d8350e779c7.r2.dev/blog/photos/2479be7483b44029b8f15d1a19e3ec7e.png',
    '/blog/tag': 'https://pub-d470eef1ae124f929afa0d8350e779c7.r2.dev/blog/photos/55728f66d4b34e708445a93bd341a825.png',
    '/blog/album': 'https://pub-d470eef1ae124f929afa0d8350e779c7.r2.dev/blog/photos/678261a9d1d24a80a9e9b226b805b23b.jpg',
    '/blog/message': 'https://pub-d470eef1ae124f929afa0d8350e779c7.r2.dev/blog/photos/0296f3d995ed48ac9c11644ecc7cf29a.png',
  }
  return pathMap[path] || 'https://pub-d470eef1ae124f929afa0d8350e779c7.r2.dev/blog/photos/a03cbe8d9c6942b7958339dd8347ff67.png'
})

const getTypeText = (type) => {
    const map = { 1: '原创', 2: '转载', 3: '翻译' }
    return map[type] || '其他'
}
// 获取文章元信息
const getArticleMeta = computed(() => {
  const path = route.path
  
  // 如果是文章详情页面，返回文章元信息
  if (path.startsWith('/blog/article/') && currentArticle.value) {
    const article = currentArticle.value
    return {
      article_title: article.article_title,
      createdAt: formatDate(article.created_at),
      updatedAt: article.updated_at ? formatDate(article.updated_at) : null,
      type: getTypeText(article.type),
      author: article.author ? article.author.username : null,
      category: article.category ? article.category.category_name : null,
      tags: article.tags || []
    }
  }
  return null
})
// 根据路由获取 Hero 区域的标题
const getHeroTitle = computed(() => {
  const path = route.path
  if (route.path.startsWith('/blog/article/')) return ''
  if (route.path.startsWith('/blog/category/detail/')) {
    if (!currentCategory.value) return '文章列表'
    return currentCategory.value.category_name || '文章列表'
  }
  if (route.path.startsWith('/blog/tag/detail/')) {
    if (!currentTag.value) return '文章列表'
    return currentTag.value.tag_name || '文章列表'
  }
  if (route.path.startsWith('/blog/album/detail/')) {
    if (!currentAlbum.value) return '照片列表'
    return currentAlbum.value.album_name || '照片列表'
  }
  const pathMap = {
    '/blog/category': '文章分类',
    '/blog/tag': '文章标签',
    '/blog/album': '相册',
    '/blog/message': '留言板',
  }
  return pathMap[path] || ''
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const scrollToContent = () => {
  const mainContent = document.querySelector('.blog-main')
  if (mainContent) {
    mainContent.scrollIntoView({ behavior: 'smooth' })
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="scss" scoped>
.blog-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin-bottom: 10px;

  .back-to-top {
  position: fixed;
  bottom: 60px;
  right: 30px;
  z-index: 999;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(64, 158, 255, 0.9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;

  &:hover {
    background-color: #409eff;
    transform: translateY(-3px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }

  // 移动端适配
  @media (max-width: 768px) {
    bottom: 20px;
    right: 20px;
    width: 36px;
    height: 36px;
  }
}
}

.blog-header {
  background-color: rgba(255, 255, 255, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  // transition: all 0.3s ease;
  // backdrop-filter: blur(10px);

  &.scrolled {
    background-color: rgba(255, 255, 255, 0.85);
    padding: 0.1rem 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);

    .header-content {
      padding: 0.1rem 1rem;
    }

    .logo h1 {
      font-size: 0.5rem;
      color: #000;
    }

    .nav-menu ul li a {
      font-size: 0.35rem;
      color: #000;

      &:hover, &.router-link-active {
        color: #333;
      }

      &::after {
        background-color: #000;
      }
    }
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0.2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    h1 {
      margin: 0;
      font-size: 0.6rem;
      color: #333;
      text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5);
    }

    a {
      text-decoration: none;
      color: inherit;
    }
  }

  .nav-menu {
    ul {
      display: flex;
      list-style: none;
      align-items: center; // 新增垂直居中
      margin: 0;
      padding: 0;

      li {
        margin-left: 1.5rem;

        a {
          text-decoration: none;
          color: #333;
          font-weight: 500;
          padding: 0.5rem 0;
          position: relative;
          transition: all 0.3s;
          text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5);

          &:hover, &.router-link-active {
            color: #000;
            text-shadow: 1px 1px 4px rgba(255, 255, 255, 0.8);
          }

        }
      }
    }
  }
}

.blog-main {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  // padding: 4rem 1rem 2rem;
  position: relative;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100vw;
    right: -100vw;
    bottom: 0;
    background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.9) 200px);
    z-index: -1;
    pointer-events: none;
  }
}

.blog-footer {
  background-color: transparent;
  color: black;
  padding: 0.3rem 0;
  margin-top: 1rem;
  position: relative;
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  }
}

@media (max-width: 768px) {
  .send-button-wrapper {
    &:hover {
      .input-container {
        width: 180px !important;
      }
      .send-button {
        transform: translateX(90px) !important; /* 调整为移动端宽度的一半 */
      }
    }
  }
}

@media (max-width: 576px) {
  .send-button-wrapper {
    &:hover {
      .input-container {
        width: 150px !important;
      }
      .send-button {
        transform: translateX(75px) !important; /* 调整为移动端宽度的一半 */
      }
    }
  }
}

/* 用户头像样式 */
.user-avatar-item {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .avatar-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #409eff;
    color: white;
    font-weight: bold;
    font-size: 18px;
  }
}
</style>