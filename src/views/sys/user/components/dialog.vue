<template>
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑用户' : '添加用户'" width="30%">
        <el-form ref="formRef" :model="formModel" :rules="rules" label-width="80px">
            <el-form-item label="用户名" prop="username">
                <el-input v-model="formModel.username" placeholder="请输入用户名" />
                <el-alert v-if="!isEdit" title="默认初始密码：123456" :closable="false" style="line-height: 10px;"
                    type="success">
                </el-alert>
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
                <el-input v-model="formModel.email" placeholder="请输入邮箱" />
            </el-form-item>

            <el-form-item label="手机号" prop="phonenumber">
                <el-input v-model="formModel.phonenumber" placeholder="请输入手机号" />
            </el-form-item>

            <el-form-item label="状态" prop="status">
                <el-radio-group v-model="formModel.status">
                    <el-radio :value="0">停用</el-radio>
                    <el-radio :value="1">正常</el-radio>
                </el-radio-group>
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
    username: [
        { required: true, message: "用户名不能为空", trigger: "blur" },
        { min: 3, max: 100, message: "用户名长度在 3 到 100 个字符", trigger: "blur" }
    ],
    password: [
        { required: true, message: "密码不能为空", trigger: "blur" },
        { min: 6, max: 100, message: "密码长度在 6 到 100 个字符", trigger: "blur" }
    ],
    email: [
        { required: true, message: "邮箱不能为空", trigger: "blur" },
        { type: 'email', message: "请输入正确的邮箱地址", trigger: "blur" }
    ],
    phonenumber: [
        { required: true, message: "手机号不能为空", trigger: "blur" },
        { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号", trigger: "blur" }
    ],
    status: [
        { required: true, message: "状态不能为空", trigger: "blur" }
    ],
    remark: []
}

const handleConfirm = () => {
  formRef.value.validate(valid => {
    if (valid) {
      emits('confirm', JSON.parse(JSON.stringify(formModel.value)));
      // dialogVisible.value = false
    }
  });
};
const handleCancel = () => {
    dialogVisible.value = false
}
</script>