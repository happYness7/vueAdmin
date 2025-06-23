<template>
    <div class="app-container">
        <el-form inline @submit.prevent="loadCategoryData">
            <el-form-item label="分类名称">
                <el-input v-model="queryForm.query" placeholder="请输入分类名称..." clearable style="width: 200px"/>
            </el-form-item>

            <el-form-item>
                <el-button type="primary" native-type="submit" :icon="Search">搜索</el-button>
                <el-button type="success" :icon="Plus" @click="handleAdd">新增分类</el-button>
            </el-form-item>
        </el-form>

        <!-- 表格容器 -->
        <div class="table-wrapper">
            <div class="table-scroll-container">
                <el-table :data="categoryList" border>
                    <el-table-column prop="id" label="ID" width="80" align="center" />
                    <el-table-column prop="category_name" label="分类名称" width="400" align="center" />
                    <el-table-column prop="created_at" label="创建时间" width="300" align="center" />
                    <el-table-column prop="updated_at" label="更新时间" width="300" align="center" />
                    <el-table-column label="操作" width="200" fixed="right" align="center">
                        <template #default="{ row }">
                            <el-button type="primary" :icon="Edit" size="small" @click="handleEdit(row)">编辑</el-button>
                            <el-button type="danger" :icon="Delete" size="small"
                                @click="handleDelete(row.id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <!-- 分页容器 -->
            <div class="pagination-container">
                <el-pagination v-model:current-page="queryForm.pageNum" v-model:page-size="queryForm.pageSize"
                    :page-sizes="[10, 20, 30, 50, 100]" :total="total"
                    layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                    @current-change="handleCurrentChange" />
            </div>
        </div>

        <!-- 分类表单对话框 -->
        <BaseDialog v-model:visible="dialogVisible" :title="dialogTitle" :form-items="formItems" :rules="rules"
            :initial-data="formData" @confirm="handleConfirm" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import requestUtil from '@/utils/request'
import { Search, Delete, Edit, Plus } from '@element-plus/icons-vue'
import BaseDialog from '@/components/dialog/BaseDialog.vue'
import { CATEGORY_CONFIG } from '@/config/dialogConfig'

// 查询表单
const queryForm = ref({
    query: '',       // 搜索关键词
    pageNum: 1,      // 当前页码
    pageSize: 10     // 每页条数
})

// 表格数据
const categoryList = ref([])
const loading = ref(false)
const total = ref(0)

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增分类')
const formData = ref({})

const formItems = ref(CATEGORY_CONFIG.formItems)
const rules = CATEGORY_CONFIG.rules

onMounted(() => {
    loadCategoryData()
})

// 加载分类数据
const loadCategoryData = async () => {
    const params = {
            query: queryForm.value.query,
            pageNum: queryForm.value.pageNum,
            pageSize: queryForm.value.pageSize
        }
    try {
        const res = await requestUtil.get('/blog/categories/category-list/', params)
        categoryList.value = res.data.categoryList
        total.value = res.data.total
    } catch (error) {
        ElMessage.error('数据加载失败: ' + (error.response?.data?.errorInfo || error.message))
    } finally {
        loading.value = false
    }
}

const handleSizeChange = (pageSize) => {
  queryForm.pageSize = pageSize
  queryForm.pageNum = 1
  loadCategoryData()
}

const handleCurrentChange = (pageNum) => {
  queryForm.pageNum = pageNum
  loadCategoryData()
}

// 新增分类
const handleAdd = () => {
    dialogTitle.value = '新增分类'
    formData.value = {}
    dialogVisible.value = true
}

// 编辑分类
const handleEdit = (row) => {
    dialogTitle.value = '编辑分类'
    formData.value = { ...row }
    dialogVisible.value = true
}

// 删除分类
const handleDelete = (id) => {
    ElMessageBox.confirm('确定要删除该分类吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        try {
            const res = await requestUtil.del(`/blog/categories/${id}/`)
            if (res.status === 204 || res.data.code === 200) {
                ElMessage.success('删除成功')
                loadCategoryData(queryForm.pageNum) // 刷新当前页数据
            }
        } catch (error) {
            ElMessage.error('删除失败: ' + (error.response?.data?.errorInfo || error.message))
        }
    }).catch(() => { })
}

// 表单提交处理
const handleConfirm = async (formModel) => {
    const submitData = {
        category_name: formModel.category_name,
    }
    try {
        if (formModel.id) {
            const res = await requestUtil.put(`/blog/categories/${formModel.id}/`, submitData)
            if (res.status === 200 || res.data.code === 200) {
                ElMessage.success('更新成功')
                dialogVisible.value = false
                loadCategoryData(queryForm.pageNum)
            }
        } else {
            const res = await requestUtil.post('/blog/categories/', formModel)
            if (res.status === 201 || res.data.code === 200) {
                ElMessage.success('添加成功')
                dialogVisible.value = false
                loadCategoryData(1)
            }
        }
    } catch (error) {
        ElMessage.error('操作失败: ' + (error.response?.data?.errorInfo || error.message))
    }
}
</script>

<style lang="scss" scoped>
@import '@/assets/scss/mixins.scss';

.app-container {
    height: calc(100vh - 92px);
    padding: 4px 0 0 10px !important;
    display: flex;
    flex-direction: column;
}

/* 表格容器样式 */
.table-wrapper {
    display: flex;
    flex-direction: column;
    height: 660px;
    background: var(--card-bg) !important;
    border: 1px solid var(--border-color);
    overflow: hidden;

    .table-scroll-container {
        flex: 1;
        overflow-y: auto;
    }

    /* 分页样式统一 */
    .pagination-container {
        padding: 10px 20px;
        border-top: 1px solid var(--border-color);
        background: var(--card-bg) !important;
        display: flex;
        justify-content: flex-end;
        flex-shrink: 0;

        :deep(.el-pagination) {
            padding: 0;
            margin: 0;
        }
    }
}

/* 统一滚动条样式 */
:deep(.table-scroll-container)::-webkit-scrollbar {
    width: 6px;
    height: 6px;

    &-thumb {
        background-color: var(--scrollbar-color);
        border-radius: 3px;
    }
}

/* 搜索栏间距统一 */
.el-form {
    margin-bottom: 7px;
}
</style>