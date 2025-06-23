<template>
  <div class="album-detail">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>{{ albumTitle }}</span>
          <div class="header-buttons">
            <template v-if="filterForm.status === '1'">
              <template v-if="!isEditMode">
                <el-button type="primary" @click="toggleEditMode">编辑</el-button>
                <el-button type="primary" @click="handleCreate">添加照片</el-button>
              </template>
              <template v-else>
                <el-button type="danger" @click="handleChangeStatus(2)">批量删除</el-button>
                <el-button type="warning" @click="toggleEditMode">取消</el-button>
              </template>
            </template>
            <template v-if="filterForm.status === '2'">
              <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
              <el-button type="success" @click="handleChangeStatus(1)">批量恢复</el-button>
              <el-button type="warning" @click="handleEmptyTrash">清空回收站</el-button>
            </template>
            <el-button type="default" @click="goBack">返回</el-button>
          </div>
        </div>
      </template>
      <!-- 筛选栏 -->
      <div class="filter-container">
        <el-tabs v-model="filterForm.status" @tab-change="handleFilterChange">
          <el-tab-pane label="相册图片" name="1" />
          <el-tab-pane label="回收站" name="2" />
        </el-tabs>
      </div>
      <div class="card-content">
        <div class="scroll-container">
          <div v-if="images.length" class="image-grid">
            <div v-for="(image, index) in images" :key="index" class="image-container">
              <el-checkbox v-if="filterForm.status === '2' || isEditMode" v-model="image.selected" @click.stop />
              <el-image 
                :src="image.url" 
                :preview-src-list="filterForm.status !== '2' && !isEditMode ? imageUrls : []"
                :initial-index="index" 
                fit="cover" 
                class="grid-image" 
                preview-teleported 
                @click="handleImageClick(image)" />
            </div>
          </div>
          <el-empty v-else description="暂无数据" :image-size="100" />
        </div>
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination 
            v-model:current-page="pagination.pageNum" 
            v-model:page-size="pagination.pageSize"
            :page-sizes="[18, 24, 30, 36]" 
            :total="pagination.total" 
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange" 
            @current-change="handleCurrentChange" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import requestUtil from '@/utils/request'
import store from '@/store'


const route = useRoute()
const router = useRouter()

// 相册标题
const albumTitle = ref('')

// 编辑模式
const isEditMode = ref(false)

// 图片数据
const images = ref([])
const imageUrls = computed(() => images.value.map(photo => photo.url))

// 分页参数
const pagination = ref({
  pageNum: 1,
  pageSize: 18,
  total: 0
})

// 筛选表单
const filterForm = ref({
  status: '1'
})

// 切换编辑模式
const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  // 退出编辑模式时，清除所有选择
  if (!isEditMode.value) {
    images.value.forEach(image => {
      image.selected = false
    })
  }
}

// 处理图片点击
const handleImageClick = (image) => {
  if (isEditMode.value || filterForm.value.status === '2') {
    // 在编辑模式或回收站状态下，点击图片切换选中状态
    image.selected = !image.selected
  }
}

// 批量删除选中的图片
const handleBatchDelete = async () => {
  const selectedImages = images.value.filter(image => image.selected)
  
  if (selectedImages.length === 0) {
    ElMessage.warning('请至少选择一张图片')
    return
  }
  
  ElMessageBox.confirm(`确定要删除选中的 ${selectedImages.length} 张图片吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const photoIds = selectedImages.map(image => image.id)
      console.log('photoIds:', photoIds)
      const res = await requestUtil.del('/blog/photos/batch-delete/', { photoIds })
      if (res.data.code === 200) {
            ElMessage.success("批量删除成功！");
            getAlbumDetail()
            isEditMode.value = false
        } else {
            ElMessage.error(res.response.errorInfo || '批量删除失败');
        }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  })
}

const handleChangeStatus = (newStatus) => {
  const selectedImages = images.value.filter(image => image.selected)
  
  if (selectedImages.length === 0) {
    ElMessage.warning('请至少选择一张图片')
    return
  }
  
  ElMessageBox.confirm(`确定要${newStatus === 1 ? '恢复' : '删除'}选中的 ${selectedImages.length} 张图片吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const photoIds = selectedImages.map(image => image.id)
      await requestUtil.patch('/blog/photos/change-status/', {photoIds})
      ElMessage.success('操作成功！')
      getAlbumDetail()
    } catch (error) {
      console.error('操作失败:', error)
      ElMessage.error('操作失败')
    }
  })
}
// 清空回收站
const handleEmptyTrash = () => {
  ElMessageBox.confirm('确定要清空回收站吗？该操作不可恢复！', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    try {
      const res = await requestUtil.del('/blog/photos/delete-recycled/')
      if (res.data.code === 200) {
        ElMessage.success('回收站已清空！')
        getAlbumDetail()
      } else {
        ElMessage.error(res.data.errorInfo || '清空失败')
      }
    } catch (error) {
      console.error('清空失败:', error)
      ElMessage.error('清空失败')
    }
  })
}

// 添加照片
const handleCreate = () => {
  // 先添加到tabs
  store.commit("ADD_TABS", {
    name: '添加照片',
    path: `/admin/album/detail/add/${route.params.id}`
  })
  // 然后导航到该路由
  router.push(`/admin/album/detail/add/${route.params.id}`)
}

// 返回上一页
const goBack = () => {
  // 先添加到tabs
  store.commit("ADD_TABS", {
    name: '相册管理',
    path: '/admin/album'
  })
  // 然后导航到该路由
  router.push('/admin/album')
}

// 处理筛选变化
const handleFilterChange = () => {
  pagination.value.pageNum = 1
  getAlbumDetail()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  pagination.value.pageNum = val
  getAlbumDetail()
}

// 处理每页显示数量变化
const handleSizeChange = (val) => {
  pagination.value.pageSize = val
  pagination.value.pageNum = 1
  getAlbumDetail()
}

// 获取相册详情数据
const getAlbumDetail = async () => {
  try {
    const params = {
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize,
      albumId: route.params.id,
      status: filterForm.value.status
    }
    const response = await requestUtil.get('/blog/photos/', params)
    if (response.data) {
      if (response.data.photoList) {
        // 添加selected属性用于多选
        images.value = response.data.photoList.map(photo => ({
          ...photo,
          selected: false
        }))
      }
      
      // 设置分页总数
      if (response.data.total !== undefined) {
        pagination.value.total = response.data.total
      }
      
      // 设置相册标题
      if (response.data.albumName) {
        albumTitle.value = response.data.albumName
      }
    }
  } catch (error) {
    console.error('获取相册详情失败:', error)
    ElMessage.error('获取相册详情失败')
  }
}

// 页面加载时获取数据
onMounted(() => {
  getAlbumDetail()
})

// 监听路由参数变化
watch(() => route.params.id, (newVal) => {
  if (newVal) {
    getAlbumDetail()
  }
})
</script>

<style lang="scss" scoped>
.album-detail {
  padding: 20px;

  .box-card {
    height: 750px;
    display: flex;
    flex-direction: column;

    :deep(.el-card__body) {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      padding: 0;
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px;
    font-size: 20px;
    
    .header-buttons {
      display: flex;
      gap: 10px;
    }
  }

  .filter-container {
    padding: 0 20px;
    
    :deep(.el-tabs__header) {
      margin-bottom: 15px;
    }
    
    :deep(.el-tabs__nav-wrap::after) {
      height: 1px;
    }
  }

  .card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* 关键属性 */
  overflow: hidden; /* 新增 */
}

.scroll-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  min-height: 0; /* 关键属性 */
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 10px 20px;
  border-top: 1px solid var(--border-color);
  background: var(--card-bg);
  position: sticky;
  bottom: 0;
  z-index: 1;
  margin-top: 0 !important; /* 移除原有 margin */
  margin-bottom: 0 !important;
}

  .image-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;

    .image-container {
      position: relative;
      
      .el-checkbox {
        position: absolute;
        top: 8px;
        left: 8px;
        z-index: 2;
      }
      
      .grid-image {
        width: 100%;
        height: 160px;
        border-radius: 4px;
        cursor: pointer;
        transition: transform 0.3s;

        &:hover {
          transform: scale(1.02);
        }
      }
    }
  }

}
</style>