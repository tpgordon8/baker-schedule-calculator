<template>
  <div class="card">
    <div class="text-sm font-bold mb-2">Current Step Timer</div>

    <div v-if="currentStep" class="space-y-2">
      <div class="text-lg font-bold">{{ currentStep.stepName }}</div>

      <div class="bg-gray-100 p-4 text-center border border-gray-300">
        <div class="text-5xl font-bold tabular-nums text-gray-900">
          {{ formatCountdown }}
        </div>
        <div class="text-xs text-gray-600 mt-2">time remaining for this step</div>
      </div>

      <div class="text-sm text-gray-600 space-y-1">
        <p><strong>Started:</strong> {{ formatTime(stepStartTime) }}</p>
        <p><strong>Planned end:</strong> {{ formatTime(stepEndTime) }}</p>
        <p v-if="isOvertime" class="text-orange-700 font-bold">
          ⚠️ Over by {{ Math.abs(overtimeMinutes) }}m
        </p>
      </div>

      <div class="flex gap-2">
        <button @click="toggleTimer" class="btn flex-1">
          {{ timerRunning ? '⏸️ Pause' : '▶️ Start' }}
        </button>
        <button @click="resetTimer" class="btn flex-1">
          🔄 Reset
        </button>
      </div>
    </div>

    <div v-else class="text-gray-600 text-sm">
      No active step selected
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useScheduleCalculator } from '../composables/useScheduleCalculator'

const props = defineProps({
  currentStep: Object,
  stepStartTime: Date,
  plannedDuration: Number // in minutes
})

const { formatTime } = useScheduleCalculator()

const timerRunning = ref(false)
const elapsedSeconds = ref(0)
let timerInterval = null

const stepStartMs = computed(() => {
  return props.stepStartTime ? new Date(props.stepStartTime).getTime() : 0
})

const stepEndTime = computed(() => {
  if (!stepStartMs.value || !props.plannedDuration) return null
  return new Date(stepStartMs.value + props.plannedDuration * 60000)
})

const totalSeconds = computed(() => {
  return (props.plannedDuration || 0) * 60
})

const remainingSeconds = computed(() => {
  return Math.max(0, totalSeconds.value - elapsedSeconds.value)
})

const isOvertime = computed(() => {
  return elapsedSeconds.value > totalSeconds.value
})

const overtimeMinutes = computed(() => {
  return Math.ceil((elapsedSeconds.value - totalSeconds.value) / 60)
})

const formatCountdown = computed(() => {
  const seconds = Math.abs(remainingSeconds.value)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`
})

function toggleTimer() {
  timerRunning.value = !timerRunning.value
}

function resetTimer() {
  timerRunning.value = false
  elapsedSeconds.value = 0
}

onMounted(() => {
  timerInterval = setInterval(() => {
    if (timerRunning.value) {
      elapsedSeconds.value += 1
    }
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>
