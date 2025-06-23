<template>
  <el-dialog v-model="dialogVisible" title="分配菜单权限" width="30%">
    <el-tree ref="treeRef" :data="menuTree" show-checkbox node-key="id" :props="treeProps"
      :default-checked-keys="selectedMenuIds" :check-strictly="false" />

    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, inject, nextTick } from 'vue'
import requestUtil from '@/utils/request'
import { ElMessage } from 'element-plus'

const tableData = inject('tableData')
const menuMap = inject('menuMap')
const menuTree = inject('menuTree')

const dialogVisible = ref(false)
const treeRef = ref(null)
const currentRole = ref(null)

const treeProps = {
  label: 'name',
  children: 'children'
}
const emit = defineEmits(['menu-updated'])

// 修正后的打开对话框方法
const openMenuDialog = async (roleId) => {
  try {
    dialogVisible.value = true
    currentRole.value = tableData.value.find(r => r.id === roleId)

    if (!currentRole.value) {
      throw new Error('未找到对应角色')
    }

    await nextTick()
    treeRef.value?.setCheckedKeys(currentRole.value.menuIds || [])
  } catch (e) {
    dialogVisible.value = false
    ElMessage.error('初始化失败：' + e.message)
  }
}

const handleConfirm = async () => {
  try {
    const checkedKeys = treeRef.value.getCheckedKeys()

    // 更新接口
    const res = await requestUtil.patch(`/role/${currentRole.value.id}/assign-menus/`, {
      menuIds: checkedKeys
    })

    if (res.status === 200 || res.data?.code === 200) {
      // 直接修改当前角色数据
      currentRole.value.menuIds = [...checkedKeys]
      currentRole.value.menus = checkedKeys.map(id => ({
        id,
        name: menuMap.value.get(id) || '未知菜单'
      }))
      ElMessage.success('菜单分配成功')
      dialogVisible.value = false
      emit('menu-updated')
    }
  } catch (e) {
    console.error('分配菜单失败:', e)
    ElMessage.error(`分配失败: ${e.response?.data?.errorInfo || e.message}`)
  }
}

defineExpose({ openMenuDialog })
</script>

<style scoped></style>