<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Check Your Progress</h2>

    <div v-if="!activeBakeStore.isActive" class="card text-gray-600">
      <p>No active bake to resume. <RouterLink to="/" class="underline">Start a new bake</RouterLink></p>
    </div>

    <div v-else>
      <!-- Started Time Banner -->
      <div class="card">
        <div class="text-sm text-gray-600">Started</div>
        <div class="text-lg font-bold">{{ formatTime(activeBakeStore.bake.actualStartTime) }}</div>
        <div class="text-xs text-gray-600">{{ formatDate(activeBakeStore.bake.actualStartTime) }}</div>
        <div class="text-sm text-gray-600 mt-2">Elapsed: {{ formatElapsed(activeBakeStore.bake.actualStartTime) }}</div>
      </div>

      <!-- Step Selector -->
      <div class="card">
        <label class="block text-sm font-bold mb-3">Which step are you on right now?</label>
        <select v-model="selectedStepId" class="input-field w-full mb-3">
          <option value="">Select a step...</option>
          <option v-for="step in availableSteps" :key="step.stepId" :value="step.stepId">
            {{ step.stepName }}
          </option>
        </select>

        <label class="block text-sm font-bold mb-2">How long have you been on this step?</label>
        <div class="flex gap-2 mb-3">
          <div class="flex-1">
            <input
              v-model.number="hoursOnStep"
              type="number"
              min="0"
              max="24"
              placeholder="Hours"
              class="input-field w-full"
            />
            <div class="text-xs text-gray-600 mt-1">Hours</div>
          </div>
          <div class="flex-1">
            <input
              v-model.number="minutesOnStep"
              type="number"
              min="0"
              max="59"
              placeholder="Minutes"
              class="input-field w-full"
            />
            <div class="text-xs text-gray-600 mt-1">Minutes</div>
          </div>
        </div>

        <button @click="calculatePace" class="btn btn-primary w-full">
          Calculate Pace
        </button>
      </div>

      <!-- Pace Display -->
      <div v-if="paceData" class="card">
        <div class="text-lg font-bold mb-2">{{ paceData.message }}</div>
        <div class="text-sm text-gray-600 mb-3">
          <p><strong>Projected finish:</strong> {{ formatTime(paceData.projectedCompletion) }}</p>
          <p><strong>Original target:</strong> {{ formatTime(new Date(activeBakeStore.bake.originalTargetTime)) }}</p>
        </div>

        <div v-if="paceData.paceStatus === 'ahead'" class="text-sm text-green-700 mb-3">
          You're finishing early! You could extend fermentation time.
        </div>
        <div v-else-if="paceData.paceStatus === 'behind'" class="text-sm text-orange-700 mb-3">
          You're running late. You could fast-track remaining steps.
        </div>
      </div>

      <!-- Action Buttons -->
      <div v-if="paceData" class="flex gap-2 mt-4">
        <button @click="goToAdjustments" class="btn btn-primary flex-1">
          Adjust Target
        </button>
        <button @click="resetCalculation" class="btn flex-1">
          Clear & Recalculate
        </button>
      </div>

      <!-- Back Button -->
      <button @click="goBack" class="btn w-full mt-4">
        Back to Tracker
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useActiveBakeStore } from '../stores/activeBake'
import { useScheduleCalculator } from '../composables/useScheduleCalculator'
import { usePaceCalculation } from '../composables/usePaceCalculation'

const router = useRouter()
const activeBakeStore = useActiveBakeStore()
const { formatTime, formatDate } = useScheduleCalculator()
const { calculatePace, formatPaceMessage } = usePaceCalculation()

const selectedStepId = ref('')
const hoursOnStep = ref(0)
const minutesOnStep = ref(0)
const paceData = ref(null)

const availableSteps = computed(() => {
  return activeBakeStore.schedule
})

function formatElapsed(startTime) {
  const start = new Date(startTime)
  const now = new Date()
  const diffMs = now - start
  const hours = Math.floor(diffMs / 3600000)
  const minutes = Math.round((diffMs % 3600000) / 60000)

  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

function calculatePaceStatus() {
  if (!selectedStepId.value || !activeBakeStore.schedule.length) {
    alert('Please select a step')
    return
  }

  const totalElapsedMinutes = hoursOnStep.value * 60 + minutesOnStep.value
  const pace = calculatePace(
    activeBakeStore.schedule,
    selectedStepId.value,
    totalElapsedMinutes,
    activeBakeStore.bake.actualStartTime,
    new Date(activeBakeStore.bake.originalTargetTime)
  )

  if (pace) {
    paceData.value = {
      ...pace,
      message: formatPaceMessage(pace)
    }
    activeBakeStore.updatePace(pace)
  }
}

function goToAdjustments() {
  // Navigate to adjustment view (will implement in Phase 2B)
  router.push('/tracker')
}

function resetCalculation() {
  selectedStepId.value = ''
  hoursOnStep.value = 0
  minutesOnStep.value = 0
  paceData.value = null
}

function goBack() {
  router.push('/tracker')
}
</script>
