<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useScenicStore } from '@/stores/scenic'

const router = useRouter()
const scenicStore = useScenicStore()

// 推荐的热门景点（前4个）
const hotSpots = ref<any[]>([])

// 系统功能模块
const systemModules = [
  {
    title: '景点浏览',
    icon: 'el-icon-map-location',
    description: '浏览丝绸之路沿线的旅游景点，查看详细信息和图片',
    route: '/scenic',
    color: 'var(--primary-color)'
  },
  {
    title: '个性化推荐',
    icon: 'el-icon-star-on',
    description: '根据您的喜好和标签偏好，获取个性化的旅游景点推荐',
    route: '/recommendation',
    color: 'var(--accent-color)'
  },
  {
    title: '标签体系',
    icon: 'el-icon-collection-tag',
    description: '了解我们的景点标签体系，帮助您更精准地找到心仪的景点',
    route: '/tags',
    color: 'var(--secondary-color)'
  },
  {
    title: '数据可视化',
    icon: 'el-icon-data-analysis',
    description: '通过直观的图表和地图，了解丝绸之路旅游资源的分布情况',
    route: '/data-visualization',
    color: '#8e44ad'
  }
]

// 页面初始化时获取热门景点
onMounted(async () => {
  if (scenicStore.scenicSpots.length === 0) {
    await scenicStore.fetchAllScenicSpots()
  }
  
  // 获取评分最高的4个景点作为热门推荐
  hotSpots.value = [...scenicStore.scenicSpots]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4)
})

// 导航到特定路由
function navigateTo(route: string) {
  router.push(route)
}

// 查看景点详情
function viewScenicDetails(id: string) {
  router.push(`/scenic/${id}`)
}
</script>

<template>
  <div class="home-container">
    <!-- Hero Banner -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">探索丝绸之路的壮美景色</h1>
        <p class="hero-subtitle">从长安到罗马，追寻古老商路上的文明印记</p>
        <el-button type="primary" size="large" @click="navigateTo('/scenic')">
          开始探索
        </el-button>
      </div>
    </div>
    
    <!-- 系统简介 -->
    <div class="intro-section page-container">
      <h2 class="section-title">丝绸之路旅游资源系统</h2>
      <p class="intro-text">
        本系统收集并展示了丝绸之路沿线的优质旅游资源，通过先进的标签体系和智能推荐算法，
        帮助您发现最适合的旅游目的地。无论您是历史文化爱好者，还是自然风光探索者，
        这里都能找到契合您口味的旅行体验。
      </p>
      
      <!-- 功能模块 -->
      <div class="modules-container">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6" v-for="module in systemModules" :key="module.title">
            <el-card class="module-card" shadow="hover" @click="navigateTo(module.route)">
              <div class="module-icon" :style="{ backgroundColor: module.color }">
                <el-icon>
                  <component :is="module.icon" />
                </el-icon>
              </div>
              <h3 class="module-title">{{ module.title }}</h3>
              <p class="module-desc">{{ module.description }}</p>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
    
    <!-- 热门景点 -->
    <div class="hot-spots-section">
      <div class="page-container">
        <h2 class="section-title">热门景点推荐</h2>
        <p class="section-desc">这些是我们最受欢迎的丝绸之路旅游目的地</p>
        
        <el-row :gutter="20" v-loading="scenicStore.isLoading">
          <el-col :xs="24" :sm="12" :md="6" v-for="spot in hotSpots" :key="spot.id">
            <el-card class="spot-card" shadow="hover" @click="viewScenicDetails(spot.id)">
              <div class="spot-gradient" :class="`gradient-${spot.id.charCodeAt(0) % 5}`">
                <div class="spot-overlay">
                  <div class="spot-icon">
                    <el-icon size="32"><location-filled /></el-icon>
                  </div>
                  <div class="spot-bottom">
                    <h3 class="spot-title-overlay">{{ spot.name }}</h3>
                    <div class="spot-rating">
                      <el-rate
                        v-model="spot.rating"
                        disabled
                        text-color="#FFFFFF"
                        score-template="{value}"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div class="spot-info">
                <p class="spot-location">
                  <el-icon><location /></el-icon>
                  {{ spot.location.city }}, {{ spot.location.country }}
                </p>
                <p class="spot-description">{{ spot.description.substring(0, 60) }}...</p>
                <div class="spot-tags">
                  <el-tag
                    v-for="(tagId, index) in spot.tags.slice(0, 3)"
                    :key="tagId"
                    size="small"
                    effect="plain"
                    class="spot-tag"
                  >
                    {{ scenicStore.tagMap.get(tagId)?.name || '未知标签' }}
                  </el-tag>
                  <el-tag v-if="spot.tags.length > 3" size="small" type="info">+{{ spot.tags.length - 3 }}</el-tag>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <div class="view-more">
          <el-button type="primary" plain @click="navigateTo('/scenic')">
            查看更多景点
          </el-button>
        </div>
      </div>
    </div>
    
    <!-- 系统特点 -->
    <div class="features-section page-container">
      <h2 class="section-title">系统特点</h2>
      
      <el-row :gutter="30">
        <el-col :xs="24" :md="8">
          <div class="feature-item">
            <el-icon class="feature-icon"><data-line /></el-icon>
            <h3 class="feature-title">智能数据分析</h3>
            <p class="feature-desc">
              结合地理信息、用户评价和历史数据，对丝绸之路旅游资源进行全方位分析。
            </p>
          </div>
        </el-col>
        
        <el-col :xs="24" :md="8">
          <div class="feature-item">
            <el-icon class="feature-icon"><connection /></el-icon>
            <h3 class="feature-title">多维标签体系</h3>
            <p class="feature-desc">
              通过地理特征、历史文化、时节特点等多维度标签，精准定位每个景点的特色。
            </p>
          </div>
        </el-col>
        
        <el-col :xs="24" :md="8">
          <div class="feature-item">
            <el-icon class="feature-icon"><avatar /></el-icon>
            <h3 class="feature-title">个性化推荐</h3>
            <p class="feature-desc">
              根据用户兴趣和偏好，提供量身定制的旅游路线和景点推荐。
            </p>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  padding-bottom: 40px;
}

.hero-section {
  height: 500px;
  background-image: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

.hero-content {
  max-width: 800px;
  padding: 0 20px;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 30px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.section-title {
  font-size: 2rem;
  color: var(--dark-color);
  text-align: center;
  margin-bottom: 1rem;
}

.intro-section {
  margin-bottom: 60px;
}

.intro-text {
  max-width: 800px;
  margin: 0 auto 40px;
  text-align: center;
  font-size: 1.1rem;
  line-height: 1.6;
  color: #666;
}

.modules-container {
  margin-top: 40px;
}

.module-card {
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  text-align: center;
}

.module-card:hover {
  transform: translateY(-5px);
}

.module-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  color: white;
  font-size: 2rem;
}

.module-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: var(--dark-color);
}

.module-desc {
  color: #666;
  line-height: 1.5;
}

.hot-spots-section {
  padding: 60px 0;
  background-color: var(--light-color);
  margin-bottom: 60px;
}

.section-desc {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
}

.spot-card {
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.spot-card:hover {
  transform: translateY(-5px);
}

.spot-gradient {
  height: 140px;
  position: relative;
  transition: transform 0.3s ease;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
}

.spot-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.7));
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 15px;
  color: white;
}

.spot-icon {
  color: white;
  align-self: flex-end;
}

.spot-bottom {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.spot-title-overlay {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  line-height: 1.3;
}

.spot-rating {
  display: flex;
  justify-content: flex-start;
}

.spot-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 10px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.spot-info {
  padding: 15px;
}

.spot-location {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.spot-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.spot-tag {
  margin-right: 5px;
}

.view-more {
  text-align: center;
  margin-top: 30px;
}

.features-section {
  margin-bottom: 40px;
}

.feature-item {
  text-align: center;
  padding: 30px 20px;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  height: 100%;
}

.feature-item:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  color: var(--primary-color);
  margin-bottom: 20px;
}

.feature-title {
  font-size: 1.3rem;
  color: var(--dark-color);
  margin-bottom: 15px;
}

.feature-desc {
  color: #666;
  line-height: 1.5;
}

/* 渐变色样式 */
.gradient-0 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.5);
}

.gradient-1 {
  background: linear-gradient(135deg, #2af598 0%, #009efd 100%);
  box-shadow: 0 4px 15px rgba(0, 158, 253, 0.5);
}

.gradient-2 {
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
  box-shadow: 0 4px 15px rgba(255, 154, 158, 0.5);
}

.gradient-3 {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  box-shadow: 0 4px 15px rgba(246, 211, 101, 0.5);
}

.gradient-4 {
  background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
  box-shadow: 0 4px 15px rgba(161, 140, 209, 0.5);
}
</style> 