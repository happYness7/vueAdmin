// 博客前台路由配置
import Layout from '@/views/frontend/layout/index.vue'

export default [
  {
    path: '/blog',
    component: Layout,
    redirect: '/blog/home',
    children: [
      {
        path: 'home',
        name: '博客首页',
        component: () => import('@/views/frontend/home/index.vue'),
        meta: { title: '博客首页', noTab: true, requiresAuth: false }
      },
      {
        path: 'article/:id',
        name: '文章详情',
        component: () => import('@/views/frontend/article/detail.vue'),
        meta: { title: '文章详情', noTab: true, requiresAuth: false }
      },
      {
        path: 'category',
        name: '文章分类',
        component: () => import('@/views/frontend/category/index.vue'),
        meta: { title: '文章分类', noTab: true, requiresAuth: false }
      },
      {
        path: 'category/detail/:id',
        name: '分类文章',
        component: () => import('@/views/frontend/category/detail.vue'),
        meta: { title: '分类文章', noTab: true, requiresAuth: false }
      },
      {
        path: 'tag',
        name: '文章标签',
        component: () => import('@/views/frontend/tag/index.vue'),
        meta: { title: '文章标签', noTab: true, requiresAuth: false }
      },
      {
        path: 'tag/detail/:id',
        name: '标签文章',
        component: () => import('@/views/frontend/tag/detail.vue'),
        meta: { title: '标签文章', noTab: true, requiresAuth: false }
      },
      {
        path: 'Album',
        name: '相册',
        component: () => import('@/views/frontend/album/index.vue'),
        meta: { title: '相册', noTab: true, requiresAuth: false }
      },
      {
        path: 'Album/detail/:id',
        name: '相册详情',
        component: () => import('@/views/frontend/album/detail.vue'),
        meta: { title: '相册详情', noTab: true, requiresAuth: false }
      },
      {
        path: 'message',
        name: '留言',
        component: () => import('@/views/frontend/message/index.vue'),
        meta: { title: '留言', noTab: true, requiresAuth: false }
      },
    ]
  }
]