<template>
  <div class="album-detail-page">
    <div class="album-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 空状态 -->
      <div v-else-if="photos.length === 0" class="empty-container">
        <el-empty description="该相册暂无照片" />
      </div>

      <!-- 照片网格 -->
      <div v-else class="photo-grid">
        <div 
          v-for="(photo, index) in photos" 
          :key="photo.id" 
          class="photo-card"
          :style="{'--i': index}"
          @click="openPreview(index)"  
        >
          <el-image 
            :src="photo.url" 
            fit="cover"
            class="photo-image"
            :preview-src-list="[]"  
            hide-on-click-modal  
          />
        </div>
      </div>

      <!-- 预览控制器 -->
      <el-image-viewer
        v-if="showPreview"
        :url-list="previewList"
        :initial-index="previewIndex"
        @close="closePreview"
        teleported
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import requestUtil from '@/utils/request'
import { ElImageViewer } from 'element-plus'  // 引入独立预览组件

const route = useRoute()
const loading = ref(true)
const photos = ref([])
const showPreview = ref(false)  // 预览显示状态
const previewIndex = ref(0)     // 当前预览索引

// 预览图片URL列表
const previewList = computed(() => {
  return photos.value.map(photo => photo.url)
})

// 打开预览
const openPreview = (index) => {
  previewIndex.value = index
  showPreview.value = true
}

// 关闭预览
const closePreview = () => {
  showPreview.value = false
}

// 获取相册中的照片
const fetchPhotos = async () => {
  const albumId = route.params.id
  if (!albumId) return
  
  loading.value = true
  try {
    const response = await requestUtil.get(`/blog/photos/`, {
      albumId,
      status: 1,
    })
    photos.value = response.data.photoList || []
  } catch (error) {
    console.error('获取照片列表失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchPhotos)

</script>

<style lang="scss" scoped>
@keyframes slideIn {
  0% {
    transform: translateY(50px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.album-detail-page {
  .album-container {
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.9);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: all .3s;
    margin-top: 30px;
    animation: slideIn 0.8s ease-out forwards;

    .loading-container,
    .empty-container {
      padding: 2rem;
      text-align: center;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    }

    .photo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 0.3rem;
      padding: 0.5rem;

      .photo-card {
        background-color: #fff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        cursor: pointer;
        animation: slideIn 0.8s ease-out forwards;
        animation-delay: calc(0.05s * var(--i, 0));

        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .photo-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .photo-info {
          padding: 0.8rem;

          .photo-title {
            font-weight: bold;
            margin: 0 0 0.5rem;
            font-size: 1rem;
            color: #2c3e50;
            text-align: center;
          }

          .photo-desc {
            color: #666;
            font-size: 0.9rem;
            margin: 0;
            text-align: center;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .album-detail-page {
    .album-container {
      .photo-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      }
    }
  }
}
</style>