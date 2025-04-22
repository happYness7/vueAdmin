import { createStore } from "vuex";

// 初始化时从 sessionStorage 读取已保存的状态
const savedState = sessionStorage.getItem('vuex_tabs_state');

export default createStore({
  state: savedState ? JSON.parse(savedState) : {
    editableTabsValue: "/index",
    editableTabs: [{ title: "首页", name: "/index" }]
  },
  mutations: {
    ADD_TABS: (state, tab) => {
      if (state.editableTabs.findIndex(e => e.name === tab.path) === -1) {
        state.editableTabs.push({
          title: tab.name,
          name: tab.path,
        });
      }
      state.editableTabsValue = tab.path;
      // 保存到 sessionStorage
      sessionStorage.setItem('vuex_tabs_state', JSON.stringify(state));
    },
    RESET_TABS: (state) => {
      state.editableTabsValue = "/index";
      state.editableTabs = [{ title: "首页", name: "/index" }];
      // 清除保存的状态
      sessionStorage.removeItem('vuex_tabs_state');
    }
  }
});