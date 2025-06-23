<template>
    <div class="app-container">
        <el-form inline @submit.prevent="loadTagData">
            <el-form-item label="标签名称">
                <el-input v-model="queryForm.query" placeholder="请输入标签名称..." clearable style="width: 200px" />
            </el-form-item>

            <el-form-item>
                <el-button type="primary" native-type="submit" :icon="Search">搜索</el-button>
                <el-button type="success" :icon="Plus" @click="handleAdd">新增标签</el-button>
            </el-form-item>
        </el-form>

        <!-- 表格容器 -->
        <div class="table-wrapper">
            <div class="table-scroll-container">
                <el-table :data="tagList" border>
                    <el-table-column prop="id" label="ID" width="80" align="center" />
                    <el-table-column prop="tag_name" label="分类名称" width="400" align="center" />
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

        <!-- 标签表单对话框 -->
        <BaseDialog v-model:visible="dialogVisible" :title="dialogTitle" :form-items="formItems" :rules="rules"
            :initial-data="formData" @confirm="handleConfirm" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import requestUtil from '@/utils/request'
import { Search, Delete, Edit, Plus, RefreshRight } from '@element-plus/icons-vue'
import BaseDialog from '@/components/dialog/BaseDialog.vue'
import { TAG_CONFIG } from '@/config/dialogConfig'



// 表格数据
const tagList = ref([])
const queryForm = ref({
    query: '',       // 搜索关键词
    pageNum: 1,      // 当前页码
    pageSize: 10,    // 每页条数
})
const total = ref(0)

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增标签')
const formData = ref({})

const formItems = ref(TAG_CONFIG.formItems)
const rules = TAG_CONFIG.rules
onMounted(() => {
    loadTagData() // ✅ 实际存在
})
// 加载标签数据
const loadTagData = async () => {
    const params = {
            query: queryForm.value.query,
            pageNum: queryForm.value.pageNum,
            pageSize: queryForm.value.pageSize
        }
    try {
        const res = await requestUtil.get('/blog/tags/tag-list/', params)
        tagList.value = res.data.tagList
        total.value = res.data.total
    } catch (error) {
        ElMessage.error('数据加载失败: ' + (error.response?.data?.errorInfo || error.message))
    }
}
// 处理页码大小变化
const handleSizeChange = (pageSize) => {
    queryForm.value.pageSize = pageSize
    queryForm.value.pageNum = 1
    loadTagData()
}
const handleCurrentChange = (pageNum) => {
    queryForm.value.pageNum = pageNum
    loadTagData()
}

// 新增标签
const handleAdd = () => {
    dialogTitle.value = '新增标签'
    formData.value = {}
    dialogVisible.value = true
}

// 编辑标签
const handleEdit = (row) => {
    dialogTitle.value = '编辑标签'
    formData.value = { ...row }
    dialogVisible.value = true
}

// 删除标签
const handleDelete = (id) => {
    ElMessageBox.confirm('确定要删除该标签吗？', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        try {
            const res = await requestUtil.del(`/blog/tags/${id}/`)
            if (res.status === 204 || res.data.code === 200) {
                ElMessage.success('删除成功')
                loadTagData(queryForm.value.pageNum) // 刷新当前页数据
            }
        } catch (error) {
            ElMessage.error('删除失败: ' + (error.response?.data?.errorInfo || error.message))
        }
    }).catch(() => { })
}

// 表单提交处理
const handleConfirm = async (formModel) => {
    const submitData = {
        tag_name: formModel.tag_name, // 映射字段
    }
    try {
        if (formModel.id) {
            // 编辑模式
            const res = await requestUtil.put(`/blog/tags/${formModel.id}/`, submitData)
            if (res.status === 200 || res.data.code === 200) {
                ElMessage.success('更新成功')
                dialogVisible.value = false
                loadTagData(queryForm.value.pageNum) // 刷新当前页数据
            }
        } else {
            // 新增模式
            const res = await requestUtil.post('/blog/tags/', formModel)
            if (res.status === 201 || res.data.code === 200) {
                ElMessage.success('添加成功')
                dialogVisible.value = false
                loadTagData(1) // 返回第一页查看新增数据
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