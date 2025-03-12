<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 返回首页
function goHome() {
  router.push('/')
}

// 返回上一页
function goBack() {
  router.back()
}
</script>

<template>
  <div class="not-found-view">
    <div class="not-found-container">
      <div class="not-found-content">
        <h1 class="not-found-code">404</h1>
        <h2 class="not-found-title">页面未找到</h2>
        <p class="not-found-message">
          很抱歉，您访问的页面不存在或已被移除。
        </p>
        <div class="not-found-actions">
          <el-button type="primary" @click="goHome">
            返回首页
          </el-button>
          <el-button @click="goBack">
            返回上一页
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-view {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
}

.not-found-container {
  width: 100%;
  max-width: 600px;
  padding: 20px;
  text-align: center;
}

.not-found-content {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  padding: 50px 30px;
}

.not-found-code {
  font-size: 8rem;
  font-weight: bold;
  color: var(--primary-color);
  margin: 0;
  line-height: 1;
}

.not-found-title {
  font-size: 2rem;
  color: var(--dark-color);
  margin: 10px 0 20px;
}

.not-found-message {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 30px;
}

.not-found-actions {
  display: flex;
  justify-content: center;
  gap: 15px;
}

@media (max-width: 768px) {
  .not-found-code {
    font-size: 6rem;
  }
  
  .not-found-title {
    font-size: 1.5rem;
  }
  
  .not-found-actions {
    flex-direction: column;
    gap: 10px;
  }
}
</style> 