import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CalculatorView from '../views/CalculatorView.vue'
import TrackerView from '../views/TrackerView.vue'
import ResumeView from '../views/ResumeView.vue'
import HistoryView from '../views/HistoryView.vue'
import TemplatesView from '../views/TemplatesView.vue'
import JoinExistingBakeView from '../views/JoinExistingBakeView.vue'

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
  },
  {
    path: '/history',
    name: 'History',
    component: HistoryView
  },
  {
    path: '/templates',
    name: 'Templates',
    component: TemplatesView
  },
  {
    path: '/join',
    name: 'JoinExisting',
    component: JoinExistingBakeView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
