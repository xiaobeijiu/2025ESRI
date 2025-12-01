<template>
  <div class="Container">
    <div class="SelectDiv">
      <!-- LOGO 和系统名 -->
      <div class="LogoDiv">
        <div class="logo">LOGO</div>
        <h2 class="system-name">智慧城市系统</h2>
      </div>

      <!-- 点击加号按钮跳转到上传页 -->
      <div class="UploadDiv">
        <el-button type="primary" circle @click="goUpload">
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'

const router = useRouter()

const goUpload = () => {
  router.push('/upload')
}
</script>

<style scoped>
.Container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: blanchedalmond;
}
.SelectDiv {
  width: 100%;
  height: 200px;
  background-color: rgb(167, 223, 223);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}
.UploadDiv {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}
</style>
