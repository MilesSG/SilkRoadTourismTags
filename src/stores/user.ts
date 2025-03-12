import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface UserPreference {
  tags: string[];
  budget: string;
  season: string;
  duration: string;
  travelStyle: string;
  [key: string]: any;
}

export interface UserInfo {
  id: string;
  username: string;
  avatar: string;
  isAdmin: boolean;
  preferences: UserPreference;
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string | null>(null)
  const isLoggedIn = ref(false)
  
  // 加载用户状态（从本地存储）
  function loadUserState() {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('userInfo')
    
    if (savedToken) {
      token.value = savedToken
      isLoggedIn.value = true
    }
    
    if (savedUser) {
      try {
        userInfo.value = JSON.parse(savedUser)
      } catch (error) {
        console.error('Failed to parse user info:', error)
      }
    }
  }
  
  // 登录
  function login(loginInfo: { username: string; password: string }) {
    // 模拟API登录请求
    return new Promise<UserInfo>((resolve) => {
      setTimeout(() => {
        // 模拟用户数据
        const user: UserInfo = {
          id: '1',
          username: loginInfo.username,
          avatar: 'https://placekitten.com/200/200',
          isAdmin: loginInfo.username === 'admin',
          preferences: {
            tags: [],
            budget: '',
            season: '',
            duration: '',
            travelStyle: ''
          }
        }
        
        // 保存到state和localStorage
        userInfo.value = user
        token.value = 'mock-jwt-token'
        isLoggedIn.value = true
        
        localStorage.setItem('token', token.value)
        localStorage.setItem('userInfo', JSON.stringify(user))
        
        resolve(user)
      }, 1000)
    })
  }
  
  // 登出
  function logout() {
    userInfo.value = null
    token.value = null
    isLoggedIn.value = false
    
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }
  
  // 更新用户偏好
  function updatePreferences(preferences: Partial<UserPreference>) {
    if (!userInfo.value) {
      console.error('无法更新偏好：用户未登录')
      return
    }
    
    console.log('更新用户偏好:', preferences)
    
    // 确保userInfo.value.preferences存在
    if (!userInfo.value.preferences) {
      userInfo.value.preferences = {
        tags: [],
        budget: '',
        season: '',
        duration: '',
        travelStyle: ''
      }
    }
    
    // 合并偏好
    userInfo.value.preferences = {
      ...userInfo.value.preferences,
      ...preferences
    }
    
    // 确保保存的偏好中存在tags属性
    if (!userInfo.value.preferences.tags) {
      userInfo.value.preferences.tags = []
    }
    
    console.log('更新后的用户偏好:', userInfo.value.preferences)
    
    // 保存到本地存储
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
  }
  
  // 初始化
  loadUserState()
  
  return {
    userInfo,
    token,
    isLoggedIn,
    login,
    logout,
    updatePreferences
  }
}) 