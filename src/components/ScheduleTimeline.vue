<template>
  <div class="space-y-2">
    <div
      v-for="(step, idx) in schedule"
      :key="step.stepId"
      class="timeline-item border-l-2 border-gray-300 pl-4 py-3"
    >
      <div class="flex justify-between items-start">
        <div>
          <div class="font-bold">{{ step.stepName }}</div>
          <div class="text-xs text-gray-600">{{ step.notes }}</div>
        </div>
        <div class="text-right">
          <div class="text-lg font-bold">{{ formatTime(step.plannedTime) }}</div>
          <div class="text-xs text-gray-600">{{ formatDate(step.plannedTime) }}</div>
          <div class="text-xs text-gray-600 mt-1">{{ step.duration }}m</div>
        </div>
      </div>

      <div v-if="idx < schedule.length - 1" class="text-xs text-gray-500 mt-2">
        ↓ {{ getDurationUntilNext(step, schedule[idx + 1]) }}
      </div>
    </div>

    <div class="pt-4 border-t border-gray-300 mt-6">
      <div class="font-bold text-lg">Total Time: {{ getTotalDuration() }}</div>
      <div class="text-sm text-gray-600 mt-1">From first step to complete cooling</div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
import { useScheduleCalculator } from '../composables/useScheduleCalculator'

const props = defineProps({
  schedule: Array,
  targetTime: Date
})

const { formatTime, formatDate } = useScheduleCalculator()

function getDurationUntilNext(currentStep, nextStep) {
  const diff = new Date(nextStep.plannedTime) - new Date(currentStep.plannedTime)
  const hours = Math.floor(diff / 3600000)
  const minutes = Math.round((diff % 3600000) / 60000)

  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

function getTotalDuration() {
  if (!Array.isArray(props.schedule) || props.schedule.length < 2) return '—'

  const first = props.schedule[0]
  const last = props.schedule[props.schedule.length - 1]
  const diff = new Date(last.plannedTime) - new Date(first.plannedTime) + (last.duration * 60000)

  const hours = Math.floor(diff / 3600000)
  const minutes = Math.round((diff % 3600000) / 60000)

  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}
</script>

<style scoped>
.timeline-item {
  position: relative;
}
</style>
