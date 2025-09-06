<template>
  <div class="nav">
    <!-- 左侧 Logo + 标题 -->
    <div class="nav-left">
      <img src="../assets/vue.svg" alt="Logo" class="logo" />
      <span class="title">AI赋能</span>
    </div>

    <!-- 右侧导航链接 -->
    <div class="nav-right">
      <router-link
        v-for="(item, index) in navItems"
        :key="index"
        :to="item.path"
        :class="['nav-button', { active: isActive(item.path) }]"
        custom
      >
        <template #default="props">
          <button @click="props.navigate">
            {{ item.name }}
            <span v-if="isActive(item.path)" class="underline"></span>
          </button>
        </template>
      </router-link>
    </div>

<!--    <div>-->
<!--      <p>登录</p>-->
<!--      <img src=""></img>-->
<!--    </div>-->
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 定义导航项及其对应的路由路径
const navItems = [
  { name: '零星材料合同', path: '/contract/material' },
  { name: '检测服务合同', path: '/contract/testing' },
  { name: '原辅材料合同', path: '/contract/raw-materials' },
  { name: '设备采购加工承揽合同', path: '/contract/equipment' },
  { name: '季度/框架合同', path: '/contract/quarterly' },
  { name: '常规销售合同', path: '/contract/sales' },
  { name: '战略合作协议项下的采购订单', path: '/contract/purchase-order' },
  { name: '英文合同', path: '/contract/english' }
]

// 初始化导航到第一个页面
onMounted(() => {
  if (route.path === '/') {
    router.push(navItems[0].path)
  }
})

// 计算属性：判断当前路由是否激活
const isActive = (path) => {
  return route.path === path
}
</script>

<style scoped>
/* 样式保持不变 */
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 24px;
  background-color: transparent;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
  width: 100vw;
  box-sizing: border-box;
}

/* 左侧 */
.nav-left {
  display: flex;
  align-items: center;
}

.logo {
  width: 32px;
  height: 32px;
  margin-right: 8px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: #1f2937; /* 深灰 */
}

/* 右侧 */
.nav-right {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.nav-button {
  position: relative;
  padding-bottom: 6px;
  font-size: 15px;
  color: #4b5563;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.3s ease;
  outline: none; /* 去除点击后的黑框 */
}

.nav-button:hover {
  color: #2563eb;
}

.nav-button:focus {
  outline: none; /* 确保按下后无黑框 */
}

.nav-button.active {
  color: #2563eb;
  font-weight: 600;
}

.underline {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 100%;
  background-color: #2563eb;
  border-radius: 1px;
}
</style>