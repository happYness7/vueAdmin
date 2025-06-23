<!-- index/index.vue -->
<template>
  <div class="dashboard-container">
    <el-card class="data-card mb-20">
      <div class="card-header">
        <el-icon><DataAnalysis /></el-icon>
        <span>核心数据概览</span>
      </div>
      <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="6" class="mb-20">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><User /></el-icon>
              <span>用户总数</span>
            </div>
          </template>
          <div class="card-content">
            <count-to :startVal="0" :endVal="userTotal" :duration="2000"/>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6" class="mb-20">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Document /></el-icon>
              <span>文章总数</span>
            </div>
          </template>
          <div class="card-content">
            <count-to :startVal="0" :endVal="articleTotal" :duration="2000"/>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6" class="mb-20">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><PriceTag /></el-icon>
              <span>标签总数</span>
            </div>
          </template>
          <div class="card-content">
            <count-to :startVal="0" :endVal="tagTotal" :duration="2000"/>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6" class="mb-20">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Collection /></el-icon>
              <span>分类总数</span>
            </div>
          </template>
          <div class="card-content">
            <count-to :startVal="0" :endVal="categoryTotal" :duration="2000"/>
          </div>
        </el-card>
      </el-col>
    </el-row>

    </el-card>

    <el-card class="operation-card">
      <div class="card-header">
        <el-icon><Operation /></el-icon>
        <span>快捷操作入口</span>
      </div>
    <el-row :gutter="20" class="mb-8">
      <el-col :xs="24" :sm="12" :md="6" v-for="item in shortcuts" :key="item.title">
        <el-card class="quick-card" shadow="hover" @click="gotoRoute(item.path)">
          <div class="card-content">
            <el-icon :size="28" class="icon"><component :is="item.icon" /></el-icon>
            <h4 class="title">{{ item.title }}</h4>
          </div>
        </el-card>
      </el-col>
    </el-row>
    </el-card>
  </div>
</template>

<script setup>
import { useStatsStore } from '@/store/stats'
import { Document, User, EditPen, List, PriceTag, Collection, DataAnalysis, Operation } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import CountTo from '@/components/CountTo/index.vue'
import { computed, onMounted, onBeforeUnmount } from 'vue'
import store from '@/store'

const statsStore = useStatsStore()

// 响应式数据
const userTotal = computed(() => statsStore.userTotal)
const articleTotal = computed(() => statsStore.articleTotal)
const tagTotal = computed(() => statsStore.tagTotal)
const categoryTotal = computed(() => statsStore.categoryTotal)

const router = useRouter()
// 从用户权限菜单中过滤出有权限的快捷操作
const shortcuts = computed(() => {
  // 获取用户菜单列表
  const menuList = JSON.parse(sessionStorage.getItem('menuList') || '[]')
  
  // 定义所有可能的快捷操作
  const allShortcuts = [
    { title: '文章列表', icon: List, path: '/admin/blog/article/list' },
    { title: '用户管理', icon: User, path: '/admin/sys/user' },
    { title: '创建文章', icon: EditPen, path: '/admin/blog/article/add' },
    { title: '个人中心', icon: User, path: '/admin/userCenter' }
  ]
  
  // 检查用户是否有权限访问特定路径
  const hasPermission = (path) => {
    // 个人中心始终可访问
    if (path === '/admin/userCenter') return true
    
    // 扁平化菜单列表，包括子菜单
    const flatMenus = menuList.reduce((acc, menu) => {
      acc.push(menu)
      if (Array.isArray(menu.children)) {
        acc.push(...menu.children)
      }
      return acc
    }, [])
    
    // 检查路径是否在用户的菜单列表中
    return flatMenus.some(menu => menu.path === path)
  }
  
  // 过滤出用户有权限的快捷操作
  return allShortcuts.filter(item => hasPermission(item.path))
})

const gotoRoute = (path) => {
  // 获取路由信息以提取标题
  const route = router.resolve(path)
  // 添加到标签页
  const routeName = route.meta.title || route.name
  // 使用store提交ADD_TABS，确保添加到标签列表
  store.commit('ADD_TABS', {
    name: routeName,
    path: path
  })
  // 然后跳转到目标路由
  router.push(path)
}

// 定时刷新逻辑
let refreshTimer = null

onMounted(() => {
  refreshTimer = setInterval(() => {
    statsStore.fetchStats()
  }, 300000) // 5分钟刷新
  statsStore.fetchStats() // 立即获取初始数据
})

onBeforeUnmount(() => {
  clearInterval(refreshTimer)
})
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;

  .data-card {
    margin-bottom: 20px;
    .mt-20 {
      margin-top: 20px;
    }
    .card-header {
      font-size: 16px;
      color: var(--el-text-color-primary);
      padding: 16px 20px;
      .el-icon {
        margin-right: 8px;
      }
    }
  }
  
  .mb-20 {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;

    .el-icon {
      font-size: 18px;
    }
  }

  .card-content {
    font-size: 24px;
    color: var(--el-color-primary);
    font-weight: bold;
    text-align: center;
  }

  .quick-card {
    cursor: pointer;
    transition: transform 0.2s;
    margin-bottom: 20px;

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
    }

    .card-content {
      display: flex;
      align-items: center;
      padding: 20px 0;

      .icon {
        margin-right: 15px;
        color: var(--el-color-primary);
      }

      .title {
        margin: 0;
        font-size: 16px;
        color: var(--el-text-color-primary);
      }
    }
  }
}

.operation-card .card-header {
  margin-bottom: 20px;
}
</style>