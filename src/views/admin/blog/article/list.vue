<template>
    <div class="app-container">
        <el-form :model="searchForm" inline @submit.prevent="loadArticleData">
            <!-- 第一行：标题、分类、标签 -->
            <el-form-item label="文章标题">
                <el-input v-model="searchForm.article_title" placeholder="请输入标题" clearable style="width: 200px"/>
            </el-form-item>

            <el-form-item label="文章分类">
                <el-select v-model="searchForm.category" clearable placeholder="请选择分类" style="min-width: 150px">
                    <el-option v-for="item in categoryOptions" :key="item.id" :label="item.name"
                        :value="item.category_name" />
                </el-select>
            </el-form-item>

            <el-form-item label="文章标签">
                <el-select v-model="searchForm.tags" multiple clearable placeholder="请选择标签"
                    style="min-width: 200px; max-width: 400px" collapse-tags collapse-tags-tooltip>
                    <el-option v-for="tag in tagOptions" :key="tag.id" :label="tag.name" :value="tag.tag_name" />
                </el-select>
            </el-form-item>

            <!-- 第二行：置顶状态 + 发布时间 -->
            <!-- 修改第二行结构 -->
            <div style="display: flex; width: 100%; margin-top: 12px; align-items: center; gap: 16px">
                <el-form-item label="置顶状态" style="margin: 0">
                    <el-select v-model="searchForm.is_top" clearable placeholder="请选择" style="width: 120px">
                        <el-option label="是" :value="1" />
                        <el-option label="否" :value="2" />
                    </el-select>
                </el-form-item>

                <el-form-item label="发布时间" style="margin: 0; flex: 1; max-width: 420px">
                    <el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="至"
                        start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 100%"
                        :shortcuts="[
                            { text: '最近一周', value: () => [new Date(Date.now() - 3600 * 1000 * 24 * 7), new Date()] },
                            { text: '最近一个月', value: () => [new Date(Date.now() - 3600 * 1000 * 24 * 30), new Date()] }
                        ]" />
                </el-form-item>

                <el-form-item style="margin: 0">
                    <el-button type="primary" native-type="submit" :icon="Search">搜索</el-button>
                    <el-button @click="resetSearch" :icon="RefreshRight">重置</el-button>
                </el-form-item>
                <el-button type="success" :icon="DocumentAdd" @click="handleAdd">新增文章</el-button>
            </div>
        </el-form>
        <el-tabs v-model="searchForm.status" type="card" @tab-change="loadArticleData" class="status-tabs">
            <el-tab-pane label="所有文章" :name="''"></el-tab-pane>
            <el-tab-pane label="公开文章" :name="1"></el-tab-pane>
            <el-tab-pane label="私密文章" :name="2"></el-tab-pane>
            <el-tab-pane label="草稿箱" :name="3"></el-tab-pane>
        </el-tabs>

        <!-- 新增的表格容器 -->
        <div class="table-wrapper">
            <div class="table-scroll-container">
                <el-table :data="articleList" border v-loading="loading">
                    <el-table-column prop="article_title" label="文章标题" width="200" align="center" />
                    <el-table-column prop="article_description" label="摘要" width="200" align="center">
                        <template #default="{ row }">
                            <span class="article-description">{{ row.article_description }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="分类" width="120" align="center">
                        <template #default="{ row }">{{ row.category?.category_name }}</template>
                    </el-table-column>
                    <el-table-column label="标签" width="180" align="center">
                        <template #default="{ row }">
                            <el-tag v-for="tag in row.tags" :key="tag.id" size="small" class="mr-2">{{ tag.tag_name
                            }}</el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="封面" width="120" align="center">
                        <template #default="{ row }">
                            <el-image 
                                :src="row.article_cover"
                                :initial-index="0"
                                :preview-src-list="row.article_cover ? [row.article_cover] : []"
                                :preview-teleported="true"
                                fit="cover"
                                class="article-cover"
                                hide-on-click-modal>
                                <template #error>
                                    <div class="cover-error">加载失败</div>
                                </template>
                            </el-image>
                        </template>
                    </el-table-column>
                    <el-table-column label="状态" width="100" align="center">
                        <template #default="{ row }">
                            <el-tag :type="getStatusTagType(row.status)">
                                {{ getStatusText(row.status) }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="作者" width="120" align="center">
                        <template #default="{ row }">{{ row.author?.username }}</template>
                    </el-table-column>
                    <el-table-column label="置顶状态" width="150" align="center">
                        <template #default="{ row }">
                            <el-switch v-model="row.is_top" @change="topChangeHandle(row)" active-text="置顶"
                                inactive-text="普通" :active-value="1" :inactive-value="2"></el-switch>
                        </template>
                    </el-table-column>
                    <el-table-column label="类型" width="100" align="center">
                        <template #default="{ row }">
                            <el-tag type="warning">
                                {{ getTypeText(row.type) }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column prop="created_at" label="发布时间" width="150" align="center" />
                    <el-table-column prop="updated_at" label="最后修改" width="150" align="center" />
                    <el-table-column label="操作" width="250" fixed="right" align="center">
                        <template #default="{ row }">
                            <el-button type="primary" :icon="Edit" size="small" @click="handleEdit(row.id)">编辑</el-button>
                            <el-button type="warning" :icon="Hide" size="small" @click="handleHide(row.id)">隐藏</el-button>
                            <el-button type="danger" :icon="Delete" size="small" @click="handleDelete(row.id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <!-- 分页容器 -->
            <div class="pagination-container">
                <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
                    :page-sizes="[10, 20, 30, 50, 100]" :total="pagination.total"
                    layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                    @current-change="loadArticleData" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import requestUtil, { getServerUrl } from '@/utils/request'
import { Search, Delete, DocumentAdd, Edit, Hide, RefreshRight } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import store from '@/store'

const router = useRouter()
// 搜索表单
const searchForm = ref({
    article_title: '',
    category: null,
    tags: [],
    is_top: null,
    dateRange: [],
    status: '',
})

// 分类和标签选项
const categoryOptions = ref([])
const tagOptions = ref([])

// 表格数据
const articleList = ref([])
const loading = ref(false)
const pagination = ref({
    pageNum: 1,
    pageSize: 10,
    total: 0
})

// 初始化加载选项
onMounted(async () => {
    await loadCategoryOptions()
    await loadTagOptions()
    loadArticleData()
})
// 状态显示逻辑
const getStatusText = (status) => {
    const map = { 1: '公开', 2: '私密', 3: '草稿' }
    return map[status] || '未知'
}

const getStatusTagType = (status) => {
    const typeMap = { 1: 'success', 2: 'danger', 3: 'info' }
    return typeMap[status] || ''
}

// 类型显示逻辑
const getTypeText = (type) => {
    const map = { 1: '原创', 2: '转载', 3: '翻译' }
    return map[type] || '其他'
}
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
const handleSizeChange = (size) => {
    pagination.value.pageSize = size
    pagination.value.pageNum = 1 // 重置到第一页
    loadArticleData()
}

// 加载文章数据
const loadArticleData = async () => {
    try {
        loading.value = true
        const params = {
            pageNum: pagination.value.pageNum,
            pageSize: pagination.value.pageSize,
            ...searchForm.value,
            start_time: searchForm.value.dateRange?.[0],
            end_time: searchForm.value.dateRange?.[1],
            // 保持搜索条件
            ...Object.fromEntries(
                Object.entries(searchForm.value)
                    .filter(([_, v]) => v !== null && v !== undefined && v !== '')
            )
        }
        // 处理标签数组参数
        if (params.tags?.length > 0) {
            params.tags = params.tags.join(',')
        }

        // 处理日期范围
        if (searchForm.value.dateRange?.length === 2) {
            params.start_time = searchForm.value.dateRange[0]
            params.end_time = searchForm.value.dateRange[1]
        }
        const res = await requestUtil.get('/blog/articles/', params)
        articleList.value = res.data.articleList
        pagination.value.total = res.data.total
        console.log(res)
    } catch (error) {
        ElMessage.error('数据加载失败: ' + (error.response?.data?.errorInfo || error.message))
    } finally {
        loading.value = false
    }
}
// 置顶状态切换处理
const topChangeHandle = async (row) => {

    const res = await requestUtil.patch(`/blog/articles/${row.id}/change-top/`, {
        is_top: row.is_top
    })

    if (res.data.code == 200) {
        ElMessage({
            type: 'success',
            message: '执行成功!'
        })
    } else {
        ElMessage({
            type: 'error',
            message: res.data.errorInfo,
        })
    }

}
// 重置搜索
const resetSearch = () => {
    searchForm.value = {
        article_title: '',
        category: null,
        tags: [],
        is_top: null,
        dateRange: []
    }
    loadArticleData()
}

// 删除处理函数
const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除该文章吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const res = await requestUtil.del(`/blog/articles/${id}/`)
      console.log(res)
      if (res.status === 204) {
        ElMessage.success('删除成功')
        loadArticleData() // 刷新数据
      }
    } catch (error) {
      ElMessage.error('删除失败: ' + error.response?.data?.errorInfo || error.message)
    }
  }).catch(() => {})
}

// 隐藏处理函数
const handleHide = (id) => {
  ElMessageBox.confirm('确定要隐藏该文章吗？', '操作确认', {
    confirmButtonText: '确定隐藏',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const res = await requestUtil.patch(`/blog/articles/${id}/`)
      if (res.data.code === 200) {
        ElMessage.success('隐藏成功')
        loadArticleData()
      }
    } catch (error) {
      ElMessage.error('操作失败: ' + error.response?.data?.errorInfo || error.message)
    }
  }).catch(() => {})
}
const handleAdd = () => {
  // 先添加到tabs
  store.commit("ADD_TABS", {
    name: '新增文章',
    path: `/admin/blog/article/add`
  })
  // 然后导航到该路由
  router.push(`/admin/blog/article/add`)
}

// 编辑处理函数
const handleEdit = (id) => {
  // 先添加到tabs
  store.commit("ADD_TABS", {
    name: '文章编辑器',
    path: `/admin/blog/article/edit/${id}`
  })
  // 然后导航到该路由
  router.push(`/admin/blog/article/edit/${id}`)
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

/* 表格容器样式与用户管理一致 */
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



/* 标签样式保持原有特色 */
:deep(.el-table__body-wrapper) .el-tag {
    margin: 2px;
    max-width: 120px;
    @include text-ellipsis;
    transition: all 0.3s;

    &:hover {
        transform: scale(1.05);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
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

.mr-2 {
    margin-right: 8px;
}

/* 摘要文本省略号 */
.article-description {
    display: inline-block;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 状态标签间距 */
.el-table .el-tag {
    margin: 2px;
}

.article-cover {
    width: 80px;
    height: 80px;
    border-radius: 4px;
    cursor: zoom-in;
    transition: transform 0.3s;
    will-change: transform;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;

    &:hover {
        transform: scale(1.1);
    }
}

/* 优化图片预览样式 */
:deep(.el-image-viewer__wrapper) {
    z-index: 2050;
}

:deep(.el-image-viewer__img) {
    -webkit-user-select: none;
    user-select: none;
    will-change: transform;
}

.cover-error {
    width: 100%;
    height: 100%;
    background: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
}
.status-tabs {
  margin: 0;
  
  :deep(.el-tabs__header) {
    margin: 0;
  }
  :deep(.el-tabs__nav-wrap) {
    padding: 0;
    background: var(--el-bg-color);
    border-radius: 4px;
  }
  :deep(.el-tabs__item) {
    height: 36px;
    line-height: 36px;
    padding: 0 20px;
    transition: all 0.3s;
    
    &.is-active {
      background: var(--el-color-primary);
      color: white;
      border-radius: 4px;
    }
  }
}

@media (max-width: 768px) {
  .status-tabs {
    :deep(.el-tabs__item) {
      padding: 0 12px;
      font-size: 14px;
    }
  }
}
</style>
