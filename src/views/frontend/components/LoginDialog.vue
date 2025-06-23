<template>
  <div>
    <!-- 登录/注册对话框 -->
    <el-dialog v-model="dialogVisible" :title="isLogin ? '登录' : '注册'" width="30%" :close-on-click-modal="false"
      :destroy-on-close="true" class="login-dialog">
      <!-- 登录表单 -->
      <el-form v-if="isLogin" ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名">
            <template #prefix>
              <el-icon>
                <User />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password>
            <template #prefix>
              <el-icon>
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="captcha" label="验证码">
          <div class="captcha-container">
            <el-input v-model="loginForm.captcha" placeholder="验证码" style="width: 60%; margin-right: 10px;"></el-input>
            <img :src="captchaBase64" class="captcha-img" @click="getCaptcha" alt="验证码" />
          </div>
        </el-form-item>
      </el-form>

      <!-- 注册表单 -->
      <el-form v-else ref="registerFormRef" :model="registerForm" :rules="registerRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名">
            <template #prefix>
              <el-icon>
                <User />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="registerForm.password" type="password" placeholder="请输入密码" show-password>
            <template #prefix>
              <el-icon>
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请确认密码" show-password>
            <template #prefix>
              <el-icon>
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="captcha" label="验证码">
          <div class="captcha-container">
            <el-input v-model="registerForm.captcha" placeholder="验证码"
              style="width: 60%; margin-right: 10px;"></el-input>
            <img :src="captchaBase64" class="captcha-img" @click="getCaptcha" alt="验证码" />
          </div>
        </el-form-item>
      </el-form>

      <!-- 底部按钮 -->
      <template #footer>
        <div class="dialog-footer">
          <div class="switch-mode">
            <a href="javascript:void(0)" @click="switchMode">
              {{ isLogin ? '注册账号' : '返回登录' }}
            </a>
          </div>
          <div>
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit">确认</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, defineExpose, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import requestUtil from '@/utils/request'

// 对话框可见性
const dialogVisible = ref(false)

// 当前模式：登录/注册
const isLogin = ref(true)

// 验证码相关
const captchaBase64 = ref('')
const captchaToken = ref('')

// 登录表单
const loginFormRef = ref(null)
const loginForm = reactive({
  username: '',
  password: '',
  captcha: ''
})

// 注册表单
const registerFormRef = ref(null)
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  captcha: ''
})

// 登录表单验证规则
const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

// 注册表单验证规则
const registerRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6到20个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  captcha: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
}

// 获取验证码
const getCaptcha = async () => {
  try {
    const result = await requestUtil.get('/user/captcha/')
    if (result.data.code === 200) {
      captchaBase64.value = result.data.base64str
      captchaToken.value = result.data.captcha_token
    } else {
      ElMessage.error('获取验证码失败')
    }
  } catch (error) {
    console.error('验证码请求失败:', error)
    ElMessage.error('验证码加载失败')
  }
}

// 切换登录/注册模式
const switchMode = () => {
  isLogin.value = !isLogin.value
  // 切换模式时重新获取验证码
  getCaptcha()
}

// 打开对话框
const openDialog = () => {
  dialogVisible.value = true
  getCaptcha()
}

// 提交表单
const handleSubmit = () => {
  if (isLogin.value) {
    // 登录逻辑
    loginFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const postData = {
            ...loginForm,
            captcha_token: captchaToken.value
          }
          const result = await requestUtil.post('/user/login/', postData)
          const data = result.data

          if (data.code === 200) {
            ElMessage.success('登录成功')
            window.sessionStorage.setItem('token', data.token)
            const currentUser = data.user
            currentUser.roles = data.roles.split(',')
            window.sessionStorage.setItem('currentUser', JSON.stringify(currentUser))
            window.sessionStorage.setItem('menuList', JSON.stringify(data.menuList))

            // 清空表单
            loginForm.username = ''
            loginForm.password = ''
            loginForm.captcha = ''

            // 关闭对话框
            dialogVisible.value = false

            // 触发登录成功事件
            emit('login-success', currentUser)
          } else {
            const errorMessage = data.errorInfo || data.info || `登录失败（错误码：${data.code}）`
            ElMessage.error(errorMessage)

            // 验证码错误时自动刷新
            if (data.code === 400 && data.errorInfo?.toLowerCase()?.includes('captcha')) {
              await getCaptcha()
              loginForm.captcha = ''
            }
          }
        } catch (error) {
          const errorMsg = error.response?.data?.errorInfo ||
            error.response?.data?.detail ||
            error.message ||
            '请求异常，请检查网络连接'
          console.error(`登录请求失败: ${errorMsg}`, error)
          ElMessage.error(`操作失败: ${errorMsg}`)

          // 服务器错误时刷新验证码
          if (error.response?.status >= 500) {
            await getCaptcha()
          }
        }
      }
    })
  } else {
    // 注册逻辑
    registerFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          const postData = {
            username: registerForm.username,
            password: registerForm.password,
            captcha: registerForm.captcha,
            captcha_token: captchaToken.value
          }
          const result = await requestUtil.post('/user/register/', postData)
          const data = result.data

          if (data.code === 200) {
            ElMessage.success('注册成功，请登录')
            // 切换到登录模式
            isLogin.value = true
            // 清空表单
            registerForm.username = ''
            registerForm.password = ''
            registerForm.confirmPassword = ''
            registerForm.captcha = ''
            // 重新获取验证码
            getCaptcha()
          } else {
            const errorMessage = data.errorInfo || data.info || `注册失败（错误码：${data.code}）`
            ElMessage.error(errorMessage)

            // 验证码错误时自动刷新
            if (data.code === 400 && data.errorInfo?.toLowerCase()?.includes('captcha')) {
              await getCaptcha()
              registerForm.captcha = ''
            }
          }
        } catch (error) {
          const errorMsg = error.response?.data?.errorInfo ||
            error.response?.data?.detail ||
            error.message ||
            '请求异常，请检查网络连接'
          console.error(`注册请求失败: ${errorMsg}`, error)
          ElMessage.error(`操作失败: ${errorMsg}`)

          // 服务器错误时刷新验证码
          if (error.response?.status >= 500) {
            await getCaptcha()
          }
        }
      }
    })
  }
}

// 定义事件
const emit = defineEmits(['login-success'])

// 暴露方法给父组件
defineExpose({
  openDialog
})
</script>

<style lang="scss" scoped>
.login-dialog {
  :deep(.el-dialog__header) {
    text-align: center;
    font-weight: bold;
    padding-bottom: 10px;
    border-bottom: 1px solid #f0f0f0;
  }

  :deep(.el-dialog__body) {
    padding: 20px 30px;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
  }
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  .switch-mode {
    a {
      color: #409eff;
      text-decoration: none;
      font-size: 14px;

      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.captcha-container {
  display: flex;
  align-items: center;
}

.captcha-img {
  height: 40px;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}
</style>