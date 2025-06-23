<template>
    <div class="app-container">
        <el-row :gutter="20" class="header">
            <el-col :span="7">
                <el-input placeholder="请输入角色名称..." v-model="queryForm.query" clearable></el-input>
            </el-col>
            <el-button type="primary" :icon="Search" @click="initRoleList">搜索</el-button>
            <el-button type="success" :icon="DocumentAdd" @click="openDialog('add')">添加角色</el-button>
            <el-popconfirm title="您确定批量删除这些记录吗？" @confirm="handleDelete(null)">
                <template #reference>
                    <el-button type="danger" :disabled="selectedRoleIds.length === 0" :icon="Delete">批量删除</el-button>
                </template>
            </el-popconfirm>
        </el-row>
        <div class="table-wrapper">
            <div class="table-scroll-container">
                <el-table :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
                    <el-table-column type="selection" width="55" />
                    <el-table-column prop="name" label="角色名称" width="150" align="center" />
                    <el-table-column prop="code" label="权限字符串" width="150" align="center" />
                    <el-table-column prop="menus" label="菜单权限" width="250" align="center">
                        <template v-slot="scope">
                            <div class="menu-tags">
                                <el-tag v-for="menu in scope.row.menus" :key="menu.id" size="small" type="warning"
                                    class="tag-item">
                                    {{ menu.name }}
                                </el-tag>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="create_time" label="创建时间" width="150" align="center" />
                    <el-table-column prop="update_time" label="更新时间" width="150" align="center" />
                    <el-table-column prop="remark" label="备注" width="200" align="center" />
                    <el-table-column prop="action" label="操作" width="400" fixed="right" align="center">
                        <template v-slot="scope">
                            <el-button type="primary" :icon="Tools"
                                @click="handleMenuDialogValue(scope.row.id)">分配权限</el-button>

                            <el-button v-if="scope.row.code != 'admin'" type="primary" :icon="Edit"
                                @click="openDialog('edit', scope.row)" />

                            <el-popconfirm v-if="scope.row.code != 'admin'" title="您确定要删除这条记录吗？"
                                @confirm="handleDeleteRole(scope.row.id)">
                                <template #reference>
                                    <el-button type="danger" :icon="Delete" />
                                </template>
                            </el-popconfirm>

                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <div class="pagination-container">
                <el-pagination v-model:currentPage="queryForm.pageNum" v-model:page-size="queryForm.pageSize"
                    :page-sizes="[10, 20, 30, 40]" layout="total, sizes, prev, pager, next, jumper" :total="total"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </div>

        <BaseDialog :visible="dialogVisible" :title="currentDialogTitle" :form-items="ROLE_CONFIG.formItems"
            :rules="ROLE_CONFIG.rules" :initial-data="currentFormData" @update:visible="val => dialogVisible = val"
            @confirm="handleFormConfirm" />
        <MenuDialog ref="menuDialog" @menu-updated="handleMenuUpdated" />

    </div>
</template>

<script setup>
import { ref, onMounted, provide } from 'vue';
import requestUtil from '@/utils/request';
import { ElMessage } from 'element-plus';
import { Search, Delete, DocumentAdd, Edit, Tools } from '@element-plus/icons-vue'
import MenuDialog from './components/menuDialog'
import BaseDialog from '@/components/dialog/BaseDialog.vue'
import { ROLE_CONFIG } from '@/config/dialogConfig'

const tableData = ref([]); // 角色列表数据
const total = ref(0); // 总条数
const queryForm = ref({
    query: '',
    pageNum: 1,
    pageSize: 10,
});


// 处理分页大小变化
const handleSizeChange = (pageSize) => {
    queryForm.value.pageSize = pageSize;
    queryForm.value.pageNum = 1;
    initRoleList();
};

// 处理当前页码变化
const handleCurrentChange = (pageNum) => {
    queryForm.value.pageNum = pageNum;
    initRoleList();
};

// 1. 菜单映射关系和加载方法
const menuMap = ref(new Map())

const menuTree = ref([])
provide('tableData', tableData)
provide('menuMap', menuMap)
provide('menuTree', menuTree)
const fetchMenuTree = async () => {
    try {
        const res = await requestUtil.get('/menu/tree')
        menuMap.value = new Map()

        // 统一构建树形结构和映射表
        const buildStructure = (menus) => {
            return menus.map(menu => {
                menuMap.value.set(menu.id, menu.name)
                return {
                    id: menu.id,
                    name: menu.name,
                    children: menu.children ? buildStructure(menu.children) : []
                }
            })
        }

        menuTree.value = buildStructure(res.data)
    } catch (e) {
        ElMessage.error('获取菜单数据失败')
    }
}

// 初始化角色列表
const initRoleList = async () => {
    try {
        const params = {
            query: queryForm.value.query,
            pageNum: queryForm.value.pageNum,
            pageSize: queryForm.value.pageSize
        }

        const roleRes = await requestUtil.get('role/role-list/', params)
        if (!roleRes?.data) return

        tableData.value = roleRes.data.roleList.map(role => ({
            ...role,
            menus: (role.menuIds || []).map(id => ({
                id,
                name: menuMap.value.get(id) || '未知菜单'
            }))
        }))

        total.value = roleRes.data.total
    } catch (error) {
        ElMessage.error('获取角色列表失败: ' + (error.message || '未知错误'))
    }
}
onMounted(async () => {
    await fetchMenuTree()
    initRoleList()
})
// 单个删除
const handleDeleteRole = async (roleId) => {
    try {
        const res = await requestUtil.del(`role/${roleId}/`); // 调用单个删除路由
        if (res.status === 200) {  // 直接检查状态码是否为 204
            ElMessage.success("角色删除成功！");
            initRoleList(); // 刷新列表
        } else {
            ElMessage.error(res.data.errorInfo || '删除角色失败');
        }
    } catch (error) {
        if (error.response) {
            const { status, data } = error.response;
            if (status === 404) {
                ElMessage.error(data.errorInfo || '角色未找到');
            } else if (status === 500) {
                ElMessage.error(data.errorInfo || '服务器内部错误，请联系管理员');
            } else {
                ElMessage.error(`请求失败，状态码：${status}`);
            }
        } else {
            ElMessage.error("网络错误，请检查连接");
        }
        console.error("删除角色失败:", error);
    }
};
const selectedRoleIds = ref([]); // 存储选中的角色 ID 列表
const handleSelectionChange = (selection) => {
    selectedRoleIds.value = selection.map(role => role.id); // 获取选中的角色 ID 列表
};

// 批量删除
const handleDelete = async () => {
    try {
        const res = await requestUtil.del("role/batch-delete/", selectedRoleIds.value); // 调用批量删除路由
        if (res.data.code === 200) {
            ElMessage.success("批量删除成功！");
            initRoleList(); // 刷新列表
        } else {
            ElMessage.error(res.data.errorInfo || '批量删除失败');
        }
    } catch (error) {
        ElMessage.error("批量删除失败，请检查网络或联系管理员");
        console.error("批量删除失败:", error);
    }
};


// 对话框状态
const dialogVisible = ref(false)
const currentDialogTitle = ref('')
const currentFormData = ref({})
const isEdit = ref(false)

// 打开对话框方法
const openDialog = (type, row) => {
  isEdit.value = type === 'edit'
  currentDialogTitle.value = isEdit.value ? '编辑角色' : '添加角色'
  currentFormData.value = isEdit.value ? 
    { ...row } : 
    {
      name: '',
      code: '',
      remark: ''
    }
  dialogVisible.value = true
}

// 表单提交处理
const handleFormConfirm = async (formData) => {
  try {
    let res
    if (!formData.remark) formData.remark = null
    if (isEdit.value) {
      res = await requestUtil.put(`role/${formData.id}/`, formData)
    } else {
      res = await requestUtil.post('role/', formData)
    }

    if ([200, 201].includes(res.status)) {
      ElMessage.success(`角色${isEdit.value ? '更新' : '添加'}成功！`)
      dialogVisible.value = false
      initRoleList()
    } else {
      ElMessage.error(res.data?.errorInfo || '操作失败')
    }
  } catch (e) {
    const errorHandler = {
      400: '请求参数错误',
      401: '未授权，请重新登录',
      404: '资源未找到',
      500: '服务器内部错误'
    }
    ElMessage.error(errorHandler[e.response?.status] || '操作失败')
    console.error("请求失败:", e)
  }
}

const menuDialog = ref(null)

// 修改分配权限按钮的处理
const handleMenuDialogValue = (roleId) => {
    menuDialog.value.openMenuDialog(roleId)
}
const handleMenuUpdated = (newMenuIds) => {
  initRoleList()
}

// 初始化加载角色列表
initRoleList();
</script>

<style lang="scss" scoped>
@import '@/assets/scss/mixins.scss'; // 导入 mixins
@import "@/assets/scss/pagination";


.app-container {
    height: calc(100vh - 84px);
    display: flex;
    flex-direction: column;
}

.table-wrapper {
    display: flex;
    flex-direction: column;
    height: 750px; // 你要固定住表格区域大小，比如 600px，看你想要多高
    background: var(--card-bg) !important;
    border: 1px solid #ebeef5;
    overflow: hidden;

    .table-scroll-container {
        flex: 1;
        overflow-y: auto;
    }

    .pagination-container {
        padding: 10px 20px;
        border-top: 1px solid #ebeef5;
        background: var(--card-bg) !important;
        border-color: var(--border-color) !important;
        display: flex;
        justify-content: flex-end;
        flex-shrink: 0; // 防止分页被挤压
    }
}

.menu-tags {
    .tag-item {
        @include text-ellipsis; // 使用 mixin
    }
}

.header {
    padding-bottom: 16px;
    box-sizing: border-box;
    flex-shrink: 0;
}

.el-pagination {
    float: right;
    padding: 20px;
    box-sizing: border-box;
}


.el-tag--small {
    margin-left: 5px;
}

.menu-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    max-height: 120px;
    overflow-y: auto;
    padding: 2px;

    .tag-item {
        margin: 2px;
        max-width: 120px;
        @include text-ellipsis;
        transition: all 0.3s;

        &:hover {
            transform: scale(1.05);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }
    }
}

/* 添加滚动条样式 */
::v-deep .menu-tags::-webkit-scrollbar {
    width: 6px;
}

::v-deep .menu-tags::-webkit-scrollbar-thumb {
    background-color: #c1c1c1;
    border-radius: 3px;
}
</style>