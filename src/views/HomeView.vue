<template>
  <div>
    <!-- Active Bake Banner -->
    <div v-if="activeBakeStore.isActive" class="card border-l-4 border-gray-900 mb-6 bg-gray-50">
      <div class="flex justify-between items-start mb-2">
        <div class="text-sm font-bold text-gray-700">🍞 You Have an Active Bake</div>
        <div class="flex gap-1">
          <button
            @click="openEditModal"
            class="text-lg hover:text-gray-700 p-1 rounded"
            title="Edit target time"
            aria-label="Edit bake target time"
          >
            ✏️
          </button>
          <button
            @click="deleteActiveBake"
            class="text-lg hover:text-red-700 p-1 rounded"
            title="Delete active bake"
            aria-label="Delete active bake"
          >
            🗑️
          </button>
        </div>
      </div>
      <div class="text-sm">Started at <strong>{{ formatTime(activeBakeStore.bake.actualStartTime) }}</strong></div>
      <div class="text-xs text-gray-600">Elapsed: <strong>{{ formatElapsed(activeBakeStore.bake.actualStartTime) }}</strong></div>
      <div class="flex gap-2 mt-4">
        <RouterLink to="/resume" class="btn btn-primary flex-1">
          ✓ Check Progress
        </RouterLink>
        <RouterLink to="/tracker" class="btn flex-1">
          📊 Track Steps
        </RouterLink>
      </div>
      <button @click="endCurrentBake" class="btn w-full mt-2 text-gray-600">
        Start Different Bake
      </button>

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
            <button
              @click="saveEditTarget"
              class="btn btn-primary flex-1"
            >
              Save
            </button>
            <button
              @click="showEditModal = false"
              class="btn flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Links -->
    <div class="flex gap-2 mb-6">
      <RouterLink to="/templates" class="btn flex-1 text-sm">
        📋 Templates
      </RouterLink>
      <RouterLink to="/history" class="btn flex-1 text-sm">
        📊 History
      </RouterLink>
    </div>

    <h2 class="text-2xl font-bold mb-6">{{ activeBakeStore.isActive ? 'Or start another bake' : 'Start a New Bake' }}</h2>

    <!-- Quick action buttons -->
    <div class="flex gap-2 mb-6">
      <RouterLink to="/join" class="btn btn-primary flex-1">
        🔄 Join Existing Bake
      </RouterLink>
    </div>

    <div class="mb-8">
      <h3 class="text-lg font-bold mb-4">Select a Template</h3>
      <div v-if="templatesStore.templates.length" class="space-y-2">
        <button
          v-for="template in templatesStore.templates"
          :key="template.id"
          @click="selectTemplate(template)"
          class="w-full text-left card hover:bg-gray-50 cursor-pointer"
        >
          <div class="font-bold">{{ template.name }}</div>
          <div class="text-sm text-gray-600">{{ Object.keys(template.workflow).length }} steps</div>
        </button>
      </div>

      <div v-else class="text-gray-600">
        No templates available. Create one from the calculator.
      </div>
    </div>

    <div v-if="selectedTemplate" class="border-t pt-6">
      <h3 class="text-lg font-bold mb-4">Next: Set Your Target Time</h3>
      <p class="text-gray-600 mb-4">
        When do you want your loaf to be <strong>completely cooled and ready</strong>?
      </p>

      <RouterLink
        to="/calculator"
        class="btn btn-primary inline-block"
      >
        Continue to Calculator →
      </RouterLink>

      <button
        @click="selectedTemplate = null"
        class="btn ml-2"
      >
        Choose Different Template
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useTemplatesStore } from '../stores/templates'
import { useActiveBakeStore } from '../stores/activeBake'
import { useScheduleCalculator } from '../composables/useScheduleCalculator'

const router = useRouter()
const templatesStore = useTemplatesStore()
const activeBakeStore = useActiveBakeStore()
const { formatTime } = useScheduleCalculator()

const selectedTemplate = ref(null)
const showEditModal = ref(false)
const editTargetDate = ref('')
const editTargetTime = ref('')

function selectTemplate(template) {
  selectedTemplate.value = template
  // Store the selected template for use in calculator
  localStorage.setItem('selectedTemplate', JSON.stringify(template))
}

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

function endCurrentBake() {
  if (confirm('Start a different bake? Your current progress will still be saved if you want to resume it later.')) {
    activeBakeStore.clearBake()
    selectedTemplate.value = null
    localStorage.removeItem('selectedTemplate')
  }
}

function openEditModal() {
  const target = new Date(activeBakeStore.bake.targetCompletionTime)
  editTargetDate.value = target.toISOString().split('T')[0]
  editTargetTime.value = target.toTimeString().slice(0, 5)
  showEditModal.value = true
}

function saveEditTarget() {
  const dateTime = new Date(`${editTargetDate.value}T${editTargetTime.value}`)
  if (isNaN(dateTime.getTime())) {
    alert('Invalid date/time')
    return
  }
  activeBakeStore.editBake({ targetCompletionTime: dateTime })
  showEditModal.value = false
}

function deleteActiveBake() {
  if (confirm('Delete this active bake? You can still resume it from history if needed.')) {
    activeBakeStore.clearBake()
    selectedTemplate.value = null
    localStorage.removeItem('selectedTemplate')
  }
}

watch(selectedTemplate, (template) => {
  if (template) {
    // Auto-navigate to calculator after selection
    setTimeout(() => {
      router.push('/calculator')
    }, 500)
  }
})
</script>
