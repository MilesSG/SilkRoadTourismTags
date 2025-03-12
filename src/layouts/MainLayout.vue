<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 计算当前用户登录状态
const isLoggedIn = computed(() => userStore.isLoggedIn)
const isAdmin = computed(() => userStore.userInfo?.isAdmin || false)

// 导航菜单数据
const navMenus = ref([
  { path: '/home', icon: 'el-icon-house', title: '首页' },
  { path: '/scenic', icon: 'el-icon-place', title: '景点浏览' },
  { path: '/recommendation', icon: 'el-icon-star-on', title: '个性化推荐' },
  { path: '/tags', icon: 'el-icon-collection-tag', title: '标签体系' },
  { path: '/data-visualization', icon: 'el-icon-data-line', title: '数据可视化' },
])

// 处理登录/退出
function handleLoginLogout() {
  if (isLoggedIn.value) {
    userStore.logout()
  } else {
    router.push('/login')
  }
}

// 跳转到用户中心
function goToUserCenter() {
  router.push('/user')
}

// 跳转到管理后台
function goToAdmin() {
  router.push('/admin/dashboard')
}
</script>

<template>
  <el-container class="layout-container">
    <!-- 顶部导航栏 -->
    <el-header class="main-header">
      <div class="logo">
        <router-link to="/">
          <h1 class="logo-text">丝绸之路旅游资源系统</h1>
        </router-link>
      </div>
      
      <div class="nav-menu">
        <el-menu
          mode="horizontal"
          :default-active="route.path"
          class="horizontal-menu"
          :ellipsis="false"
          router
        >
          <el-menu-item v-for="item in navMenus" :key="item.path" :index="item.path">
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </el-menu>
      </div>
      
      <div class="user-actions">
        <template v-if="isLoggedIn">
          <el-dropdown>
            <el-avatar
              size="medium"
              :src="userStore.userInfo?.avatar || ''"
              class="user-avatar"
            />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToUserCenter">
                  <el-icon><user /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item v-if="isAdmin" @click="goToAdmin">
                  <el-icon><setting /></el-icon>管理后台
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLoginLogout">
                  <el-icon><switch-button /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
        <template v-else>
          <el-button type="primary" @click="handleLoginLogout" size="small">
            登录
          </el-button>
        </template>
      </div>
    </el-header>
    
    <!-- 主内容区域 -->
    <el-main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>
    
    <!-- 页脚 -->
    <el-footer class="main-footer">
      <div>© {{ new Date().getFullYear() }} 丝绸之路旅游资源数据构建及展示系统</div>
      <div>联系我们 | 关于我们 | 使用条款</div>
    </el-footer>
  </el-container>
</template>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 20px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  flex-shrink: 0;
}

.logo-text {
  font-size: 1.4rem;
  color: var(--primary-color);
  margin: 0;
  font-weight: 600;
}

.nav-menu {
  flex-grow: 1;
  margin: 0 20px;
}

.horizontal-menu {
  justify-content: center;
  border-bottom: none;
}

.user-actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.user-avatar {
  cursor: pointer;
  border: 2px solid var(--primary-color);
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f5f7fa;
}

.main-footer {
  text-align: center;
  padding: 20px;
  background-color: #f8f8f8;
  color: #666;
  font-size: 0.9rem;
  border-top: 1px solid #eee;
}
</style> 