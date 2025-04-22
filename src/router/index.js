import { createRouter, createWebHashHistory } from "vue-router";
import store from "@/store";

const routes = [
  {
    path: "/",
    name: "主页",
    component: () => import("../layout/index.vue"),
    redirect: "/index",
    children: [
      {
        path: "/index",
        name: "首页",
        component: () => import("../views/index/index.vue"),
        meta: { requiresAuth: true }  // 添加认证标记
      },
      {
        path: "/sys/user",
        name: "用户管理",
        component: () => import("../views/sys/user/index.vue"),
        meta: { requiresAuth: true }
      },
      {
        path: "/sys/role",
        name: "角色管理",
        component: () => import("../views/sys/role/index.vue"),
        meta: { requiresAuth: true }
      },
      {
        path: "/sys/menu",
        name: "菜单管理",
        component: () => import("../views/sys/menu/index.vue"),
        meta: { requiresAuth: true }
      },
      {
        path: "/bsns/department",
        name: "部门管理",
        component: () => import("../views/bsns/Department"),
        meta: { requiresAuth: true }
      },
      {
        path: "/bsns/post",
        name: "岗位管理",
        component: () => import("../views/bsns/Post"),
        meta: { requiresAuth: true }
      },
      {
        path: "/userCenter",
        name: "个人中心",
        component: () => import("../views/userCenter/index.vue"),
        meta: { requiresAuth: true }
      },
    ],
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/Login.vue"),
    meta: { guest: true }  // 标记为游客路由
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 全局路由守卫
router.beforeEach((to, from, next) => {
  const token = window.sessionStorage.getItem('token')
  const currentUser = JSON.parse(window.sessionStorage.getItem('currentUser'))
  
  // 新增 Token 有效性检查
  if (token) {
    const tokenExp = JSON.parse(atob(token.split('.')[1])).exp * 1000
    if (Date.now() >= tokenExp) {
      window.sessionStorage.clear()
      return next('/login?expired=1')
    }
  }
  // 认证检查
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }  // 保存目标路径用于登录后跳转
      })
      return
    }
  }

  // 已登录用户禁止访问游客路由
  if (to.matched.some(record => record.meta.guest) && token) {
    next('/')
    return
  }

  // 原有标签页逻辑保持不变
  if (to.path !== '/login') {
    store.commit('ADD_TABS', {
      name: to.meta.title || '未命名标签',
      path: to.path
    })
  }
  next()
})


export default router;