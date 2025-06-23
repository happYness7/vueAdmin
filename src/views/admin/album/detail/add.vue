<template>
    <div class="album-add">
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <span>添加照片</span>
                    <div class="header-buttons">
                        <el-button type="primary" @click="handleUpload" :loading="uploading">上传照片</el-button>
                        <el-button @click="goBack">返回</el-button>
                    </div>
                </div>
                <div class="el-upload__tip">
                    支持 jpg/png/jpeg 格式，单个文件不超过 5MB，最多可选择9张图片
                </div>
            </template>
            <div class="upload-container">
                <el-upload v-model:file-list="fileList" class="upload-demo" action="#" :auto-upload="false"
                    :on-change="handleChange" :on-remove="handleRemove" :before-upload="beforeUpload"
                    list-type="picture-card" :limit="9" :on-exceed="handleExceed" multiple :on-progress="handleProgress">
                    <el-icon>
                        <Plus />
                    </el-icon>
                </el-upload>
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { uploadImage } from '@/utils/upload'
import requestUtil from '@/utils/request'
import store from '@/store'

const router = useRouter()
const route = useRoute()
const albumId = route.params.id
const fileList = ref([])
const uploading = ref(false)

// 文件改变时的钩子
const handleChange = (uploadFile) => {
  fileList.value = fileList.value.slice(-9) // 确保最多只有9张图片
}

// 移除文件时的钩子
const handleRemove = (uploadFile, uploadFiles) => {
  fileList.value = uploadFiles
}
const handleExceed = () => {
  ElMessage.warning('最多只能上传9张照片')
}
const handleProgress = (event, file) => {
  file.percent = event.percent
}
// 上传前的钩子
const beforeUpload = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
  const isValidType = allowedTypes.includes(file.type)
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isValidType) {
    ElMessage.error('仅支持 JPG/PNG/JPEG 格式')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('总文件大小超过5MB限制')
    return false
  }
  return false // 仍然阻止自动上传
}

// 处理批量上传
const handleUpload = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请至少选择一张图片')
    return
  }

  uploading.value = true
  try {
    // 过滤有效文件（移除上传失败的）
    const validFiles = fileList.value.filter(file => file.raw)
    
    // 执行批量上传
    const uploadResults = await Promise.all(
      validFiles.map(file => uploadImage(file.raw, 'photo'))
    )

    // 提取成功上传的URL
    const successUrls = uploadResults
      .filter(result => result.success)
      .map(result => result.url)

    if (successUrls.length === 0) {
      ElMessage.warning('没有成功上传的照片')
      return
    }

    // 提交到后端保存关联关系
    const response = await requestUtil.post('/blog/photos/', {
      album_id: albumId,
      urls: successUrls
    })

    if (response.data.code === 200) {
      ElMessage.success(`成功添加${successUrls.length}张照片`)
      goBack()
    } else {
      ElMessage.error(response.data.errorInfo || '保存照片信息失败')
    }
  } catch (error) {
    console.error('上传出错:', error)
    ElMessage.error('上传失败：' + error.message)
  } finally {
    uploading.value = false
  }
}

// 返回上一页
const goBack = () => {
  // 先添加到tabs
  store.commit("ADD_TABS", {
    name: '照片管理',
    path: `/admin/album/detail/${albumId}/`
  })
  // 然后导航到该路由
  router.push(`/admin/album/detail/${albumId}/`)
}
</script>

<style lang="scss" scoped>
.album-add {
    padding: 20px;

    .box-card {
        height: 750px;
        display: flex;
        flex-direction: column;

        :deep(.el-card__body) {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
            padding: 0;
        }
    }

    .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px;
        font-size: 20px;

        .header-buttons {
            display: flex;
            gap: 10px;
        }
    }

    .upload-container {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
        margin-bottom: 20px;
        padding: 20px;

        :deep(.el-upload--picture-card) {
            width: 160px;
            height: 160px;
            margin: 0 8px 8px 0;
        }

        :deep(.el-upload-list--picture-card) {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            width: 100%;

            .el-upload-list__item {
                width: 160px;
                height: 160px;
                margin: 0;
            }
        }
    }

    .el-upload__tip {
        color: red;
        font-size: 12px;
        padding: 10px 20px;
        text-align: center;
        background: var(--el-fill-color-light);
        margin-top: 10px;
        border-radius: 4px;
    }
}
</style>