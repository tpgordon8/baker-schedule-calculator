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
        <button @click="toggleBakeMenu" class="btn">
          ⚙️
        </button>
        <button @click="endBake" class="btn flex-1">
          Finish Bake
        </button>
      </div>

      <!-- Bake Settings Menu -->
      <div v-if="showBakeMenu" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white border-4 border-gray-900 p-6 max-w-sm w-full">
          <h3 class="text-lg font-bold mb-4">Bake Options</h3>
          <div class="space-y-2">
            <button @click="openEditModal" class="btn w-full text-left">
              ✏️ Edit Target Time
            </button>
            <button @click="togglePause" class="btn w-full text-left">
              {{ activeBakeStore.bake.isPaused ? '▶️ Resume' : '⏸️ Pause' }}
            </button>
            <button @click="deleteBake" class="btn w-full text-left text-red-700">
              🗑️ Delete Bake
            </button>
            <button @click="toggleBakeMenu" class="btn w-full">
              Cancel
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Target Time Modal -->
      <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
            <button @click="saveEditTarget" class="btn btn-primary flex-1">
              Save
            </button>
            <button @click="showEditModal = false" class="btn flex-1">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification Settings -->
    <NotificationSettings
      :is-showing="showNotificationSettings"
      @close="showNotificationSettings = false"
    />

    <AdjustmentModal
      v-if="showAdjustment"
      :step="adjustingStep"
      @close="showAdjustment = false"
      @adjust="handleAdjustment"
    />
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useActiveBakeStore } from '../stores/activeBake'
import { useNotificationsStore } from '../stores/notifications'
import { useScheduleCalculator } from '../composables/useScheduleCalculator'
import { useNotifications } from '../composables/useNotifications'
import StepCard from '../components/StepCard.vue'
import AdjustmentModal from '../components/AdjustmentModal.vue'
import ProgressBar from '../components/ProgressBar.vue'
import StepTimer from '../components/StepTimer.vue'
import NotificationSettings from '../components/NotificationSettings.vue'

const router = useRouter()
const activeBakeStore = useActiveBakeStore()
const notificationsStore = useNotificationsStore()
const { formatTime, formatDate, adjustScheduleForDelay } = useScheduleCalculator()
const { requestPermission, scheduleAllNotifications } = useNotifications()

const showAdjustment = ref(false)
const adjustingStepId = ref(null)
const adjustingStepIndex = ref(null)
const showNotificationSettings = ref(false)
const showBakeMenu = ref(false)
const showEditModal = ref(false)
const editTargetDate = ref('')
const editTargetTime = ref('')

// Request notification permission on mount
onMounted(async () => {
  const targetDate = new Date(activeBakeStore.bake.targetCompletionTime)
  editTargetDate.value = targetDate.toISOString().split('T')[0]
  editTargetTime.value = targetDate.toTimeString().slice(0, 5)

  // Request notification permission
  if (!notificationsStore.permissionRequested) {
    await requestPermission()
    if (notificationsStore.permissionGranted) {
      scheduleAllNotifications(schedule.value)
    }
  }
})

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

function toggleBakeMenu() {
  showBakeMenu.value = !showBakeMenu.value
}

function openEditModal() {
  showBakeMenu.value = false
  showEditModal.value = true
}

function saveEditTarget() {
  const newDate = new Date(`${editTargetDate.value}T${editTargetTime.value}`)
  activeBakeStore.editBake({
    targetCompletionTime: newDate.toISOString()
  })
  showEditModal.value = false
}

function togglePause() {
  showBakeMenu.value = false
  if (activeBakeStore.bake.isPaused) {
    activeBakeStore.resumeBake()
    scheduleAllNotifications(schedule.value, activeBakeStore.bake.actualStartTime)
  } else {
    activeBakeStore.pauseBake()
  }
}

function deleteBake() {
  if (confirm('Delete this bake? This cannot be undone.')) {
    showBakeMenu.value = false
    activeBakeStore.clearBake()
    router.push('/')
  }
}
</script>
