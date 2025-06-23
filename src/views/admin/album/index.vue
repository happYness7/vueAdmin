<template>
  <div class="album-list">
    <div class="table-wrapper">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>相册管理</span>
            <el-button type="primary" @click="handleCreate">新建相册</el-button>
          </div>
        </template>
        <div class="card-content">
          <div class="scroll-container">
            <div class="album-grid">
              <el-card v-for="(album, index) in albums" :key="index" class="album-item" shadow="hover">
                <template #header>
                  <div class="album-header">
                    <span class="album-title">{{ album.album_name }}</span>
                    <div class="album-actions">
                      <el-button-group>
                        <el-button type="primary" :icon="Edit" size="small"
                          @click.stop="handleEdit(album)">编辑</el-button>
                        <el-button type="danger" :icon="Delete" size="small"
                          @click.stop="handleDelete(album.id)">删除</el-button>
                      </el-button-group>
                    </div>
                  </div>
                </template>
                <div @click="viewAlbum(album.id)">
                  <el-image :src="album.album_cover" fit="cover" class="album-cover" />
                  <div class="album-info">
                    <p>{{ album.description }}</p>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination v-model:current-page="pagination.pageNum" v-model:page-size="pagination.pageSize"
              :page-sizes="[4, 8, 12, 16]" :total="pagination.total" layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange" @current-change="handleCurrentChange" />
          </div>
        </div>
      </el-card>
    </div>

    <!-- 新建/编辑相册对话框 -->
    <BaseDialog :visible="dialogVisible" :title="dialogType === 'create' ? '新建相册' : '编辑相册'"
      :form-items="ALBUM_CONFIG.formItems" :rules="ALBUM_CONFIG.rules" :initial-data="albumForm" @confirm="handleSubmit"
      @close="dialogVisible = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete } from '@element-plus/icons-vue'
import requestUtil from '@/utils/request'
import BaseDialog from '@/components/dialog/BaseDialog.vue'
import { ALBUM_CONFIG } from '@/config/dialogConfig'
import store from '@/store'

const router = useRouter()

// 分页参数
const pagination = ref({
  pageNum: 1,
  pageSize: 4,
  total: 0
})

// 相册列表数据
const albums = ref([])

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('create')
const albumForm = ref({
  album_name: '',
  album_cover: '',
  description: ''
})

// 重置表单
const resetForm = () => {
  albumForm.value = {
    album_name: '',
    album_cover: '',
    description: ''
  }
  dialogType.value = 'create'
}
// 查看相册详情
const viewAlbum = (albumId) => {
  // 先添加到tabs
  store.commit("ADD_TABS", {
    name: '照片管理',
    path: `/admin/album/detail/${albumId}/`
  })
  // 然后导航到该路由
  router.push(`/admin/album/detail/${albumId}/`)
}

// 获取相册列表
const getAlbumList = async () => {
  try {
    const params = {
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize
    }
    const response = await requestUtil.get('/blog/albums/', params)
    albums.value = response.data.albumList
    pagination.value.total = response.data.total
  } catch (error) {
    console.error('获取相册列表失败:', error)
    ElMessage.error('获取相册列表失败')
  }
}

// 新建相册
const handleCreate = () => {
  resetForm()
  dialogVisible.value = true
}

// 编辑相册
const handleEdit = (album) => {
  dialogType.value = 'edit'
  albumForm.value = { ...album }
  dialogVisible.value = true
}

// 删除相册
const handleDelete = (albumId) => {
  ElMessageBox.confirm('确定要删除这个相册吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await requestUtil.del(`/blog/albums/${albumId}/`)
      ElMessage.success('删除成功')
      getAlbumList()
    } catch (error) {
      console.error('删除相册失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

// 提交表单
const handleSubmit = async (formData) => {
  try {
    if (dialogType.value === 'create') {
      await requestUtil.post('/blog/albums/', formData)
      ElMessage.success('创建成功')
    } else {
      await requestUtil.put(`/blog/albums/${formData.id}/`, formData)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    resetForm()
    getAlbumList()
  } catch (error) {
    console.error('保存相册失败:', error)
    ElMessage.error('保存失败')
  }
}

// 处理分页大小变化
const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.pageNum = 1
  getAlbumList()
}

// 处理页码变化
const handleCurrentChange = (current) => {
  pagination.value.pageNum = current
  getAlbumList()
}

// 页面加载时获取数据
getAlbumList()
</script>

<style lang="scss" scoped>
.album-list {
  padding: 20px;

  .table-wrapper {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  height: 780px; // 保持固定高度
  display: flex;
  flex-direction: column;

  .box-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0; // 新增关键属性

    :deep(.el-card__body) {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0; // 新增关键属性
    }

    .card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-height: 0; // 新增关键属性
    }

    .scroll-container {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      min-height: 0; // 新增关键属性
    }
  }
}

  .pagination-container {
    padding: 10px 20px;
    border-top: 1px solid #ebeef5;
    background: var(--card-bg) !important;
    border-color: var(--border-color) !important;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0; // 防止分页被挤压
    position: sticky;
    bottom: 0;
    z-index: 1;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .album-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;


    .album-item {
      position: relative;
      transition: transform 0.3s;

      &:hover {
        transform: translateY(-5px);
      }

      :deep(.el-card__header) {
        padding: 10px;

        .album-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .album-title {
            font-size: 16px;
            font-weight: bold;
            color: var(--el-text-color-primary);
          }

          .album-actions {
            display: flex;
            justify-content: flex-end;
          }
        }
      }

      .album-cover {
        width: 100%;
        height: 200px;
        border-radius: 4px;
        cursor: pointer;
      }

      .album-info {
        padding: 10px 0;
        cursor: pointer;

        h3 {
          margin: 0 0 10px;
          font-size: 16px;
          color: var(--text-color);
        }

        p {
          margin: 0;
          font-size: 14px;
          color: var(--el-text-color-regular);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}
</style>