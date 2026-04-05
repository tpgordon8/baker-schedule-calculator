<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Check Your Progress</h2>

    <div v-if="!activeBakeStore.isActive" class="card text-gray-600">
      <p>No active bake to resume. <RouterLink to="/" class="underline">Start a new bake</RouterLink></p>
    </div>

    <div v-else>
      <!-- Started Time Banner -->
      <div class="card bg-gray-50">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Started</div>
            <div class="text-2xl font-bold text-gray-900">{{ formatTime(activeBakeStore.bake.actualStartTime) }}</div>
            <div class="text-xs text-gray-500 mt-1">{{ formatDate(activeBakeStore.bake.actualStartTime) }}</div>
          </div>
          <div>
            <div class="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Elapsed Time</div>
            <div class="text-2xl font-bold text-gray-900">{{ formatElapsed(activeBakeStore.bake.actualStartTime) }}</div>
            <div class="text-xs text-gray-500 mt-1">Since start</div>
          </div>
        </div>
      </div>

      <!-- Step Selector -->
      <div class="card">
        <div class="mb-4">
          <label class="block text-sm font-bold mb-2">Which step are you on right now?</label>
          <select v-model="selectedStepId" class="input-field w-full">
            <option value="">Select a step...</option>
            <option v-for="step in availableSteps" :key="step.stepId" :value="step.stepId">
              {{ step.stepName }}
            </option>
          </select>
          <p v-if="selectedStepId && availableSteps.find(s => s.stepId === selectedStepId)" class="text-xs text-gray-500 mt-2">
            Expected duration: {{ availableSteps.find(s => s.stepId === selectedStepId)?.duration }} min
          </p>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-bold mb-3">How long have you been on this step?</label>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <input
                v-model.number="hoursOnStep"
                type="number"
                min="0"
                max="24"
                placeholder="0"
                class="input-field w-full text-center"
              />
              <div class="text-xs text-gray-600 mt-2 text-center font-medium">Hours</div>
            </div>
            <div>
              <input
                v-model.number="minutesOnStep"
                type="number"
                min="0"
                max="59"
                placeholder="0"
                class="input-field w-full text-center"
              />
              <div class="text-xs text-gray-600 mt-2 text-center font-medium">Minutes</div>
            </div>
          </div>
        </div>

        <button @click="calculatePace" class="btn btn-primary w-full" :disabled="!selectedStepId">
          Calculate Pace
        </button>
      </div>

      <!-- Pace Display -->
      <div v-if="paceData" class="card border-l-4" :class="paceData.paceStatus === 'ahead' ? 'border-l-green-600' : paceData.paceStatus === 'behind' ? 'border-l-orange-600' : 'border-l-blue-600'">
        <div class="flex justify-between items-start mb-4">
          <div>
            <div class="text-sm font-medium text-gray-600 mb-1">PACE STATUS</div>
            <div class="text-xl font-bold text-gray-900">{{ paceData.message }}</div>
          </div>
          <button
            @click="openEditTargetModal"
            class="text-xl hover:text-gray-700 p-2 hover:bg-gray-100 rounded transition-colors"
            title="Edit target time"
            aria-label="Edit target completion time"
          >
            ✏️
          </button>
        </div>

        <div class="bg-gray-50 p-3 rounded mb-3 border border-gray-200">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <div class="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Projected finish</div>
              <div class="text-lg font-bold text-gray-900">{{ formatTime(paceData.projectedCompletion) }}</div>
            </div>
            <div>
              <div class="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Original target</div>
              <div class="text-lg font-bold text-gray-900">{{ formatTime(new Date(activeBakeStore.bake.originalTargetTime)) }}</div>
            </div>
          </div>
        </div>

        <div v-if="paceData.paceStatus === 'ahead'" class="bg-green-50 border border-green-200 text-green-800 p-3 rounded text-sm font-medium">
          ✨ You're finishing early! Consider extending fermentation time for better flavor.
        </div>
        <div v-else-if="paceData.paceStatus === 'behind'" class="bg-orange-50 border border-orange-200 text-orange-800 p-3 rounded text-sm font-medium">
          ⚠️ You're running behind schedule. You could fast-track remaining steps.
        </div>
        <div v-else class="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded text-sm font-medium">
          ✓ You're right on pace for your target completion time!
        </div>
      </div>

      <!-- Edit Target Modal -->
      <div v-if="showEditTargetModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white border-4 border-gray-900 p-6 max-w-sm w-full">
          <h3 class="text-lg font-bold mb-4">Edit Target Time</h3>
          <div class="mb-4">
            <label class="block text-sm font-bold mb-2">New Target Date</label>
            <input
              v-model="editTargetDate"
              type="date"
              class="input-field w-full"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-bold mb-2">New Target Time</label>
            <input
              v-model="editTargetTime"
              type="time"
              class="input-field w-full"
            />
          </div>
          <div class="flex gap-2">
            <button
              @click="saveEditTarget"
              class="btn btn-primary flex-1"
            >
              Save
            </button>
            <button
              @click="showEditTargetModal = false"
              class="btn flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div v-if="paceData" class="flex gap-2 mt-4">
        <button @click="showAdjustmentModal" class="btn btn-primary flex-1">
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

    <!-- Adjustment Modal -->
    <AdjustmentOptions
      :is-showing="showAdjustments"
      :current-time="new Date()"
      :original-target="new Date(activeBakeStore.bake.originalTargetTime)"
      :remaining-steps="remainingSteps"
      @apply="handleAdjustment"
      @cancel="showAdjustments = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useActiveBakeStore } from '../stores/activeBake'
import { useScheduleCalculator } from '../composables/useScheduleCalculator'
import { usePaceCalculation } from '../composables/usePaceCalculation'
import AdjustmentOptions from '../components/AdjustmentOptions.vue'

const router = useRouter()
const activeBakeStore = useActiveBakeStore()
const { formatTime, formatDate } = useScheduleCalculator()
const { calculatePace: calculatePaceData, formatPaceMessage } = usePaceCalculation()

const selectedStepId = ref('')
const hoursOnStep = ref(0)
const minutesOnStep = ref(0)
const paceData = ref(null)
const showAdjustments = ref(false)
const showEditTargetModal = ref(false)
const editTargetDate = ref('')
const editTargetTime = ref('')

const availableSteps = computed(() => {
  const schedule = activeBakeStore.schedule || []
  if (schedule.length > 0) {
    return schedule.map(step => ({
      stepId: step.stepId,
      stepName: step.stepName,
      duration: step.duration
    }))
  }

  // Fallback: generate steps from stored template
  let template = activeBakeStore.bake?.template

  // If template missing (old bake), try to get from localStorage
  if (!template) {
    const stored = localStorage.getItem('selectedTemplate')
    if (stored) {
      try {
        template = JSON.parse(stored)
      } catch {
        template = null
      }
    }
  }

  if (!template?.workflow) return []

  return Object.entries(template.workflow)
    .filter(([, step]) => !step.withinBulk)
    .map(([stepId, stepData]) => ({
      stepId,
      stepName: stepData.name || stepId,
      duration: stepData.minutes
    }))
})

const remainingSteps = computed(() => {
  if (!selectedStepId.value || !activeBakeStore.schedule) return []
  const currentIndex = activeBakeStore.schedule.findIndex(s => s.stepId === selectedStepId.value)
  return activeBakeStore.schedule.slice(currentIndex + 1)
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

function calculatePace() {
  if (!selectedStepId.value || !activeBakeStore.schedule.length) {
    alert('Please select a step')
    return
  }

  const totalElapsedMinutes = hoursOnStep.value * 60 + minutesOnStep.value
  const pace = calculatePaceData(
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

function showAdjustmentModal() {
  showAdjustments.value = true
}

function handleAdjustment(adjustment) {
  if (adjustment.type === 'fast-track') {
    // Fast-track: reduce remaining steps to meet new target
    activeBakeStore.adjustTarget(adjustment.newTarget)

    // Recalculate pace with new target
    const totalElapsedMinutes = hoursOnStep.value * 60 + minutesOnStep.value
    const pace = calculatePaceData(
      activeBakeStore.schedule,
      selectedStepId.value,
      totalElapsedMinutes,
      activeBakeStore.bake.actualStartTime,
      adjustment.newTarget
    )

    if (pace) {
      paceData.value = {
        ...pace,
        message: formatPaceMessage(pace)
      }
      activeBakeStore.updatePace(pace)
    }
  } else if (adjustment.type === 'extend') {
    // Extend fermentation: shift target time
    activeBakeStore.adjustTarget(adjustment.newCompletionTime)

    const totalElapsedMinutes = hoursOnStep.value * 60 + minutesOnStep.value
    const pace = calculatePaceData(
      activeBakeStore.schedule,
      selectedStepId.value,
      totalElapsedMinutes,
      activeBakeStore.bake.actualStartTime,
      adjustment.newCompletionTime
    )

    if (pace) {
      paceData.value = {
        ...pace,
        message: formatPaceMessage(pace)
      }
      activeBakeStore.updatePace(pace)
    }
  }

  showAdjustments.value = false
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

function openEditTargetModal() {
  const target = new Date(activeBakeStore.bake.targetCompletionTime)
  editTargetDate.value = target.toISOString().split('T')[0]
  editTargetTime.value = target.toTimeString().slice(0, 5)
  showEditTargetModal.value = true
}

function saveEditTarget() {
  const dateTime = new Date(`${editTargetDate.value}T${editTargetTime.value}`)
  if (isNaN(dateTime.getTime())) {
    alert('Invalid date/time')
    return
  }
  activeBakeStore.editBake({ targetCompletionTime: dateTime })
  showEditTargetModal.value = false
  // Recalculate pace with new target
  if (paceData.value) {
    const totalElapsedMinutes = hoursOnStep.value * 60 + minutesOnStep.value
    const pace = calculatePaceData(
      activeBakeStore.schedule,
      selectedStepId.value,
      totalElapsedMinutes,
      activeBakeStore.bake.actualStartTime,
      dateTime
    )
    if (pace) {
      paceData.value = {
        ...pace,
        message: formatPaceMessage(pace)
      }
      activeBakeStore.updatePace(pace)
    }
  }
}
</script>
