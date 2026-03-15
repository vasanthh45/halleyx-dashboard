import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../pages/Dashboard.vue'
import Orders from '../pages/Orders.vue'
import DashboardConfig from '../pages/DashboardConfig.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/orders',
    name: 'Orders',
    component: Orders
  },
  {
    path: '/dashboard-config',
    name: 'DashboardConfig',
    component: DashboardConfig
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router