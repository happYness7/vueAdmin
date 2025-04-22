<template>
    <!-- 角色分配对话框 -->
    <el-dialog v-model="roleDialogVisible" title="角色分配" width="30%">
        <el-checkbox-group v-model="roleForm.selectedRoles">
            <el-checkbox v-for="role in roleList" :key="role.id" :value="role.id">
                {{ role.name }}
            </el-checkbox>
        </el-checkbox-group>

        <template #footer>
            <el-button @click="roleDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleConfirm">确认</el-button>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref } from 'vue';
import requestUtil from '@/utils/request';
import { ElMessage } from 'element-plus';

const roleDialogVisible = ref(false);
const roleList = ref([]);
const currentUserId = ref(null); // 新增：存储当前操作用户ID
const roleForm = ref({
    selectedRoles: [],
});

// 获取所有角色列表
const fetchRoleList = async () => {
    try {
        const res = await requestUtil.get('/role');
        roleList.value = res.data;
    } catch (error) {
        ElMessage.error('获取角色列表失败: ' + (error.message || '未知错误'));
    }
};

// 打开对话框（新增参数处理）
const openRoleDialog = (userId, selectedRoleIds) => {
    roleDialogVisible.value = true;
    currentUserId.value = userId;
    roleForm.value.selectedRoles = selectedRoleIds;

    // 如果尚未加载过角色列表
    if (roleList.value.length === 0) {
        fetchRoleList();
    }
};

// 确认分配角色
const handleConfirm = async () => {
    if (!currentUserId.value) {
        console.error('分配角色失败: 当前用户ID为空');
        ElMessage.error('分配角色失败，用户ID无效');
        return;
    }

    if (!roleForm.value.selectedRoles || roleForm.value.selectedRoles.length === 0) {
        ElMessage.warning('请至少选择一个角色');
        return;
    }

    try {
        const res = await requestUtil.patch(`/user/${currentUserId.value}/assign-roles/`, {
            id: currentUserId.value,
            roleIds: roleForm.value.selectedRoles
        });

        if (res && res.status === 200) {
            ElMessage.success('角色分配成功');
            roleDialogVisible.value = false;
            window.location.reload();
        } else {
            ElMessage.error('分配角色失败，请稍后重试');
        }
    } catch (error) {
        ElMessage.error('分配角色失败: ' + (error.message || '未知错误'));
    }
};

defineExpose({ openRoleDialog });
</script>


<style scoped>
.role-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.role-tag {
    margin: 4px;
}
</style>