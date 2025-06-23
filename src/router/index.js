import { createRouter, createWebHashHistory } from "vue-router";
import store from "@/store";
import blogRoutes from "./blog.js";

const routes = [
  {
    path: "/",
    redirect: "/blog"
  },
  {
    path: "/admin",
    component: () => import("../layout/index.vue"),
    redirect: "/admin/index",
    children: [
      {
        path: "/admin/index",
        name: "首页",
        component: () => import("../views/admin/index/index.vue"),
        meta: { requiresAuth: true, fixed: true }, // 添加认证标记
      },
      {
        path: "/admin/sys/user",
        name: "用户管理",
        component: () => import("../views/admin/sys/user/index.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "/admin/sys/role",
        name: "角色管理",
        component: () => import("../views/admin/sys/role/index.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "/admin/sys/menu",
        name: "菜单管理",
        component: () => import("../views/admin/sys/menu/index.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "/admin/userCenter",
        name: "个人中心",
        component: () => import("../views/admin/userCenter/index.vue"),
        meta: { requiresAuth: true, title: "个人中心" },
      },
      {
        path: "/admin/blog/article/list",
        name: "文章列表",
        component: () => import("../views/admin/blog/article/list.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "/admin/blog/article/add",
        name: "新增文章",
        component: () => import("../views/admin/blog/article/add.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "/admin/blog/article/edit/:id",
        name: "文章编辑器",
        component: () => import("../views/admin/blog/article/edit.vue"),
      },
      {
        path: "/admin/album",
        name: "相册管理",
        component: () => import("../views/admin/album/index.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "/admin/album/detail/:id",
        name: "照片管理",
        component: () => import("../views/admin/album/detail/index.vue"),
      },
      {
        path: "/admin/album/detail/add/:id",
        name: "添加照片",
        component: () => import("../views/admin/album/detail/add.vue"),
      },
      {
        path: "/admin/blog/tag",
        name: "标签管理",
        component: () => import("../views/admin/blog/tag/index.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "/admin/blog/category",
        name: "分类管理",
        component: () => import("../views/admin/blog/category/index.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "/admin/web/config",
        name: "环境管理",
        component: () => import("../views/admin/web/config.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "/admin/web/message",
        name: "留言管理",
        component: () => import("../views/admin/web/message.vue"),
        meta: { requiresAuth: true },
      },
    ],
  },
  ...blogRoutes,
  {
    path: "/admin/login",
    name: "login",
    component: () => import("../views/admin/Login.vue"),
    meta: { guest: true },
  },
];

const router = createRouter({
  history: createWebHashHistory('/'), // 明确指定根路径
  routes,
});

// 全局路由守卫
router.beforeEach((to, from, next) => {
  const token = window.sessionStorage.getItem("token");
  
  // 路由分类处理
  const isAdminRoute = to.path.startsWith("/admin");
  const isBlogRoute = to.path.startsWith("/blog");
  const isLoginRoute = to.path === "/admin/login";

  // 博客前台路由无需认证
  if (isBlogRoute) {
    return next();
  }

  // 后台管理路由需要认证
  if (isAdminRoute && !isLoginRoute) {
    if (!token) {
      next({
        path: "/admin/login",
        query: { redirect: to.fullPath }
      });
      return;
    }
    // Token 有效性检查
    const tokenExp = token ? JSON.parse(atob(token.split(".")[1])).exp * 1000 : 0;
    if (Date.now() >= tokenExp) {
      window.sessionStorage.clear();
      next("/admin/login?expired=1");
      return;
    }
    return next();
  }


  // 新增 Token 有效性检查
  if (token) {
    const tokenExp = JSON.parse(atob(token.split(".")[1])).exp * 1000;
    if (Date.now() >= tokenExp) {
      window.sessionStorage.clear();
      return next("/admin/login?expired=1");
    }
  }
  // 认证检查
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!token) {
      next({
        path: "/admin/login",
        query: { redirect: to.fullPath }, // 保存目标路径用于登录后跳转
      });
      return;
    }
  }

  // 已登录用户访问登录页面，重定向到后台首页
  if (isLoginRoute && token) {
    next("/admin/index");
    return;
  }

  // 只有访问后台路由时才处理标签页
  if (isAdminRoute && !isLoginRoute && !to.meta?.noTab) {
    // 从博客返回时恢复激活标签页
    if (from.path.startsWith("/blog")) {
      const targetPath = store.state.editableTabsValue;
      if (targetPath && targetPath !== to.fullPath) {
        return next(targetPath);
      }
    }
    
    // 检查是否为特殊路由类型
    const isArticleEdit = to.path.includes('/admin/blog/article/edit/');
    const isAlbumDetail = to.path.includes('/admin/album/detail/') && !to.path.includes('/add/');
    const isPhotoAdd = to.path.includes('/admin/album/detail/add/');
    
    // 特殊路由使用路由配置中的名称，其他路由使用meta中的title或name
    let routeName = to.meta.title || to.name;
    
    // 对于特殊路由，确保使用路由配置中的名称
    if (isArticleEdit || isAlbumDetail || isPhotoAdd) {
      routeName = to.name;
      
      // 提取ID部分，用于在标签中显示
      let id = '';
      if (isArticleEdit) {
        id = to.params.id || to.path.split('/edit/')[1];
      } else if (isAlbumDetail || isPhotoAdd) {
        id = to.params.id || to.path.split('/detail/')[1];
        if (isPhotoAdd) {
          id = to.params.id || to.path.split('/add/')[1];
        }
      }
      
      // 添加ID到路由名称，以便在标签中显示
      if (id) {
        routeName = `${routeName} - ${id}`;
      }
    }
    
    // 添加/更新标签页
    store.commit("ADD_TABS", {
      name: routeName,
      path: to.fullPath,
    });
  }
  next();
});

export default router;
