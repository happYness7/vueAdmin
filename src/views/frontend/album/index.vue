<template>
  <div class="album-page">
    <div class="album-grid">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-else-if="albums.length === 0" class="empty-container">
        <el-empty description="暂无相册" />
      </div>

      <div v-else class="albums">
        <div v-for="(album, index) in albums" :key="album.id" class="album-card" :style="{'--i': index}" @click="goToAlbumDetail(album.id)">
          <div class="album-cover" v-if="album.album_cover">
            <img :src="album.album_cover" :alt="album.album_name">
          </div>
          <div class="album-info">
            <h3 class="album-title">{{ album.album_name }}</h3>
            <p class="album-desc">{{ album.description }}</p>
          </div>
        </div>
      </div>

      <div class="pagination-container" >
        <el-pagination background layout="prev, pager, next" :total="total" :page-size="pageSize"
          :current-page="currentPage" @current-change="handlePageChange" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import requestUtil from '@/utils/request'

const router = useRouter()
const loading = ref(true)
const albums = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(4)

// 获取相册列表
const fetchAlbums = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    const response = await requestUtil.get('/blog/albums/', { params })
    albums.value = response.data.albumList || []
    total.value = response.data.total || 0
  } catch (error) {
    console.error('获取相册列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 页码变化处理
const handlePageChange = (page) => {
  currentPage.value = page
  fetchAlbums()
}

// 跳转到相册详情
const goToAlbumDetail = (albumId) => {
  router.push(`/blog/album/detail/${albumId}`)
}

// 组件挂载时获取数据
onMounted(() => {
  fetchAlbums()
})
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

.album-page {
  .album-grid {
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

    .albums {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 0.3rem;
      padding: 0.3rem;

      .album-card {
        background-color: #fff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        cursor: pointer; /* 添加手型光标，表明可点击 */
        animation: slideIn 0.8s ease-out forwards;
        animation-delay: calc(0.1s * var(--i, 0));

        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        .album-cover {
          position: relative;
          padding-top: 56.25%; // 16:9 比例

          img {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .album-info {
          padding: 0.3rem;
          flex: 1;
          display: flex;
          flex-direction: column;

          .album-title {
            font-weight: bold;
            text-align: center;
            margin: 0 0 0.5rem;
            font-size: 0.7rem;
            color: #2c3e50;
          }

          .album-desc {
            color: #666;
            font-size: 0.3rem;
            text-align: center;
            margin: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
        }
      }
    }

    .pagination-container {
      display: flex;
      justify-content: center;

      :deep(.el-pagination) {
        --el-pagination-hover-color: var(--el-color-primary);

        .el-pager li:not(.is-active):hover {
          color: var(--el-pagination-hover-color);
        }

        .el-pager li.is-active {
          background-color: var(--el-color-primary);
          color: #fff;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .album-page {
    .album-grid {
      .albums {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      }
    }
  }
}
</style>