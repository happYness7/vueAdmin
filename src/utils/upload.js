import requestUtil from './request'
import { ElMessage } from 'element-plus'

// 文件类型和大小验证
const validateFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
  const isValidType = allowedTypes.includes(file.type)
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isValidType) {
    ElMessage.error('仅支持 JPG/PNG/JPEG 格式')
  }
  if (!isLt5M) {
    ElMessage.error('文件大小超过5MB限制')
  }
  return isValidType && isLt5M
}

// 统一的图片上传函数
export const uploadImage = async (file, type = 'photo') => {
  try {
    // 验证文件
    if (!validateFile(file)) {
      return { success: false, url: null }
    }

    // 准备上传数据
    const formData = new FormData()
    formData.append('file', file)

    // 发送请求
    const res = await requestUtil.post('/upload-image/?type=' + type, formData)

    if (res && res.data && res.data.url) {
      ElMessage.success('上传成功')
      return { success: true, url: res.data.url }
    } else {
      ElMessage.error('上传失败')
      return { success: false, url: null }
    }
  } catch (error) {
    ElMessage.error('上传失败：' + error.message)
    return { success: false, url: null }
  }
}