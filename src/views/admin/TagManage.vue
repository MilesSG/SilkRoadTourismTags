<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useScenicStore } from '@/stores/scenic'
import { ElMessage, ElMessageBox } from 'element-plus'

const scenicStore = useScenicStore()
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加标签')
const isEdit = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('全部')

// 分页设置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 标签表单
const tagForm = ref({
  id: '',
  name: '',
  category: ''
})

// 验证规则
const rules = {
  name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择标签分类', trigger: 'change' }]
}

// 表单引用
const formRef = ref()

// 所有标签分类
const categories = computed(() => {
  const cats = ['全部']
  if (scenicStore.tags && scenicStore.tags.length > 0) {
    const uniqueCategories = [...new Set(scenicStore.tags.map(tag => tag.category))]
    cats.push(...uniqueCategories)
  }
  return cats
})

// 计算过滤后的标签列表
const filteredTags = computed(() => {
  let result = scenicStore.tags
  
  // 按分类过滤
  if (selectedCategory.value !== '全部') {
    result = result.filter(tag => tag.category === selectedCategory.value)
  }
  
  // 按搜索词过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(tag => tag.name.toLowerCase().includes(query))
  }
  
  return result
})

// 分页后的标签列表
const paginatedTags = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  
  const filtered = filteredTags.value
  pagination.total = filtered.length
  
  return filtered.slice(start, end)
})

// 加载标签数据
async function loadData() {
  loading.value = true
  try {
    await scenicStore.loadTags()
  } catch (error) {
    ElMessage.error('加载数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 打开添加标签对话框
function openAddDialog() {
  isEdit.value = false
  dialogTitle.value = '添加标签'
  resetForm()
  dialogVisible.value = true
}

// 打开编辑标签对话框
function openEditDialog(tag) {
  isEdit.value = true
  dialogTitle.value = '编辑标签'
  
  // 复制标签数据到表单
  tagForm.value = { ...tag }
  
  dialogVisible.value = true
}

// 重置表单
function resetForm() {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  tagForm.value = {
    id: '',
    name: '',
    category: ''
  }
}

// 提交表单
async function submitForm() {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          // 更新标签
          await scenicStore.updateTag(tagForm.value)
          ElMessage.success('标签更新成功')
        } else {
          // 添加标签
          await scenicStore.addTag({
            ...tagForm.value,
            id: `tag-${Date.now()}`
          })
          ElMessage.success('标签添加成功')
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

// 删除标签
function confirmDelete(tag) {
  ElMessageBox.confirm(
    `确定要删除标签 "${tag.name}" 吗？这可能会影响已使用该标签的景点数据。`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await scenicStore.deleteTag(tag.id)
      ElMessage.success('标签删除成功')
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
  <div class="tag-manage-view">
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">标签管理</h1>
        <div class="header-actions">
          <el-select 
            v-model="selectedCategory" 
            placeholder="选择分类" 
            class="category-select"
          >
            <el-option 
              v-for="category in categories" 
              :key="category" 
              :label="category" 
              :value="category" 
            />
          </el-select>
          
          <el-input
            v-model="searchQuery"
            placeholder="搜索标签名称"
            clearable
            class="search-input"
          >
            <template #prefix>
              <el-icon><search /></el-icon>
            </template>
          </el-input>
          
          <el-button type="primary" @click="openAddDialog">
            <el-icon><plus /></el-icon>添加标签
          </el-button>
        </div>
      </div>
      
      <!-- 标签表格 -->
      <el-card shadow="hover" class="data-table-card">
        <el-table
          v-loading="loading"
          :data="paginatedTags"
          style="width: 100%"
          border
          stripe
        >
          <el-table-column prop="id" label="ID" width="180" />
          <el-table-column prop="name" label="名称" min-width="150">
            <template #default="{ row }">
              <el-tag>{{ row.name }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="category" label="分类" min-width="150" />
          <el-table-column label="使用情况" min-width="100">
            <template #default="{ row }">
              <!-- 在实际应用中，这里会显示使用了该标签的景点数量 -->
              <el-tag type="info">{{ Math.floor(Math.random() * 10) }} 个景点</el-tag>
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
      
      <!-- 添加/编辑标签对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="50%"
        destroy-on-close
      >
        <el-form
          ref="formRef"
          :model="tagForm"
          :rules="rules"
          label-width="100px"
        >
          <el-form-item label="名称" prop="name">
            <el-input v-model="tagForm.name" />
          </el-form-item>
          
          <el-form-item label="分类" prop="category">
            <el-select
              v-model="tagForm.category"
              placeholder="选择标签分类"
              class="category-select-full"
              allow-create
              filterable
            >
              <el-option
                v-for="category in categories.filter(c => c !== '全部')"
                :key="category"
                :label="category"
                :value="category"
              />
            </el-select>
            <div class="form-helper-text">
              您可以选择现有分类或创建新分类
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
.tag-manage-view {
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

.category-select {
  width: 150px;
}

.category-select-full {
  width: 100%;
}

.search-input {
  width: 250px;
}

.data-table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.form-helper-text {
  font-size: 0.8rem;
  color: #999;
  margin-top: 5px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    margin-top: 15px;
    flex-direction: column;
  }
  
  .category-select,
  .search-input {
    width: 100%;
  }
}
</style> 