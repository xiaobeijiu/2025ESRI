import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import loginRegister from '../components/登录-注册.vue'

import MainPage from '../components/主控-页面.vue'
import SmartTraffic from '../components/智慧-交通.vue'
import SmartHousing from '../components/智慧-住建.vue'
import SmartSecurity from '../components/智慧-治安.vue'
import SmartFacilities from '../components/智慧-设施.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // 默认重定向到登录页
    { path: '/', redirect: '/login' },
    {
      path: '/login',
      name: 'login',
      component: loginRegister,
    },
    {
      path: '/main',
      name: 'main',
      component: MainPage,
    },
    {
      path: '/smart-traffic',
      name: 'smart-traffic',
      component: SmartTraffic,
    },
    {
      path: '/smart-housing',
      name: 'smart-housing',
      component: SmartHousing,
    },
    {
      path: '/smart-security',
      name: 'smart-security',
      component: SmartSecurity,
    },
    {
      path: '/smart-facilities',
      name: 'smart-facilities',
      component: SmartFacilities,
    },
  ]
})
// 路由守卫：未登录时跳转至登录页
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // 当目标路由需要登录且当前未登录时，跳转到登录页
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router

