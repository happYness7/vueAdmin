// stores/stats.js
import { defineStore } from 'pinia'
import requestUtil from '@/utils/request'


export const useStatsStore = defineStore('stats', {
  state: () => ({
    userTotal: 0,
    articleTotal: 0,
    tagTotal: 0,
    categoryTotal: 0
  }),
  actions: {
    async fetchStats() {
      try {
        const res = await requestUtil.get('/statistics/')
        console.log(res) 
        this.userTotal = res.data.data.user_total || 0
        this.articleTotal = res.data.data.article_total || 0
        this.tagTotal = res.data.data.tag_total || 0
        this.categoryTotal = res.data.data.category_total || 0
      } catch (error) {
        console.error('获取统计信息失败:', error)
      }
    }
  }
})