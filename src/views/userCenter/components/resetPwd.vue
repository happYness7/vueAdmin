<template>
    <el-form ref="pwdRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="旧密码" prop="oldPassword">
            <el-input v-model="form.oldPassword" placeholder="请输入旧密码" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
            <el-input v-model="form.newPassword" placeholder="请输入新密码" type="password" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
            <el-input v-model="form.confirmPassword" placeholder="请确认密码" type="password" show-password />
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="handleSubmit">保存</el-button>
        </el-form-item>
    </el-form>
</template>

<script setup>
import { defineProps, ref } from "vue";
import requestUtil from "@/utils/request";
import { ElMessage } from 'element-plus';

const props = defineProps({
    user: {
        type: Object,
        default: () => ({}),
        required: true
    }
});

const form = ref({
    id: -1,
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
});

const pwdRef = ref(null);

form.value = props.user;

const equalToPassword = (rule, value, callback) => {
    if (form.value.newPassword !== value) {
        callback(new Error("两次输入的密码不一致"));
    } else {
        callback();
    }
};

const rules = ref({
    oldPassword: [{ required: true, message: "旧密码不能为空", trigger: "blur" }],
    newPassword: [
        { required: true, message: "新密码不能为空", trigger: "blur" },
        { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" }
    ],
    confirmPassword: [
        { required: true, message: "确认密码不能为空", trigger: "blur" },
        { required: true, validator: equalToPassword, trigger: "blur" }
    ]
});

const handleSubmit = () => {
    pwdRef.value.validate(async (valid) => {
        if (valid) {
            try {
                // 构造请求数据
                const requestData = {
                    oldPassword: form.value.oldPassword,
                    newPassword: form.value.newPassword
                };

                // 发送 PATCH 请求
                const res = await requestUtil.patch(`user/${form.value.id}/`, requestData);
                if (res.data.code === 200) {
                    ElMessage.success("密码修改成功，下一次登录生效！");
                } else {
                    ElMessage.error(res.data.errorInfo || '密码修改失败');
                }
            } catch (e) {
                if (e.response) {
                    const { status, data } = e.response;
                    if (status === 400) {
                        ElMessage.error(data.errorInfo || '请求参数错误');
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
                    ElMessage.error("网络错误，请检查连接");
                }
                console.error("请求失败:", e);
            }
        }
    });
};
</script>

<style lang="scss" scoped></style>