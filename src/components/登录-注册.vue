<template>
  <div class="onecity-login">
    <div class="wrap">
      <div class="card">
        <!-- 左侧视觉面板 -->
        <div class="visual">
          <div class="visual-bg"></div>
          <div class="visual-content">
            <div class="brand">
              <div class="logo">智</div>
              <div>
                <h1>{{ brandTitle }}</h1>
                <p class="tagline">{{ tagline }}</p>
              </div>
            </div>

            <div class="info-cards">
              <div class="info-card">
                <h3>🏠 智慧住建</h3>
              </div>
              <div class="info-card">
                <h3>🚦 智慧交通</h3>
              </div>
              <div class="info-card">
                <h3>👮 智慧治安</h3>
              </div>
              <div class="info-card">
                <h3>🏗️ 基础设施</h3>
              </div>
            </div>
          </div>

          <div class="footer-note">OneCity Platform © 2025</div>
        </div>

        <!-- 右侧：登录/注册表单 -->
        <div class="form">
          <div class="login-header">
            <div class="logo-container">
              <h2>{{ systemTitle }}</h2>
            </div>

            <div class="tab-container">
              <div
                :class="['tab-item', activeTab === 'login' ? 'active' : '']"
                @click="activeTab = 'login'"
              >
                登录
              </div>
              <div
                :class="['tab-item', activeTab === 'register' ? 'active' : '']"
                @click="activeTab = 'register'"
              >
                注册
              </div>
            </div>
          </div>

          <!-- 登录/注册内容切换 -->
          <transition name="fade" mode="out-in">
            <div v-if="activeTab === 'login'" key="login" class="login-form">
              <div class="form-group">
                <label for="username">用户名</label>
                <input
                  type="text"
                  id="username"
                  v-model.trim="loginForm.username"
                  placeholder="请输入用户名"
                  @keyup.enter="handleLogin"
                />
                <span class="input-focus-border"></span>
              </div>

              <div class="form-group">
                <label for="password">密码</label>
                <div class="password-input-container">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    id="password"
                    v-model="loginForm.password"
                    placeholder="请输入密码"
                    @keyup.enter="handleLogin"
                  />
                  <i
                    :class="['password-toggle', showPassword ? 'password-visible' : 'password-hidden']"
                    @click="showPassword = !showPassword"
                    :title="showPassword ? '点击隐藏' : '点击显示'"
                  ></i>
                  <span class="input-focus-border"></span>
                </div>
              </div>

              <div class="form-options">
                <label class="checkbox-container">
                  <input type="checkbox" v-model="rememberMe" />
                  记住密码
                </label>
                <a href="#" class="forgot-password" @click.prevent="showForgotModal = true">忘记密码?</a>
              </div>

              <div class="form-group">
                <button type="button" class="btn-login" @click="handleLogin" :disabled="isLoading">
                  <span v-if="!isLoading">登录</span>
                  <span v-else class="loading-spinner" aria-label="loading"></span>
                </button>
              </div>

              <transition name="fade">
                <div class="message" v-if="loginMessage" :class="{ success: loginSuccess }">
                  {{ loginMessage }}
                </div>
              </transition>
            </div>

            <div v-else key="register" class="login-form">
              <div class="form-group">
                <label for="reg-username">用户名</label>
                <input
                  type="text"
                  id="reg-username"
                  v-model.trim="registerForm.username"
                  placeholder="请输入用户名"
                  @keyup.enter="handleRegister"
                />
                <span class="input-focus-border"></span>
              </div>

              <div class="form-group">
                <label for="reg-password">密码</label>
                <div class="password-input-container">
                  <input
                    :type="showRegPassword ? 'text' : 'password'"
                    id="reg-password"
                    v-model="registerForm.password"
                    placeholder="请输入密码"
                    @keyup.enter="handleRegister"
                  />
                  <i
                    :class="['password-toggle', showRegPassword ? 'password-visible' : 'password-hidden']"
                    @click="showRegPassword = !showRegPassword"
                    :title="showRegPassword ? '点击隐藏' : '点击显示'"
                  ></i>
                  <span class="input-focus-border"></span>
                </div>
              </div>

              <div class="form-group">
                <label for="confirm-password">确认密码</label>
                <div class="password-input-container">
                  <input
                    :type="showConfirmPassword ? 'text' : 'password'"
                    id="confirm-password"
                    v-model="registerForm.confirmPassword"
                    placeholder="请再次输入密码"
                    @keyup.enter="handleRegister"
                  />
                  <i
                    :class="['password-toggle', showConfirmPassword ? 'password-visible' : 'password-hidden']"
                    @click="showConfirmPassword = !showConfirmPassword"
                    :title="showConfirmPassword ? '点击隐藏' : '点击显示'"
                  ></i>
                  <span class="input-focus-border"></span>
                </div>
              </div>

              <div class="form-group">
                <button class="btn-register" @click="handleRegister" :disabled="isLoading">
                  <span v-if="!isLoading">注册</span>
                  <span v-else class="loading-spinner" aria-label="loading"></span>
                </button>
              </div>

              <transition name="fade">
                <div class="message" v-if="registerMessage" :class="{ success: registerSuccess }">
                  {{ registerMessage }}
                </div>
              </transition>
            </div>
          </transition>

          <div class="login-footer">
            <p>© 2025 郑州市城市管理系统 - 版权所有</p>
          </div>

          <!-- 找回密码弹窗 -->
          <div v-if="showForgotModal" class="modal-backdrop" @click.self="showForgotModal = false">
            <div class="modal-dialog">
              <h3>找回密码</h3>
              <div class="form-group">
                <label for="fp-username">用户名</label>
                <input id="fp-username" type="text" v-model.trim="forgotForm.username" placeholder="请输入用户名" />
              </div>
              <div class="form-group">
                <label for="fp-contact">联系方式</label>
                <input id="fp-contact" type="text" v-model.trim="forgotForm.contact" placeholder="请输入邮箱或手机号" />
              </div>
              <div class="modal-actions">
                <button class="btn-primary" @click="submitForgot">提交</button>
                <button class="btn-secondary" @click="showForgotModal = false">取消</button>
              </div>
              <p class="modal-tip">提交后，我们会通过您的联系方式向您发送重置指引。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';

// 定义变量
const router = useRouter();
const userStore = useUserStore();

const brandTitle = '智慧城市'
const tagline = '以数据为经，以服务为纬，编织城市的温度。'
const systemTitle = '🏙️ 郑州市城市管理一张图🗺️'

const activeTab = ref<'login' | 'register'>('login')

// 登录表单相关信息
const loginForm = ref({
  username: '',
  password: ''
})
const rememberMe = ref(false)    // 记住我（是否保存账号密码到 localStorage:本地存储容器）
const showPassword = ref(false)  // 控制密码框是否明文显示
const loginMessage = ref('')     // 登录提示信息（成功/失败）
const loginSuccess = ref(false)  // 登录结果标志

// 注册表单相关信息
const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: ''
})

const showRegPassword = ref(false)        // 是否显示注册密码
const showConfirmPassword = ref(false)    // 是否显示确认密码
const registerMessage = ref('')           // 注册提示信息
const registerSuccess = ref(false)        // 注册结果标志

const isLoading = ref(false)              // 控制“加载中”状态

// 找回密码弹窗状态与表单
const showForgotModal = ref(false)
const forgotForm = ref({ username: '', contact: '' })

function submitForgot() {
  const username = forgotForm.value.username.trim()
  const contact = forgotForm.value.contact.trim()
  if (!username || !contact) {
    alert('请填写用户名和联系方式')
    return
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phonePattern = /^1[3-9]\d{9}$/
  if (!emailPattern.test(contact) && !phonePattern.test(contact)) {
    alert('请输入有效的邮箱或手机号')
    return
  }
  // TODO: 可在此调用后端重置接口
  showForgotModal.value = false
  alert('找回请求已提交，我们会尽快与您联系。')
}

// 登录函数 - 异步函数
async function handleLogin() {
  // 防止用户名和密码为空
  if (!loginForm.value.username || !loginForm.value.password) {
    loginMessage.value = '请填写用户名和密码'
    loginSuccess.value = false
    return
  }

  isLoading.value = true
  loginMessage.value = ''

  // 捕获异常
  try {
    // 调用后端接口
    const result = await userStore.login(loginForm.value.username, loginForm.value.password);

    // 登入成功
    if (result.success) {
      loginSuccess.value = true;
      loginMessage.value = '登录成功，正在跳转...';

      if (rememberMe.value) {
        localStorage.setItem('rememberedCredentials', JSON.stringify({
          username: loginForm.value.username,
          password: loginForm.value.password
        }));
      }
      else {
        localStorage.removeItem('rememberedCredentials');
      }

      // 登录成功后，延迟1.5s，根据情况跳转到主页面
      setTimeout(() => {
        // 跳转到目标地址
        router.push('/main');
      }, 1500);
    }
    else
    {
      // 登录失败
      loginSuccess.value = false;
      loginMessage.value = result.message || '登录失败';
    }
  } catch (error) {
    // 报错的处理方式
    loginSuccess.value = false;
    loginMessage.value = '登录过程中发生错误';
    console.error('Login error:', error);
  } finally {
    // 登录过程结束，无论成功或失败，都要将 isLoading 设置为 false
    setTimeout(() => { isLoading.value = false }, 500);
  }
}

// 注册函数
async function handleRegister() {
  if (!registerForm.value.username || !registerForm.value.password) {
    registerMessage.value = '请填写用户名和密码'
    registerSuccess.value = false
    return
  }

  // 密码强度校验：8-16位，且必须同时包含字母和数字
  const pwd = registerForm.value.password
  const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/
  if (!pwdRegex.test(pwd)) {
    registerMessage.value = '密码需为8-16位，且必须包含字母和数字'
    registerSuccess.value = false
    return
  }

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    registerMessage.value = '两次密码不一致'
    registerSuccess.value = false
    return
  }

  isLoading.value = true
  registerMessage.value = ''

  try {
    const reg = await userStore.register(registerForm.value.username, registerForm.value.password);
    if (!reg.success) {
      registerSuccess.value = false
      registerMessage.value = reg.message || '注册失败，请稍后重试'
      return
    }

    // 注册成功 → 切换到登录 tab
    registerSuccess.value = true
    registerMessage.value = '注册成功，请登录'
    setTimeout(() => {
      activeTab.value = 'login'
      loginForm.value.username = registerForm.value.username
      loginForm.value.password = ''
      registerMessage.value = ''
    }, 2000)
  } catch (err) {
    registerSuccess.value = false
    registerMessage.value = '注册失败，请稍后重试'
    console.error('Register error:', err)
  } finally {
    isLoading.value = false
  }
}

// 在组件挂载时读取本地保存的账号密码并自动填充
onMounted(() => {
  try {
    const raw = localStorage.getItem('rememberedCredentials')
    if (raw) {
      const obj = JSON.parse(raw)
      loginForm.value.username = obj?.username || ''
      loginForm.value.password = obj?.password || ''
      rememberMe.value = true
    }
  } catch (e) {
    // 读取失败则忽略
    console.warn('读取本地凭据失败:', e)
  }
})
</script>
<style scoped>
@import "../CSS/登录注册.css";
@import "../CSS/style.css";

/* 找回密码弹窗样式 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-dialog {
  width: 360px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12);
  padding: 16px;
}
.modal-dialog h3 {
  margin: 0 0 12px;
  font-size: 16px;
  color: #1f2937;
}
.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 12px;
}
.modal-dialog .btn-primary {
  background: #1f6feb;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
}
.modal-dialog .btn-primary:hover { background: #165bd3; }
.modal-dialog .btn-secondary {
  background: #e5e7eb;
  color: #111827;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
}
.modal-tip {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}
</style>
