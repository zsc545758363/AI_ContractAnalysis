import { createRouter, createWebHistory } from 'vue-router'
import MaterialContract from '@/views/MaterialContract2.vue'

const routes = [
    {
    path: '/',
    name: 'Home',
    component: MaterialContract
  },
  {
    path: '/contract/material',
    name: 'MaterialContract',
    component: () => import('../views/MaterialContract2.vue'),
    children: [
      {
        path: ':sessionId', // ❗这里就专门处理历史记录
        name: 'MaterialContractSession',
        component: () => import('../views/MaterialContract2.vue') // 如果用同一个组件
      }
    ]
  },
  {
    path: '/contract/testing',
    name: 'TestingContract',
    component: () => import('../views/TestingContract.vue')
  },
  {
    path: '/contract/raw-materials',
    name: 'Raw-materialsContract',
    component: () => import('../views/Raw-materialsContract.vue')
  },
  {
    path: '/contract/equipment',
    name: 'EquipmentContract',
    component: () => import('../views/EquipmentContract.vue')
  },
  {
    path: '/contract/quarterly',
    name: 'QuarterlyContract',
    component: () => import('../views/QuarterlyContract.vue')
  },
  {
    path: '/contract/sales',
    name: 'SalesContract',
    component: () => import('../views/SalesContract.vue')
  },
  {
    path: '/contract/purchase-order',
    name: 'Purchase-orderContract',
    component: () => import('../views/Purchase-orderContract.vue')
  },
  {
    path: '/contract/english',
    name: 'EnglishContract',
    component: () => import('../views/EnglishContract.vue')
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
