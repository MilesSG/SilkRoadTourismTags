import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useScenicStore, type ScenicSpot } from './scenic'
import { useUserStore, type UserPreference } from './user'

// 推荐结果类型
export interface RecommendResult {
  scenicSpot: ScenicSpot;
  matchScore: number; // 匹配得分，0-100
  matchTags: string[]; // 匹配的标签ID
}

export const useRecommendationStore = defineStore('recommendation', () => {
  const scenicStore = useScenicStore()
  const userStore = useUserStore()
  
  // 状态
  const recommendResults = ref<RecommendResult[]>([])
  const isRecommending = ref(false)
  const error = ref<string | null>(null)
  
  // 计算属性：排序后的结果
  const sortedResults = computed(() => {
    return [...recommendResults.value].sort((a, b) => b.matchScore - a.matchScore)
  })
  
  // 添加简化版推荐函数
  function getSimpleRecommendations(): RecommendResult[] {
    console.log('使用简化版推荐算法')
    
    const results: RecommendResult[] = []
    
    // 如果没有景点数据，返回空结果
    if (scenicStore.scenicSpots.length === 0) {
      console.error('没有景点数据可用')
      return []
    }
    
    // 返回评分最高的5个景点
    const topSpots = [...scenicStore.scenicSpots]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5)
    
    topSpots.forEach(spot => {
      results.push({
        scenicSpot: spot,
        matchScore: 80, // 默认高分
        matchTags: spot.tags.slice(0, 3) // 使用景点的前3个标签
      })
    })
    
    console.log('简化版推荐结果数量:', results.length)
    return results
  }
  
  // 根据用户偏好生成推荐
  async function generateRecommendations() {
    // 确保用户已登录并有偏好
    if (!userStore.userInfo?.preferences) {
      error.value = '请先设置您的偏好';
      console.error('无法生成推荐：没有用户偏好数据');
      return;
    }
    
    isRecommending.value = true;
    error.value = null;
    
    try {
      // 确保景点和标签数据已加载
      if (scenicStore.scenicSpots.length === 0) {
        console.log('加载景点数据');
        await scenicStore.loadScenicSpots();
      }
      
      if (scenicStore.tags.length === 0) {
        console.log('加载标签数据');
        await scenicStore.loadTags();
      }
      
      console.log('数据已加载，景点数量:', scenicStore.scenicSpots.length, '标签数量:', scenicStore.tags.length);
      
      // 计算推荐结果
      recommendResults.value = calculateRecommendations(userStore.userInfo.preferences);
      console.log('推荐计算完成，结果数量:', recommendResults.value.length);
      
      // 确保始终有推荐结果
      if (recommendResults.value.length === 0) {
        console.log('没有匹配结果，使用默认推荐');
        recommendResults.value = getDefaultRecommendations();
      }
    } catch (err) {
      console.error('生成推荐时出错:', err);
      error.value = '生成推荐时发生错误';
      
      // 出错时使用默认推荐
      recommendResults.value = getDefaultRecommendations();
    } finally {
      isRecommending.value = false;
    }
  }
  
  // 提供默认推荐结果（评分最高的景点）
  function getDefaultRecommendations(): RecommendResult[] {
    console.log('使用默认推荐（评分最高的景点）');
    
    const results: RecommendResult[] = [];
    
    // 获取评分最高的5个景点
    const topSpots = [...scenicStore.scenicSpots]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8);
    
    // 为每个景点创建推荐结果
    topSpots.forEach(spot => {
      results.push({
        scenicSpot: spot,
        matchScore: 75, // 默认匹配分数
        matchTags: spot.tags.slice(0, 3) // 使用景点的前3个标签
      });
    });
    
    return results;
  }
  
  // 推荐计算算法（简化版）
  function calculateRecommendations(preferences: UserPreference): RecommendResult[] {
    console.log('开始计算推荐，用户偏好:', preferences.tags);
    
    // 如果用户没有选择标签，返回默认推荐
    if (!preferences.tags || preferences.tags.length === 0) {
      console.log('用户没有选择标签，返回默认推荐');
      return getDefaultRecommendations();
    }
    
    const results: RecommendResult[] = [];
    const allSpotsWithScores: {spot: ScenicSpot, score: number, matchedTags: string[]}[] = [];
    
    // 计算每个景点的匹配分数
    scenicStore.scenicSpots.forEach(spot => {
      // 找出匹配的标签
      const matchedTags = spot.tags.filter(tagId => preferences.tags.includes(tagId));
      
      // 计算基础匹配分数（每个匹配标签20分）
      let score = matchedTags.length * 20;
      
      // 加上景点评分的加成（0-5分映射到0-15分）
      score += spot.rating * 3;
      
      // 控制分数在0-100之间
      score = Math.min(100, Math.max(0, score));
      
      // 收集所有景点的分数和匹配标签
      allSpotsWithScores.push({
        spot,
        score,
        matchedTags
      });
    });
    
    // 按分数排序
    allSpotsWithScores.sort((a, b) => b.score - a.score);
    
    // 取前15个分数最高的景点
    const topRatedSpots = allSpotsWithScores.slice(0, 15);
    
    // 转换为推荐结果
    topRatedSpots.forEach(item => {
      results.push({
        scenicSpot: item.spot,
        matchScore: Math.round(item.score),
        matchTags: item.matchedTags.length > 0 ? item.matchedTags : item.spot.tags.slice(0, 3)
      });
    });
    
    console.log('计算完成，推荐结果数量:', results.length);
    return results;
  }
  
  // 使用标签计算两个景点之间的相似度 (改进权重算法)
  function calculateSimilarity(spotA: ScenicSpot, spotB: ScenicSpot): number {
    // 获取标签及其类别
    const tagsA = spotA.tags.map(tagId => {
      const tag = scenicStore.tagMap.get(tagId)
      return { id: tagId, category: tag?.category || '' }
    })
    
    const tagsB = spotB.tags.map(tagId => {
      const tag = scenicStore.tagMap.get(tagId)
      return { id: tagId, category: tag?.category || '' }
    })
    
    // 按类别分组的标签相似度权重
    const categoryWeights: Record<string, number> = {
      '类型': 2.0, // 类型匹配最重要
      '文化': 1.8, // 文化匹配其次重要
      '地理特征': 1.5, // 地理特征中等重要
      '活动': 1.3,
      '季节': 1.0,
      '预算': 0.8,
      '人群': 0.7
    }
    
    let weightedIntersection = 0
    let weightedUnion = 0
    
    // 所有标签ID
    const allTagIds = new Set([
      ...tagsA.map(t => t.id),
      ...tagsB.map(t => t.id)
    ])
    
    // 计算加权交集和并集
    allTagIds.forEach(tagId => {
      const tagAItem = tagsA.find(t => t.id === tagId)
      const tagBItem = tagsB.find(t => t.id === tagId)
      
      // 确定标签类别
      const category = tagAItem?.category || tagBItem?.category || ''
      // 获取类别权重
      const weight = categoryWeights[category] || 1.0
      
      // 如果两个景点都有这个标签，加到交集
      if (tagAItem && tagBItem) {
        weightedIntersection += weight
      }
      
      // 并集总是要加
      weightedUnion += weight
    })
    
    // 加权Jaccard相似系数
    return weightedUnion > 0 ? weightedIntersection / weightedUnion : 0
  }
  
  // 获取与特定景点相似的其他景点
  function getSimilarSpots(spotId: string, limit = 5): ScenicSpot[] {
    const spot = scenicStore.getScenicSpotById(spotId)
    if (!spot) return []
    
    const similarities: {spot: ScenicSpot, similarity: number}[] = []
    
    scenicStore.scenicSpots.forEach(otherSpot => {
      if (otherSpot.id !== spotId) {
        const similarity = calculateSimilarity(spot, otherSpot)
        similarities.push({spot: otherSpot, similarity})
      }
    })
    
    // 按相似度排序并返回前N个
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.spot)
  }
  
  return {
    recommendResults,
    sortedResults,
    isRecommending,
    error,
    generateRecommendations,
    getSimilarSpots
  }
}) 