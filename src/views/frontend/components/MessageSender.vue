<template>
  <div class="send-message-container">
    <div class="send-button-wrapper" @mouseenter="showInput = true" @mouseleave="showInput = false">
      <div class="input-container" :class="{ 'show-input': showInput }">
        <input 
          v-model="messageInput" 
          type="text" 
          placeholder="说点什么吧..." 
          @keyup.enter="sendMessage"
        />
      </div>
      <button class="send-button" @click="sendMessage">
        <el-icon><ChatDotRound /></el-icon> 发送
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineExpose } from 'vue'
import { ChatDotRound } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import requestUtil from '@/utils/request'

const messageInput = ref('')
const showInput = ref(false)

// 发送弹幕
const sendMessage = async () => {
  if (!messageInput.value.trim()) return
  
  try {
    // 从本地存储获取用户信息
    const userInfo = JSON.parse(sessionStorage.getItem('currentUser'))
    
    // 构建请求数据
    const requestData = {
      content: messageInput.value,
      comment_type: 3
    }

    // 如果用户已登录，添加用户ID
    if (userInfo?.id) {
      requestData.user_id = userInfo.id
    }

    // 发送请求
    await requestUtil.post('/blog/comments/', requestData)
    
    // 发送成功消息
    ElMessage.success('发送成功')
    
    messageInput.value = ''
  } catch (error) {
    console.error('发送弹幕失败:', error)
    ElMessage.error('发送失败: ' + (error.response?.data?.errorInfo || error.message))
  }
}

// 暴露方法给父组件
defineExpose({
  sendMessage
})
</script>

<style lang="scss" scoped>
/* 发送消息容器新样式 */
.send-message-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;

  .send-button-wrapper {
    position: relative;
    display: flex;
    justify-content: center; /* 新增居中 */
    width: fit-content; /* 根据内容自适应宽度 */
    transition: all 0.3s ease;

    &:hover {
      .input-container {
        width: 250px;
        opacity: 1;
      }
      .send-button {
        transform: translateX(125px); /* 调整为输入框宽度的一半 */
      }
    }

    .input-container {
      position: absolute;
      left: 50%; /* 居中定位 */
      transform: translateX(-50%);
      width: 0;
      opacity: 0;
      transition: all 0.3s ease;
      z-index: 1;

      input {
        width: 100%;
        padding: 8px 12px;
        border: none;
        border-radius: 20px;
        background-color: rgba(255, 255, 255, 0.9);
        color: #333;
        outline: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      &.show-input {
        width: 250px;
        opacity: 1;
      }
    }

    .send-button {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 8px 16px;
      border: none;
      border-radius: 20px;
      background-color: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(5px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
      z-index: 2;
      transform: translateX(0); 

      &:hover {
        background-color: rgba(0, 0, 0, 0.9);
      }
    }
  }
}
</style>