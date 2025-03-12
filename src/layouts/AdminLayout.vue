<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 计算属性：是否是管理员
const isAdmin = computed(() => userStore.userInfo?.isAdmin || false)

// 控制侧边菜单折叠状态
const isCollapse = ref(false)

// 侧边菜单项
const adminMenus = [
  {
    path: '/admin/dashboard',
    title: '控制面板',
    icon: 'el-icon-odometer'
  },
  {
    path: '/admin/scenic-manage',
    title: '景点管理',
    icon: 'el-icon-place'
  },
  {
    path: '/admin/tag-manage',
    title: '标签管理',
    icon: 'el-icon-price-tag'
  },
  {
    path: '/admin/user-manage',
    title: '用户管理',
    icon: 'el-icon-user'
  }
]

// 返回前台页面
function backToFrontend() {
  router.push('/')
}

// 切换菜单折叠状态
function toggleCollapse() {
  isCollapse.value = !isCollapse.value
}

// 检查权限
onMounted(() => {
  if (!userStore.isLoggedIn || !isAdmin.value) {
    // 没有管理员权限，跳转到登录页
    ElMessage.error('您需要管理员权限才能访问此页面')
    router.push('/login')
  }
})
</script>

<template>
  <el-container class="admin-layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '210px'" class="admin-sidebar">
      <div class="admin-logo">
        <img src="../assets/logo-small.png" alt="Logo" class="logo-img" />
        <span v-if="!isCollapse" class="logo-text">管理后台</span>
      </div>
      
      <el-menu
        :default-active="route.path"
        class="admin-menu"
        :collapse="isCollapse"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item v-for="item in adminMenus" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
      
      <div class="collapse-btn" @click="toggleCollapse">
        <el-icon v-if="isCollapse"><Right /></el-icon>
        <el-icon v-else><Left /></el-icon>
      </div>
    </el-aside>
    
    <!-- 主区域 -->
    <el-container class="admin-main-container">
      <!-- 头部 -->
      <el-header class="admin-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">管理后台</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-button type="primary" size="small" @click="backToFrontend">
            <el-icon><Back /></el-icon>
            返回前台
          </el-button>
          
          <el-dropdown>
            <el-avatar
              size="small"
              :src="userStore.userInfo?.avatar"
              class="avatar"
            />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/user')">个人中心</el-dropdown-item>
                <el-dropdown-item divided @click="userStore.logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 内容区域 -->
      <el-main class="admin-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
      
      <!-- 底部 -->
      <el-footer class="admin-footer">
        丝绸之路旅游资源系统 &copy; {{ new Date().getFullYear() }} 管理后台
      </el-footer>
    </el-container>
  </el-container>
</template>

<style scoped>
.admin-layout-container {
  min-height: 100vh;
}

.admin-sidebar {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #304156;
  transition: width 0.3s;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 1001;
  overflow-x: hidden;
}

.admin-logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  padding: 0 16px;
  overflow: hidden;
}

.logo-img {
  width: 32px;
  height: 32px;
  margin-right: 8px;
}

.admin-menu {
  border-right: none;
  flex: 1;
}

.collapse-btn {
  padding: 16px 0;
  text-align: center;
  color: #bfcbd9;
  cursor: pointer;
  transition: all 0.3s;
}

.collapse-btn:hover {
  color: #409EFF;
}

.admin-main-container {
  margin-left: v-bind('isCollapse ? "64px" : "210px"');
  transition: margin-left 0.3s;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
}

.header-right > * {
  margin-left: 10px;
}

.avatar {
  cursor: pointer;
}

.admin-main {
  padding: 24px;
  background-color: #f5f7fa;
}

.admin-footer {
  text-align: center;
  color: #909399;
  font-size: 14px;
  padding: 16px 0;
  background-color: white;
  border-top: 1px solid #eee;
}
</style> 