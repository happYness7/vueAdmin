<template>
    <div class="app-container">
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <span>博客配置信息</span>
                    <div>
                        <el-button v-if="!isEdit" type="primary" @click="handleEdit">编辑</el-button>
                        <template v-else>
                            <el-button type="success" @click="handleSave">保存</el-button>
                            <el-button @click="cancelEdit">取消</el-button>
                        </template>
                    </div>
                </div>
            </template>

            <el-form ref="configFormRef" :model="configForm" :rules="rules" label-width="120px" :disabled="!isEdit">
                <el-form-item label="博客名称" prop="blog_name">
                    <el-input v-model="configForm.blog_name" placeholder="请输入博客名称" />
                </el-form-item>

                <el-form-item label="博客头像" prop="blog_avatar">
                    <div class="avatar-container">
                        <!-- 博客头像上传 -->
                        <el-upload class="avatar-uploader" :show-file-list="false" :http-request="handleAvatarUpload"
                            :before-upload="beforeImageUpload" :disabled="!isEdit">
                            <div class="image-wrapper">
                                <el-image v-if="configForm.blog_avatar" :src="configForm.blog_avatar" class="avatar"
                                    fit="cover" />
                                <div v-if="isEdit && configForm.blog_avatar" class="delete-overlay"
                                    @click.stop="configForm.blog_avatar = ''">
                                    <el-icon>
                                        <Delete />
                                    </el-icon>
                                </div>
                                <el-icon v-if="!configForm.blog_avatar" class="avatar-uploader-icon">
                                    <Plus />
                                </el-icon>
                            </div>
                        </el-upload>
                    </div>
                </el-form-item>

                <el-form-item label="个人签名" prop="personal_say">
                    <el-input v-model="configForm.personal_say" type="textarea" :rows="2" placeholder="请输入个人签名" />
                </el-form-item>

                <el-form-item label="博客公告" prop="blog_notice">
                    <el-input v-model="configForm.blog_notice" type="textarea" :rows="3" placeholder="请输入博客公告" />
                </el-form-item>

                <el-form-item label="联系方式" class="qrcode-container">
                    <div class="qrcode-wrapper">
                        <div class="qrcode-item">
                            <div class="qrcode-label">QQ二维码</div>
                            <el-upload class="qrcode-uploader" :show-file-list="false" :http-request="handleQQUpload"
                                :before-upload="beforeImageUpload" :disabled="!isEdit">
                                <div class="image-wrapper">
                                    <el-image v-if="configForm.qq_link" :src="configForm.qq_link" class="qrcode-image"
                                        :preview-src-list="[configForm.qq_link]" fit="contain" />
                                    <div v-if="isEdit && configForm.qq_link" class="delete-overlay"
                                        @click.stop="configForm.qq_link = ''">
                                        <el-icon>
                                            <Delete />
                                        </el-icon>
                                    </div>
                                    <el-icon v-if="!configForm.qq_link" class="qrcode-uploader-icon">
                                        <Plus />
                                    </el-icon>
                                </div>
                            </el-upload>
                        </div>
                        <div class="qrcode-item">
                            <div class="qrcode-label">微信二维码</div>
                            <el-upload class="qrcode-uploader" :show-file-list="false"
                                :http-request="handleWechatUpload" :before-upload="beforeImageUpload"
                                :disabled="!isEdit">
                                <div class="image-wrapper">
                                    <el-image v-if="configForm.we_chat_link" :src="configForm.we_chat_link"
                                        class="qrcode-image" :preview-src-list="[configForm.we_chat_link]"
                                        fit="contain" />
                                    <div v-if="isEdit && configForm.we_chat_link" class="delete-overlay"
                                        @click.stop="configForm.we_chat_link = ''">
                                        <el-icon>
                                            <Delete />
                                        </el-icon>
                                    </div>
                                    <el-icon v-if="!configForm.we_chat_link" class="qrcode-uploader-icon">
                                        <Plus />
                                    </el-icon>
                                </div>
                            </el-upload>
                        </div>
                    </div>
                </el-form-item>

                <el-form-item label="GitHub链接" prop="github_link">
                    <el-input v-model="configForm.github_link" placeholder="请输入GitHub链接" />
                </el-form-item>

                <el-form-item label="Gitee链接" prop="git_ee_link">
                    <el-input v-model="configForm.git_ee_link" placeholder="请输入Gitee链接" />
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import requests from '@/utils/request'
import { uploadImage } from '@/utils/upload'

// 表单引用
const configFormRef = ref(null)

// 编辑状态
const isEdit = ref(false)

// 表单数据
const configForm = ref({
    blog_name: '',
    blog_avatar: '',
    personal_say: '',
    blog_notice: '',
    qq_link: '',
    we_chat_link: '',
    github_link: '',
    git_ee_link: ''
})

// 表单验证规则
const rules = {
    blog_name: [
        { required: true, message: '请输入博客名称', trigger: 'blur' },
        { min: 2, max: 50, message: '长度在2到50个字符', trigger: 'blur' }
    ],
    blog_avatar: [
        { required: true, message: '请上传博客头像', trigger: 'change' }
    ],
    personal_say: [
        { max: 255, message: '长度不能超过255个字符', trigger: 'blur' }
    ]
}

// 获取配置信息
const fetchConfigData = async () => {
    try {
        const response = await requests.get('/blog/configs')
        if (response.status === 200) {
            configForm.value = { ...response.data[0] }
        } else {
            ElMessage.error('获取配置信息失败')
        }
    } catch (error) {
        console.error('获取配置信息出错:', error)
        ElMessage.error('获取配置信息出错')
    }
}

// 进入编辑模式
const handleEdit = () => {
    isEdit.value = true
}

// 取消编辑
const cancelEdit = () => {
    isEdit.value = false
    fetchConfigData() // 重新获取数据，放弃修改
}

// 保存配置
const handleSave = async () => {
    try {
        await configFormRef.value.validate(async (valid) => {
            if (valid) {
                const response = await requests.put(`/blog/configs/1/`, configForm.value)
                if (response.status === 200) {
                    ElMessage.success('保存成功')
                    isEdit.value = false
                } else {
                    ElMessage.error(response.message || '保存失败')
                }
            } else {
                return false
            }
        })
    } catch (error) {
        console.error('保存配置出错:', error)
        ElMessage.error('保存配置出错')
    }
}

// 图片上传前的验证已移至uploadImage函数中
const beforeImageUpload = () => true

// 博客头像上传处理
const handleAvatarUpload = async (options) => {
    const { success, url } = await uploadImage(options.file, 'config')
    if (success) {
        configForm.value.blog_avatar = url
    }
}

// QQ二维码上传处理
const handleQQUpload = async (options) => {
    const { success, url } = await uploadImage(options.file, 'config')
    if (success) {
        configForm.value.qq_link = url
    }
}

// 微信二维码上传处理
const handleWechatUpload = async (options) => {
    const { success, url } = await uploadImage(options.file, 'config')
    if (success) {
        configForm.value.we_chat_link = url
    }
}

// 页面加载时获取配置信息
onMounted(() => {
    fetchConfigData()
})
</script>

<style lang="scss" scoped>
.app-container {
    padding: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* 通用上传组件样式 */
.uploader-base {
    cursor: pointer;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
    border: 1px solid #e4e7ed;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

    &:hover {
        border-color: var(--el-color-primary);
    }
}

/* 头像容器样式 */
.avatar-container {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 20px;
}

.avatar-uploader {
    width: 130px;
    height: 130px;
    border-radius: 50%;
    overflow: hidden;
    position: relative;
    cursor: pointer;
    border: 1px dashed #d9d9d9;
    background-color: #f5f7fa;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
        border-color: var(--el-color-primary);
    }
}

.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
}

.avatar {
    width: 130px;
    height: 130px;
    border-radius: 50%;
    object-fit: cover;
    display: block;
    transition: transform 0.2s ease-in-out;

    &:hover {
        transform: scale(1.05);
    }
}

.qrcode-wrapper {
    gap: 30px;
    margin-bottom: 20px;

    .qrcode-item {
        max-width: 220px;

        .qrcode-label {
            font-size: 14px;
            margin-bottom: 12px;
            color: var(--el-text-color-regular);
        }
    }
}



.delete-overlay {
    font-size: 20px;
    background-color: rgba(0, 0, 0, 0.6);
}

/* 二维码上传样式 */
.qrcode-container {
    .qrcode-wrapper {
        display: flex;
        gap: 20px;
        align-items: flex-start;
    }

    .qrcode-item {
        flex: 1;
        max-width: 200px;

        .qrcode-label {
            margin-bottom: 8px;
            color: #606266;
            font-size: 14px;
        }
    }
}

.qrcode-uploader {
    @extend .uploader-base;
    width: 200px;
    height: 200px;
}

.qrcode-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 10px;
}


/* 图片包装器样式 */
.image-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* 删除按钮遮罩层 */
.delete-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s;
    cursor: pointer;
    color: #fff;
    font-size: 24px;

    &:hover {
        opacity: 1;
    }
}
</style>