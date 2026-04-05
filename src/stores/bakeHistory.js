import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBakeHistoryStore = defineStore('bakeHistory', () => {
  const completedBakes = ref([])

  function addCompletedBake(bakeData) {
    const completedBake = {
      id: Date.now().toString(),
      templateName: bakeData.templateName,
      originalTarget: bakeData.originalTarget,
      actualCompletion: bakeData.actualCompletion,
      completedAt: new Date().toISOString(),
      elapsedTime: calculateElapsed(bakeData.originalTarget, bakeData.actualCompletion),
      variance: calculateVariance(bakeData.originalTarget, bakeData.actualCompletion),
      stepsCount: bakeData.stepsCount,
      adjustments: bakeData.adjustments || []
    }
    completedBakes.value.unshift(completedBake)
    return completedBake
  }

  function calculateElapsed(startTime, endTime) {
    const start = new Date(startTime)
    const end = new Date(endTime)
    const ms = end - start
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.round((ms % 3600000) / 60000)
    return { hours, minutes, total: Math.round(ms / 60000) }
  }

  function calculateVariance(originalTarget, actualCompletion) {
    const target = new Date(originalTarget)
    const actual = new Date(actualCompletion)
    const ms = actual - target
    const minutes = Math.round(ms / 60000)
    return minutes // positive = late, negative = early
  }

  function getCompletedBakes(limit = 10) {
    return completedBakes.value.slice(0, limit)
  }

  function getStatistics() {
    if (completedBakes.value.length === 0) {
      return {
        totalBakes: 0,
        averageVariance: 0,
        onTimeCount: 0,
        earlyCount: 0,
        lateCount: 0
      }
    }

    const onTime = completedBakes.value.filter(b => Math.abs(b.variance) <= 15)
    const early = completedBakes.value.filter(b => b.variance < -15)
    const late = completedBakes.value.filter(b => b.variance > 15)

    const avgVariance = Math.round(
      completedBakes.value.reduce((sum, b) => sum + b.variance, 0) / completedBakes.value.length
    )

    return {
      totalBakes: completedBakes.value.length,
      averageVariance: avgVariance,
      onTimeCount: onTime.length,
      earlyCount: early.length,
      lateCount: late.length
    }
  }

  function clearHistory() {
    completedBakes.value = []
  }

  return {
    completedBakes,
    addCompletedBake,
    getCompletedBakes,
    getStatistics,
    clearHistory
  }
}, {
  persist: true
})
