<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useScenicStore } from '@/stores/scenic'
import { useRecommendationStore } from '@/stores/recommendation'

const router = useRouter()
const userStore = useUserStore()
const scenicStore = useScenicStore()
const recommendStore = useRecommendationStore()

const isLoading = ref(true)
const loadingStep = ref<string>('初始化')
const showPreferenceForm = ref(false)
const selectedTags = ref<string[]>([])

// 推荐结果展示模式
const viewMode = ref<'grid' | 'list'>('grid')

// 计算用户是否有已选择的偏好
const hasPreferences = computed(() => {
  return userStore.userInfo?.preferences?.tags && 
         userStore.userInfo.preferences.tags.length > 0
})

// 按类别分组的标签，用于显示在偏好选择表单中
const tagsByCategory = computed(() => {
  const result: Record<string, any[]> = {}
  
  scenicStore.tags.forEach(tag => {
    if (!result[tag.category]) {
      result[tag.category] = []
    }
    
    result[tag.category].push(tag)
  })
  
  return result
})

// 计算推荐结果
const recommendResults = computed(() => {
  return recommendStore.recommendResults
})

// 初始化
onMounted(async () => {
  isLoading.value = true
  loadingStep.value = '加载用户信息'
  
  // 确保用户已登录
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  
  // 加载景点和标签数据
  loadingStep.value = '加载景点数据'
  if (scenicStore.scenicSpots.length === 0) {
    await scenicStore.loadScenicSpots()
  }
  
  console.log('调试信息: 景点数据加载完成，数量 =', scenicStore.scenicSpots.length)
  
  loadingStep.value = '加载标签数据'
  if (scenicStore.tags.length === 0) {
    await scenicStore.loadTags()
  }
  
  console.log('调试信息: 标签数据加载完成，数量 =', scenicStore.tags.length)
  
  // 如果用户已有偏好，则初始化选中的标签
  if (hasPreferences.value && userStore.userInfo?.preferences?.tags) {
    selectedTags.value = [...userStore.userInfo.preferences.tags]
    console.log('调试信息: 用户已有偏好标签，数量 =', selectedTags.value.length)
  }
  
  // 如果用户有偏好，自动生成推荐
  if (hasPreferences.value) {
    loadingStep.value = '生成推荐'
    console.log('调试信息: 开始生成推荐')
    await generateRecommendations()
    console.log('调试信息: 推荐结果数量 =', recommendResults.value.length)
  } else {
    // 否则显示偏好选择表单
    showPreferenceForm.value = true
    console.log('调试信息: 显示偏好选择表单')
  }
  
  isLoading.value = false
})

// 切换标签选择
function toggleTag(tagId: string) {
  const index = selectedTags.value.indexOf(tagId)
  
  if (index === -1) {
    selectedTags.value.push(tagId)
  } else {
    selectedTags.value.splice(index, 1)
  }
}

// 保存用户偏好并生成推荐
async function savePreferencesAndRecommend() {
  isLoading.value = true
  loadingStep.value = '保存用户偏好'
  
  // 更新用户偏好
  await userStore.updatePreferences({
    tags: selectedTags.value
  })
  
  // 生成推荐
  loadingStep.value = '生成推荐'
  await generateRecommendations()
  
  showPreferenceForm.value = false
  isLoading.value = false
}

// 生成推荐
async function generateRecommendations() {
  await recommendStore.generateRecommendations()
}

// 重新选择偏好
function reopenPreferenceForm() {
  showPreferenceForm.value = true
}

// 导航到景点详情
function navigateToScenic(id: string) {
  router.push(`/scenic/${id}`)
}

// 切换视图模式
function toggleViewMode() {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

// 新增测试函数
async function reloadData() {
  isLoading.value = true
  loadingStep.value = '重新加载数据'
  
  console.log('开始重新加载数据...')
  
  // 强制重新加载景点数据
  await scenicStore.loadScenicSpots()
  console.log('景点数据加载完成，数量:', scenicStore.scenicSpots.length)
  
  // 强制重新加载标签数据
  await scenicStore.loadTags()
  console.log('标签数据加载完成，数量:', scenicStore.tags.length)
  
  isLoading.value = false
}

// 强制生成推荐，无视当前偏好
async function forceGenerateRecommendations() {
  isLoading.value = true
  loadingStep.value = '强制生成推荐'
  
  if (!userStore.userInfo) {
    console.error('用户未登录，无法生成推荐')
    isLoading.value = false
    return
  }
  
  // 设置默认偏好，确保有至少一个标签
  await userStore.updatePreferences({
    tags: ['type-historical', 'type-cultural', 'geo-desert'],
    budget: 'medium',
    season: 'spring'
  })
  
  console.log('已设置默认偏好:', userStore.userInfo.preferences)
  
  // 生成推荐
  await recommendStore.generateRecommendations()
  console.log('推荐生成完成，结果数量:', recommendResults.value.length)
  
  isLoading.value = false
}

// 快速访客登录并推荐
async function quickGuestLogin() {
  isLoading.value = true
  loadingStep.value = '访客登录'
  
  // 登出当前用户
  userStore.logout()
  
  // 访客登录
  await userStore.login({
    username: 'guest',
    password: 'guest123',
    remember: false
  })
  
  console.log('访客登录成功')
  
  // 设置默认偏好
  await userStore.updatePreferences({
    tags: ['type-cultural', 'type-historical', 'geo-desert'],
    budget: 'medium',
    season: 'spring',
    travelStyle: 'cultural'
  })
  
  console.log('偏好设置完成:', userStore.userInfo?.preferences)
  
  // 加载数据
  if (scenicStore.scenicSpots.length === 0) {
    await scenicStore.loadScenicSpots()
  }
  
  if (scenicStore.tags.length === 0) {
    await scenicStore.loadTags()
  }
  
  console.log('数据加载完成')
  
  // 生成推荐
  await recommendStore.generateRecommendations()
  console.log('推荐生成完成，结果数量:', recommendStore.recommendResults.length)
  
  isLoading.value = false
}
</script>

<template>
  <div class="recommendation-view">
    <div class="page-container">
      <h1 class="page-title">个性化景点推荐</h1>
      
      <!-- 调试信息区域 -->
      <div class="debug-info">
        <h2>调试信息</h2>
        <el-card class="debug-card">
          <ul>
            <li>景点数量: {{ scenicStore.scenicSpots.length }}</li>
            <li>标签数量: {{ scenicStore.tags.length }}</li>
            <li>用户已登录: {{ userStore.isLoggedIn ? '是' : '否' }}</li>
            <li>用户偏好: {{ userStore.userInfo?.preferences?.tags?.length || 0 }} 个标签</li>
            <li>推荐结果: {{ recommendResults.length }} 个景点</li>
          </ul>
          
          <div v-if="scenicStore.scenicSpots.length > 0">
            <h3>第一个景点详情</h3>
            <pre class="json-preview">{{ JSON.stringify(scenicStore.scenicSpots[0], null, 2) }}</pre>
          </div>
          
          <div class="debug-actions">
            <el-button @click="reloadData" size="large">重新加载数据</el-button>
            <el-button @click="forceGenerateRecommendations" size="large">强制生成推荐</el-button>
            <el-button @click="quickGuestLogin" type="primary" size="large">访客登录并推荐</el-button>
          </div>
        </el-card>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-container">
        <el-card class="loading-card">
          <template #header>
            <div class="loading-header">
              <el-icon class="loading-icon"><loading /></el-icon>
              <span>{{ loadingStep }}</span>
            </div>
          </template>
          <el-progress :percentage="70" status="success" :indeterminate="true" />
          <p class="loading-message">正在为您生成个性化推荐，请稍候...</p>
        </el-card>
      </div>
      
      <!-- 偏好选择表单 -->
      <div v-else-if="showPreferenceForm" class="preference-form">
        <el-card class="preference-card">
          <template #header>
            <div class="preference-header">
              <h2>选择您的旅行偏好</h2>
              <p>请选择您感兴趣的标签，我们将为您推荐最匹配的景点</p>
            </div>
          </template>
          
          <div class="tag-categories">
            <div 
              v-for="(tags, category) in tagsByCategory" 
              :key="category"
              class="tag-category"
            >
              <h3 class="category-title">{{ category }}</h3>
              <div class="tags-list">
                <div
                  v-for="tag in tags"
                  :key="tag.id"
                  class="tag-item"
                  :class="{ selected: selectedTags.includes(tag.id) }"
                  @click="toggleTag(tag.id)"
                  :style="{ 
                    borderColor: selectedTags.includes(tag.id) ? tag.color : 'transparent',
                    backgroundColor: selectedTags.includes(tag.id) ? tag.color + '20' : 'transparent'
                  }"
                >
                  <span class="tag-name">{{ tag.name }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <el-button 
              type="primary" 
              :disabled="selectedTags.length === 0"
              @click="savePreferencesAndRecommend"
              size="large"
              class="save-button"
            >
              生成推荐
            </el-button>
            <p v-if="selectedTags.length === 0" class="tags-hint">请至少选择一个标签</p>
            <p v-else class="tags-hint">已选择 {{ selectedTags.length }} 个标签</p>
          </div>
        </el-card>
      </div>
      
      <!-- 推荐结果 -->
      <div v-else class="recommendation-results">
        <!-- 推荐结果头部 -->
        <div class="results-header">
          <div class="results-info">
            <h2>为您推荐的景点</h2>
            <p class="results-summary">
              根据您的偏好，我们从 {{ scenicStore.scenicSpots.length }} 个景点中精选了 
              {{ recommendResults.length }} 个最匹配的景点
            </p>
            <p v-if="recommendResults.length > 0 && recommendResults[0].matchTags.length === 0" class="results-explanation">
              <el-icon><info-filled /></el-icon>
              没有找到完全匹配您选择标签的景点，以下是我们根据您的偏好智能推荐的景点
            </p>
          </div>
          
          <div class="results-actions">
            <el-button type="primary" plain @click="reopenPreferenceForm" size="large">
              <el-icon><edit /></el-icon>
              修改偏好
            </el-button>
            
            <el-button @click="toggleViewMode" size="large">
              <el-icon v-if="viewMode === 'grid'"><menu /></el-icon>
              <el-icon v-else><grid /></el-icon>
              {{ viewMode === 'grid' ? '列表视图' : '网格视图' }}
            </el-button>
          </div>
        </div>
        
        <!-- 推荐结果加载状态 -->
        <div v-if="recommendStore.isRecommending" class="results-loading">
          <el-skeleton :rows="3" animated />
        </div>
        
        <!-- 推荐结果错误状态 -->
        <el-alert
          v-else-if="recommendStore.error"
          type="error"
          :title="recommendStore.error"
          description="生成推荐时发生错误，请稍后重试"
          show-icon
        />
        
        <!-- 无推荐结果 -->
        <el-empty
          v-else-if="recommendResults.length === 0"
          description="没有找到匹配的景点"
        >
          <el-button type="primary" @click="reopenPreferenceForm">重新选择偏好</el-button>
        </el-empty>
        
        <!-- 网格视图 -->
        <div v-else-if="viewMode === 'grid'" class="grid-view">
          <el-row :gutter="24">
            <el-col 
              v-for="(result, index) in recommendResults" 
              :key="result.scenicSpot.id"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
              style="margin-bottom: 24px;"
              :style="{'--el-index': index}"
            >
              <el-card class="spot-card" shadow="hover" @click="navigateToScenic(result.scenicSpot.id)">
                <div class="spot-image-container">
                  <img 
                    :src="result.scenicSpot.images[0]" 
                    :alt="result.scenicSpot.name" 
                    @error="(e: Event) => { if (e.target) (e.target as HTMLImageElement).src = 'https://pic.imgdb.cn/item/65f1a0e89f345e8d03a1c9c5.jpg' }"
                  />
                  <div class="match-badge">
                    <span>{{ Math.round(result.matchScore) }}% 匹配</span>
                  </div>
                </div>
                
                <div class="spot-info">
                  <h3 class="spot-title">{{ result.scenicSpot.name }}</h3>
                  <p class="spot-location">
                    <el-icon><location /></el-icon>
                    {{ result.scenicSpot.location.city }}, {{ result.scenicSpot.location.province }}
                  </p>
                  
                  <div class="spot-description-preview">
                    {{ result.scenicSpot.description.substring(0, 80) }}...
                  </div>
                  
                  <div class="matched-tags">
                    <div class="tags-container">
                      <el-tag
                        v-for="tagId in result.matchTags.slice(0, 3)"
                        :key="tagId"
                        size="small"
                        effect="plain"
                        :color="scenicStore.tagMap.get(tagId)?.color + '20'"
                        :style="{ borderColor: scenicStore.tagMap.get(tagId)?.color }"
                      >
                        {{ scenicStore.tagMap.get(tagId)?.name || '未知' }}
                      </el-tag>
                      
                      <el-tag v-if="result.matchTags.length > 3" size="small" effect="plain">
                        +{{ result.matchTags.length - 3 }}
                      </el-tag>
                    </div>
                  </div>
                  
                  <div class="spot-footer">
                    <div class="spot-price">¥{{ result.scenicSpot.price.adult }} <span class="price-label">起</span></div>
                    <el-rate v-model="result.scenicSpot.rating" disabled text-color="#ff9900" size="small" />
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
        
        <!-- 列表视图 -->
        <div v-else class="list-view">
          <el-card 
            v-for="result in recommendResults" 
            :key="result.scenicSpot.id"
            class="list-item"
            shadow="hover"
            @click="navigateToScenic(result.scenicSpot.id)"
          >
            <div class="list-item-content">
              <div class="list-item-image">
                <img 
                  :src="result.scenicSpot.images[0]" 
                  :alt="result.scenicSpot.name" 
                  @error="(e: Event) => { if (e.target) (e.target as HTMLImageElement).src = 'https://pic.imgdb.cn/item/65f1a0e89f345e8d03a1c9c5.jpg' }"
                />
                <div class="match-badge">
                  <span>{{ Math.round(result.matchScore) }}% 匹配</span>
                </div>
              </div>
              
              <div class="list-item-info">
                <h3 class="spot-title">{{ result.scenicSpot.name }}</h3>
                <p class="spot-location">
                  <el-icon><location /></el-icon>
                  {{ result.scenicSpot.location.city }}, {{ result.scenicSpot.location.province }}, {{ result.scenicSpot.location.country }}
                </p>
                <p class="spot-description-full">{{ result.scenicSpot.description.substring(0, 150) }}...</p>
                
                <div class="matched-tags">
                  <div class="tags-container">
                    <el-tag
                      v-for="tagId in result.matchTags"
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
              </div>
              
              <div class="list-item-meta">
                <div class="price">
                  <strong>¥{{ result.scenicSpot.price.adult }}</strong>
                  <span>起</span>
                </div>
                
                <el-rate 
                  v-model="result.scenicSpot.rating" 
                  disabled 
                  text-color="#ff9900"
                />
                
                <el-button type="primary" plain size="large" @click.stop="navigateToScenic(result.scenicSpot.id)">
                  查看详情
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recommendation-view {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-bottom: 60px;
}

.page-container {
  padding: 40px 20px;
  max-width: 1280px;
  margin: 0 auto;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 40px;
  color: #333;
  position: relative;
  display: inline-block;
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: -12px;
  left: 0;
  height: 5px;
  width: 100px;
  background: linear-gradient(90deg, #3498db, #9b59b6);
  border-radius: 2px;
}

/* 调试信息区域 */
.debug-info {
  margin-bottom: 40px;
  padding: 20px;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
}

.debug-info h2 {
  font-size: 1.8rem;
  margin-bottom: 20px;
  color: #333;
  font-weight: 600;
}

.debug-card {
  border: none;
}

.json-preview {
  max-height: 300px;
  overflow: auto;
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  font-size: 14px;
  font-family: Consolas, Monaco, 'Courier New', monospace;
  line-height: 1.5;
  margin-bottom: 20px;
}

.debug-info ul {
  list-style: none;
  padding: 0;
  margin-bottom: 20px;
}

.debug-info ul li {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  font-size: 16px;
  color: #555;
}

.debug-actions {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-top: 20px;
}

/* 加载状态 */
.loading-container {
  margin: 40px 0;
}

.loading-card {
  max-width: 600px;
  margin: 0 auto;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: none;
}

.loading-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.loading-icon {
  font-size: 24px;
  animation: spin 1.5s linear infinite;
}

.loading-message {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 16px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 偏好表单样式 */
.preference-form {
  margin: 40px 0;
}

.preference-card {
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: none;
}

.preference-header {
  text-align: center;
  margin-bottom: 10px;
}

.preference-header h2 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 15px;
  color: #333;
}

.preference-header p {
  font-size: 16px;
  color: #666;
}

.tag-categories {
  display: flex;
  flex-direction: column;
  gap: 25px;
  margin-bottom: 30px;
}

.category-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
  position: relative;
  display: inline-block;
  padding-left: 15px;
}

.category-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 5px;
  height: 18px;
  width: 4px;
  background: linear-gradient(to bottom, #3498db, #9b59b6);
  border-radius: 2px;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.tag-item {
  padding: 10px 20px;
  border-radius: 20px;
  background-color: #f8f9fa;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.tag-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.tag-item.selected {
  font-weight: 600;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.tag-name {
  position: relative;
  z-index: 2;
}

.form-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
}

.save-button {
  min-width: 200px;
  height: 50px;
  font-size: 16px;
  font-weight: 600;
}

.tags-hint {
  color: #666;
  font-size: 14px;
}

/* 结果头部 */
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
}

.results-info h2 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: #333;
}

.results-summary {
  color: #666;
  font-size: 16px;
  margin-bottom: 10px;
}

.results-explanation {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e67e22;
  font-size: 15px;
  margin-top: 15px;
  padding: 10px;
  background-color: #feefdc;
  border-radius: 8px;
}

.results-actions {
  display: flex;
  gap: 15px;
}

/* 卡片样式 */
.grid-view {
  margin-bottom: 40px;
}

.spot-card {
  height: 100%;
  border-radius: 16px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: none;
  cursor: pointer;
}

.spot-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.spot-image-container {
  height: 220px;
  position: relative;
  overflow: hidden;
}

.spot-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.spot-card:hover .spot-image {
  transform: scale(1.1);
}

.match-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: linear-gradient(135deg, #3498db, #9b59b6);
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.spot-info {
  padding: 20px;
  position: relative;
}

.spot-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 10px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spot-location {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
  margin-bottom: 15px;
  font-size: 0.95rem;
}

.spot-description-preview {
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
  line-height: 1.5;
  height: 60px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.spot-description-full {
  font-size: 15px;
  color: #555;
  margin-bottom: 20px;
  line-height: 1.6;
}

.matched-tags {
  margin-bottom: 15px;
}

.spot-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f1f1f1;
}

.spot-price {
  font-size: 1.2rem;
  font-weight: 700;
  color: #e74c3c;
}

.price-label {
  font-size: 0.8rem;
  font-weight: normal;
  color: #999;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tags-container :deep(.el-tag) {
  border-radius: 15px;
  padding: 0 12px;
  font-weight: 500;
}

/* 列表视图样式 */
.list-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.list-item {
  cursor: pointer;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: none;
}

.list-item:hover {
  transform: translateX(8px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
}

.list-item-content {
  display: flex;
  gap: 25px;
}

.list-item-image {
  flex: 0 0 280px;
  height: 200px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.list-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.list-item:hover .list-item-image img {
  transform: scale(1.05);
}

.list-item-info {
  flex: 1;
  padding: 10px 0;
  min-width: 0; /* 允许子元素溢出收缩 */
}

.list-item-meta {
  flex: 0 0 160px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  padding: 15px 0;
}

.price {
  color: #e74c3c;
  font-weight: 600;
}

.price strong {
  font-size: 1.4rem;
}

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.grid-view .el-col {
  animation: fadeIn 0.5s ease-out forwards;
  animation-delay: calc(var(--el-index, 0) * 0.1s);
  opacity: 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .results-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .results-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .list-item-content {
    flex-direction: column;
  }
  
  .list-item-image {
    flex: 0 0 auto;
    width: 100%;
  }
  
  .list-item-meta {
    flex: 0 0 auto;
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding-top: 15px;
  }
  
  .spot-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .matched-tags {
    margin-bottom: 10px;
  }
}

@media (max-width: 480px) {
  .page-container {
    padding: 20px 10px;
  }
  
  .page-title {
    font-size: 1.8rem;
    margin-bottom: 30px;
  }
  
  .page-title::after {
    bottom: -8px;
    height: 4px;
    width: 60px;
  }
  
  .spot-image-container {
    height: 180px;
  }
  
  .results-actions {
    flex-direction: column;
    width: 100%;
    gap: 10px;
  }
  
  .results-actions .el-button {
    width: 100%;
  }
  
  .results-info h2 {
    font-size: 1.5rem;
  }
  
  .match-badge {
    font-size: 0.8rem;
    padding: 5px 10px;
  }
}
</style>

 