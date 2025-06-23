<template>
    <div class="avatar-container">
        <el-switch v-model="isDarkMode" inline-prompt :active-icon="Moon" :inactive-icon="Sunny"
            @change="toggleTheme" />
        <el-dropdown>
            <span class="el-dropdown-link">
                <el-avatar shape="square" :size="40" :src="squareUrl" />
                &nbsp;&nbsp;{{ currentUser.username }}
                <el-icon class="el-icon--right">
                    <arrow-down />
                </el-icon>
            </span>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item>
                        <router-link :to="{ path: '/admin/userCenter' }"
                            @click.native="forceTabUpdate('/admin/userCenter')">
                            个人中心
                        </router-link>
                    </el-dropdown-item>
                    <el-dropdown-item @click="logout">安全退出</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
    </div>
</template>

<script setup>
import { ArrowDown } from '@element-plus/icons-vue'
import requestUtil, { getServerUrl } from '@/utils/request';
import store from '@/store'
import router from '@/router'
import { ref, onMounted } from 'vue'
import { Sunny, Moon } from '@element-plus/icons-vue'
import { useStore } from 'vuex'

const isDarkMode = ref(false)
const store1 = useStore()

const forceTabUpdate = (path) => {
  store1.commit('ADD_TABS', {
    path: path,
    name: '个人中心'
  })
}
// 初始化主题
const initTheme = () => {
    isDarkMode.value = localStorage.getItem('theme') === 'dark'
    document.documentElement.classList.toggle('dark', isDarkMode.value)
}

// 切换主题
const toggleTheme = (val) => {
    document.documentElement.classList.toggle('dark', val)
    localStorage.setItem('theme', val ? 'dark' : 'light')
}

onMounted(initTheme)
const currentUser = JSON.parse(sessionStorage.getItem('currentUser'))
const squareUrl = currentUser.avatar

const logout = () => {
    window.sessionStorage.clear()
    store.commit('RESET_TABS')
    router.replace('/admin/login')
}
</script>

<style lang='scss' scoped>
.avatar-container {
    display: flex;
    align-items: center;
    gap: 15px;
}

:deep(.el-switch__core .el-icon) {
    color: var(--switch-icon-color) !important;
}

.el-dropdown-link {
    cursor: pointer;
    color: var(--el-color-primary);
    display: flex;
    align-items: center;
}
</style>