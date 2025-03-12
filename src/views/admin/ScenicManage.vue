<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useScenicStore } from '@/stores/scenic'
import { ElMessage, ElMessageBox } from 'element-plus'

const scenicStore = useScenicStore()
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加景点')
const isEdit = ref(false)
const searchQuery = ref('')

// 分页设置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 景点表单
const scenicForm = ref({
  id: '',
  name: '',
  description: '',
  location: '',
  images: [],
  tags: [],
  price: 0,
  openingHours: '',
  bestSeasons: [],
  rating: 0,
  visitDuration: ''
})

// 验证规则
const rules = {
  name: [{ required: true, message: '请输入景点名称', trigger: 'blur' }],
  description: [{ required: true, message: '请输入景点描述', trigger: 'blur' }],
  location: [{ required: true, message: '请输入景点位置', trigger: 'blur' }]
}

// 表单引用
const formRef = ref()

// 计算过滤后的景点列表
const filteredScenicList = computed(() => {
  if (!searchQuery.value) {
    return scenicStore.scenicSpots
  }
  
  const query = searchQuery.value.toLowerCase()
  return scenicStore.scenicSpots.filter(spot => {
    return spot.name.toLowerCase().includes(query) ||
           spot.description.toLowerCase().includes(query) ||
           spot.location.toLowerCase().includes(query)
  })
})

// 分页后的景点列表
const paginatedScenicList = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  
  const filtered = filteredScenicList.value
  pagination.total = filtered.length
  
  return filtered.slice(start, end)
})

// 加载景点和标签数据
async function loadData() {
  loading.value = true
  try {
    await Promise.all([
      scenicStore.loadScenicSpots(),
      scenicStore.loadTags()
    ])
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 打开添加景点对话框
function openAddDialog() {
  isEdit.value = false
  dialogTitle.value = '添加景点'
  resetForm()
  dialogVisible.value = true
}

// 打开编辑景点对话框
function openEditDialog(scenic) {
  isEdit.value = true
  dialogTitle.value = '编辑景点'
  
  // 复制景点数据到表单
  scenicForm.value = { ...scenic }
  
  dialogVisible.value = true
}

// 重置表单
function resetForm() {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  scenicForm.value = {
    id: '',
    name: '',
    description: '',
    location: '',
    images: [],
    tags: [],
    price: 0,
    openingHours: '',
    bestSeasons: [],
    rating: 0,
    visitDuration: ''
  }
}

// 提交表单
async function submitForm() {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          // 更新景点
          await scenicStore.updateScenicSpot(scenicForm.value)
          ElMessage.success('景点更新成功')
        } else {
          // 添加景点
          await scenicStore.addScenicSpot(scenicForm.value)
          ElMessage.success('景点添加成功')
        }
        
        dialogVisible.value = false
        loadData() // 重新加载数据
      } catch (error) {
        ElMessage.error('操作失败')
        console.error(error)
      }
    }
  })
}

// 删除景点
function confirmDelete(scenic) {
  ElMessageBox.confirm(
    `确定要删除景点 "${scenic.name}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await scenicStore.deleteScenicSpot(scenic.id)
      ElMessage.success('景点删除成功')
      loadData() // 重新加载数据
    } catch (error) {
      ElMessage.error('删除失败')
      console.error(error)
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 处理页码变化
function handleCurrentChange(val) {
  pagination.currentPage = val
}

// 处理每页显示数量变化
function handleSizeChange(val) {
  pagination.pageSize = val
  pagination.currentPage = 1
}

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="scenic-manage-view">
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">景点管理</h1>
        <div class="header-actions">
          <el-input
            v-model="searchQuery"
            placeholder="搜索景点名称/描述/位置"
            clearable
            class="search-input"
          >
            <template #prefix>
              <el-icon><search /></el-icon>
            </template>
          </el-input>
          
          <el-button type="primary" @click="openAddDialog">
            <el-icon><plus /></el-icon>添加景点
          </el-button>
        </div>
      </div>
      
      <!-- 景点表格 -->
      <el-card shadow="hover" class="data-table-card">
        <el-table
          v-loading="loading"
          :data="paginatedScenicList"
          style="width: 100%"
          border
          stripe
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="名称" min-width="150" />
          <el-table-column prop="location" label="位置" min-width="150" />
          <el-table-column label="标签" min-width="200">
            <template #default="{ row }">
              <el-tag
                v-for="tag in row.tags"
                :key="tag"
                size="small"
                class="tag-item"
              >
                {{ tag }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="价格" width="100">
            <template #default="{ row }">
              {{ row.price }} 元
            </template>
          </el-table-column>
          <el-table-column prop="rating" label="评分" width="100">
            <template #default="{ row }">
              <el-rate
                v-model="row.rating"
                disabled
                text-color="#ff9900"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openEditDialog(row)">
                编辑
              </el-button>
              <el-button type="danger" link @click="confirmDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
      
      <!-- 添加/编辑景点对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="60%"
        destroy-on-close
      >
        <el-form
          ref="formRef"
          :model="scenicForm"
          :rules="rules"
          label-width="100px"
        >
          <el-form-item label="名称" prop="name">
            <el-input v-model="scenicForm.name" />
          </el-form-item>
          
          <el-form-item label="描述" prop="description">
            <el-input
              v-model="scenicForm.description"
              type="textarea"
              :rows="4"
            />
          </el-form-item>
          
          <el-form-item label="位置" prop="location">
            <el-input v-model="scenicForm.location" />
          </el-form-item>
          
          <el-form-item label="价格" prop="price">
            <el-input-number
              v-model="scenicForm.price"
              :min="0"
              :precision="2"
              :step="10"
            />
          </el-form-item>
          
          <el-form-item label="开放时间" prop="openingHours">
            <el-input v-model="scenicForm.openingHours" />
          </el-form-item>
          
          <el-form-item label="最佳季节" prop="bestSeasons">
            <el-select
              v-model="scenicForm.bestSeasons"
              multiple
              placeholder="选择最佳游览季节"
            >
              <el-option label="春季" value="春季" />
              <el-option label="夏季" value="夏季" />
              <el-option label="秋季" value="秋季" />
              <el-option label="冬季" value="冬季" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="游览时长" prop="visitDuration">
            <el-input v-model="scenicForm.visitDuration" />
          </el-form-item>
          
          <el-form-item label="评分" prop="rating">
            <el-rate v-model="scenicForm.rating" />
          </el-form-item>
          
          <el-form-item label="标签" prop="tags">
            <el-select
              v-model="scenicForm.tags"
              multiple
              filterable
              collapse-tags
              placeholder="选择标签"
              style="width: 100%"
            >
              <el-option-group
                v-for="group in scenicStore.tagsByCategory"
                :key="group.category"
                :label="group.category"
              >
                <el-option
                  v-for="tag in group.tags"
                  :key="tag.id"
                  :label="tag.name"
                  :value="tag.name"
                />
              </el-option-group>
            </el-select>
          </el-form-item>
          
          <el-form-item label="图片" prop="images">
            <el-upload
              action="#"
              list-type="picture-card"
              :auto-upload="false"
              :limit="5"
            >
              <el-icon><plus /></el-icon>
            </el-upload>
            <div class="el-upload__tip">
              图片不会真正上传，这里只是示意。实际项目中需要配置上传服务。
            </div>
          </el-form-item>
        </el-form>
        
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitForm">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<style scoped>
.scenic-manage-view {
  padding-bottom: 40px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 2rem;
  margin: 0;
  color: var(--dark-color);
}

.header-actions {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.search-input {
  width: 300px;
}

.data-table-card {
  margin-bottom: 20px;
}

.tag-item {
  margin-right: 5px;
  margin-bottom: 5px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    margin-top: 15px;
    flex-wrap: wrap;
  }
  
  .search-input {
    width: 100%;
  }
}
</style> 