<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Bake History</h2>

    <!-- Statistics -->
    <div class="grid grid-cols-2 gap-3 mb-6">
      <div class="card text-center">
        <div class="text-2xl font-bold">{{ stats.totalBakes }}</div>
        <div class="text-xs text-gray-600">Total Bakes</div>
      </div>
      <div class="card text-center">
        <div class="text-2xl font-bold" :class="stats.averageVariance > 0 ? 'text-orange-700' : 'text-green-700'">
          {{ stats.averageVariance > 0 ? '+' : '' }}{{ stats.averageVariance }}m
        </div>
        <div class="text-xs text-gray-600">Average Variance</div>
      </div>
      <div class="card text-center">
        <div class="text-xl font-bold text-green-700">{{ stats.onTimeCount }}</div>
        <div class="text-xs text-gray-600">On Time</div>
      </div>
      <div class="card text-center">
        <div class="text-xl font-bold text-orange-700">
          {{ stats.lateCount }}
          <span class="text-xs ml-1">late</span>
        </div>
        <div class="text-xs text-gray-600">Early: {{ stats.earlyCount }}</div>
      </div>
    </div>

    <!-- Completed Bakes List -->
    <h3 class="text-lg font-bold mb-3">Recent Bakes</h3>

    <div v-if="historyStore.completedBakes.length === 0" class="card text-gray-600 text-center py-6">
      <p>No completed bakes yet. Start baking to track your progress!</p>
    </div>

    <div v-else class="space-y-2">
      <div v-for="bake in historyStore.completedBakes" :key="bake.id" class="card">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="font-bold">{{ bake.templateName }}</div>
            <div class="text-xs text-gray-600 mt-1">
              {{ formatDate(bake.completedAt) }}
            </div>
            <div class="text-sm mt-2">
              <strong>Target:</strong> {{ formatTime(new Date(bake.originalTarget)) }}
              <br />
              <strong>Actual:</strong> {{ formatTime(new Date(bake.actualCompletion)) }}
            </div>
          </div>
          <div class="text-right flex flex-col gap-2 items-end ml-4">
            <div>
              <div class="text-lg font-bold" :class="getVarianceColor(bake.variance)">
                {{ bake.variance > 0 ? '+' : '' }}{{ bake.variance }}m
              </div>
              <div class="text-xs text-gray-600">{{ getVarianceLabel(bake.variance) }}</div>
              <div class="text-xs text-gray-600 mt-2">
                {{ bake.elapsedTime.hours }}h {{ bake.elapsedTime.minutes }}m
              </div>
            </div>
            <button
              @click="deleteBake(bake.id)"
              class="text-lg hover:text-red-700 p-1 rounded"
              title="Delete this bake from history"
              aria-label="Delete bake"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Clear History Button -->
    <button
      v-if="historyStore.completedBakes.length > 0"
      @click="clearHistory"
      class="btn w-full mt-6 text-gray-600"
    >
      Clear History
    </button>

    <!-- Back Button -->
    <RouterLink to="/" class="btn w-full mt-2 block text-center">
      Back to Home
    </RouterLink>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useBakeHistoryStore } from '../stores/bakeHistory'
import { useScheduleCalculator } from '../composables/useScheduleCalculator'

const historyStore = useBakeHistoryStore()
const { formatTime, formatDate } = useScheduleCalculator()

const stats = computed(() => historyStore.getStatistics())

function getVarianceColor(variance) {
  if (Math.abs(variance) <= 15) return 'text-green-700'
  if (variance > 0) return 'text-orange-700'
  return 'text-blue-700'
}

function getVarianceLabel(variance) {
  if (Math.abs(variance) <= 15) return '✓ On time'
  if (variance > 0) return 'Late'
  return 'Early'
}

function clearHistory() {
  if (confirm('Clear all bake history? This cannot be undone.')) {
    historyStore.clearHistory()
  }
}

function deleteBake(bakeId) {
  if (confirm('Delete this bake from history?')) {
    historyStore.deleteBake(bakeId)
  }
}
</script>
