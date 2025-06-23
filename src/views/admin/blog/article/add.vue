<template>
    <div class="article-add-container">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>添加文章</span>
            <div class="header-buttons">
              <el-button type="primary" @click="showPublishDialog">发布文章</el-button>
            </div>
          </div>
        </template>
        
        <el-form :model="articleForm" :rules="rules" ref="articleFormRef" label-width="100px">
          <el-form-item label="文章标题" prop="article_title">
            <el-input v-model="articleForm.article_title" placeholder="请输入文章标题" />
          </el-form-item>
          
          <el-form-item style="width: 100%; height: auto" prop="article_content">
            <MdEditor
              v-model="articleForm.article_content"
              style="height: 500px"
            />
          </el-form-item>
        </el-form>
  
        <!-- 新增发布对话框 -->
        <BaseDialog
          :visible="publishDialogVisible"
          :title="'发布设置'"
          :form-items="publishFormItems"
          :rules="publishRules"
          :initial-data="articleForm"
          @update:visible="val => publishDialogVisible = val"
          @confirm="handlePublishConfirm"
        />
      </el-card>
    </div>
  </template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import requestUtil from '@/utils/request'
import BaseDialog from '@/components/dialog/BaseDialog.vue'
import { ARTICLE_PUBLISH_CONFIG } from '@/config/dialogConfig'

// 表单引用
const articleFormRef = ref(null)

// 主表单数据
const articleForm = ref({
  article_title: '',
  article_content: '',
  // 以下字段将移动到对话框
  category: '',
  tags: [],
  article_description: '',
  type: 1,      // 默认原创
  status: 3,    // 默认草稿
  is_top: 2,    // 默认不置顶
})

// 表单验证规则（仅保留核心字段）
const rules = {
  article_title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在2到100个字符', trigger: 'blur' }
  ],
  article_content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' }
  ]
}

// 分类和标签选项
const categoryOptions = ref([])
const tagOptions = ref([])

// 发布对话框相关
const publishDialogVisible = ref(false)
const publishFormItems = ref([...ARTICLE_PUBLISH_CONFIG.formItems])
const publishRules = ARTICLE_PUBLISH_CONFIG.rules

// 初始化加载分类和标签
onMounted(async () => {
  await loadCategoryOptions()
  await loadTagOptions()
  setupDialogOptions()
})

// 加载分类选项
const loadCategoryOptions = async () => {
  try {
    const res = await requestUtil.get('/blog/categories/')
    categoryOptions.value = res.data
  } catch (error) {
    ElMessage.error('分类加载失败')
  }
}

// 加载标签选项
const loadTagOptions = async () => {
  try {
    const res = await requestUtil.get('/blog/tags/')
    tagOptions.value = res.data
  } catch (error) {
    ElMessage.error('标签加载失败')
  }
}

// 设置对话框选项
const setupDialogOptions = () => {
  // 设置分类选项
  const categoryItem = publishFormItems.value.find(item => item.prop === 'category')
  if (categoryItem) {
    categoryItem.componentProps.options = categoryOptions.value.map(item => ({
      label: item.category_name,
      value: item.id
    }))
  }

  // 设置标签选项
  const tagItem = publishFormItems.value.find(item => item.prop === 'tags')
  if (tagItem) {
    tagItem.componentProps.options = tagOptions.value.map(item => ({
      label: item.tag_name,
      value: item.id
    }))
  }
}

// 显示发布对话框
const showPublishDialog = () => {
  if (!articleForm.value.article_title) {
    ElMessage.warning('请输入文章标题')
    return
  }
  if (!articleForm.value.article_content) {
    ElMessage.warning('请输入文章内容')
    return
  }
  
  // 确保对话框打开前，先设置好对话框的可见性
  publishDialogVisible.value = true
}

// 处理发布确认
const handlePublishConfirm = async (formData) => {
  try {
    // 合并对话框数据到主表单
    Object.assign(articleForm.value, formData)
    
    // 执行表单验证
    await articleFormRef.value.validate()
    
    // 提交数据
    await requestUtil.post('/blog/articles/', articleForm.value)
    
    // 处理结果
    const statusMap = {
      1: '发布成功',
      2: '已保存为私密文章',
      3: '已保存为草稿'
    }
    ElMessage.success(statusMap[formData.status])
    
    // 重置表单
    publishDialogVisible.value = false
    articleFormRef.value.resetFields()
  } catch (error) {
    ElMessage.error('操作失败: ' + (error.response?.data?.errorInfo || error.message))
  }
}

</script>

<style scoped>
.article-add-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

</style>