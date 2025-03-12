<script setup lang="ts">
import { ref, onMounted } from 'vue'

const statistics = ref({
  totalScenicSpots: 10,
  totalTags: 84,
  totalUsers: 156,
  activeUsers: 78
})

const recentActivities = ref([
  { id: 1, type: '用户登录', user: '管理员', time: '2024-03-12 14:35' },
  { id: 2, type: '标签更新', user: '管理员', time: '2024-03-12 10:22' },
  { id: 3, type: '景点添加', user: '管理员', time: '2024-03-11 16:45' },
  { id: 4, type: '用户注册', user: '张三', time: '2024-03-11 09:18' },
  { id: 5, type: '景点更新', user: '管理员', time: '2024-03-10 15:30' }
])

onMounted(() => {
  // 在实际应用中，这里会从API获取数据
  console.log('Dashboard mounted')
})
</script>

<template>
  <div class="dashboard-view">
    <div class="page-container">
      <h1 class="page-title">控制面板</h1>
      
      <!-- 统计卡片 -->
      <div class="statistics">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6">
            <el-card class="statistic-card" shadow="hover">
              <div class="statistic-content">
                <div class="statistic-icon" style="color: #409EFF;">
                  <el-icon><place /></el-icon>
                </div>
                <div class="statistic-info">
                  <h3 class="statistic-title">景点总数</h3>
                  <p class="statistic-value">{{ statistics.totalScenicSpots }}</p>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="6">
            <el-card class="statistic-card" shadow="hover">
              <div class="statistic-content">
                <div class="statistic-icon" style="color: #67C23A;">
                  <el-icon><price-tag /></el-icon>
                </div>
                <div class="statistic-info">
                  <h3 class="statistic-title">标签总数</h3>
                  <p class="statistic-value">{{ statistics.totalTags }}</p>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="6">
            <el-card class="statistic-card" shadow="hover">
              <div class="statistic-content">
                <div class="statistic-icon" style="color: #E6A23C;">
                  <el-icon><user /></el-icon>
                </div>
                <div class="statistic-info">
                  <h3 class="statistic-title">用户总数</h3>
                  <p class="statistic-value">{{ statistics.totalUsers }}</p>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :xs="24" :sm="12" :md="6">
            <el-card class="statistic-card" shadow="hover">
              <div class="statistic-content">
                <div class="statistic-icon" style="color: #F56C6C;">
                  <el-icon><data-analysis /></el-icon>
                </div>
                <div class="statistic-info">
                  <h3 class="statistic-title">活跃用户</h3>
                  <p class="statistic-value">{{ statistics.activeUsers }}</p>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <!-- 最近活动 -->
      <div class="recent-activities">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近活动</span>
              <el-button type="primary" link>查看全部</el-button>
            </div>
          </template>
          
          <el-table :data="recentActivities" stripe style="width: 100%">
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="type" label="活动类型" />
            <el-table-column prop="user" label="用户" />
            <el-table-column prop="time" label="时间" />
            <el-table-column label="操作" width="150">
              <template #default>
                <el-button type="primary" link>查看</el-button>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
      
      <!-- 快捷操作 -->
      <div class="quick-actions">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card class="action-card" shadow="hover">
                <el-icon><plus /></el-icon>
                <span>添加景点</span>
              </el-card>
            </el-col>
            
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card class="action-card" shadow="hover">
                <el-icon><upload /></el-icon>
                <span>导入数据</span>
              </el-card>
            </el-col>
            
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card class="action-card" shadow="hover">
                <el-icon><download /></el-icon>
                <span>导出数据</span>
              </el-card>
            </el-col>
            
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card class="action-card" shadow="hover">
                <el-icon><setting /></el-icon>
                <span>系统设置</span>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-view {
  padding-bottom: 40px;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 30px;
  color: var(--dark-color);
}

.statistics {
  margin-bottom: 30px;
}

.statistic-card {
  margin-bottom: 20px;
  transition: transform 0.3s ease;
}

.statistic-card:hover {
  transform: translateY(-5px);
}

.statistic-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.statistic-icon {
  font-size: 2.5rem;
}

.statistic-info {
  flex: 1;
}

.statistic-title {
  font-size: 1rem;
  color: #666;
  margin: 0 0 5px 0;
}

.statistic-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--dark-color);
  margin: 0;
}

.recent-activities {
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quick-actions {
  margin-bottom: 30px;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.action-card:hover {
  background-color: var(--primary-color);
  color: white;
}

.action-card .el-icon {
  font-size: 2rem;
}
</style> 