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
  height: 100vh;
}

.el-container {
  height: 100%;
}

.sidebar-container {
  background-color: #304156;
  height: 100%;
}

.el-header {
  padding: 0;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
}

.el-main {
  padding: 0;
  overflow-x: hidden;
  overflow-y: auto;
}

:deep(ul.el-menu) {
  border-right-width: 0px
}
</style>