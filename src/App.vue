<template>
   <router-view />
</template>

<script setup>
import { onMounted } from 'vue';
import { useUserStore } from './stores/user';

const userStore = useUserStore();

// 在应用启动时检查登录状态
onMounted(() => {
  userStore.checkLoginStatus();
});

</script>

<style scoped>

/* 例如放在 src/assets/main.css 或 App.vue 中不加 scoped 的 <style> */
.vue-devtools__anchor-btn,
.panel-entry-btn {
  display: none !important;
}
</style>
