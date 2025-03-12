<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useScenicStore } from '@/stores/scenic'

const scenicStore = useScenicStore()
const isLoading = ref(true)

// 搜索过滤
const searchQuery = ref('')

// 标签编辑相关
const editingTag = ref<any>(null)
const isEditing = ref(false)
const tagForm = ref({
  id: '',
  name: '',
  category: '',
  color: '#3498db'
})

// 按类别组织标签
const tagsByCategory = computed(() => {
  const filtered = scenicStore.tags.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    tag.category.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
  
  const result: Record<string, any[]> = {}
  
  filtered.forEach(tag => {
    if (!result[tag.category]) {
      result[tag.category] = []
    }
    
    result[tag.category].push(tag)
  })
  
  return result
})

// 初始化
onMounted(async () => {
  isLoading.value = true
  
  if (scenicStore.tags.length === 0) {
    await scenicStore.fetchAllTags()
  }
  
  isLoading.value = false
})

// 编辑标签
function editTag(tag: any) {
  editingTag.value = tag
  tagForm.value = {
    id: tag.id,
    name: tag.name,
    category: tag.category,
    color: tag.color
  }
  isEditing.value = true
}

// 创建新标签
function createNewTag() {
  editingTag.value = null
  tagForm.value = {
    id: generateId(),
    name: '',
    category: '',
    color: getRandomColor()
  }
  isEditing.value = true
}

// 保存标签
function saveTag() {
  // 在真实应用中，这里会调用API进行保存
  if (editingTag.value) {
    // 更新现有标签
    const index = scenicStore.tags.findIndex(t => t.id === editingTag.value.id)
    if (index !== -1) {
      scenicStore.tags[index] = { ...tagForm.value }
    }
  } else {
    // 添加新标签
    scenicStore.tags.push({ ...tagForm.value })
  }
  
  // 关闭对话框
  isEditing.value = false
}

// 删除标签
function deleteTag(tag: any) {
  // 在真实应用中，这里会调用API进行删除
  const index = scenicStore.tags.findIndex(t => t.id === tag.id)
  if (index !== -1) {
    scenicStore.tags.splice(index, 1)
  }
}

// 生成随机ID
function generateId() {
  return 'tag_' + Math.random().toString(36).substr(2, 9)
}

// 获取随机颜色
function getRandomColor() {
  const colors = [
    '#3498db', // 蓝色
    '#2ecc71', // 绿色
    '#e74c3c', // 红色
    '#f39c12', // 橙色
    '#9b59b6', // 紫色
    '#1abc9c', // 青绿色
    '#34495e', // 深蓝色
    '#e67e22', // 橙红色
    '#16a085', // 深绿色
    '#c0392b'  // 深红色
  ]
  
  return colors[Math.floor(Math.random() * colors.length)]
}
</script>

<template>
  <div class="tags-view">
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">标签管理</h1>
        <div class="page-actions">
          <el-input
            v-model="searchQuery"
            placeholder="搜索标签或类别..."
            prefix-icon="search"
            clearable
            class="search-input"
          />
          <el-button type="primary" @click="createNewTag">
            <el-icon><plus /></el-icon>
            创建标签
          </el-button>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>
      
      <!-- 标签列表 -->
      <div v-else class="tags-container">
        <template v-if="Object.keys(tagsByCategory).length === 0">
          <el-empty description="没有找到匹配的标签" />
        </template>
        
        <template v-else>
          <div 
            v-for="(tags, category) in tagsByCategory" 
            :key="category"
            class="tag-category"
          >
            <h2 class="category-title">{{ category }}</h2>
            <div class="tags-grid">
              <el-card
                v-for="tag in tags"
                :key="tag.id"
                class="tag-card"
                shadow="hover"
                :style="{ borderTopColor: tag.color }"
              >
                <div class="tag-header">
                  <div class="tag-color" :style="{ backgroundColor: tag.color }"></div>
                  <h3 class="tag-name">{{ tag.name }}</h3>
                </div>
                
                <div class="tag-content">
                  <p class="tag-info">类别: {{ tag.category }}</p>
                  <p class="tag-info">ID: {{ tag.id }}</p>
                </div>
                
                <div class="tag-actions">
                  <el-button-group>
                    <el-button type="primary" text @click="editTag(tag)">
                      <el-icon><edit /></el-icon>
                    </el-button>
                    <el-popconfirm
                      title="确定要删除此标签吗？"
                      @confirm="deleteTag(tag)"
                    >
                      <template #reference>
                        <el-button type="danger" text>
                          <el-icon><delete /></el-icon>
                        </el-button>
                      </template>
                    </el-popconfirm>
                  </el-button-group>
                </div>
              </el-card>
            </div>
          </div>
        </template>
      </div>
      
      <!-- 标签编辑对话框 -->
      <el-dialog
        v-model="isEditing"
        :title="editingTag ? '编辑标签' : '创建标签'"
        width="500px"
      >
        <el-form :model="tagForm" label-width="80px">
          <el-form-item label="名称">
            <el-input v-model="tagForm.name" placeholder="请输入标签名称" />
          </el-form-item>
          
          <el-form-item label="类别">
            <el-input v-model="tagForm.category" placeholder="请输入类别名称" />
          </el-form-item>
          
          <el-form-item label="颜色">
            <el-color-picker v-model="tagForm.color" show-alpha />
          </el-form-item>
        </el-form>
        
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="isEditing = false">取消</el-button>
            <el-button type="primary" @click="saveTag">保存</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<style scoped>
.tags-view {
  padding-bottom: 40px;
}

.page-container {
  position: relative;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 2rem;
  color: var(--dark-color);
  margin: 0;
}

.page-actions {
  display: flex;
  gap: 15px;
}

.search-input {
  width: 250px;
}

.loading-container {
  padding: 20px 0;
}

.tags-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.tag-category {
  margin-bottom: 15px;
}

.category-title {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: var(--dark-color);
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
}

.tags-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.tag-card {
  position: relative;
  border-top: 4px solid transparent;
  transition: all 0.3s ease;
}

.tag-card:hover {
  transform: translateY(-5px);
}

.tag-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.tag-color {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.tag-name {
  font-size: 1.1rem;
  margin: 0;
  color: var(--dark-color);
}

.tag-content {
  margin-bottom: 15px;
}

.tag-info {
  margin: 5px 0;
  color: #666;
  font-size: 0.9rem;
}

.tag-actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .page-actions {
    width: 100%;
  }
  
  .search-input {
    width: 100%;
  }
  
  .tags-grid {
    grid-template-columns: 1fr;
  }
}
</style> 