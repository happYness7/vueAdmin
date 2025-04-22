<template>
  <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑角色' : '添加角色'" width="30%">
    <el-form ref="formRef" :model="formModel" :rules="rules" label-width="80px">
      <el-form-item label="角色名称" prop="name">
        <el-input v-model="formModel.name" placeholder="请输入角色名称" />
      </el-form-item>

      <el-form-item label="权限字符" prop="code">
        <el-input v-model="formModel.code" placeholder="请输入权限字符串（如：admin）" />
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input v-model="formModel.remark" type="textarea" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  visible: Boolean,
  isEdit: Boolean,
  modelValue: Object
});
const emits = defineEmits(['update:visible', 'confirm']);

const dialogVisible = ref(props.visible);
const formModel = ref({ ...props.modelValue });
const formRef = ref(null);

watch(() => props.visible, (val) => {
  dialogVisible.value = val;
  formModel.value = JSON.parse(JSON.stringify(props.modelValue || {}));
});

watch(dialogVisible, (val) => {
  emits('update:visible', val);
});

const rules = {
  name: [
    { required: true, message: "角色名称不能为空", trigger: "blur" },
    { min: 2, max: 50, message: "角色名称长度在 2 到 50 个字符", trigger: "blur" }
  ],
  code: [
    { required: true, message: "权限字符不能为空", trigger: "blur" },
    { pattern: /^[a-zA-Z0-9_]+$/, message: "只能包含字母、数字和下划线", trigger: "blur" }
  ],
  remark: []
}

const handleConfirm = () => {
  formRef.value.validate(valid => {
    if (valid) {
      emits('confirm', JSON.parse(JSON.stringify(formModel.value)));
    }
  });
};

const handleCancel = () => {
  dialogVisible.value = false;
}
</script>

<style scoped>
.el-input, .el-textarea {
  width: 90%;
}
</style>