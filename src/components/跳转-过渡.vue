<template>
    <div id="viewDiv">
      <div class="navigation">
        <div class="navi-item">
          <RouterLink to="/smart-housing" style="text-decoration: none; color: inherit;">
            <img src="../../asset/icon/住建.svg" alt="" style="width: 19px" />
            <br />智<br />慧<br />住<br />建
          </RouterLink>
        </div>
        <div class="navi-item">
          <RouterLink to="/smart-traffic" style="text-decoration: none; color: inherit;">
            <img src="../../asset/icon/交通.svg" alt="" style="width: 18px" />
            <br />智<br />慧<br />交<br />通
          </RouterLink>
        </div>
        <div class="navi-item">
          <RouterLink to="/smart-security" style="text-decoration: none; color: inherit;">
            <img src="../../asset/icon/治安.svg" alt="" style="width: 17px" />
            <br />智<br />慧<br />治<br />安
          </RouterLink>
        </div>
        <div class="navi-item">
          <RouterLink to="/smart-facilities" style="text-decoration: none; color: inherit;">
            <img src="../../asset/icon/设施.svg" alt="" style="width: 17px" />
            <br />智<br />慧<br />设<br />施
          </RouterLink>
        </div>
      </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';

  // 声明变量存储事件监听器引用，以便在组件卸载时移除
  let toggleIconClickHandler;

  // 组件挂载时设置导航栏切换事件
  onMounted(() => {
    // 设置导航栏切换事件
    const toggleIcon = document.querySelector(".head-bar i.layui-icon");
    const navigation = document.querySelector(".navigation");

    if (toggleIcon && navigation) {
      toggleIconClickHandler = function() {
        toggleIcon.classList.toggle("mirror");
        navigation.classList.toggle("show");
      };

      // 添加事件监听器
      toggleIcon.addEventListener("click", toggleIconClickHandler);
    }
  });

// 组件卸载时清理
onUnmounted(() => {
  // 移除事件监听器
  const toggleIcon = document.querySelector(".head-bar i.layui-icon");
  if (toggleIcon && toggleIconClickHandler) {
    toggleIcon.removeEventListener("click", toggleIconClickHandler);
  }
});
</script>

<style scoped>
/* 导航栏样式 */
.navigation {
  width: 0;
  height: 68vh;
  padding-top: 5px;
  background: rgba(255, 255, 255);
  display: flex;
  justify-content: center;
  overflow: hidden;
  transition: width 0.3s ease;
  flex-wrap: wrap;
  align-items: flex-start;
}

.navigation.show {
  width: 40px;
}

.navi-item {
  width: 20px;
  height: 96px;
  line-height: 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  cursor: pointer;
  color: #8a8a8a;
  transition: color 0.3s ease-in-out, border 0.3s ease-in-out;
  border-radius: 8px;
  border: 1px solid transparent;
  user-select: none;
  position: relative;
}

.navi-item:hover {
  color: #667eea;
  border: 1px solid #667eea;
}

.navi-item:not(:last-child)::before {
  content: "—";
  position: absolute;
  bottom: -15px;
  color: #8a8a8a;
  font-weight: bold;
  font-size: 20px;
}

.navi-item img {
  width: 20px;
  height: 20px;
  margin-bottom: 4px;
}

.navi-item br {
  line-height: 1.2;
}
</style>
