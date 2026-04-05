import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CalculatorView from '../views/CalculatorView.vue'
import TrackerView from '../views/TrackerView.vue'
import ResumeView from '../views/ResumeView.vue'

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
  },
  {
    path: '/resume',
    name: 'Resume',
    component: ResumeView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
