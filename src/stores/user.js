import { defineStore } from 'pinia'

// 使用本地存储持久化已注册用户表
const USERS_KEY = 'onecity_users'
// 登录状态持久化键
const AUTH_KEY = 'onecity_auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    // 统一对外使用 userInfo，便于组件访问 userStore.userInfo.isLoggedIn / username
    userInfo: (() => {
      try {
        const raw = localStorage.getItem(AUTH_KEY)
        const obj = raw ? JSON.parse(raw) : null
        return {
          isLoggedIn: !!(obj && obj.isAuthenticated),
          username: obj ? (obj.username || '') : ''
        }
      } catch {
        return { isLoggedIn: false, username: '' }
      }
    })(),
    // 已注册用户表（持久化）
    users: (() => {
      try {
        const raw = localStorage.getItem(USERS_KEY)
        return raw ? (JSON.parse(raw) || {}) : {}
      } catch {
        return {}
      }
    })()
  }),

  // 提供 isAuthenticated 以兼容路由守卫的使用
  getters: {
    isAuthenticated(state) {
      return !!state.userInfo.isLoggedIn
    }
  },

  actions: {
    // 将用户表写回本地存储
    saveUsers() {
      localStorage.setItem(USERS_KEY, JSON.stringify(this.users))
    },

    // 应用启动或刷新时检查登录状态
    checkLoginStatus() {
      try {
        const raw = localStorage.getItem(AUTH_KEY)
        const obj = raw ? JSON.parse(raw) : null
        this.userInfo.isLoggedIn = !!(obj && obj.isAuthenticated)
        this.userInfo.username = obj ? (obj.username || '') : ''
      } catch {
        this.userInfo.isLoggedIn = false
        this.userInfo.username = ''
      }
    },

    // 注册用户（若重名则失败），成功后立即持久化
    register(name, password) {
      const username = (name || '').trim()
      if (!username) return { success: false, message: '用户名不能为空' }
      if (!password) return { success: false, message: '密码不能为空' }
      if (this.users[username]) return { success: false, message: '用户名已存在' }
      this.users[username] = { password }
      this.saveUsers()
      return { success: true }
    },

    // 登录（校验用户名和密码），成功后持久化登录状态
    login(name, password) {
      const username = (name || '').trim()
      if (!username || !password) return { success: false, message: '请填写用户名和密码' }
      const record = this.users[username]
      if (!record) return { success: false, message: '用户未注册' }
      if (record.password !== password) return { success: false, message: '密码不正确' }

      this.userInfo.isLoggedIn = true
      this.userInfo.username = username
      localStorage.setItem(AUTH_KEY, JSON.stringify({ isAuthenticated: true, username }))
      return { success: true }
    },

    // 退出登录
    logout() {
      this.userInfo.isLoggedIn = false
      this.userInfo.username = ''
      localStorage.setItem(AUTH_KEY, JSON.stringify({ isAuthenticated: false, username: '' }))
    }
  }
})
