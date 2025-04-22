<template>
    <div class="app-container">
        <el-row class="header">
            <el-button type="success" :icon="DocumentAdd" @click="handleDialogValue()">新增</el-button>
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
                        <el-button type="primary" :icon="Edit" @click="handleDialogValue(scope.row.id)" />
                        <el-popconfirm title="您确定要删除这条记录吗？" @confirm="handleDelete(scope.row.id)">
                            <template #reference>
                                <el-button type="danger" :icon="Delete" />
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>
        </div>

        <Dialog :visible="addOrEditDialogVisible" :is-edit="isEdit" :model-value="currentFormData"
            :menu-options="tableData" @update:visible="val => addOrEditDialogVisible = val"
            @confirm="handleFormConfirm" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, DocumentAdd, Edit } from '@element-plus/icons-vue'
import requestUtil from '@/utils/request'
import Dialog from './components/dialog'

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

const addOrEditDialogVisible = ref(false)
const isEdit = ref(false)
const currentFormData = ref({})
const findMenuRecursive = (menus, id) => {
    for (const menu of menus) {
        if (menu.id === id) return menu;
        if (menu.children) {
            const found = findMenuRecursive(menu.children, id);
            if (found) return found;
        }
    }
    return null;
}; const handleDialogValue = (id) => {
    if (id) {
        const menu = findMenuRecursive(tableData.value, id); // 替换原有查找逻辑
        currentFormData.value = { ...menu };
        isEdit.value = true;
    } else {
        currentFormData.value = {
            parent: 0,
            menu_type: 'M',
            name: '',
            icon: '',
            path: '',
            component: '',
            perms: '',
            order_num: 1,
            remark: ''
        }
        isEdit.value = false
    }
    addOrEditDialogVisible.value = true
}

const handleFormConfirm = async (formData) => {
    try {
        if (!formData.remark) {
            formData.remark = null
        }
        if (!formData.icon) {
            formData.icon = null
        }
        if (!formData.component) {
            formData.component = null
        }
        if (!formData.perms) {
            formData.perms = null
        }
        let res
        if (isEdit.value) {
            res = await requestUtil.put(`menu/${formData.id}/`, formData)
        } else {
            res = await requestUtil.post('menu/', formData)
        }
        console.log(res)
        console.log(formData)

        if (res.status === (isEdit.value ? 200 : 201)) {
            ElMessage.success(`菜单${isEdit.value ? '更新' : '添加'}成功！`)
            addOrEditDialogVisible.value = false
            initMenuList()
        } else {
            ElMessage.error(res.data?.errorInfo || '操作失败')
        }
    } catch (e) {
         // 优化后的错误处理逻辑
         if (e.response?.data) {
            const { code, errorInfo } = e.response.data
            const errorMap = {
                400: errorInfo || '请求参数错误',
                404: '父菜单不存在',
                500: '服务器内部错误'
            }
            ElMessage.error(errorMap[code] || errorInfo || '操作失败')
        } else {
            ElMessage.error("网络错误，请检查连接")
        }
        console.error("操作失败:", e)
    }
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