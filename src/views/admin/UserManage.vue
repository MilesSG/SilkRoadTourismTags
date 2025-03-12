<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const userStore = useUserStore()
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加用户')
const isEdit = ref(false)
const searchQuery = ref('')
const selectedRole = ref('全部')

// 模拟用户数据
const users = ref([
  {
    id: 1,
    username: 'admin',
    name: '管理员',
    email: 'admin@example.com',
    role: '管理员',
    status: '活跃',
    lastLogin: '2024-03-12 08:35',
    registeredAt: '2024-01-01'
  },
  {
    id: 2,
    username: 'zhangsan',
    name: '张三',
    email: 'zhangsan@example.com',
    role: '普通用户',
    status: '活跃',
    lastLogin: '2024-03-10 14:22',
    registeredAt: '2024-01-15'
  },
  {
    id: 3,
    username: 'lisi',
    name: '李四',
    email: 'lisi@example.com',
    role: '普通用户',
    status: '休眠',
    lastLogin: '2024-02-25 09:14',
    registeredAt: '2024-01-18'
  },
  {
    id: 4,
    username: 'wangwu',
    name: '王五',
    email: 'wangwu@example.com',
    role: '编辑',
    status: '活跃',
    lastLogin: '2024-03-11 16:45',
    registeredAt: '2024-02-05'
  },
  {
    id: 5,
    username: 'zhaoliu',
    name: '赵六',
    email: 'zhaoliu@example.com',
    role: '普通用户',
    status: '活跃',
    lastLogin: '2024-03-12 10:30',
    registeredAt: '2024-02-10'
  }
])

// 分页设置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 用户表单
const userForm = ref({
  id: '',
  username: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: '普通用户'
})

// 验证规则
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== userForm.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

// 表单引用
const formRef = ref()

// 角色选项
const roles = [
  { label: '全部', value: '全部' },
  { label: '管理员', value: '管理员' },
  { label: '编辑', value: '编辑' },
  { label: '普通用户', value: '普通用户' }
]

// 计算过滤后的用户列表
const filteredUsers = computed(() => {
  let result = users.value
  
  // 按角色过滤
  if (selectedRole.value !== '全部') {
    result = result.filter(user => user.role === selectedRole.value)
  }
  
  // 按搜索词过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    )
  }
  
  return result
})

// 分页后的用户列表
const paginatedUsers = computed(() => {
  const start = (pagination.currentPage - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  
  const filtered = filteredUsers.value
  pagination.total = filtered.length
  
  return filtered.slice(start, end)
})

// 加载用户数据
function loadData() {
  loading.value = true
  // 在实际应用中，这里会从API获取数据
  setTimeout(() => {
    loading.value = false
  }, 500)
}

// 打开添加用户对话框
function openAddDialog() {
  isEdit.value = false
  dialogTitle.value = '添加用户'
  resetForm()
  dialogVisible.value = true
}

// 打开编辑用户对话框
function openEditDialog(user) {
  isEdit.value = true
  dialogTitle.value = '编辑用户'
  
  // 复制用户数据到表单（不包括密码字段）
  userForm.value = { 
    ...user,
    password: '',
    confirmPassword: ''
  }
  
  dialogVisible.value = true
}

// 重置表单
function resetForm() {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  
  userForm.value = {
    id: '',
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '普通用户'
  }
}

// 提交表单
async function submitForm() {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          // 更新用户
          const index = users.value.findIndex(u => u.id === userForm.value.id)
          if (index !== -1) {
            users.value[index] = {
              ...users.value[index],
              username: userForm.value.username,
              name: userForm.value.name,
              email: userForm.value.email,
              role: userForm.value.role
            }
            ElMessage.success('用户更新成功')
          }
        } else {
          // 添加用户
          const newUser = {
            id: Date.now(),
            username: userForm.value.username,
            name: userForm.value.name,
            email: userForm.value.email,
            role: userForm.value.role,
            status: '活跃',
            lastLogin: '-',
            registeredAt: new Date().toISOString().split('T')[0]
          }
          users.value.push(newUser)
          ElMessage.success('用户添加成功')
        }
        
        dialogVisible.value = false
      } catch (error) {
        ElMessage.error('操作失败')
        console.error(error)
      }
    }
  })
}

// 删除用户
function confirmDelete(user) {
  ElMessageBox.confirm(
    `确定要删除用户 "${user.name}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    users.value = users.value.filter(u => u.id !== user.id)
    ElMessage.success('用户删除成功')
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 修改用户状态
function toggleUserStatus(user) {
  const index = users.value.findIndex(u => u.id === user.id)
  if (index !== -1) {
    users.value[index].status = user.status === '活跃' ? '休眠' : '活跃'
    ElMessage.success(`用户状态已更改为${users.value[index].status}`)
  }
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
  <div class="user-manage-view">
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">用户管理</h1>
        <div class="header-actions">
          <el-select 
            v-model="selectedRole" 
            placeholder="选择角色" 
            class="role-select"
          >
            <el-option 
              v-for="role in roles" 
              :key="role.value" 
              :label="role.label" 
              :value="role.value" 
            />
          </el-select>
          
          <el-input
            v-model="searchQuery"
            placeholder="搜索用户名/姓名/邮箱"
            clearable
            class="search-input"
          >
            <template #prefix>
              <el-icon><search /></el-icon>
            </template>
          </el-input>
          
          <el-button type="primary" @click="openAddDialog">
            <el-icon><plus /></el-icon>添加用户
          </el-button>
        </div>
      </div>
      
      <!-- 用户表格 -->
      <el-card shadow="hover" class="data-table-card">
        <el-table
          v-loading="loading"
          :data="paginatedUsers"
          style="width: 100%"
          border
          stripe
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="username" label="用户名" min-width="120" />
          <el-table-column prop="name" label="姓名" min-width="120" />
          <el-table-column prop="email" label="邮箱" min-width="180" />
          <el-table-column prop="role" label="角色" width="100">
            <template #default="{ row }">
              <el-tag 
                :type="row.role === '管理员' ? 'danger' : row.role === '编辑' ? 'warning' : 'info'"
              >
                {{ row.role }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag 
                :type="row.status === '活跃' ? 'success' : 'info'"
                @click="toggleUserStatus(row)"
                style="cursor: pointer"
              >
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lastLogin" label="最后登录" min-width="160" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openEditDialog(row)">
                编辑
              </el-button>
              <el-button 
                type="danger" 
                link 
                @click="confirmDelete(row)"
                :disabled="row.role === '管理员'"
              >
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
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
      
      <!-- 添加/编辑用户对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="50%"
        destroy-on-close
      >
        <el-form
          ref="formRef"
          :model="userForm"
          :rules="rules"
          label-width="100px"
        >
          <el-form-item label="用户名" prop="username">
            <el-input 
              v-model="userForm.username" 
              :disabled="isEdit" 
            />
            <div v-if="isEdit" class="form-helper-text">
              用户名不可修改
            </div>
          </el-form-item>
          
          <el-form-item label="姓名" prop="name">
            <el-input v-model="userForm.name" />
          </el-form-item>
          
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="userForm.email" />
          </el-form-item>
          
          <el-form-item 
            label="密码" 
            prop="password"
            :rules="isEdit ? [] : rules.password"
          >
            <el-input 
              v-model="userForm.password" 
              type="password" 
              show-password
              :placeholder="isEdit ? '不修改请留空' : '请输入密码'"
            />
            <div v-if="isEdit" class="form-helper-text">
              不修改密码请留空
            </div>
          </el-form-item>
          
          <el-form-item 
            label="确认密码" 
            prop="confirmPassword"
            :rules="isEdit && !userForm.password ? [] : rules.confirmPassword"
          >
            <el-input 
              v-model="userForm.confirmPassword" 
              type="password" 
              show-password
              :placeholder="isEdit ? '不修改请留空' : '请确认密码'"
            />
          </el-form-item>
          
          <el-form-item label="角色" prop="role">
            <el-select
              v-model="userForm.role"
              placeholder="选择用户角色"
            >
              <el-option 
                v-for="role in roles.filter(r => r.value !== '全部')" 
                :key="role.value" 
                :label="role.label" 
                :value="role.value" 
              />
            </el-select>
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
.user-manage-view {
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

.role-select {
  width: 150px;
}

.search-input {
  width: 300px;
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
    flex-wrap: wrap;
  }
  
  .role-select,
  .search-input {
    width: 100%;
  }
}
</style> 