<template>
  <router-view/>
</template>

<script setup>
  import { watch } from 'vue'
  import { useRoute } from 'vue-router';
  import store from './store';

  const route = useRoute()
  watch(route, (to, from) => {
    if (to.name == '个人中心') {
      let obj = {
        path: to.path,
        name: to.name
      }
      store.commit('ADD_TABS', obj)
    }
  },{deep:true, immediate:true})
</script>

<style>
html, body, #app {
    height: 100%;
    margin: 0;
    padding: 0;
}

.app-container{
  padding:20px
}
</style>
