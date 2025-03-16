<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useScenicStore } from '@/stores/scenic'
import * as echarts from 'echarts/core'
import { 
  BarChart, 
  PieChart, 
  MapChart,
  LineChart
} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  VisualMapComponent,
  GeoComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 注册必要的组件
echarts.use([
  BarChart,
  PieChart,
  MapChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  VisualMapComponent,
  GeoComponent,
  CanvasRenderer
])

const scenicStore = useScenicStore()
const isLoading = ref(true)
const isLoadingMap = ref(true)

// 图表实例
const tagDistributionChart = ref<echarts.ECharts | null>(null)
const locationDistributionChart = ref<echarts.ECharts | null>(null)
const priceRangeChart = ref<echarts.ECharts | null>(null)
const ratingDistributionChart = ref<echarts.ECharts | null>(null)
const seasonalPopularityChart = ref<echarts.ECharts | null>(null)

// 计算分析数据
const tagAnalysis = computed(() => {
  if (!scenicStore.scenicSpots.length || !scenicStore.tags.length) {
    return [];
  }
  
  const tagCounts: Record<string, number> = {}
  
  // 统计每个标签在景点中出现的次数
  scenicStore.scenicSpots.forEach((spot: any) => {
    spot.tags.forEach((tagId: string) => {
      if (!tagCounts[tagId]) {
        tagCounts[tagId] = 0
      }
      tagCounts[tagId]++
    })
  })
  
  // 按照出现次数排序，找出前15个最受欢迎的标签
  const sortedTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([tagId, count]) => {
      const tag = scenicStore.tagMap.get(tagId)
      return {
        name: tag ? tag.name : tagId,
        value: count,
        itemStyle: {
          color: tag?.color || '#999'
        }
      }
    })
  
  return sortedTags
})

const locationAnalysis = computed(() => {
  if (!scenicStore.scenicSpots.length) {
    return [];
  }
  
  const locations: Record<string, number> = {}
  
  // 统计各地区的景点数量
  scenicStore.scenicSpots.forEach((spot: any) => {
    const province = spot.location.province
    
    if (!locations[province]) {
      locations[province] = 0
    }
    
    locations[province]++
  })
  
  return Object.entries(locations).map(([province, count]) => ({
    name: province,
    value: count
  }))
})

const priceAnalysis = computed(() => {
  if (!scenicStore.scenicSpots.length) {
    return [];
  }
  
  const ranges = [
    { range: '0-50', min: 0, max: 50, count: 0 },
    { range: '51-100', min: 51, max: 100, count: 0 },
    { range: '101-200', min: 101, max: 200, count: 0 },
    { range: '201-300', min: 201, max: 300, count: 0 },
    { range: '301+', min: 301, max: Infinity, count: 0 }
  ]
  
  // 统计各价格区间的景点数量
  scenicStore.scenicSpots.forEach((spot: any) => {
    const price = spot.price.adult
    
    const range = ranges.find(r => price >= r.min && price <= r.max)
    if (range) {
      range.count++
    }
  })
  
  return ranges.map(r => ({
    name: r.range,
    value: r.count
  }))
})

const ratingAnalysis = computed(() => {
  if (!scenicStore.scenicSpots.length) {
    return [];
  }
  
  const ratings = [
    { rating: '5星', value: 5, count: 0 },
    { rating: '4-4.9星', min: 4, max: 4.9, count: 0 },
    { rating: '3-3.9星', min: 3, max: 3.9, count: 0 },
    { rating: '2-2.9星', min: 2, max: 2.9, count: 0 },
    { rating: '1-1.9星', min: 1, max: 1.9, count: 0 }
  ]
  
  // 统计各评分区间的景点数量
  scenicStore.scenicSpots.forEach((spot: any) => {
    const rating = spot.rating
    
    if (rating === 5) {
      ratings[0].count++
      return
    }
    
    const range = ratings.find(r => 
      typeof r.min !== 'undefined' && 
      typeof r.max !== 'undefined' && 
      rating >= r.min && 
      rating <= r.max
    )
    
    if (range) {
      range.count++
    }
  })
  
  return ratings.map(r => ({
    name: r.rating,
    value: r.count
  }))
})

const seasonalAnalysis = computed(() => {
  if (!scenicStore.scenicSpots.length) {
    return [];
  }
  
  const seasons = [
    { name: '春季', count: 0 },
    { name: '夏季', count: 0 },
    { name: '秋季', count: 0 },
    { name: '冬季', count: 0 }
  ]
  
  // 统计各季节适合游览的景点数量
  scenicStore.scenicSpots.forEach((spot: any) => {
    if (spot.bestVisitSeason && spot.bestVisitSeason.length) {
      spot.bestVisitSeason.forEach((season: string) => {
        if (season === '春' || season === '春季') {
          seasons[0].count++;
        } else if (season === '夏' || season === '夏季') {
          seasons[1].count++;
        } else if (season === '秋' || season === '秋季') {
          seasons[2].count++;
        } else if (season === '冬' || season === '冬季') {
          seasons[3].count++;
        }
      })
    }
  })
  
  return seasons
})

// 初始化
onMounted(async () => {
  isLoading.value = true
  
  // 确保数据已加载
  if (scenicStore.scenicSpots.length === 0) {
    await scenicStore.fetchAllScenicSpots()
  }
  
  if (scenicStore.tags.length === 0) {
    await scenicStore.fetchAllTags()
  }
  
  isLoading.value = false
  
  // 等待DOM更新后初始化图表
  setTimeout(() => {
    nextTick(() => {
      try {
        initTagDistributionChart()
        initLocationDistributionChart()
        initPriceRangeChart()
        initRatingDistributionChart()
        initSeasonalPopularityChart()
        
        // 监听窗口大小变化，重新调整图表大小
        window.addEventListener('resize', handleResize)
      } catch (error) {
        console.error('初始化图表失败:', error)
      }
    })
  }, 500) // 添加延时确保DOM已完全渲染
})

// 处理窗口大小变化
function handleResize() {
  tagDistributionChart.value?.resize()
  locationDistributionChart.value?.resize()
  priceRangeChart.value?.resize()
  ratingDistributionChart.value?.resize()
  seasonalPopularityChart.value?.resize()
}

// 初始化标签分布图表
function initTagDistributionChart() {
  const chartDom = document.getElementById('tag-distribution-chart')
  if (!chartDom) {
    console.error('找不到标签分布图表DOM元素')
    return
  }
  
  try {
    tagDistributionChart.value = echarts.init(chartDom)
    
    const option = {
      title: {
        text: '热门标签分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} 个景点'
      },
      series: [
        {
          type: 'bar',
          data: tagAnalysis.value,
          label: {
            show: false
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ],
      xAxis: {
        type: 'category',
        data: tagAnalysis.value.map(item => item.name),
        axisLabel: {
          interval: 0,
          rotate: 45
        }
      },
      yAxis: {
        type: 'value'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '15%',
        containLabel: true
      }
    }
    
    tagDistributionChart.value.setOption(option)
  } catch (error) {
    console.error('初始化标签分布图表失败:', error)
  }
}

// 初始化地域分布图表
function initLocationDistributionChart() {
  const chartDom = document.getElementById('location-distribution-chart')
  if (!chartDom) {
    console.error('找不到地域分布图表DOM元素')
    return
  }
  
  try {
    locationDistributionChart.value = echarts.init(chartDom)
    
    const option = {
      title: {
        text: '景点地域分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} 个景点 ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        type: 'scroll'
      },
      series: [
        {
          type: 'pie',
          radius: '50%',
          data: locationAnalysis.value,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          label: {
            formatter: '{b}: {c} ({d}%)'
          }
        }
      ]
    }
    
    locationDistributionChart.value.setOption(option)
  } catch (error) {
    console.error('初始化地域分布图表失败:', error)
  }
}

// 初始化价格区间图表
function initPriceRangeChart() {
  const chartDom = document.getElementById('price-range-chart')
  if (!chartDom) {
    console.error('找不到价格区间图表DOM元素')
    return
  }
  
  try {
    priceRangeChart.value = echarts.init(chartDom)
    
    const option = {
      title: {
        text: '景点价格区间分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} 个景点 ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],  // 环形图
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: priceAnalysis.value
        }
      ]
    }
    
    priceRangeChart.value.setOption(option)
  } catch (error) {
    console.error('初始化价格区间图表失败:', error)
  }
}

// 初始化评分分布图表
function initRatingDistributionChart() {
  const chartDom = document.getElementById('rating-distribution-chart')
  if (!chartDom) {
    console.error('找不到评分分布图表DOM元素')
    return
  }
  
  try {
    ratingDistributionChart.value = echarts.init(chartDom)
    
    const option = {
      title: {
        text: '景点评分分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: '{b}: {c} 个景点'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ratingAnalysis.value.map(item => item.name)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          type: 'bar',
          data: ratingAnalysis.value.map(item => ({
            value: item.value,
            itemStyle: {
              color: getColorByRating(item.name)
            }
          })),
          label: {
            show: true,
            position: 'top',
            formatter: '{c}'
          }
        }
      ]
    }
    
    ratingDistributionChart.value.setOption(option)
  } catch (error) {
    console.error('初始化评分分布图表失败:', error)
  }
}

// 根据评分获取颜色
function getColorByRating(rating: string) {
  const colors = {
    '5星': '#27ae60',
    '4-4.9星': '#2ecc71',
    '3-3.9星': '#f39c12',
    '2-2.9星': '#e67e22',
    '1-1.9星': '#e74c3c'
  }
  
  return colors[rating as keyof typeof colors] || '#3498db'
}

// 初始化季节热度图表
function initSeasonalPopularityChart() {
  const chartDom = document.getElementById('seasonal-popularity-chart')
  if (!chartDom) {
    console.error('找不到季节热度图表DOM元素')
    return
  }
  
  try {
    seasonalPopularityChart.value = echarts.init(chartDom)
    
    const option = {
      title: {
        text: '季节热度分布',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: '{b}: {c} 个景点'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: seasonalAnalysis.value.map(item => item.name)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          type: 'bar',
          data: seasonalAnalysis.value.map(item => ({
            value: item.count,
            itemStyle: {
              color: getColorBySeason(item.name)
            }
          })),
          label: {
            show: true,
            position: 'top',
            formatter: '{c}'
          }
        }
      ]
    }
    
    seasonalPopularityChart.value.setOption(option)
  } catch (error) {
    console.error('初始化季节热度图表失败:', error)
  }
}

// 根据季节获取颜色
function getColorBySeason(season: string) {
  const colors = {
    '春季': '#27ae60',
    '夏季': '#e74c3c',
    '秋季': '#e67e22',
    '冬季': '#3498db'
  }
  
  return colors[season as keyof typeof colors] || '#999'
}
</script>

<template>
  <div class="data-visualization-view">
    <div class="page-container">
      <h1 class="page-title">数据可视化</h1>
      <p class="page-description">通过图表展示丝绸之路旅游资源的数据分析</p>
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>
      
      <template v-else>
        <!-- 统计概览 -->
        <div class="stats-overview">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card class="stat-card" shadow="hover">
                <div class="stat-content">
                  <div class="stat-icon">
                    <el-icon><place /></el-icon>
                  </div>
                  <div class="stat-info">
                    <h3 class="stat-title">景点总数</h3>
                    <p class="stat-value">{{ scenicStore.scenicSpots.length }}</p>
                  </div>
                </div>
              </el-card>
            </el-col>
            
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card class="stat-card" shadow="hover">
                <div class="stat-content">
                  <div class="stat-icon">
                    <el-icon><price-tag /></el-icon>
                  </div>
                  <div class="stat-info">
                    <h3 class="stat-title">标签总数</h3>
                    <p class="stat-value">{{ scenicStore.tags.length }}</p>
                  </div>
                </div>
              </el-card>
            </el-col>
            
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card class="stat-card" shadow="hover">
                <div class="stat-content">
                  <div class="stat-icon">
                    <el-icon><location /></el-icon>
                  </div>
                  <div class="stat-info">
                    <h3 class="stat-title">覆盖省份</h3>
                    <p class="stat-value">{{ locationAnalysis.length }}</p>
                  </div>
                </div>
              </el-card>
            </el-col>
            
            <el-col :xs="24" :sm="12" :md="8" :lg="6">
              <el-card class="stat-card" shadow="hover">
                <div class="stat-content">
                  <div class="stat-icon">
                    <el-icon><star /></el-icon>
                  </div>
                  <div class="stat-info">
                    <h3 class="stat-title">平均评分</h3>
                    <p class="stat-value">
                      {{ 
                        (scenicStore.scenicSpots.reduce((sum: number, spot: any) => sum + spot.rating, 0) / 
                        scenicStore.scenicSpots.length).toFixed(1) 
                      }}
                    </p>
                  </div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
        
        <!-- 图表展示 -->
        <div class="charts-container">
          <el-row :gutter="20">
            <!-- 标签分布图表 -->
            <el-col :xs="24" :lg="12">
              <el-card class="chart-card" shadow="hover">
                <div id="tag-distribution-chart" class="chart"></div>
              </el-card>
            </el-col>
            
            <!-- 地域分布图表 -->
            <el-col :xs="24" :lg="12">
              <el-card class="chart-card" shadow="hover">
                <div id="location-distribution-chart" class="chart"></div>
              </el-card>
            </el-col>
            
            <!-- 价格区间图表 -->
            <el-col :xs="24" :lg="12">
              <el-card class="chart-card" shadow="hover">
                <div id="price-range-chart" class="chart"></div>
              </el-card>
            </el-col>
            
            <!-- 评分分布图表 -->
            <el-col :xs="24" :lg="12">
              <el-card class="chart-card" shadow="hover">
                <div id="rating-distribution-chart" class="chart"></div>
              </el-card>
            </el-col>
            
            <!-- 季节热度图表 -->
            <el-col :xs="24">
              <el-card class="chart-card" shadow="hover">
                <div id="seasonal-popularity-chart" class="chart"></div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.data-visualization-view {
  padding-bottom: 40px;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 10px;
  color: var(--dark-color);
}

.page-description {
  color: #666;
  margin-bottom: 30px;
}

.loading-container {
  padding: 40px 0;
}

.stats-overview {
  margin-bottom: 30px;
}

.stat-card {
  margin-bottom: 20px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  font-size: 2.5rem;
  color: var(--primary-color);
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 1rem;
  color: #666;
  margin: 0 0 5px 0;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: var(--dark-color);
  margin: 0;
}

.chart-card {
  margin-bottom: 20px;
  height: 400px;
}

.chart {
  width: 100%;
  height: 350px;
  min-height: 350px;
}
</style> 