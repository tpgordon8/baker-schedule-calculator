<template>
  <div>
    <h2 class="text-2xl font-bold mb-2">Track Your Bake</h2>

    <div v-if="!activeBakeStore.isActive" class="card text-gray-600">
      <p>No active bake. <RouterLink to="/" class="underline">Start a new bake</RouterLink></p>
    </div>

    <div v-else>
      <div class="card">
        <div class="text-sm text-gray-600">Target Completion Time</div>
        <div class="text-2xl font-bold">{{ formatTime(activeBakeStore.bake.targetCompletionTime) }}</div>
        <div class="text-sm text-gray-600">{{ formatDate(activeBakeStore.bake.targetCompletionTime) }}</div>
        <div v-if="activeBakeStore.pace" class="text-xs text-gray-600 mt-2 p-2 bg-gray-50">
          <p>{{ activeBakeStore.pace.message }}</p>
        </div>
      </div>

      <!-- Progress Bar -->
      <ProgressBar
        :completed-count="completedStepsCount"
        :total-count="schedule.length"
      />

      <!-- Step Timer (for current step) -->
      <StepTimer
        v-if="currentStep"
        :current-step="currentStep"
        :step-start-time="stepStartTime"
        :planned-duration="currentStep.duration"
        class="mt-4"
      />

      <h3 class="text-lg font-bold mb-4 mt-6">Steps</h3>

      <div class="space-y-3">
        <StepCard
          v-for="(step, idx) in schedule"
          :key="step.stepId"
          :step="step"
          :index="idx"
          :total-steps="schedule.length"
          @mark-complete="markStepComplete(step.stepId)"
          @adjust="openAdjustmentModal(step.stepId, idx)"
        />
      </div>

      <div class="flex gap-2 mt-8">
        <RouterLink to="/resume" class="btn flex-1">
          📊 Check Pace
        </RouterLink>
        <button @click="endBake" class="btn flex-1">
          Finish Bake
        </button>
      </div>
    </div>

    <AdjustmentModal
      v-if="showAdjustment"
      :step="adjustingStep"
      @close="showAdjustment = false"
      @adjust="handleAdjustment"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useActiveBakeStore } from '../stores/activeBake'
import { useScheduleCalculator } from '../composables/useScheduleCalculator'
import StepCard from '../components/StepCard.vue'
import AdjustmentModal from '../components/AdjustmentModal.vue'
import ProgressBar from '../components/ProgressBar.vue'
import StepTimer from '../components/StepTimer.vue'

const router = useRouter()
const activeBakeStore = useActiveBakeStore()
const { formatTime, formatDate, adjustScheduleForDelay } = useScheduleCalculator()

const showAdjustment = ref(false)
const adjustingStepId = ref(null)
const adjustingStepIndex = ref(null)

const schedule = computed(() => activeBakeStore.schedule)

const adjustingStep = computed(() => {
  if (!adjustingStepId.value) return null
  return schedule.value.find(s => s.stepId === adjustingStepId.value)
})

const completedStepsCount = computed(() => {
  return schedule.value.filter(s => s.status === 'completed').length
})

const currentStep = computed(() => {
  return schedule.value.find(s => s.status === 'pending')
})

const stepStartTime = computed(() => {
  if (!currentStep.value) return new Date()
  // Find the step before current to calculate when this step started
  const currentIndex = schedule.value.findIndex(s => s.stepId === currentStep.value.stepId)
  if (currentIndex === 0) return new Date(activeBakeStore.bake.actualStartTime)
  // Sum durations of all previous steps from start time
  let totalMinutes = 0
  for (let i = 0; i < currentIndex; i++) {
    totalMinutes += schedule.value[i].duration
  }
  const startMs = new Date(activeBakeStore.bake.actualStartTime).getTime()
  return new Date(startMs + totalMinutes * 60000)
})

function markStepComplete(stepId) {
  const step = schedule.value.find(s => s.stepId === stepId)
  if (step && step.status === 'pending') {
    const now = new Date()
    activeBakeStore.markStepComplete(stepId, now)
    step.actualTime = now
    step.status = 'completed'
  }
}

function openAdjustmentModal(stepId, idx) {
  adjustingStepId.value = stepId
  adjustingStepIndex.value = idx
  showAdjustment.value = true
}

function handleAdjustment(adjustment) {
  const { type, delayMinutes } = adjustment

  if (type === 'late') {
    const delayedStep = adjustingStep.value
    const actualTime = new Date(delayedStep.plannedTime.getTime() + delayMinutes * 60000)

    const { schedule: newSchedule, newTarget } = adjustScheduleForDelay(
      schedule.value,
      adjustingStepId.value,
      actualTime,
      new Date(activeBakeStore.bake.targetCompletionTime)
    )

    // Update the bake
    activeBakeStore.bake.targetCompletionTime = newTarget
    activeBakeStore.updateSchedule(newSchedule)

    markStepComplete(adjustingStepId.value)

    activeBakeStore.addAdjustment({
      type: 'stepDelay',
      affectedStep: adjustingStepId.value,
      delayMinutes,
      newTarget
    })
  }

  showAdjustment.value = false
}

function endBake() {
  if (confirm('End this bake session? You can view the history on the home page.')) {
    activeBakeStore.clearBake()
    router.push('/')
  }
}
</script>
