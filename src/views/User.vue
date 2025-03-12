<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useScenicStore } from '@/stores/scenic'

const router = useRouter()
const userStore = useUserStore()
const scenicStore = useScenicStore()

const isLoading = ref(true)
const activeTab = ref('profile')
const isEditingProfile = ref(false)
const isEditingPreferences = ref(false)
const selectedTags = ref<string[]>([])

// 用户表单
const userForm = ref({
  username: '',
  email: '',
  fullName: '',
  avatar: '',
  phone: '',
  gender: '',
  birthYear: undefined as number | undefined,
  address: ''
})

// 计算用户的偏好标签对象
const preferredTags = computed(() => {
  if (!userStore.user?.preferences?.preferredTags) return []
  
  return userStore.user.preferences.preferredTags
    .map(tagId => scenicStore.tagMap.get(tagId))
    .filter(tag => tag !== undefined)
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

// 初始化
onMounted(async () => {
  isLoading.value = true
  
  // 确保用户已登录
  if (!userStore.isLoggedIn) {
    router.push('/login')
    return
  }
  
  // 加载标签数据
  if (scenicStore.tags.length === 0) {
    await scenicStore.fetchAllTags()
  }
  
  // 初始化表单和选中标签
  if (userStore.user) {
    userForm.value = {
      username: userStore.user.username,
      email: userStore.user.email,
      fullName: userStore.user.fullName || '',
      avatar: userStore.user.avatar || '',
      phone: userStore.user.phone || '',
      gender: userStore.user.gender || '',
      birthYear: userStore.user.birthYear,
      address: userStore.user.address || ''
    }
    
    if (userStore.user.preferences?.preferredTags) {
      selectedTags.value = [...userStore.user.preferences.preferredTags]
    }
  }
  
  isLoading.value = false
})

// 开始编辑个人资料
function startEditingProfile() {
  isEditingProfile.value = true
}

// 保存个人资料
async function saveProfile() {
  try {
    await userStore.updateProfile(userForm.value)
    isEditingProfile.value = false
  } catch (error) {
    console.error('更新个人资料失败:', error)
  }
}

// 取消编辑个人资料
function cancelEditingProfile() {
  // 重置表单
  if (userStore.user) {
    userForm.value = {
      username: userStore.user.username,
      email: userStore.user.email,
      fullName: userStore.user.fullName || '',
      avatar: userStore.user.avatar || '',
      phone: userStore.user.phone || '',
      gender: userStore.user.gender || '',
      birthYear: userStore.user.birthYear,
      address: userStore.user.address || ''
    }
  }
  
  isEditingProfile.value = false
}

// 开始编辑偏好
function startEditingPreferences() {
  if (userStore.user?.preferences?.preferredTags) {
    selectedTags.value = [...userStore.user.preferences.preferredTags]
  } else {
    selectedTags.value = []
  }
  
  isEditingPreferences.value = true
}

// 保存偏好
async function savePreferences() {
  try {
    await userStore.updatePreferences({
      preferredTags: selectedTags.value
    })
    isEditingPreferences.value = false
  } catch (error) {
    console.error('更新偏好失败:', error)
  }
}

// 取消编辑偏好
function cancelEditingPreferences() {
  if (userStore.user?.preferences?.preferredTags) {
    selectedTags.value = [...userStore.user.preferences.preferredTags]
  } else {
    selectedTags.value = []
  }
  
  isEditingPreferences.value = false
}

// 切换标签选择
function toggleTag(tagId: string) {
  const index = selectedTags.value.indexOf(tagId)
  
  if (index === -1) {
    selectedTags.value.push(tagId)
  } else {
    selectedTags.value.splice(index, 1)
  }
}

// 退出登录
function logout() {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="user-view">
    <div class="page-container">
      <h1 class="page-title">个人中心</h1>
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>
      
      <template v-else>
        <!-- 用户信息卡片 -->
        <el-card class="user-card" shadow="hover">
          <div class="user-header">
            <div class="user-avatar">
              <img 
                :src="userStore.user?.avatar || '/default-avatar.png'" 
                :alt="userStore.user?.username"
              />
            </div>
            <div class="user-info">
              <h2 class="user-name">{{ userStore.user?.fullName || userStore.user?.username }}</h2>
              <p class="user-email">{{ userStore.user?.email }}</p>
            </div>
            <div class="user-actions">
              <el-button type="danger" plain @click="logout">
                <el-icon><switch-button /></el-icon>
                退出登录
              </el-button>
            </div>
          </div>
        </el-card>
        
        <!-- 标签页 -->
        <el-tabs v-model="activeTab" class="user-tabs">
          <!-- 个人资料标签页 -->
          <el-tab-pane label="个人资料" name="profile">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>个人资料</span>
                  <el-button 
                    v-if="!isEditingProfile" 
                    type="primary" 
                    plain 
                    @click="startEditingProfile"
                  >
                    编辑资料
                  </el-button>
                </div>
              </template>
              
              <template v-if="isEditingProfile">
                <el-form :model="userForm" label-width="100px">
                  <el-row :gutter="20">
                    <el-col :xs="24" :md="12">
                      <el-form-item label="用户名">
                        <el-input v-model="userForm.username" disabled />
                      </el-form-item>
                    </el-col>
                    
                    <el-col :xs="24" :md="12">
                      <el-form-item label="邮箱">
                        <el-input v-model="userForm.email" disabled />
                      </el-form-item>
                    </el-col>
                    
                    <el-col :xs="24" :md="12">
                      <el-form-item label="姓名">
                        <el-input v-model="userForm.fullName" placeholder="请输入您的姓名" />
                      </el-form-item>
                    </el-col>
                    
                    <el-col :xs="24" :md="12">
                      <el-form-item label="手机号码">
                        <el-input v-model="userForm.phone" placeholder="请输入您的手机号码" />
                      </el-form-item>
                    </el-col>
                    
                    <el-col :xs="24" :md="12">
                      <el-form-item label="性别">
                        <el-select v-model="userForm.gender" placeholder="请选择">
                          <el-option label="男" value="male" />
                          <el-option label="女" value="female" />
                          <el-option label="其他" value="other" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    
                    <el-col :xs="24" :md="12">
                      <el-form-item label="出生年份">
                        <el-date-picker
                          v-model="userForm.birthYear"
                          type="year"
                          placeholder="请选择出生年份"
                          value-format="YYYY"
                        />
                      </el-form-item>
                    </el-col>
                    
                    <el-col :xs="24">
                      <el-form-item label="地址">
                        <el-input 
                          v-model="userForm.address" 
                          type="textarea"
                          placeholder="请输入您的地址"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  
                  <div class="form-actions">
                    <el-button @click="cancelEditingProfile">取消</el-button>
                    <el-button type="primary" @click="saveProfile">保存</el-button>
                  </div>
                </el-form>
              </template>
              
              <template v-else>
                <div class="profile-info">
                  <el-descriptions :column="2" border>
                    <el-descriptions-item label="用户名">{{ userStore.user?.username }}</el-descriptions-item>
                    <el-descriptions-item label="邮箱">{{ userStore.user?.email }}</el-descriptions-item>
                    <el-descriptions-item label="姓名">{{ userStore.user?.fullName || '未设置' }}</el-descriptions-item>
                    <el-descriptions-item label="手机号码">{{ userStore.user?.phone || '未设置' }}</el-descriptions-item>
                    <el-descriptions-item label="性别">
                      {{ userStore.user?.gender ? (userStore.user.gender === 'male' ? '男' : userStore.user.gender === 'female' ? '女' : '其他') : '未设置' }}
                    </el-descriptions-item>
                    <el-descriptions-item label="出生年份">{{ userStore.user?.birthYear || '未设置' }}</el-descriptions-item>
                    <el-descriptions-item label="地址" :span="2">{{ userStore.user?.address || '未设置' }}</el-descriptions-item>
                  </el-descriptions>
                </div>
              </template>
            </el-card>
          </el-tab-pane>
          
          <!-- 偏好设置标签页 -->
          <el-tab-pane label="旅行偏好" name="preferences">
            <el-card>
              <template #header>
                <div class="card-header">
                  <span>旅行偏好</span>
                  <el-button 
                    v-if="!isEditingPreferences" 
                    type="primary" 
                    plain 
                    @click="startEditingPreferences"
                  >
                    编辑偏好
                  </el-button>
                </div>
              </template>
              
              <template v-if="isEditingPreferences">
                <p class="preferences-hint">请选择您感兴趣的标签，我们将为您推荐最匹配的景点</p>
                
                <div class="tag-categories">
                  <div 
                    v-for="(tags, category) in tagsByCategory" 
                    :key="category"
                    class="tag-category"
                  >
                    <h3>{{ category }}</h3>
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
                  <el-button @click="cancelEditingPreferences">取消</el-button>
                  <el-button type="primary" @click="savePreferences">保存</el-button>
                </div>
              </template>
              
              <template v-else>
                <div v-if="preferredTags.length === 0" class="empty-preferences">
                  <el-empty description="您还没有设置旅行偏好" />
                  <el-button type="primary" @click="startEditingPreferences">设置偏好</el-button>
                </div>
                
                <div v-else class="preferences-display">
                  <p class="preferences-summary">
                    您已选择了 <strong>{{ preferredTags.length }}</strong> 个偏好标签
                  </p>
                  
                  <div class="preferences-tags">
                    <el-tag
                      v-for="tag in preferredTags"
                      :key="tag.id"
                      :color="tag.color + '20'"
                      :style="{ borderColor: tag.color }"
                      effect="plain"
                      class="pref-tag"
                    >
                      {{ tag.name }}
                    </el-tag>
                  </div>
                  
                  <p class="preferences-hint">
                    根据您的偏好，我们将为您推荐最合适的景点。
                    <el-link type="primary" :underline="false" @click="router.push('/recommendation')">
                      查看推荐 <el-icon><arrow-right /></el-icon>
                    </el-link>
                  </p>
                </div>
              </template>
            </el-card>
          </el-tab-pane>
        </el-tabs>
      </template>
    </div>
  </div>
</template>

<style scoped>
.user-view {
  padding-bottom: 40px;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 30px;
  color: var(--dark-color);
}

.loading-container {
  padding: 40px 0;
}

.user-card {
  margin-bottom: 30px;
}

.user-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 1.5rem;
  margin: 0 0 5px 0;
  color: var(--dark-color);
}

.user-email {
  color: #666;
  margin: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 10px;
}

.empty-preferences {
  padding: 30px 0;
  text-align: center;
}

.preferences-summary {
  margin-bottom: 20px;
  color: #666;
}

.preferences-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.pref-tag {
  margin-right: 0;
}

.preferences-hint {
  color: #666;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.tag-categories {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.tag-category h3 {
  margin-bottom: 10px;
  color: #666;
  font-size: 1.1rem;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-item {
  padding: 8px 15px;
  border-radius: 20px;
  border: 2px solid transparent;
  background-color: #f5f5f5;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tag-item:hover {
  background-color: #eeeeee;
}

.tag-item.selected {
  border-color: var(--primary-color);
}

.tag-name {
  font-size: 0.9rem;
}

.user-tabs {
  margin-bottom: 30px;
}

@media (max-width: 768px) {
  .user-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .user-actions {
    width: 100%;
    display: flex;
    justify-content: center;
  }
}
</style> 