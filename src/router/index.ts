import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 布局组件
const MainLayout = () => import('@/layouts/MainLayout.vue')

// 懒加载路由
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: MainLayout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页', icon: 'home' }
      },
      {
        path: 'scenic',
        name: 'Scenic',
        component: () => import('@/views/Scenic.vue'),
        meta: { title: '景点浏览', icon: 'location' }
      },
      {
        path: 'scenic/:id',
        name: 'ScenicDetail',
        component: () => import('@/views/ScenicDetail.vue'),
        meta: { title: '景点详情', icon: 'info' }
      },
      {
        path: 'recommendation',
        name: 'Recommendation',
        component: () => import('@/views/Recommendation.vue'),
        meta: { title: '个性化推荐', icon: 'star' }
      },
      {
        path: 'tags',
        name: 'Tags',
        component: () => import('@/views/Tags.vue'),
        meta: { title: '标签体系', icon: 'collection-tag' }
      },
      {
        path: 'data-visualization',
        name: 'DataVisualization',
        component: () => import('@/views/DataVisualization.vue'),
        meta: { title: '数据可视化', icon: 'data-analysis' }
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/User.vue'),
        meta: { title: '用户中心', icon: 'user' }
      }
    ]
  },
  {
    path: '/admin',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/admin/dashboard',
    meta: { requiresAdmin: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { title: '控制面板', icon: 'dashboard' }
      },
      {
        path: 'scenic-manage',
        name: 'ScenicManage',
        component: () => import('@/views/admin/ScenicManage.vue'),
        meta: { title: '景点管理', icon: 'management' }
      },
      {
        path: 'tag-manage',
        name: 'TagManage',
        component: () => import('@/views/admin/TagManage.vue'),
        meta: { title: '标签管理', icon: 'price-tag' }
      },
      {
        path: 'user-manage',
        name: 'UserManage',
        component: () => import('@/views/admin/UserManage.vue'),
        meta: { title: '用户管理', icon: 'user' }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: '404' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title ? to.meta.title : ''} - 丝绸之路旅游资源系统`
  
  // 这里可以添加身份验证逻辑
  // 例如检查管理员页面的访问权限等
  
  next()
})

export default router 