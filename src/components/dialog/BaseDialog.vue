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
          >
            <!-- 处理选项型组件 -->
            <template v-if="item.options">
              <component 
                :is="item.type === 'radio-group' ? ElRadio : ElOption"
                v-for="opt in item.options"
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
  ElInputNumber
} from 'element-plus'

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
  'input-number': markRaw(ElInputNumber)
}


// 响应式数据
const visible = ref(props.visible)
const formModel = ref({ ...props.initialData })

// 监听器
watch(() => props.visible, val => visible.value = val)
watch(visible, val => emits('update:visible', val))
watch(() => props.initialData, val => formModel.value = { ...val })

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
:deep(.el-select-dropdown__item) {
  &[data-level="0"] { padding-left: 32px; }
  &[data-level="1"] { padding-left: 64px; }
  &[data-level="2"] { padding-left: 96px; }
  
  &:before {
    content: '';
    position: absolute;
    left: 16px;
    width: 6px;
    height: 6px;
    background: #409eff;
    border-radius: 50%;
  }
  
  &[data-level="-1"] {
    padding-left: 16px;
    font-weight: 600;
    &:before { display: none; }
  }
}

</style>