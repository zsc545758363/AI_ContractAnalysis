<template>
  <aside class="sidebar">
    <div class="sidebar-header">历史记录</div>
    <ul class="session-list">
      <li
        v-for="(session, index) in sessions"
        :key="index"
        class="session-item"
        @click="loadSession(session)"
      >
        {{ session.file_name }}
      </li>
    </ul>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const sessions = ref([])
const router = useRouter()

// 获取历史记录
const fetchHistory = async () => {
  try {
    const res = await fetch('/api/get_analysis_history/')
    const data = await res.json()
    sessions.value = data
  } catch (err) {
    console.error('加载历史记录失败', err)
  }
}

// 点击 li 时加载该会话并传给路由
const loadSession = (session) => {
  router.push({ name: 'MaterialContractSession', params: { sessionId: session.id } })
}

//用于更新历史记录
function refreshHistory() {
  fetchHistory()
}


onMounted(() => {
  fetchHistory()
})


// 暴露方法给父组件使用
defineExpose({
  refreshHistory
})
</script>


<style scoped>
.sidebar {
  width: 100%;
  height: 100%;
  background-color: white;
  border-radius: 10px;
}

.sidebar-header {
  padding: 16px;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #ddd;
  transform: scaleX(80%);

}

.session-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.session-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.session-item:hover {
  background-color: #e0e0e0;
}
</style>
