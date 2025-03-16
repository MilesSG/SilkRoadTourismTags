<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useScenicStore, type Tag, type ScenicSpot } from '@/stores/scenic'

const router = useRouter()
const scenicStore = useScenicStore()

// 搜索和筛选条件
const searchQuery = ref('')
const selectedTags = ref<string[]>([])
const activeTagCategories = ref<string[]>(['类型', '地理特征', '文化'])
const sortOption = ref('rating')

// 列表视图或网格视图
const viewMode = ref<'grid' | 'list'>('grid')

// 分页相关
const currentPage = ref(1)
const pageSize = ref(8)

// 标签分类
const tagCategories = computed(() => {
  const categories = new Set<string>()
  scenicStore.tags.forEach(tag => {
    categories.add(tag.category)
  })
  return Array.from(categories).sort()
})

// 按分类组织标签
const tagsByCategory = computed(() => {
  const grouped: Record<string, Tag[]> = {}
  
  tagCategories.value.forEach(category => {
    grouped[category] = scenicStore.tags.filter(tag => tag.category === category)
  })
  
  return grouped
})

// 筛选后的景点
const filteredSpots = computed(() => {
  let result = [...scenicStore.scenicSpots]
  
  // 关键词搜索
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(spot => 
      spot.name.toLowerCase().includes(query) || 
      spot.description.toLowerCase().includes(query) ||
      spot.location.city.toLowerCase().includes(query) ||
      spot.location.country.toLowerCase().includes(query)
    )
  }
  
  // 标签筛选
  if (selectedTags.value.length > 0) {
    result = result.filter(spot => 
      selectedTags.value.some(tagId => spot.tags.includes(tagId))
    )
  }
  
  // 排序
  result = sortSpots(result, sortOption.value)
  
  return result
})

// 分页后的景点
const paginatedSpots = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredSpots.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => 
  Math.ceil(filteredSpots.value.length / pageSize.value)
)

// 排序方法
function sortSpots(spots: ScenicSpot[], option: string) {
  switch (option) {
    case 'rating':
      return [...spots].sort((a, b) => b.rating - a.rating)
    case 'price-asc':
      return [...spots].sort((a, b) => a.price.adult - b.price.adult)
    case 'price-desc':
      return [...spots].sort((a, b) => b.price.adult - a.price.adult)
    case 'name':
      return [...spots].sort((a, b) => a.name.localeCompare(b.name))
    default:
      return spots
  }
}

// 切换标签选择
function toggleTag(tagId: string) {
  const index = selectedTags.value.indexOf(tagId)
  if (index === -1) {
    selectedTags.value.push(tagId)
  } else {
    selectedTags.value.splice(index, 1)
  }
  // 重置为第一页
  currentPage.value = 1
}

// 切换标签类别显示
function toggleTagCategory(category: string) {
  const index = activeTagCategories.value.indexOf(category)
  if (index === -1) {
    activeTagCategories.value.push(category)
  } else {
    activeTagCategories.value.splice(index, 1)
  }
}

// 清除所有筛选
function clearFilters() {
  searchQuery.value = ''
  selectedTags.value = []
  currentPage.value = 1
}

// 查看景点详情
function viewScenicDetails(id: string) {
  router.push(`/scenic/${id}`)
}

// 监听筛选条件变化，重置页码
watch([searchQuery, selectedTags, sortOption], () => {
  currentPage.value = 1
})

// 页面初始化
onMounted(async () => {
  if (scenicStore.scenicSpots.length === 0) {
    await scenicStore.loadScenicSpots()
  }
  
  if (scenicStore.tags.length === 0) {
    await scenicStore.loadTags()
  }
})

// 获取标签类型，用于标签颜色
function getTagType(tagId: string): '' | 'success' | 'warning' | 'info' | 'danger' {
  const tag = scenicStore.tagMap.get(tagId);
  if (!tag) return '';
  
  // 根据标签类别分配类型
  switch (tag.category) {
    case '类型':
      return 'primary';
    case '地理特征':
      return 'success';
    case '文化':
      return 'info';
    case '活动':
      return 'warning';
    case '季节':
      return 'danger';
    default:
      return '';
  }
}

// 获取标签名称
function getTagName(tagId: string): string {
  const tag = scenicStore.tagMap.get(tagId);
  return tag?.name || '未知标签';
}

// 获取基于ID的渐变色索引
function getGradientIndex(id: string): number {
  return id.charCodeAt(0) % 5;
}
</script>

<template>
  <div class="scenic-view">
    <div class="scenic-header">
      <div class="page-container">
        <h1 class="page-title">丝绸之路景点浏览</h1>
        <p class="page-desc">探索古老丝绸之路上的壮丽景观和人文遗迹</p>
      </div>
      <div class="header-banner"></div>
    </div>
    
    <div class="page-container">
      <!-- 搜索和视图控制 -->
      <div class="search-controls">
        <div class="search-box">
          <el-input 
            v-model="searchQuery" 
            placeholder="搜索景点名称、描述或位置" 
            prefix-icon="el-icon-search"
            clearable
          />
        </div>
        
        <div class="view-controls">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button label="grid">
              <el-icon><grid /></el-icon>
            </el-radio-button>
            <el-radio-button label="list">
              <el-icon><menu /></el-icon>
            </el-radio-button>
          </el-radio-group>
          
          <el-select v-model="sortOption" placeholder="排序方式" size="small">
            <el-option label="评分高→低" value="rating" />
            <el-option label="价格低→高" value="price-asc" />
            <el-option label="价格高→低" value="price-desc" />
            <el-option label="名称" value="name" />
          </el-select>
        </div>
      </div>
      
      <!-- 主内容区 -->
      <div class="main-content">
        <!-- 侧边栏筛选 -->
        <div class="filter-sidebar">
          <div class="filter-header">
            <h3>筛选条件</h3>
            <el-button type="text" @click="clearFilters" v-if="selectedTags.length > 0 || searchQuery">
              清除筛选
            </el-button>
          </div>
          
          <div class="tag-filters">
            <div v-for="category in tagCategories" :key="category" class="tag-category">
              <div 
                class="category-header" 
                @click="toggleTagCategory(category)"
                :class="{ 'is-active': activeTagCategories.includes(category) }"
              >
                <h4>{{ category }}</h4>
                <el-icon>
                  <arrow-down v-if="activeTagCategories.includes(category)" />
                  <arrow-right v-else />
                </el-icon>
              </div>
              
              <div 
                v-show="activeTagCategories.includes(category)"
                class="category-tags"
              >
                <el-checkbox
                  v-for="tag in tagsByCategory[category]"
                  :key="tag.id"
                  :label="tag.name"
                  :style="{ borderColor: tag.color }"
                  :checked="selectedTags.includes(tag.id)"
                  @change="toggleTag(tag.id)"
                  class="tag-checkbox"
                >
                  <span class="tag-name">{{ tag.name }}</span>
                </el-checkbox>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 景点列表 -->
        <div class="scenic-list-container">
          <div class="result-info">
            <span>共找到 <strong>{{ filteredSpots.length }}</strong> 个景点</span>
          </div>
          
          <!-- 加载提示 -->
          <div v-if="scenicStore.isLoading" class="loading-container">
            <el-skeleton :rows="3" animated />
            <el-skeleton :rows="3" animated />
          </div>
          
          <!-- 错误提示 -->
          <el-alert
            v-else-if="scenicStore.error"
            :title="scenicStore.error"
            type="error"
            :closable="false"
            show-icon
          />
          
          <!-- 无结果提示 -->
          <el-empty
            v-else-if="filteredSpots.length === 0"
            description="没有找到符合条件的景点"
          >
            <el-button @click="clearFilters">清除筛选</el-button>
          </el-empty>
          
          <!-- 网格视图 -->
          <div v-else-if="viewMode === 'grid'" class="scenic-grid">
            <el-row :gutter="20">
              <el-col v-for="spot in paginatedSpots" :key="spot.id" :xs="24" :sm="12" :md="8" :lg="6" :xl="6" class="scenic-col">
                <div class="scenic-card-wrapper">
                  <el-card class="scenic-card" shadow="hover" @click="viewScenicDetails(spot.id)">
                    <div class="card-gradient" :class="`gradient-${getGradientIndex(spot.id)}`">
                      <div class="card-overlay">
                        <div class="scenic-icon">
                          <el-icon size="32"><location-filled /></el-icon>
                        </div>
                        <div class="card-bottom">
                          <h3 class="card-title">{{ spot.name }}</h3>
                          <div class="scenic-rating">
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
                    <div class="scenic-content">
                      <p class="scenic-location">
                        <el-icon><location /></el-icon>
                        {{ spot.location.province }} · {{ spot.location.city }}
                      </p>
                      <p class="scenic-description">{{ spot.description.substring(0, 50) }}...</p>
                      <div class="scenic-price">
                        <el-icon><ticket /></el-icon> 门票 ¥{{ spot.price.adult }}
                      </div>
                      <div class="scenic-tags">
                        <el-tag 
                          v-for="tagId in spot.tags.slice(0, 3)" 
                          :key="tagId" 
                          size="small" 
                          :type="getTagType(tagId)"
                          effect="plain"
                          class="tag-item"
                        >
                          {{ getTagName(tagId) }}
                        </el-tag>
                      </div>
                    </div>
                  </el-card>
                </div>
              </el-col>
            </el-row>
          </div>
          
          <!-- 列表视图 -->
          <div v-else class="list-view">
            <el-table
              :data="paginatedSpots"
              style="width: 100%"
              @row-click="(row) => viewScenicDetails(row.id)"
              :row-class-name="'clickable-row'"
            >
              <el-table-column label="景点" min-width="220">
                <template #default="{ row }">
                  <div class="list-item-info">
                    <div class="list-gradient-container" :class="`gradient-${getGradientIndex(row.id)}`">
                      <el-icon size="24"><location-filled /></el-icon>
                    </div>
                    <div>
                      <div class="list-title">{{ row.name }}</div>
                      <div class="list-location">
                        <el-icon><location /></el-icon>
                        {{ row.location.province }}, {{ row.location.city }}
                      </div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column label="评分" width="120">
                <template #default="{ row }">
                  <el-rate v-model="row.rating" disabled text-color="#ff9900" />
                </template>
              </el-table-column>
              
              <el-table-column label="门票" width="100" prop="price.adult">
                <template #default="{ row }">
                  <span>¥{{ row.price.adult }}</span>
                </template>
              </el-table-column>
              
              <el-table-column label="标签" min-width="200">
                <template #default="{ row }">
                  <div class="list-tags">
                    <el-tag
                      v-for="tagId in row.tags.slice(0, 3)"
                      :key="tagId"
                      size="small"
                      :type="getTagType(tagId)"
                      effect="plain"
                      class="tag-item"
                    >
                      {{ getTagName(tagId) }}
                    </el-tag>
                    <el-tag v-if="row.tags.length > 3" size="small" type="info">
                      +{{ row.tags.length - 3 }}
                    </el-tag>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column label="最佳季节" width="100">
                <template #default="{ row }">
                  <span>{{ row.bestVisitSeason.join('/') }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
          
          <!-- 分页控制 -->
          <div class="pagination-container" v-if="filteredSpots.length > 0">
            <el-pagination
              v-model:current-page="currentPage"
              :page-size="pageSize"
              layout="prev, pager, next, jumper"
              :total="filteredSpots.length"
              background
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scenic-view {
  padding-bottom: 40px;
}

.scenic-header {
  position: relative;
  padding: 60px 0;
  margin-bottom: 30px;
  color: white;
  text-align: center;
  background-color: rgba(30, 60, 114, 0.9);
}

.header-banner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  background-size: cover;
  background-position: center;
  z-index: -1;
}

.page-title {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  font-weight: 700;
  color: #ffffff;
}

.page-desc {
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  color: #ffffff;
}

.search-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.search-box {
  width: 300px;
}

.view-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.main-content {
  display: flex;
  gap: 20px;
}

.filter-sidebar {
  flex: 0 0 250px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  max-height: calc(100vh - 200px);
  position: sticky;
  top: 100px;
  overflow-y: auto;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.filter-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--dark-color);
}

.tag-category {
  margin-bottom: 15px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  margin-bottom: 10px;
  user-select: none;
}

.category-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.category-header.is-active h4 {
  color: var(--primary-color);
}

.category-tags {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 10px;
}

.tag-checkbox {
  display: block;
  margin-bottom: 5px;
}

.tag-name {
  margin-left: 5px;
}

.scenic-list-container {
  flex: 1;
}

.result-info {
  margin-bottom: 15px;
  color: #666;
}

.scenic-grid {
  margin-bottom: 20px;
}

.scenic-card {
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.scenic-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.scenic-rating {
  display: flex;
  justify-content: flex-start;
}

.scenic-content {
  padding: 15px;
}

.scenic-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 5px;
  color: var(--dark-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scenic-location {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.scenic-price {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.scenic-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag-item {
  margin-right: 5px;
}

.list-view {
  margin-bottom: 20px;
}

.list-item-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.list-gradient-container {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
  position: relative;
}

.list-title {
  font-weight: 600;
  margin-bottom: 5px;
}

.list-location {
  color: #666;
  font-size: 0.9rem;
}

.list-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.clickable-row {
  cursor: pointer;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.loading-container {
  padding: 20px;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .filter-sidebar {
    flex: 0 0 auto;
    max-height: none;
    position: static;
    margin-bottom: 20px;
    width: 100%;
  }
  
  .search-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    width: 100%;
  }
  
  .view-controls {
    justify-content: space-between;
    margin-top: 10px;
  }
}

.scenic-card-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 4px;
}

.scenic-card:hover .card-gradient {
  transform: scale(1.05);
}

/* 卡片渐变色背景 */
.card-gradient {
  height: 140px;
  position: relative;
  transition: transform 0.3s ease;
  overflow: hidden;
  border-radius: 8px 8px 0 0;
}

.card-overlay {
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

.card-bottom {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  line-height: 1.3;
}

.scenic-icon {
  color: white;
  align-self: flex-end;
}

.scenic-description {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 10px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

/* 增强图标和文字搭配 */
.scenic-location,
.scenic-price {
  display: flex;
  align-items: center;
  gap: 5px;
}

.scenic-location .el-icon,
.scenic-price .el-icon {
  color: var(--primary-color);
}
</style> 