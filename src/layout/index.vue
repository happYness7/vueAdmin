<template>
    <div class="app-wrapper">
        <el-container>
            <el-aside width="200px" class="sidebar-container">
                <Menu />
            </el-aside>
            <el-container>
                <el-header>
                    <Header />
                </el-header>
                <el-container>
                    <el-main>
                        <Tabs />
                        <router-view />
                    </el-main>
                </el-container>
            </el-container>
        </el-container>
    </div>
</template>

<script setup>
import Menu from '@/layout/menu'
import Header from '@/layout/header'
import Tabs from '@/layout/tabs'

</script>

<style>
.app-wrapper {
    width: 100%;
    height: 100vh; /* vh是viewport height，直接等于屏幕高度 */
    overflow: hidden; /* 防止页面整体出现滚动条 */
}

.sidebar-container {
    background-color: #2d3a4b;
    height: 100%;
}

.el-container {
    height: 100%
}

.el-header {
    padding-left: 0px;
    padding-right: 0px;
}

:deep(ul.el-menu) {
    border-right-width: 0px
}
</style>