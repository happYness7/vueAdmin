<template>
    <div class="app-container">
        <el-row :gutter="20" class="header">
            <el-col :span="7">
                <el-input placeholder="请输入用户名..." v-model="queryForm.query" clearable></el-input>
            </el-col>
            <el-button type="primary" :icon="Search" @click="initUserList">搜索</el-button>
            <el-button type="success" :icon="DocumentAdd" @click="openDialog('add')">添加用户</el-button>
            <el-popconfirm title="您确定批量删除这些记录吗？" @confirm="handleDelete">
                <template #reference>
                    <el-button type="danger" :disabled="selectedUserIds.length === 0" :icon="Delete">批量删除</el-button>
                </template>
            </el-popconfirm>
        </el-row>
        <div class="table-wrapper">
            <div class="table-scroll-container">
                <el-table :data="tableData" style="width: 100%" @selection-change="handleSelectionChange">
                    <el-table-column type="selection" width="55" />
                    <el-table-column prop="avatar" label="头像" width="80" align="center">
                        <template v-slot="scope">
                            <img :src="scope.row.avatar" width="50"
                                height="50" />
                        </template>
                    </el-table-column>
                    <el-table-column prop="username" label="用户名" width="105" align="center" />
                    <el-table-column prop="roles" label="拥有角色" width="200" align="center">
                        <template v-slot="scope">
                            <div class="role-tags">
                                <el-tag size="small" type="warning" v-for="item in scope.row.roleList" class="tag-item">
                                    {{item.name }}</el-tag>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="email" label="邮箱" width="200" align="center" />
                    <el-table-column prop="phonenumber" label="手机号" width="120" align="center" />
                    <el-table-column prop="status" label="状态" width="200" align="center">
                        <template v-slot="{ row }">
                            <el-switch v-model="row.status" @change="statusChangeHandle(row)" active-text="正常"
                                inactive-text="禁用" :active-value="1" :inactive-value="0"></el-switch>
                        </template>
                    </el-table-column>
                    <el-table-column prop="create_time" label="创建时间" width="150" align="center" />
                    <el-table-column prop="login_date" label="最后登录时间" width="150" align="center" />
                    <el-table-column prop="update_time" label="更新时间" width="150" align="center" />
                    <el-table-column prop="remark" label="备注" width="150" align="center" />
                    <el-table-column prop="action" label="操作" width="400" align="center" fixed=right>
                        <template v-slot="scope">
                            <el-button type="primary" :icon="Tools"
                                @click="handleRoleDialog(scope.row.id, scope.row.roleList)">分配角色
                            </el-button>

                            <el-popconfirm v-if="scope.row.username != 'happYness7'" title="您确定要对这个用户重置密码吗？"
                                @confirm="handleResetPassword(scope.row.id)">
                                <template #reference>
                                    <el-button type="warning" :icon="RefreshRight">重置密码</el-button>
                                </template>
                            </el-popconfirm>

                            <el-button type="primary" v-if="scope.row.username != 'happYness7'" :icon="Edit"
                                @click="openDialog('edit', scope.row)"></el-button>
                            <el-popconfirm v-if="scope.row.username != 'happYness7'" title="您确定要删除这条记录吗？"
                                @confirm="handleDeleteUser(scope.row.id)">
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
        <RoleDialog ref="roleDialog" @role-assigned="handleRoleAssigned" />
        <BaseDialog :visible="dialogVisible" :title="currentDialogTitle" :form-items="USER_CONFIG.formItems"
            :rules="USER_CONFIG.rules" :initial-data="currentFormData" @update:visible="val => dialogVisible = val"
            @confirm="handleFormConfirm" />
    </div>
</template>

<script setup>
import RoleDialog from './components/roleDialog.vue'
import { ref } from 'vue'
import requestUtil, { getServerUrl } from '@/utils/request'
import { ElMessage } from 'element-plus'
import { Search, Delete, DocumentAdd, Edit, Tools, RefreshRight } from '@element-plus/icons-vue'
import BaseDialog from '@/components/dialog/BaseDialog.vue'
import { USER_CONFIG } from '@/config/dialogConfig'


const handleRoleAssigned = () => {
    initUserList(); // 重新获取用户列表
};

const isEdit = ref(false)
const dialogVisible = ref(false)
const currentDialogTitle = ref('')
const currentFormData = ref({})

// 打开对话框方法
const openDialog = (type, row) => {
    isEdit.value = type === 'edit'
    currentDialogTitle.value = isEdit.value ? '编辑用户' : '添加用户'
    currentFormData.value = isEdit.value ?
        { ...row } :
        {
            username: '',
            password: '123456',
            email: '',
            phonenumber: '',
            status: 0,
            remark: ''
        }
    dialogVisible.value = true
}

// 提交表单
const handleFormConfirm = async (formData) => {
    try {
        // 清空备注字段空值
        if (!formData.remark) formData.remark = null

        let res
        if (isEdit.value) {
            res = await requestUtil.put(`user/${formData.id}/`, formData)
        } else {
            res = await requestUtil.post('user/', formData)
        }

        // 统一处理成功状态
        if ([200, 201].includes(res.status)) {
            ElMessage.success(`用户${isEdit.value ? '更新' : '添加'}成功`)
            dialogVisible.value = false  // 成功时关闭对话框
            initUserList()
        } else {
            ElMessage.error(res.data?.errorInfo || '操作失败')
        }
    } catch (e) {
        // 更详细的错误处理
        if (e.response) {
            const { status, data } = e.response;
            if (status === 400) {
                // 处理用户名重复或其他参数错误
                ElMessage.error(data.errorInfo || '处理用户名重复或其他参数错误');
            } else if (status === 401) {
                ElMessage.error('未授权，请重新登录');
            } else if (status === 404) {
                ElMessage.error('资源未找到');
            } else if (status === 500) {
                ElMessage.error('服务器内部错误，请联系管理员');
            } else {
                ElMessage.error(`请求失败，状态码：${status}`);
            }
        } else {
            // 处理网络错误
            ElMessage.error("网络错误，请检查连接");
        }
        console.error("请求失败:", e);
        // 不关闭对话框，保留表单内容
    }
};

const tableData = ref([])
const total = ref(0)
const queryForm = ref({
    query: '',
    pageNum: 1,
    pageSize: 10
})
const initUserList = async () => {
    const params = {
        query: queryForm.value.query,
        pageNum: queryForm.value.pageNum,
        pageSize: queryForm.value.pageSize
    };
    try {
        const res = await requestUtil.get("user/", params); // 直接传递 params
        if (res.data.code === 200) {
            tableData.value = res.data.userList;
            total.value = res.data.total;
        } else {
            ElMessage.error(res.response.errorInfo || '获取用户列表失败');
        }
    } catch (e) {
        if (e.response) {
            const { status, data } = e.response;
            if (status === 404) {
                ElMessage.error(data.errorInfo || '分页超出范围');
            } else if (status === 500) {
                ElMessage.error(data.errorInfo || '服务器内部错误，请联系管理员');
            } else {
                ElMessage.error(`请求失败，状态码：${status}`);
            }
        } else {
            ElMessage.error("网络错误，请检查连接");
        }
        console.error("请求失败:", e);
    }
};
const handleCurrentChange = (pageNum) => {
    queryForm.value.pageNum = pageNum
    initUserList()
}
const handleSizeChange = (pageSize) => {
    queryForm.value.pageSize = pageSize
    queryForm.value.pageNum = 1
    initUserList()
}
const selectedUserIds = ref([]); // 存储选中的用户 ID 列表
const handleSelectionChange = (selection) => {
    selectedUserIds.value = selection.map(user => user.id); // 获取选中的用户 ID 列表
};
// 单个删除
const handleDeleteUser = async (userId) => {
    try {
        const res = await requestUtil.del(`user/${userId}/`); // 调用单个删除路由
        if (res.data.code === 200) {  // 直接检查状态码是否为 204
            ElMessage.success("用户删除成功！");
            initUserList(); // 刷新列表
        } else {
            ElMessage.error(res.data.errorInfo || '删除用户失败');
        }
    } catch (error) {
        if (error.response) {
            const { status, data } = error.response;
            if (status === 404) {
                ElMessage.error(data.errorInfo || '用户未找到');
            } else if (status === 500) {
                ElMessage.error(data.errorInfo || '服务器内部错误，请联系管理员');
            } else {
                ElMessage.error(`请求失败，状态码：${status}`);
            }
        } else {
            ElMessage.error("网络错误，请检查连接");
        }
        console.error("删除用户失败:", error);
    }
};

// 批量删除
const handleDelete = async () => {
    try {
        const res = await requestUtil.del("user/batch-delete/", selectedUserIds.value); // 调用批量删除路由
        if (res.data.code === 200) {
            ElMessage.success("批量删除成功！");
            initUserList(); // 刷新列表
        } else {
            ElMessage.error(res.response.errorInfo || '批量删除失败');
        }
    } catch (error) {
        ElMessage.error("批量删除失败，请检查网络或联系管理员");
        console.error("批量删除失败:", error);
    }
};

const roleDialog = ref(null);
const handleRoleDialog = (userId, userRoles) => {
    // 提取用户已有角色ID数组
    const selectedIds = userRoles.map(role => role.id);
    roleDialog.value.openRoleDialog(userId, selectedIds);
};

const handleResetPassword = async (userId) => {
    if (!userId) {
        console.error('重置密码失败: 用户ID为空');
        ElMessage.error('重置密码失败，用户ID无效');
        return;
    }

    try {
        const res = await requestUtil.patch(`user/${userId}/reset-password/`);
        if (res && res.status === 200) {
            ElMessage.success('密码重置成功！');
            initUserList(); // 刷新用户列表
        } else {
            console.error('重置密码失败: 响应状态码异常', res);
            ElMessage.error('重置密码失败，请稍后重试');
        }
    } catch (error) {
        console.error('重置密码失败:', error);
        if (error.response) {
            const { status, data } = error.response;
            if (status === 400) {
                ElMessage.error(data.errorInfo || '请求参数错误');
            } else if (status === 401) {
                ElMessage.error('未授权，请重新登录');
            } else if (status === 404) {
                ElMessage.error('用户未找到');
            } else if (status === 500) {
                ElMessage.error('服务器内部错误，请联系管理员');
            } else {
                ElMessage.error(`重置密码失败，状态码：${status}`);
            }
        } else {
            ElMessage.error('网络错误，请检查连接');
        }
    }
};

const statusChangeHandle = async (row) => {
    let res = await requestUtil.patch(`user/${row.id}/change-status/`, { id: row.id, status: row.status });
    if (res.data.code == 200) {
        ElMessage({
            type: 'success',
            message: '执行成功!'
        })
    } else {
        ElMessage({
            type: 'error',
            message: res.data.msg,
        })
        initUserList();
    }
}

initUserList()
</script>

<style lang='scss' scoped>
@import '@/assets/scss/mixins.scss'; // 导入 mixins

.app-container {
    height: calc(100vh - 84px); // 根据实际布局调整
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

.role-tags {
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

.role-tags {
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
::v-deep .role-tags::-webkit-scrollbar {
    width: 6px;
}

::v-deep .role-tags::-webkit-scrollbar-thumb {
    background-color: #c1c1c1;
    border-radius: 3px;
}
</style>