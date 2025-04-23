<template>
    <div class="app-container">
        <el-row class="header">
            <el-button type="success" :icon="DocumentAdd" @click="openDialog('add')">新增</el-button>
        </el-row>

        <div class="table-container">
            <el-table :data="tableData" style="width: 100%; margin-bottom: 20px" row-key="id" borderstripe
                :tree-props="{ children: 'children', hasChildren: 'hasChildren' }">
                <el-table-column prop="name" label="菜单名称" width="180" />
                <el-table-column prop="icon" label="图标" width="70" align="center">
                    <template #default="scope">
                        <el-icon v-if="scope.row.icon">
                            <svg-icon :icon="scope.row.icon" />
                        </el-icon>
                        <el-icon v-else>
                        </el-icon>
                    </template>
                </el-table-column>
                <el-table-column prop="order_num" label="排序" width="70" align="center" />
                <el-table-column prop="perms" label="权限标识" width="200" />
                <el-table-column prop="path" label="组件路径" width="180" />
                <el-table-column prop="menu_type" label="菜单类型" width="70" align="center">
                    <template #default="scope">
                        <el-tag size="small" v-if="scope.row.menu_type === 'M'" type="danger">目录</el-tag>
                        <el-tag size="small" v-else-if="scope.row.menu_type === 'C'" type="success">菜单</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="create_time" label="创建时间" align="center" width="120" />
                <el-table-column prop="update_time" label="更新时间" align="center" width="120" />
                <el-table-column prop="remark" label="备注" align="center" width="120" />
                <el-table-column prop="action" label="操作" width="300" fixed="right" align="center">
                    <template #default="scope">
                        <el-button type="primary" :icon="Edit" @click="openDialog('edit', scope.row)" />
                        <el-popconfirm title="您确定要删除这条记录吗？" @confirm="handleDelete(scope.row.id)">
                            <template #reference>
                                <el-button type="danger" :icon="Delete" />
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <BaseDialog :visible="dialogVisible" :title="currentDialogTitle" :form-items="MENU_CONFIG.formItems"
            :rules="MENU_CONFIG.rules" :initial-data="currentFormData" @update:visible="val => dialogVisible = val"
            @confirm="handleFormConfirm" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, DocumentAdd, Edit } from '@element-plus/icons-vue'
import requestUtil from '@/utils/request'
import BaseDialog from '@/components/dialog/BaseDialog.vue'
import { MENU_CONFIG } from '@/config/dialogConfig'


const tableData = ref([])

const initMenuList = async () => {
    try {
        const res = await requestUtil.get('/menu/')
        if (res.data.code === 200) {
            tableData.value = res.data.data
        } else {
            ElMessage.error(res.msg || '获取菜单失败')
        }
    } catch (error) {
        ElMessage.error('请求失败：' + error.message)
    }
}

onMounted(() => {
    initMenuList()
})

const handleDelete = async (id) => {
    try {
        const res = await requestUtil.del(`/menu/${id}/`)
        if (res.status === 200) {
            ElMessage.success("删除成功！")
            initMenuList()
        } else {
            ElMessage.error(res.data.msg || '删除失败')
        }
    } catch (error) {
        if (error.response) {
            const { status, data } = error.response
            const errorMap = {
                404: '菜单不存在',
                500: '服务器错误，请检查菜单是否有关联数据'
            }
            ElMessage.error(errorMap[status] || `删除失败（${status}）`)
        } else {
            ElMessage.error("网络错误，请检查连接")
        }
        console.error("删除失败:", error)
    }
}

// 对话框状态
const dialogVisible = ref(false)
const currentDialogTitle = ref('')
const currentFormData = ref({})
const isEdit = ref(false)

// 打开对话框方法
const openDialog = (type, row) => {
    isEdit.value = type === 'edit'
    currentDialogTitle.value = isEdit.value ? '编辑菜单' : '添加菜单'

    currentFormData.value = isEdit.value ?
        {
            ...row,
            parent: row.parent || 0 // 关键修复点
        } :
        {
            parent_id: 0,
            menu_type: 'M',
            name: '',
            icon: '',
            path: '',
            component: '',
            perms: '',
            order_num: 1,
            remark: ''
        }

    injectMenuOptions()
    dialogVisible.value = true
}
const injectMenuOptions = () => {
  const menuItem = MENU_CONFIG.formItems.find(i => i.prop === 'parent')
  menuItem.options = generateMenuOptions(tableData.value)
}

const generateMenuOptions = (menus, level = 0) => {
  return menus.reduce((acc, menu) => {
    if (menu.menu_type !== 'M') return acc // 过滤非目录
    const node = {
      value: menu.id,
      label: '　'.repeat(level) + menu.name,
      children: generateMenuOptions(menu.children || [], level + 1)
    }
    return [...acc, node]
  }, [
    { value: 0, label: '根目录' } // 根选项始终作为第一个
  ])
}
// 表单提交处理
const handleFormConfirm = async (formData) => {
    try {
        const cleanedData = Object.fromEntries(
            Object.entries(formData)
                .filter(([_, v]) => v !== null && v !== '')
        )

        const res = isEdit.value ?
            await requestUtil.put(`menu/${cleanedData.id}/`, cleanedData) :
            await requestUtil.post('menu/', cleanedData)

        if ([200, 201].includes(res.status)) {
            ElMessage.success(`菜单${isEdit.value ? '更新' : '添加'}成功！`)
            dialogVisible.value = false
            initMenuList()
        }
    } catch (e) {
        handleFormError(e)
    }
}

// 统一错误处理
const handleFormError = (error) => {
    const errorMap = {
        400: '请求参数错误',
        404: '父菜单不存在',
        500: '服务器内部错误'
    }
    ElMessage.error(errorMap[error.response?.status] || '操作失败')
    console.error("操作失败:", error)
}
</script>

<style lang="scss" scoped>
.app-container {
    height: calc(100vh - 84px);
    display: flex;
    flex-direction: column;
}

.table-container {
    flex: 1;
    overflow: auto;
    margin-bottom: 60px;
}

.header {
    padding-bottom: 16px;
    box-sizing: border-box;
}
</style>