<template>
  <div class="menu-container">
    <div class="menu-header">
      <span class="title">happYness7</span>
    </div>
    <el-menu active-text-color="#ffd04b" background-color="#2d3a4b" class="el-menu-vertical-demo" text-color="#fff"
      router :default-active="$route.path">
      <!-- 首页固定菜单 -->
      <el-menu-item index="/admin/index" @click="openTab({ name: '首页', path: '/admin/index' })">
        <el-icon><home-filled /></el-icon>
        <span>首页</span>
      </el-menu-item>

      <!-- 动态菜单渲染 -->
      <template v-for="menu in processedMenuList" :key="menu.path">
        <!-- 目录类型（包含子菜单） -->
        <el-sub-menu v-if="menu.menu_type === 'M' && menu.children?.length" :index="menu.path">
          <template #title>
            <el-icon><svg-icon :icon="menu.icon" /></el-icon>
            <span>{{ menu.name }}</span>
          </template>
          <el-menu-item v-for="child in menu.children" :key="child.path" :index="child.path" @click="openTab(child)">
            <el-icon><svg-icon :icon="child.icon" /></el-icon>
            <span>{{ child.name }}</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 菜单类型（无子菜单） -->
        <el-menu-item v-else-if="menu.menu_type === 'C'" :index="menu.path" @click="openTab(menu)">
          <el-icon><svg-icon :icon="menu.icon" /></el-icon>
          <span>{{ menu.name }}</span>
        </el-menu-item>
      </template>
      <div class="blog-home-button">
        <el-menu-item index="/blog/home" @click="openTab({ name: '博客首页', path: '/blog/home' })">
          <el-icon><home-filled /></el-icon>
          <span>博客首页</span>
        </el-menu-item>
      </div>
    </el-menu>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import store from '@/store'
import { HomeFilled } from '@element-plus/icons-vue'

const route = useRoute()

// 处理菜单数据
const menuList = ref([])

// 初始化菜单数据
const initMenuList = () => {
  try {
    // 只在初始化时解析一次JSON数据
    const rawList = JSON.parse(sessionStorage.getItem('menuList')) || []
    menuList.value = rawList.map(menu => ({
      ...menu,
      // 确保children存在且为数组
      children: Array.isArray(menu.children) ? menu.children : []
    }))
  } catch (error) {
    console.error('解析菜单数据出错:', error)
    menuList.value = []
  }
}

// 监听sessionStorage中menuList的变化
window.addEventListener('storage', (e) => {
  if (e.key === 'menuList') {
    initMenuList()
  }
})

// 计算处理后的菜单列表
const processedMenuList = computed(() => menuList.value)

// 组件挂载时初始化菜单数据
onMounted(() => {
  initMenuList()
})

const openTab = (item) => {
  // 过滤无效菜单项
  if (!item.path || item.menu_type !== 'C') return
  store.commit('ADD_TABS', {
    name: item.name,
    path: item.path
  })
}
</script>

<style lang="scss" scoped>
.menu-container {
  background-color: #2d3a4b;
  height: 100vh; // 确保容器占满整个高度
  display: flex;
  flex-direction: column;
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background-color: rgba(0, 0, 0, 0.1); /* 添加背景色增强层次感 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 添加阴影效果 */
}

.title {
  color: #fff;
  font-size: 18px;
  font-weight: 600; /* 加粗字体 */
  margin: 0;
  letter-spacing: 1px; /* 增加字母间距 */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3); /* 添加文字阴影 */
}

.el-menu-vertical-demo {
  flex: 1; // 使菜单内容占满剩余空间
  display: flex;
  flex-direction: column;

  // 目录菜单样式
  .el-sub-menu {
    &__title {
      &:hover {
        background-color: rgba(#000, 0.2) !important;
      }
    }
  }

  // 叶子菜单样式
  .el-menu-item {
    &::after {
      content: '';
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 60%;
      width: 3px;
      background: transparent;
      transition: all 0.3s;
    }

    &.is-active::after {
      background: #ffd04b;
    }
  }
}

.blog-home-button {
  margin-top: auto; // 将按钮推到容器底部
  border-top: 1px solid rgba(255, 255, 255, 0.1); // 添加分割线
}
</style>