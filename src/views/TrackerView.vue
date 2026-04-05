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

      <h3 class="text-lg font-bold mb-4">Steps</h3>

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
