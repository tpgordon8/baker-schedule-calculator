<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Join Existing Bake</h2>
    <p class="text-gray-600 mb-6">
      Already started baking? Tell us where you are and we'll calculate your pace.
    </p>

    <div class="mb-6">
      <!-- Progress indicator -->
      <div class="flex gap-2 mb-6">
        <div
          v-for="i in 6"
          :key="i"
          :class="[
            'h-2 flex-1 rounded',
            i <= currentStep ? 'bg-gray-900' : 'bg-gray-200'
          ]"
        />
      </div>

      <!-- Step 1: Template Selection -->
      <div v-if="currentStep === 1" class="card">
        <h3 class="text-lg font-bold mb-4">Step 1: Select Template</h3>
        <p class="text-gray-600 mb-4">Which recipe are you using?</p>
        <div class="space-y-2">
          <button
            v-for="template in templates"
            :key="template.id"
            @click="selectTemplate(template)"
            :class="[
              'w-full text-left p-4 border rounded cursor-pointer',
              selectedTemplate?.id === template.id
                ? 'border-gray-900 bg-gray-50'
                : 'hover:bg-gray-50'
            ]"
          >
            <div class="font-bold">{{ template.name }}</div>
            <div class="text-sm text-gray-600">
              {{ Object.keys(template.workflow).length }} steps
            </div>
          </button>
        </div>
      </div>

      <!-- Step 2: Actual Start Time -->
      <div v-if="currentStep === 2" class="card">
        <h3 class="text-lg font-bold mb-4">Step 2: When Did You Start?</h3>
        <p class="text-gray-600 mb-4">
          What time did you actually start the baking process?
        </p>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Date</label>
          <input
            v-model="actualStartDate"
            type="date"
            class="w-full p-2 border rounded"
          />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Time</label>
          <input
            v-model="actualStartTime"
            type="time"
            class="w-full p-2 border rounded"
          />
        </div>
        <div v-if="startTimeError" class="p-3 bg-red-50 text-red-700 rounded text-sm">
          {{ startTimeError }}
        </div>
        <div v-else-if="actualStartDateTime" class="p-3 bg-gray-50 rounded text-sm">
          <strong>You started:</strong> {{ formatStartTime() }}
          <br />
          <strong>Hours elapsed:</strong> {{ calculateElapsedHours() }}h
        </div>
      </div>

      <!-- Step 3: Target Completion Time -->
      <div v-if="currentStep === 3" class="card">
        <h3 class="text-lg font-bold mb-4">Step 3: Target Finish Time</h3>
        <p class="text-gray-600 mb-4">
          When do you want your loaf completely cooled and ready?
        </p>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Date</label>
          <input
            v-model="targetDate"
            type="date"
            class="w-full p-2 border rounded"
          />
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium mb-2">Time</label>
          <input
            v-model="targetTime"
            type="time"
            class="w-full p-2 border rounded"
          />
        </div>
        <div v-if="targetTimeError" class="p-3 bg-red-50 text-red-700 rounded text-sm">
          {{ targetTimeError }}
        </div>
        <div v-else-if="targetDateTime" class="p-3 bg-gray-50 rounded text-sm">
          <strong>Target finish:</strong> {{ formatTargetTime() }}
          <br />
          <strong>Time available:</strong> {{ calculateTimeAvailable() }}
        </div>
      </div>

      <!-- Step 4: Completed Steps Checklist -->
      <div v-if="currentStep === 4" class="card">
        <h3 class="text-lg font-bold mb-4">Step 4: What Steps Are Done?</h3>
        <p class="text-gray-600 mb-4">
          Check off all the steps you've already completed.
        </p>
        <StepChecklist
          v-model="completedStepIds"
          :steps="workflowSteps"
        />
      </div>

      <!-- Step 5: Current Step -->
      <div v-if="currentStep === 5" class="card">
        <h3 class="text-lg font-bold mb-4">Step 5: What Step Are You On Now?</h3>
        <p class="text-gray-600 mb-4">
          Which step are you currently working on?
        </p>
        <div class="space-y-2">
          <button
            v-for="step in remainingSteps"
            :key="step.stepId"
            @click="currentStepId = step.stepId"
            :class="[
              'w-full text-left p-4 border rounded cursor-pointer',
              currentStepId === step.stepId
                ? 'border-gray-900 bg-gray-50'
                : 'hover:bg-gray-50'
            ]"
          >
            <div class="font-bold">{{ step.stepName }}</div>
            <div class="text-sm text-gray-600">{{ formatDuration(step.duration) }}</div>
          </button>
        </div>
      </div>

      <!-- Step 6: Elapsed Time on Current Step -->
      <div v-if="currentStep === 6" class="card">
        <h3 class="text-lg font-bold mb-4">Step 6: Time on Current Step</h3>
        <p class="text-gray-600 mb-4">
          How long have you been on "{{ getCurrentStepName() }}"?
        </p>
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium mb-2">Hours</label>
            <input
              v-model.number="currentStepHours"
              type="number"
              min="0"
              class="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Minutes</label>
            <input
              v-model.number="currentStepMinutes"
              type="number"
              min="0"
              max="59"
              class="w-full p-2 border rounded"
            />
          </div>
        </div>
        <div v-if="currentStepError" class="p-3 bg-red-50 text-red-700 rounded text-sm mb-4">
          {{ currentStepError }}
        </div>
        <div v-else class="p-3 bg-gray-50 rounded text-sm">
          <strong>Elapsed on this step:</strong> {{ currentStepHours }}h {{ currentStepMinutes }}m
        </div>
      </div>

      <!-- Step 7: Review -->
      <div v-if="currentStep === 7" class="card">
        <h3 class="text-lg font-bold mb-4">Review & Confirm</h3>
        <div class="space-y-4">
          <div class="p-3 bg-gray-50 rounded">
            <div class="text-sm text-gray-600">Template</div>
            <div class="font-bold">{{ selectedTemplate.name }}</div>
          </div>
          <div class="p-3 bg-gray-50 rounded">
            <div class="text-sm text-gray-600">Started</div>
            <div class="font-bold">{{ formatStartTime() }}</div>
            <div class="text-sm">{{ calculateElapsedHours() }}h elapsed</div>
          </div>
          <div class="p-3 bg-gray-50 rounded">
            <div class="text-sm text-gray-600">Target Finish</div>
            <div class="font-bold">{{ formatTargetTime() }}</div>
          </div>
          <div class="p-3 bg-gray-50 rounded">
            <div class="text-sm text-gray-600">Completed Steps</div>
            <div class="font-bold">{{ completedStepIds.length }} of {{ workflowSteps.length }}</div>
            <div v-if="completedStepIds.length > 0" class="text-sm mt-2">
              {{ getCompletedStepNames() }}
            </div>
          </div>
          <div class="p-3 bg-gray-50 rounded">
            <div class="text-sm text-gray-600">Currently On</div>
            <div class="font-bold">{{ getCurrentStepName() }}</div>
            <div class="text-sm">{{ currentStepHours }}h {{ currentStepMinutes }}m elapsed</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex gap-2 mt-6">
      <RouterLink to="/" class="btn">Cancel</RouterLink>
      <button
        v-if="currentStep > 1"
        @click="previousStep"
        class="btn flex-1"
      >
        ← Back
      </button>
      <button
        v-if="currentStep < 7"
        @click="nextStep"
        :disabled="!canProceed"
        class="btn btn-primary flex-1"
        :class="{ 'opacity-50 cursor-not-allowed': !canProceed }"
      >
        Next →
      </button>
      <button
        v-if="currentStep === 7"
        @click="joinBake"
        class="btn btn-primary flex-1"
      >
        Join Bake & Continue
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useTemplatesStore } from '../stores/templates'
import { useActiveBakeStore } from '../stores/activeBake'
import { useScheduleCalculator } from '../composables/useScheduleCalculator'
import { usePaceCalculation } from '../composables/usePaceCalculation'
import StepChecklist from '../components/StepChecklist.vue'

const router = useRouter()
const templatesStore = useTemplatesStore()
const activeBakeStore = useActiveBakeStore()
const { generateSchedule, formatTime, formatDate } = useScheduleCalculator()
const { calculatePace } = usePaceCalculation()

const currentStep = ref(1)
const selectedTemplate = ref(null)
const actualStartDate = ref('')
const actualStartTime = ref('')
const targetDate = ref('')
const targetTime = ref('')
const completedStepIds = ref([])
const currentStepId = ref('')
const currentStepHours = ref(0)
const currentStepMinutes = ref(0)

// Computed properties
const templates = computed(() => templatesStore.templates)

const workflowSteps = computed(() => {
  if (!selectedTemplate.value) return []
  return Object.entries(selectedTemplate.value.workflow).map(([stepId, stepData]) => ({
    stepId,
    stepName: stepId.replace(/([A-Z])/g, ' $1').trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    duration: stepData.minutes,
    description: stepData.description
  }))
})

const remainingSteps = computed(() => {
  return workflowSteps.value.filter(s => !completedStepIds.value.includes(s.stepId))
})

const actualStartDateTime = computed(() => {
  if (!actualStartDate.value || !actualStartTime.value) return null
  return new Date(`${actualStartDate.value}T${actualStartTime.value}`)
})

const targetDateTime = computed(() => {
  if (!targetDate.value || !targetTime.value) return null
  return new Date(`${targetDate.value}T${targetTime.value}`)
})

const startTimeError = computed(() => {
  if (!actualStartDateTime.value) return ''
  if (actualStartDateTime.value > new Date()) {
    return 'Start time cannot be in the future'
  }
  return ''
})

const targetTimeError = computed(() => {
  if (!targetDateTime.value) return ''
  if (targetDateTime.value < new Date()) {
    return 'Target time cannot be in the past (consider extending your timeline)'
  }
  if (actualStartDateTime.value && targetDateTime.value <= actualStartDateTime.value) {
    return 'Target must be after start time'
  }
  return ''
})

const currentStepError = computed(() => {
  if (!currentStepId.value) return ''
  const totalElapsed = currentStepHours.value * 60 + currentStepMinutes.value
  const currentStep = workflowSteps.value.find(s => s.stepId === currentStepId.value)
  if (!currentStep) return 'Step not found'
  if (totalElapsed > currentStep.duration) {
    return `Time on current step (${totalElapsed}m) exceeds step duration (${currentStep.duration}m)`
  }
  return ''
})

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return selectedTemplate.value !== null
    case 2:
      return !startTimeError.value && actualStartDateTime.value
    case 3:
      return !targetTimeError.value && targetDateTime.value
    case 4:
      return completedStepIds.value.length >= 0
    case 5:
      return currentStepId.value !== ''
    case 6:
      return !currentStepError.value
    default:
      return false
  }
})

// Methods
function selectTemplate(template) {
  selectedTemplate.value = template
}

function formatStartTime() {
  if (!actualStartDateTime.value) return ''
  return formatDate(actualStartDateTime.value) + ' at ' + formatTime(actualStartDateTime.value)
}

function formatTargetTime() {
  if (!targetDateTime.value) return ''
  return formatDate(targetDateTime.value) + ' at ' + formatTime(targetDateTime.value)
}

function calculateElapsedHours() {
  if (!actualStartDateTime.value) return 0
  const now = new Date()
  const diff = (now - actualStartDateTime.value) / (1000 * 60 * 60)
  return Math.round(diff * 10) / 10
}

function calculateTimeAvailable() {
  if (!actualStartDateTime.value || !targetDateTime.value) return ''
  const diffMs = targetDateTime.value - actualStartDateTime.value
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m from start to finish`
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

function getCurrentStepName() {
  if (!currentStepId.value) return 'Not selected'
  const step = workflowSteps.value.find(s => s.stepId === currentStepId.value)
  return step ? step.stepName : 'Unknown'
}

function getCompletedStepNames() {
  const completed = workflowSteps.value.filter(s => completedStepIds.value.includes(s.stepId))
  return completed.map(s => s.stepName).join(', ')
}

function nextStep() {
  if (canProceed.value && currentStep.value < 7) {
    currentStep.value++
  }
}

function previousStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

function joinBake() {
  console.log('joinBake() called', {
    selectedTemplate: selectedTemplate.value?.name,
    actualStartDateTime: actualStartDateTime.value,
    targetDateTime: targetDateTime.value,
    currentStepId: currentStepId.value,
    completedStepIds: completedStepIds.value
  })

  if (!selectedTemplate.value) {
    console.error('joinBake: No template selected')
    return
  }
  if (!actualStartDateTime.value) {
    console.error('joinBake: No actual start date/time')
    return
  }
  if (!targetDateTime.value) {
    console.error('joinBake: No target date/time')
    return
  }

  try {
    // Initialize bake with retroactive data
    activeBakeStore.initializeBake(targetDateTime.value.toISOString(), selectedTemplate.value)

    // Mark as retroactive
    activeBakeStore.bake.isRetroactive = true
    activeBakeStore.bake.actualStartTime = actualStartDateTime.value.toISOString()
    activeBakeStore.bake.completedStepIds = completedStepIds.value
    activeBakeStore.bake.currentStepId = currentStepId.value
    activeBakeStore.bake.elapsedOnCurrentStepMinutes = currentStepHours.value * 60 + currentStepMinutes.value

    // Generate schedule
    const schedule = generateSchedule(
      selectedTemplate.value,
      targetDateTime.value.toISOString()
    )

    // Mark completed steps
    schedule.forEach(step => {
      if (completedStepIds.value.includes(step.stepId)) {
        step.status = 'completed'
        step.actualTime = new Date().toISOString()
      }
    })

    // Update schedule
    activeBakeStore.updateSchedule(schedule)

    // Calculate retroactive pace
    const paceData = calculatePace(
      schedule,
      currentStepId.value,
      completedStepIds.value.reduce((sum, stepId) => {
        const step = schedule.find(s => s.stepId === stepId)
        return sum + (step?.duration || 0)
      }, 0) + (currentStepHours.value * 60 + currentStepMinutes.value),
      actualStartDateTime.value.toISOString(),
      targetDateTime.value
    )

    if (paceData) {
      activeBakeStore.updatePace(paceData)
    }

    console.log('joinBake: Success, navigating to /tracker')
    // Navigate to tracker
    router.push('/tracker')
  } catch (error) {
    console.error('joinBake: Error occurred', error)
  }
}
</script>
