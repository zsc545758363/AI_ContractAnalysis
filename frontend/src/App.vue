<template>
  <div class="app-wrapper">
    <!-- 顶部导航栏 -->
    <NavBar />

    <!-- 页面主要内容区域 -->
    <main class="app-content">
      <div class="historybar">
        <HistoryBar @load-session="handleLoadSession" ref="historyBarRef" />
      </div>
      <div class="content">
        <router-view :historicalSession="selectedSession" @analysis-finished="handleAnalysisFinished" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import NavBar from "@/components/NavBar.vue"
import HistoryBar from "@/components/HistoryBar.vue"

const selectedSession = ref(null)

const handleLoadSession = (session) => {
  selectedSession.value = session
}

const historyBarRef = ref(null)

// 当 MaterialContract2 发出分析完成事件
function handleAnalysisFinished() {
  historyBarRef.value?.refreshHistory()
}

</script>

<style>
/* 基础样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  background: linear-gradient(180deg, #f6f9ff, #f2f7ff);
}

NavBar {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: transparent;
}

.app-content {
  display: flex;
  width: 100%;
  height: 640px;
}

.historybar {
  width: 15%;
  margin: 10px;
}

.content {
  width: 85%;
}
</style>
