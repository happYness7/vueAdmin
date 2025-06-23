<template>
    <!-- 弹幕容器 -->
    <div class="danmaku-overlay" ref="danmakuContainer">
      <div 
        v-for="(message, index) in messages" 
        :key="index" 
        class="danmaku-item"
        :style="{
          top: `${message.top}px`,
          animationDuration: `${message.duration}s`,
          animationDelay: `${message.delay}s`,
          color: message.color
        }"
      >
        <span class="avatar">{{ message.avatar }}</span>
        <span class="content">{{ message.content }}</span>
      </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineExpose } from 'vue'
import requestUtil from '@/utils/request'

const danmakuContainer = ref(null)
const messages = ref([])
const messageInterval = ref(null)

// 在组件挂载时初始化弹幕
onMounted(() => {
  initDanmaku()
})

// 在组件卸载时清除定时器
onUnmounted(() => {
  if (messageInterval.value) {
    clearInterval(messageInterval.value)
    messageInterval.value = null
  }
})

// 初始化弹幕
const initDanmaku = async () => {
  try {
    const res = await requestUtil.get('/blog/comments/message-list/')
    // 计算可用的垂直空间并分配不重叠的位置
    const containerHeight = window.innerHeight - 100
    const itemHeight = 50 // 弹幕项的估计高度，包括间距
    const maxRows = Math.floor(containerHeight / itemHeight)
    
    messages.value = res.data.messageList.map((msg, index) => ({
      content: msg.content,
      // 使用索引来确保弹幕不重叠，循环使用可用的垂直位置
      top: (index % maxRows) * itemHeight + 10,
      duration: 10 + Math.floor(Math.random() * 10),
      delay: Math.floor(Math.random() * 5),
      color: '#ffffff',
      avatar: msg.from_user?.username || '游客'
    }))
    
    // 设置定时器，每隔一段时间重新获取弹幕
    if (!messageInterval.value) {
      messageInterval.value = setInterval(loadNewMessages, 10000)
    }
  } catch (error) {
    console.error('获取弹幕失败:', error)
  }
}

// 加载新弹幕
const loadNewMessages = async () => {
  try {
    const res = await requestUtil.get('/blog/comments/message-list/')
    // 计算可用的垂直空间并分配不重叠的位置
    const containerHeight = window.innerHeight - 100
    const itemHeight = 50 // 弹幕项的估计高度，包括间距
    const maxRows = Math.floor(containerHeight / itemHeight)
    const currentCount = messages.value.length
    
    const newMessages = res.data.messageList
      .filter(msg => !messages.value.some(existing => existing.content === msg.content))
      .map((msg, index) => ({
        content: msg.content,
        // 使用当前消息数量+索引来确保新弹幕不重叠
        top: ((currentCount + index) % maxRows) * itemHeight + 10,
        duration: 10 + Math.floor(Math.random() * 10),
        delay: 0,
        color: '#ffffff',
        avatar: msg.from_user?.username || '游客'
      }))
    
    messages.value.push(...newMessages)
    
    // 保持弹幕数量在合理范围内
    if (messages.value.length > 50) {
      messages.value.splice(0, messages.value.length - 50)
    }
  } catch (error) {
    console.error('获取新弹幕失败:', error)
  }
}

// 提供发送消息方法给父组件
const sendMessageToScreen = async (content, userInfo) => {
  try {
    // 计算可用的垂直空间并分配不重叠的位置
    const containerHeight = window.innerHeight - 100
    const itemHeight = 50 // 弹幕项的估计高度，包括间距
    const maxRows = Math.floor(containerHeight / itemHeight)
    const currentCount = messages.value.length
    
    // 添加新弹幕到界面
    const newMessage = {
      content: content,
      top: (currentCount % maxRows) * itemHeight + 10,
      duration: 10 + Math.floor(Math.random() * 10),
      delay: 0,
      color: '#ffffff',
      avatar: userInfo.username || '游客'  // 显示用户名或游客
    }
    
    messages.value.push(newMessage)
    
    // 保持弹幕数量在合理范围内
    if (messages.value.length > 50) {
      messages.value.shift()
    }
  } catch (error) {
    console.error('添加弹幕失败:', error)
  }
}

// 暴露方法给父组件
defineExpose({
  sendMessageToScreen
})

onMounted(() => {
  initDanmaku()
})

onUnmounted(() => {
  // 清除定时器
  if (messageInterval.value) {
    clearInterval(messageInterval.value)
    messageInterval.value = null
  }
})

</script>

<style lang="scss" scoped>

.message-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

/* 弹幕样式 */
.danmaku-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 50;
  pointer-events: auto; /* 修改为auto以允许鼠标事件 */
  overflow: hidden;
}

.danmaku-item {
  position: absolute;
  right: -300px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 16px;
  animation: danmaku-move linear forwards;
  transition: background-color 0.3s;
  
  &:hover {
    animation-play-state: paused;
    background-color: rgba(0, 0, 0, 0.8);
    z-index: 100;
  }

  .avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: #3498db;
    color: #fff;
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 30px;
  }

  .content {
    line-height: 1.2;
  }
}

@keyframes danmaku-move {
  from { transform: translateX(0); }
  to { transform: translateX(calc(-100vw - 300px)); }
}
</style>