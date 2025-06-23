import { createStore } from "vuex";

// 初始化时从 sessionStorage 读取已保存的状态
const savedState = sessionStorage.getItem('vuex_tabs_state');

export default createStore({
  state: savedState ? JSON.parse(savedState) : {
    editableTabsValue: "/admin/index",
    editableTabs: [{ title: "首页", name: "/admin/index" }]
  },
  mutations: {
    ADD_TABS: (state, tab) => {
      // 检查特殊路由类型
      const isArticleEdit = tab.path.includes('/admin/blog/article/edit/');
      const isAlbumDetail = tab.path.includes('/admin/album/detail/') && !tab.path.includes('/add/');
      const isPhotoAdd = tab.path.includes('/admin/album/detail/add/');
      
      // 查找现有标签页索引（精确匹配路径）
      const exactPathIndex = state.editableTabs.findIndex(e => e.name === tab.path);
      
      // 如果路径完全匹配，只需激活该标签
      if (exactPathIndex !== -1) {
        state.editableTabsValue = tab.path;
        return; // 已存在完全匹配的标签，直接返回
      }
      
      // 对于特殊路由，检查是否已存在同类型的标签（不考虑ID）
      if (isArticleEdit || isAlbumDetail || isPhotoAdd) {
        // 查找是否已存在同类型的标签
        const sameTypeIndex = state.editableTabs.findIndex(e => {
          if (isArticleEdit && e.name.includes('/admin/blog/article/edit/')) return true;
          if (isAlbumDetail && e.name.includes('/admin/album/detail/') && !e.name.includes('/add/')) return true;
          if (isPhotoAdd && e.name.includes('/admin/album/detail/add/')) return true;
          return false;
        });
        
        if (sameTypeIndex !== -1) {
          // 更新已有的同类型标签，保持标题不变，只更新路径
          state.editableTabs[sameTypeIndex].name = tab.path;
          // 确保标题不包含ID
          if (state.editableTabs[sameTypeIndex].title.includes(' - ')) {
            state.editableTabs[sameTypeIndex].title = tab.name;
          }
        } else {
          // 创建新标签，标题不添加ID
          state.editableTabs.push({
            title: tab.name,
            name: tab.path,
          });
        }
      } else {
        // 非特殊路由，直接添加新标签
        state.editableTabs.push({
          title: tab.name,
          name: tab.path,
        });
      }
      
      // 设置当前激活的标签
      state.editableTabsValue = tab.path;
      
      // 保存到 sessionStorage
      sessionStorage.setItem('vuex_tabs_state', JSON.stringify(state));
    },
    UPDATE_TABS: (state, { tabs, activeTab }) => {
      // 更新标签页列表和当前激活的标签页
      state.editableTabs = tabs;
      state.editableTabsValue = activeTab;
      // 保存到 sessionStorage
      sessionStorage.setItem('vuex_tabs_state', JSON.stringify(state));
    },
    RESET_TABS: (state) => {
      state.editableTabsValue = "/admin/index";
      state.editableTabs = [{ title: "首页", name: "/admin/index" }];
      // 清除保存的状态
      sessionStorage.removeItem('vuex_tabs_state');
    },
     UPDATE_ACTIVE_TAB: (state, path) => {
    if (state.editableTabs.some(t => t.name === path)) {
      state.editableTabsValue = path
      sessionStorage.setItem('vuex_tabs_state', JSON.stringify(state))
    }
  },
  }
  }
);