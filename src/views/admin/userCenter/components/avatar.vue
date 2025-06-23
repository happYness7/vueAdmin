<template>
    <el-form ref="formRef" :model="form" label-width="100px" style="text-align: center;padding-bottom:10px">
        <el-upload class="avatar-uploader" :show-file-list="false" :http-request="handleAvatarUpload"
            :before-upload="beforeAvatarUpload">
            <img v-if="imageUrl" :src="imageUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
                <Plus />
            </el-icon>
        </el-upload>

        <el-button @click="handleConfirm">确认更换</el-button>

    </el-form>
</template>
<script setup>
import { defineProps, ref } from "vue";
import requestUtil from "@/utils/request";
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { uploadImage } from '@/utils/upload'

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
    avatar: ''
})

const formRef = ref(null)

const imageUrl = ref("")

form.value = props.user;
imageUrl.value = form.value.avatar

const handleAvatarUpload = async (options) => {
    const { success, url } = await uploadImage(options.file, 'avatar')
    if (success) {
        imageUrl.value = url;
        form.value.avatar = url;
    }
}

const beforeAvatarUpload = () => {
    return true // 验证逻辑已移至uploadImage函数中
}

const handleConfirm = async () => {
    let result = await requestUtil.post("user/update-avatar/", form.value);
    let data = result.data;
    if (data.code == 200) {
        // 更新 sessionStorage 中的用户信息
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || {};
        currentUser.avatar = form.value.avatar;
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
        ElMessage.success("执行成功！")
    } else {
        ElMessage.error(data.errorInfo);
    }
}


</script>


<style>
.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.avatar-uploader .el-upload:hover {
    border-color: #409eff;
}

.el-icon.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    text-align: center;
}

.avatar {
    width: 120px;
    height: 120px;
    display: block;
}
</style>