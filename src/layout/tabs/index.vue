<template>
  <el-tabs v-model="editableTabsValue" type="card" class="demo-tabs" @tab-remove="removeTab" @tab-click="clickTab">
    <el-tab-pane 
      v-for="item in editableTabs" 
      :key="item.name" 
      :label="item.title" 
      :name="item.name"
      :closable="item.name !== '/admin/index'"> 
    </el-tab-pane>
  </el-tabs>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const store = useStore()
const router = useRouter()

// 使用计算属性保持双向同步
const editableTabsValue = computed({
  get: () => store.state.editableTabsValue,
  set: (val) => store.commit('UPDATE_ACTIVE_TAB', val)
})

const editableTabs = computed(() => store.state.editableTabs)

const clickTab = (target) => {
  const path = target.paneName
  // 强制更新激活状态
  store.commit('ADD_TABS', {
    path: path,
    name: target.props.label || '未命名标签'
  })
  router.push(path)
}

// 关闭标签页
const removeTab = (targetName) => {
  // 不允许关闭首页标签
  if (targetName === '/admin/index') {
    return
  }
  
  // 获取当前所有标签页
  const tabs = [...store.state.editableTabs]
  // 获取当前激活的标签页
  let activeName = store.state.editableTabsValue
  
  // 找到要关闭的标签页的索引
  const index = tabs.findIndex(tab => tab.name === targetName)
  if (index === -1) return
  
  // 过滤掉要关闭的标签页
  const filteredTabs = tabs.filter(tab => tab.name !== targetName)
  
  // 如果关闭的是当前激活的标签页，需要激活其他标签页
  if (activeName === targetName) {
    // 优先选择右侧标签，其次选择左侧标签
    const nextTab = tabs[index + 1] || tabs[index - 1]
    if (nextTab) {
      activeName = nextTab.name
    } else {
      // 如果没有其他标签页，则激活首页
      activeName = '/admin/index'
    }
    
    // 立即更新标签页列表和当前激活的标签页
    store.commit('UPDATE_TABS', {
      tabs: filteredTabs,
      activeTab: activeName
    })
    
    // 确保路由跳转到新的激活标签页
    router.push(activeName)
  } else {
    // 如果关闭的不是当前激活的标签页，只需更新标签页列表
    store.commit('UPDATE_TABS', {
      tabs: filteredTabs,
      activeTab: activeName
    })
  }
}
</script>

<style>
.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

.el-tabs--card > .el-tabs__header .el-tabs__item.is-active {
  background-color: lightgray;
}

.el-main {
  padding: 0px;
}

.el-tabs__content {
  padding: 0px !important;
}
</style>