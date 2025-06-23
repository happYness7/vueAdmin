<template>
  <el-dialog v-model="visible" :title="title" width="30%">
    <el-form ref="formRef" :model="formModel" :rules="rules" label-width="100px">
      <template v-for="item in formItems" :key="item.prop">
        <el-form-item :label="item.label" :prop="item.prop">
          <!-- 动态组件渲染 -->
          <component 
            :is="componentMap[item.type]"
            v-model="formModel[item.prop]"
            v-bind="item.componentProps"
            :auto-upload="false"
            :on-change="item.type === 'upload' ? (uploadFile) => handleUploadSuccess(uploadFile.raw, item.prop) : undefined"
            :before-upload="item.type === 'upload' ? beforeUpload : undefined"
          >
            <!-- 上传组件的提示信息 -->
            <template v-if="item.type === 'upload' && item.componentProps?.tip">
              <div class="upload-tip">{{ item.componentProps.tip }}</div>
            </template>
            <!-- 上传组件的预览 -->
            <template v-if="item.type === 'upload'">
              <img v-if="formModel[item.prop]" :src="formModel[item.prop]" class="upload-preview" />
              <el-icon v-else class="upload-icon"><Plus /></el-icon>
            </template>
            <!-- 处理选项型组件 -->
             <template v-if="getOptions(item).length">
              <component 
                :is="item.type === 'radio-group' ? ElRadio : ElOption"
                v-for="opt in getOptions(item)"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </template>
          </component>
        </el-form-item>
      </template>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, markRaw } from 'vue'
import {
  ElInput,
  ElRadio,
  ElRadioGroup,
  ElOption,
  ElSelect,
  ElInputNumber,
  ElSwitch,
  ElUpload,
} from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { uploadImage } from '@/utils/upload'

const getOptions = (item) => {
  // 优先使用 componentProps 中的选项，其次使用根级 options
  return item.componentProps?.options || item.options || []
}
const props = defineProps({
  visible: Boolean,
  title: String,
  formItems: {
    type: Array,
    required: true,
    validator: items => items.every(item => 
      ['label', 'prop', 'type'].every(key => key in item)
    )
  },
  rules: Object,
  initialData: Object,
})

const emits = defineEmits(['update:visible', 'confirm'])

// 组件映射（使用 markRaw 优化性能）
const componentMap = {
  input: markRaw(ElInput),
  'radio-group': markRaw(ElRadioGroup),
  select: markRaw(ElSelect),
  textarea: markRaw(ElInput),
  'input-number': markRaw(ElInputNumber),
  switch: markRaw(ElSwitch),
  upload: markRaw(ElUpload),
}


// 响应式数据
const visible = ref(props.visible)
const formModel = ref({ ...props.initialData })

// 监听器
watch(() => props.visible, val => {
  visible.value = val
  // 当对话框打开时，确保表单数据是最新的
  if (val && props.initialData) {
    formModel.value = { ...props.initialData }
  }
})
watch(visible, val => emits('update:visible', val))
watch(() => props.initialData, val => formModel.value = { ...val })

// 处理上传
const handleUploadSuccess = async (file, prop) => {
  // 根据prop名称判断上传类型
  let uploadType = 'photo'  // 默认类型
  if (prop === 'article_cover') {
    uploadType = 'article_cover'
  } else if (prop === 'album_cover') {
    uploadType = 'album_cover'
  } else if (prop.includes('config')) {
    uploadType = 'config'
  }

  const { success, url } = await uploadImage(file, uploadType)
  if (success) {
    formModel.value[prop] = url
  }
}

// 上传前验证
const beforeUpload = (file) => {
  return true // 验证逻辑已移至uploadImage函数中
}

// 确认处理
const handleConfirm = () => {
  emits('confirm', { ...formModel.value })
}
</script>
<style scoped>
/* 在 BaseDialog.vue 中添加 */
:deep(.el-textarea__inner) {
  min-height: 80px !important;
}

/* 上传组件样式 */
.upload-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 5px;
  line-height: 1.4;
}

.upload-preview {
  width: 148px;
  height: 148px;
  display: block;
  object-fit: cover;
}

:deep(.el-upload) {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 148px;
  height: 148px;
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.el-upload:hover) {
  border-color: #409eff;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
}
</style>