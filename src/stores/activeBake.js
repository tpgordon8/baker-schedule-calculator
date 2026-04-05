import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useActiveBakeStore = defineStore('activeBake', () => {
  const bake = ref(null)

  const schedule = computed(() => bake.value?.schedule || [])

  const isActive = computed(() => bake.value !== null)

  function initializeBake(targetTime, template) {
    bake.value = {
      id: Date.now().toString(),
      templateId: template.id,
      targetCompletionTime: targetTime,
      createdAt: new Date().toISOString(),
      schedule: [],
      adjustments: []
    }
  }

  function updateSchedule(newSchedule) {
    if (bake.value) {
      bake.value.schedule = newSchedule
    }
  }

  function markStepComplete(stepId, actualTime) {
    if (bake.value) {
      const step = bake.value.schedule.find(s => s.stepId === stepId)
      if (step) {
        step.actualTime = actualTime
        step.status = 'completed'
      }
    }
  }

  function addAdjustment(adjustment) {
    if (bake.value) {
      bake.value.adjustments.push({
        ...adjustment,
        timestamp: new Date().toISOString()
      })
    }
  }

  function clearBake() {
    bake.value = null
  }

  return {
    bake,
    schedule,
    isActive,
    initializeBake,
    updateSchedule,
    markStepComplete,
    addAdjustment,
    clearBake
  }
})
