import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CalculatorView from '../views/CalculatorView.vue'
import TrackerView from '../views/TrackerView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/calculator',
    name: 'Calculator',
    component: CalculatorView
  },
  {
    path: '/tracker',
    name: 'Tracker',
    component: TrackerView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
