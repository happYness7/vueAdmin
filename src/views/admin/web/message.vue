<template>
  <div class="app-container">
    <el-form :model="searchForm" inline @submit.prevent="loadMessageData">
        <!-- 留言内容搜索 -->
        <el-form-item label="留言内容" >
          <el-input v-model="searchForm.content" placeholder="请输入留言内容" clearable style="width: 240px" />
        </el-form-item>

        <!-- 留言时间范围 -->
        <el-form-item label="留言时间" >
          <el-date-picker v-model="searchForm.dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 100%" :shortcuts="[
              { text: '最近一周', value: () => [new Date(Date.now() - 3600 * 1000 * 24 * 7), new Date()] },
              { text: '最近一个月', value: () => [new Date(Date.now() - 3600 * 1000 * 24 * 30), new Date()] }
            ]" />
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item >
          <el-button type="primary" native-type="submit" :icon="Search">搜索</el-button>
          <el-button @click="resetSearch" :icon="RefreshRight">重置</el-button>
          <el-popconfirm title="您确定批量删除这些记录吗？" @confirm="handleBatchDelete">
            <template #reference>
              <el-button type="danger" :disabled="selectedMessageIds.length === 0" :icon="Delete">批量删除</el-button>
            </template>
          </el-popconfirm>
        </el-form-item>
    </el-form>

    <!-- 表格容器 -->
    <div class="table-wrapper">
      <div class="table-scroll-container">
        <el-table :data="messageList" border v-loading="loading" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="content" label="留言内容" min-width="300" align="center">
            <template #default="{ row }">
              <span class="message-content">{{ row.content }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="from_user.username" label="留言用户" width="150" align="center" />
          <el-table-column prop="created_at" label="留言时间" width="150" align="center" />
          <el-table-column label="操作" width="150" fixed="right" align="center">
            <template #default="{ row }">
              <el-button type="danger" :icon="Delete" size="small" @click="handleDelete(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 分页容器 -->
      <div class="pagination-container">
        <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 30, 50, 100]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" @current-change="loadMessageData" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import requestUtil from '@/utils/request'
import { Search, Delete, RefreshRight } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = ref({
  content: '',
  dateRange: []
})

// 选中的留言ID列表
const selectedMessageIds = ref([])

// 表格数据
const messageList = ref([])
const loading = ref(false)
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 加载留言数据
const loadMessageData = async () => {
  try {
    loading.value = true
    const params = {
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize,
      content: searchForm.value.content,
      start_time: searchForm.value.dateRange?.[0],
      end_time: searchForm.value.dateRange?.[1]
    }

    const res = await requestUtil.get('/blog/comments/message-list/', params)
    messageList.value = res.data.messageList
    pagination.value.total = res.data.total
  } catch (error) {
    ElMessage.error('数据加载失败: ' + (error.response?.data?.errorInfo || error.message))
  } finally {
    loading.value = false
  }
}

// 处理分页大小变化
const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.pageNum = 1 // 重置到第一页
  loadMessageData()
}

// 处理表格选择变化
const handleSelectionChange = (selection) => {
  selectedMessageIds.value = selection.map(item => item.id)
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    const comment_ids = selectedMessageIds.value
    const res = await requestUtil.del('/blog/comments/batch-delete/', { comment_ids })
    if (res.data.code === 200) {
      ElMessage.success('批量删除成功！')
      loadMessageData() // 刷新列表
    } else {
      ElMessage.error(res.data.errorInfo || '批量删除失败')
    }
  } catch (error) {
    ElMessage.error('批量删除失败：' + (error.response?.data?.errorInfo || error.message))
    console.error('批量删除失败:', error)
  }
}

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    content: '',
    dateRange: []
  }
  loadMessageData()
}

// 删除处理函数
const handleDelete = (id) => {
  ElMessageBox.confirm('确定要删除该留言吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const res = await requestUtil.del(`/blog/comments/${id}/`)
      if (res.status === 204) {
        ElMessage.success('删除成功')
        loadMessageData() // 刷新数据
      }
    } catch (error) {
      ElMessage.error('删除失败: ' + error.response?.data?.errorInfo || error.message)
    }
  }).catch(() => { })
}

// 初始加载数据
loadMessageData()
</script>

<style lang="scss" scoped>
@import '@/assets/scss/mixins.scss';

.app-container {
  height: calc(100vh - 92px);
  padding: 4px 0 0 10px !important;
  display: flex;
  flex-direction: column;
}

/* 统一表格容器样式 */
.table-wrapper {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 180px);
  /* 动态高度 */
  margin-top: 8px;
  background: var(--card-bg) !important;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;

  .table-scroll-container {
    flex: 1;
    overflow-y: auto;
    padding: 0 10px;
  }

  /* 统一分页样式 */
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

/* 优化表格单元格样式 */
:deep(.el-table) {
  th.el-table__cell {
    background-color: var(--el-fill-color-light) !important;
  }

  td {
    padding: 8px 0;
  }
}

/* 统一操作按钮间距 */
.el-button+.el-button {
  margin-left: 8px;
}

/* 优化留言内容显示 */
.message-content {
  display: inline-block;
  max-width: 100%;
  @include text-ellipsis;
  line-height: 1.4;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .app-container {
    padding: 4px !important;
  }

  .el-form-item {
    margin-bottom: 10px;

    &__label {
      width: auto !important;
    }
  }

  .table-wrapper {
    height: auto;
    max-height: calc(100vh - 200px);
  }
}
</style>