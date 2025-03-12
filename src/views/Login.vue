<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loginForm = ref({
  username: '',
  password: '',
  remember: false
})

const isLoading = ref(false)
const errorMessage = ref('')
const activeTab = ref('login')

// 注册表单
const registerForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

// 表单校验规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
  ]
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度不能小于3个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能小于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: (error?: Error) => void) => {
        if (value !== registerForm.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  agreeTerms: [
    {
      validator: (rule: any, value: boolean, callback: (error?: Error) => void) => {
        if (!value) {
          callback(new Error('请阅读并同意服务条款'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 登录表单引用
const loginFormRef = ref()
// 注册表单引用
const registerFormRef = ref()

// 初始化
onMounted(() => {
  // 如果用户已登录，跳转到首页
  if (userStore.isLoggedIn) {
    router.push('/')
  }
})

// 处理登录
async function handleLogin() {
  // 表单验证
  await loginFormRef.value.validate()
  
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    // 调用登录接口
    await userStore.login({
      username: loginForm.value.username,
      password: loginForm.value.password,
      remember: loginForm.value.remember
    })
    
    // 登录成功，跳转到首页或之前的页面
    const redirect = router.currentRoute.value.query.redirect as string || '/'
    router.push(redirect)
  } catch (error: any) {
    errorMessage.value = error.message || '登录失败，请检查用户名和密码'
  } finally {
    isLoading.value = false
  }
}

// 处理注册
async function handleRegister() {
  // 表单验证
  await registerFormRef.value.validate()
  
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    // 实际开发中这里会调用注册接口
    // 这里仅作为模拟，直接调用登录接口
    await userStore.login({
      username: registerForm.value.username,
      password: registerForm.value.password,
      remember: true
    })
    
    // 注册成功，跳转到首页
    router.push('/')
  } catch (error: any) {
    errorMessage.value = error.message || '注册失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

// 访客登录
async function handleGuestLogin() {
  try {
    isLoading.value = true
    errorMessage.value = ''
    
    // 访客登录，使用预设的访客账号
    await userStore.login({
      username: 'guest',
      password: 'guest123',
      remember: false
    })
    
    console.log('访客登录成功，设置默认偏好')
    
    // 为访客用户设置一些默认偏好，确保推荐系统有初始数据
    await userStore.updatePreferences({
      tags: ['type-cultural', 'type-historical', 'geo-desert'],
      budget: 'medium',
      season: 'spring',
      travelStyle: 'cultural'
    })
    
    console.log('访客默认偏好设置完成:', userStore.userInfo?.preferences)
    
    // 登录成功，跳转到首页
    router.push('/')
  } catch (error: any) {
    errorMessage.value = error.message || '访客登录失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-view">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <img src="/images/silk-road-logo.png" alt="Logo" class="login-logo" />
          <h1 class="login-title">丝绸之路旅游资源系统</h1>
        </div>
        
        <el-tabs v-model="activeTab" class="login-tabs">
          <!-- 登录标签页 -->
          <el-tab-pane label="登录" name="login">
            <el-alert
              v-if="errorMessage"
              type="error"
              :title="errorMessage"
              show-icon
              class="login-error"
            />
            
            <el-form
              ref="loginFormRef"
              :model="loginForm"
              :rules="loginRules"
              label-position="top"
              @keyup.enter="handleLogin"
            >
              <el-form-item label="用户名" prop="username">
                <el-input 
                  v-model="loginForm.username"
                  placeholder="请输入用户名"
                  prefix-icon="user"
                />
              </el-form-item>
              
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  prefix-icon="lock"
                  show-password
                />
              </el-form-item>
              
              <div class="form-options">
                <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
                <el-link type="primary" :underline="false">忘记密码?</el-link>
              </div>
              
              <el-button
                type="primary"
                :loading="isLoading"
                class="submit-button"
                @click="handleLogin"
              >
                登录
              </el-button>
              
              <div class="guest-login">
                <el-button type="info" plain @click="handleGuestLogin">
                  访客登录
                </el-button>
              </div>
            </el-form>
          </el-tab-pane>
          
          <!-- 注册标签页 -->
          <el-tab-pane label="注册" name="register">
            <el-alert
              v-if="errorMessage"
              type="error"
              :title="errorMessage"
              show-icon
              class="login-error"
            />
            
            <el-form
              ref="registerFormRef"
              :model="registerForm"
              :rules="registerRules"
              label-position="top"
            >
              <el-form-item label="用户名" prop="username">
                <el-input 
                  v-model="registerForm.username"
                  placeholder="请输入用户名"
                  prefix-icon="user"
                />
              </el-form-item>
              
              <el-form-item label="邮箱" prop="email">
                <el-input 
                  v-model="registerForm.email"
                  placeholder="请输入邮箱"
                  prefix-icon="message"
                />
              </el-form-item>
              
              <el-form-item label="密码" prop="password">
                <el-input
                  v-model="registerForm.password"
                  type="password"
                  placeholder="请输入密码"
                  prefix-icon="lock"
                  show-password
                />
              </el-form-item>
              
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  prefix-icon="lock"
                  show-password
                />
              </el-form-item>
              
              <el-form-item prop="agreeTerms">
                <el-checkbox v-model="registerForm.agreeTerms">
                  我已阅读并同意<el-link type="primary" :underline="false">服务条款</el-link>
                </el-checkbox>
              </el-form-item>
              
              <el-button
                type="primary"
                :loading="isLoading"
                class="submit-button"
                @click="handleRegister"
              >
                注册
              </el-button>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  background-image: url('/images/silk-road-bg.jpg');
  background-size: cover;
  background-position: center;
}

.login-container {
  width: 100%;
  max-width: 460px;
  padding: 20px;
}

.login-card {
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.login-logo {
  width: 80px;
  height: 80px;
  margin-bottom: 15px;
}

.login-title {
  font-size: 1.8rem;
  color: var(--dark-color);
  text-align: center;
  margin: 0;
}

.login-error {
  margin-bottom: 20px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.submit-button {
  width: 100%;
  margin-bottom: 20px;
}

.guest-login {
  display: flex;
  justify-content: center;
}

.login-tabs :deep(.el-tabs__nav) {
  width: 100%;
}

.login-tabs :deep(.el-tabs__item) {
  flex: 1;
  text-align: center;
}
</style> 