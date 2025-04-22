<template>
    <el-form ref="userRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="手机号码：" prop="phonenumber">
            <el-input v-model="form.phonenumber" maxlength="11" />
        </el-form-item>
        <el-form-item label="用户邮箱：" prop="email">
            <el-input v-model="form.email" maxlength="50" />
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="handleSubmit">保存</el-button>
        </el-form-item>
    </el-form>
</template>

<script setup>
import { defineProps, ref } from 'vue'
import requestUtil from "@/utils/request";
import { ElMessage } from "element-plus";

const props = defineProps(
    {
        user: {
            type: Object,
            default: () => {
            },
            required: true
        }
    }
)
const form = ref({
    id: -1,
    phonenumber: '',
    email: ''
})

const userRef = ref(null)

form.value = props.user;

const rules = ref({
    email: [{ required: true, message: "邮箱地址不能为空", trigger: "blur" }, {
        type: "email",
        message: "请输入正确的邮箱地址",
        trigger: ["blur", "change"]
    }],
    phonenumber: [{ required: true, message: "手机号码不能为空", trigger: "blur" }, {
        pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
        message: "请输入正确的手机号码",
        trigger: "blur"
    }],
});


const handleSubmit = () => {
    userRef.value.validate(async (valid) => {
        if (valid) {
            try {
                const res = await requestUtil.put(`user/${form.value.id}/`, form.value);
                if (res.status === 200) {
                    ElMessage.success("用户信息更新成功！");
                    window.sessionStorage.setItem("currentUser", JSON.stringify(form.value));
                    setTimeout(() => {
                        window.location.reload(); // 延迟 1 秒刷新页面
                    }, 1000);
                } else {
                    ElMessage.error(res.data.errorInfo || '更新失败');
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