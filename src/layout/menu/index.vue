<template>
  <el-menu 
    active-text-color="#ffd04b" 
    background-color="#2d3a4b" 
    class="el-menu-vertical-demo" 
    text-color="#fff"
    router 
    :default-active="$route.path"
  >
    <!-- 首页固定菜单 -->
    <el-menu-item index="/index" @click="openTab({name:'首页', path:'/index'})">
      <el-icon><home-filled /></el-icon>
      <span>首页</span>
    </el-menu-item>

    <!-- 动态菜单渲染 -->
    <template v-for="menu in processedMenuList" :key="menu.path">
      <!-- 目录类型（包含子菜单） -->
      <el-sub-menu 
        v-if="menu.menu_type === 'M' && menu.children?.length"
        :index="menu.path"
      >
        <template #title>
          <el-icon><svg-icon :icon="menu.icon"/></el-icon>
          <span>{{ menu.name }}</span>
        </template>
        <el-menu-item 
          v-for="child in menu.children" 
          :key="child.path" 
          :index="child.path"
          @click="openTab(child)"
        >
          <el-icon><svg-icon :icon="child.icon"/></el-icon>
          <span>{{ child.name }}</span>
        </el-menu-item>
      </el-sub-menu>

      <!-- 菜单类型（无子菜单） -->
      <el-menu-item 
        v-else-if="menu.menu_type === 'C'"
        :index="menu.path"
        @click="openTab(menu)"
      >
        <el-icon><svg-icon :icon="menu.icon"/></el-icon>
        <span>{{ menu.name }}</span>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import store from '@/store'
import { HomeFilled } from '@element-plus/icons-vue'

const route = useRoute()

// 处理菜单数据
const processedMenuList = computed(() => {
  const rawList = JSON.parse(sessionStorage.getItem('menuList')) || []
  return rawList.map(menu => ({
    ...menu,
    // 确保children存在且为数组
    children: Array.isArray(menu.children) ? menu.children : []
  }))
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
.el-menu-vertical-demo {
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
</style>