<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useScenicStore } from '@/stores/scenic'
import { useRecommendationStore } from '@/stores/recommendation'

const route = useRoute()
const router = useRouter()
const scenicStore = useScenicStore()
const recommendStore = useRecommendationStore()

const scenicId = computed(() => route.params.id as string)
const scenicSpot = computed(() => scenicStore.getScenicSpotById(scenicId.value))
const isLoading = ref(true)

// 轮播图的当前索引
const currentImageIndex = ref(0)

// 获取景点的所有标签对象
const tags = computed(() => {
  if (!scenicSpot.value) return []
  return scenicSpot.value.tags
    .map(tagId => scenicStore.tagMap.get(tagId))
    .filter(tag => tag !== undefined)
})

// 按类别分组的标签
const tagsByCategory = computed(() => {
  if (!tags.value.length) return {}
  
  const result: Record<string, any[]> = {}
  tags.value.forEach(tag => {
    if (!tag) return
    
    if (!result[tag.category]) {
      result[tag.category] = []
    }
    
    result[tag.category].push(tag)
  })
  
  return result
})

// 获取相似景点
const similarSpots = ref<any[]>([])

// 初始化
onMounted(async () => {
  isLoading.value = true
  
  // 确保景点和标签数据已加载
  if (scenicStore.scenicSpots.length === 0) {
    await scenicStore.fetchAllScenicSpots()
  }
  
  if (scenicStore.tags.length === 0) {
    await scenicStore.fetchAllTags()
  }
  
  // 如果景点不存在，重定向到景点列表页
  if (!scenicSpot.value) {
    router.push('/scenic')
    return
  }
  
  // 获取相似景点
  similarSpots.value = recommendStore.getSimilarSpots(scenicId.value, 4)
  
  isLoading.value = false
})

// 导航到景点详情
function navigateToScenic(id: string) {
  router.push(`/scenic/${id}`)
}

// 返回景点列表
function goBack() {
  router.push('/scenic')
}

// 切换轮播图
function changeImage(index: number) {
  currentImageIndex.value = index
}
</script>

<template>
  <div class="scenic-detail-view">
    <div class="page-container">
      <!-- 加载状态 -->
      <div v-if="isLoading || !scenicSpot" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>
      
      <!-- 景点详情内容 -->
      <template v-else>
        <!-- 返回按钮 -->
        <div class="back-button">
          <el-button type="text" @click="goBack">
            <el-icon><back /></el-icon> 返回景点列表
          </el-button>
        </div>
        
        <!-- 景点头部信息 -->
        <div class="scenic-header">
          <h1 class="scenic-title">{{ scenicSpot.name }}</h1>
          <div class="scenic-meta">
            <span class="scenic-location">
              <el-icon><location /></el-icon>
              {{ scenicSpot.location.city }}, {{ scenicSpot.location.province }}, {{ scenicSpot.location.country }}
            </span>
            <span class="scenic-rating">
              <el-rate v-model="scenicSpot.rating" disabled show-score text-color="#ff9900" />
            </span>
          </div>
        </div>
        
        <!-- 主要内容区 -->
        <div class="scenic-main">
          <!-- 左侧图片和描述 -->
          <div class="scenic-left">
            <!-- 图片轮播 -->
            <div class="scenic-images">
              <div class="main-image-container">
                <img 
                  :src="scenicSpot.images[currentImageIndex]" 
                  :alt="scenicSpot.name" 
                  class="main-image"
                />
              </div>
              <div class="image-thumbnails">
                <div
                  v-for="(image, index) in scenicSpot.images"
                  :key="index"
                  class="thumbnail"
                  :class="{ active: index === currentImageIndex }"
                  @click="changeImage(index)"
                >
                  <img :src="image" :alt="`${scenicSpot.name} ${index + 1}`" />
                </div>
              </div>
            </div>
            
            <!-- 描述信息 -->
            <div class="scenic-description">
              <h2>景点描述</h2>
              <p>{{ scenicSpot.description }}</p>
            </div>
            
            <!-- 标签信息 -->
            <div class="scenic-tags">
              <h2>景点特色</h2>
              <div class="tag-categories">
                <div 
                  v-for="(tags, category) in tagsByCategory" 
                  :key="category"
                  class="tag-category"
                >
                  <h3>{{ category }}</h3>
                  <div class="tags-list">
                    <el-tag
                      v-for="tag in tags"
                      :key="tag.id"
                      :color="tag.color + '20'"
                      :style="{ borderColor: tag.color }"
                      effect="plain"
                      class="tag-item"
                    >
                      {{ tag.name }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 右侧信息卡片 -->
          <div class="scenic-right">
            <!-- 基本信息卡片 -->
            <el-card class="info-card">
              <template #header>
                <div class="card-header">
                  <span>基本信息</span>
                </div>
              </template>
              
              <ul class="info-list">
                <li>
                  <span class="info-label">详细地址:</span>
                  <span class="info-value">{{ scenicSpot.location.address }}</span>
                </li>
                <li>
                  <span class="info-label">开放时间:</span>
                  <span class="info-value">{{ scenicSpot.openingHours.open }} - {{ scenicSpot.openingHours.close }}</span>
                </li>
                <li v-if="scenicSpot.openingHours.holidayAdjustment">
                  <span class="info-label">节假日特别安排:</span>
                  <span class="info-value">{{ scenicSpot.openingHours.holidayAdjustment }}</span>
                </li>
                <li>
                  <span class="info-label">门票价格:</span>
                  <span class="info-value price">成人: ¥{{ scenicSpot.price.adult }}</span>
                  <span v-if="scenicSpot.price.child" class="info-value price">儿童: ¥{{ scenicSpot.price.child }}</span>
                  <span v-if="scenicSpot.price.student" class="info-value price">学生: ¥{{ scenicSpot.price.student }}</span>
                </li>
                <li>
                  <span class="info-label">建议游览时间:</span>
                  <span class="info-value">{{ scenicSpot.visitDuration }}</span>
                </li>
                <li>
                  <span class="info-label">最佳游览季节:</span>
                  <span class="info-value">{{ scenicSpot.bestVisitSeason.join('、') }}</span>
                </li>
              </ul>
            </el-card>
            
            <!-- 地图位置 -->
            <el-card class="map-card">
              <template #header>
                <div class="card-header">
                  <span>地理位置</span>
                </div>
              </template>
              
              <div class="map-placeholder">
                <div class="map-overlay">
                  <el-icon><location /></el-icon>
                  <p>地图加载中...</p>
                  <p class="coordinates">
                    坐标: {{ scenicSpot.location.coordinates.lat.toFixed(4) }}, 
                    {{ scenicSpot.location.coordinates.lng.toFixed(4) }}
                  </p>
                </div>
              </div>
            </el-card>
          </div>
        </div>
        
        <!-- 相似景点推荐 -->
        <div class="similar-spots" v-if="similarSpots.length > 0">
          <h2>相似景点推荐</h2>
          <el-row :gutter="20">
            <el-col 
              v-for="spot in similarSpots" 
              :key="spot.id"
              :xs="24"
              :sm="12"
              :md="6"
            >
              <el-card class="spot-card" shadow="hover" @click="navigateToScenic(spot.id)">
                <div class="spot-image-container">
                  <img :src="spot.images[0]" :alt="spot.name" class="spot-image" />
                </div>
                <div class="spot-info">
                  <h3 class="spot-title">{{ spot.name }}</h3>
                  <p class="spot-location">{{ spot.location.city }}, {{ spot.location.country }}</p>
                  <div class="spot-tags">
                    <el-tag
                      v-for="(tagId, index) in spot.tags.slice(0, 2)"
                      :key="tagId"
                      size="small"
                      effect="plain"
                      :color="scenicStore.tagMap.get(tagId)?.color + '20'"
                      :style="{ borderColor: scenicStore.tagMap.get(tagId)?.color }"
                    >
                      {{ scenicStore.tagMap.get(tagId)?.name || '未知' }}
                    </el-tag>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.scenic-detail-view {
  padding-bottom: 40px;
}

.loading-container {
  padding: 40px 0;
}

.back-button {
  margin-bottom: 20px;
}

.scenic-header {
  margin-bottom: 30px;
}

.scenic-title {
  font-size: 2.5rem;
  margin-bottom: 10px;
  color: var(--dark-color);
}

.scenic-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  color: #666;
}

.scenic-location {
  display: flex;
  align-items: center;
  gap: 5px;
}

.scenic-main {
  display: flex;
  gap: 30px;
  margin-bottom: 40px;
}

.scenic-left {
  flex: 1;
}

.scenic-right {
  flex: 0 0 350px;
}

.scenic-images {
  margin-bottom: 30px;
}

.main-image-container {
  height: 400px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 10px;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-thumbnails {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.thumbnail {
  width: 80px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.thumbnail.active {
  opacity: 1;
  border-color: var(--primary-color);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scenic-description {
  margin-bottom: 30px;
}

.scenic-description h2 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: var(--dark-color);
}

.scenic-description p {
  line-height: 1.8;
  color: #333;
  text-align: justify;
}

.scenic-tags h2 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: var(--dark-color);
}

.tag-categories {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.tag-category h3 {
  font-size: 1.1rem;
  margin-bottom: 10px;
  color: #666;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  margin-right: 0;
}

.info-card, .map-card {
  margin-bottom: 20px;
}

.card-header {
  font-weight: bold;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-list li {
  margin-bottom: 12px;
  display: flex;
  flex-wrap: wrap;
}

.info-label {
  width: 120px;
  color: #666;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
}

.info-value.price {
  color: #e74c3c;
  margin-right: 10px;
}

.map-placeholder {
  height: 200px;
  background-color: #eee;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.map-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #666;
}

.map-overlay .el-icon {
  font-size: 2rem;
  margin-bottom: 10px;
  color: var(--primary-color);
}

.coordinates {
  font-size: 0.9rem;
  margin-top: 5px;
}

.similar-spots h2 {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: var(--dark-color);
}

.spot-card {
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
}

.spot-card:hover {
  transform: translateY(-5px);
}

.spot-image-container {
  height: 150px;
  overflow: hidden;
}

.spot-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.spot-info {
  padding: 15px;
}

.spot-title {
  font-size: 1.1rem;
  margin-bottom: 5px;
  color: var(--dark-color);
}

.spot-location {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.spot-tags {
  display: flex;
  gap: 5px;
}

@media (max-width: 768px) {
  .scenic-main {
    flex-direction: column;
  }
  
  .scenic-right {
    flex: 0 0 auto;
    width: 100%;
  }
  
  .main-image-container {
    height: 250px;
  }
  
  .tag-categories {
    grid-template-columns: 1fr;
  }
}
</style> 