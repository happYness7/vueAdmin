<template>
  <div class="pagination-container">
    <el-pagination
      background
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      :current-page="currentPage"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script setup>
defineProps({
  total: {
    type: Number,
    default: 0
  },
  pageSize: {
    type: Number,
    default: 10
  },
  currentPage: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['page-change'])

const handlePageChange = (newPage) => {
  emit('page-change', newPage)
}
</script>

<style scoped>
.pagination-container {
  margin-top: 5px;
  padding: 10px 0;
  display: flex;
  justify-content: center;
}
</style>