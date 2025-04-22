<template>
    <el-dialog v-model="visible" :title="isEdit ? '编辑菜单' : '添加菜单'" width="30%">
      <el-form ref="formRef" :model="formModel" :rules="rules" label-width="100px">
        <el-form-item label="上级菜单" prop="parent">
          <el-select v-model="formModel.parent" placeholder="请选择上级菜单">
            <el-option label="根目录" :value="0" />
            <template v-for="item in menuOptions" :key="item.id">
              <el-option :label="item.name" :value="item.id" />
              <template v-for="child in item.children">
                <el-option :label="`— ${child.name}`" :value="child.id" />
              </template>
            </template>
          </el-select>
        </el-form-item>
  
        <el-form-item label="菜单类型" prop="menu_type">
          <el-radio-group v-model="formModel.menu_type">
            <el-radio :value="'M'">目录</el-radio>
            <el-radio :value="'C'">菜单</el-radio>
          </el-radio-group>
        </el-form-item>
  
        <el-form-item label="菜单图标" prop="icon">
          <el-input v-model="formModel.icon" />
        </el-form-item>
  
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="formModel.name" />
        </el-form-item>
  
        <el-form-item label="权限标识" prop="perms">
          <el-input v-model="formModel.perms" />
        </el-form-item>
  
        <el-form-item label="路由路径" prop="path">
          <el-input v-model="formModel.path" />
        </el-form-item>
  
        <el-form-item label="组件路径" prop="component">
          <el-input v-model="formModel.component" />
        </el-form-item>
  
        <el-form-item label="显示顺序" prop="order_num">
          <el-input-number v-model="formModel.order_num" :min="1" />
        </el-form-item>
  
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formModel.remark" />
        </el-form-item>
      </el-form>
  
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="handleConfirm">确认</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  
  const props = defineProps({
    visible: Boolean,
    isEdit: Boolean,
    modelValue: Object,
    menuOptions: { type: Array, default: () => [] }
  })
  const emits = defineEmits(['update:visible', 'confirm'])
  
  const visible = ref(props.visible)
  const formModel = ref({})
  const formRef = ref(null)
  
  watch(() => props.visible, (val) => {
    visible.value = val
    formModel.value = {
    //   parent_id: 0,
    //   menu_type: 'M',
    //   name: '',
    //   icon: '',
    //   path: '',
    //   component: '',
    //   perms: '',
    //   order_num: 1,
    //   remark: '',
      ...(props.modelValue || {})
    }
  })
  
  watch(visible, (val) => {
    emits('update:visible', val)
  })
  
  const rules = {
    name: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
    menu_type: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
    path: [{ required: true, message: '路由路径不能为空', trigger: 'blur' }],
    component: [],
    perms: []
  }
  
  const handleConfirm = () => {
    formRef.value.validate(valid => {
      if (valid) {
        emits('confirm', JSON.parse(JSON.stringify(formModel.value)))
      }
    })
  }
  
  const handleCancel = () => {
    visible.value = false
  }
  </script>
  
  <style scoped>
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
  }
  </style>