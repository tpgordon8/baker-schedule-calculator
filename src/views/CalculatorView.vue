<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Calculate Your Bake Schedule</h2>

    <div class="card">
      <label class="block text-sm font-bold mb-2">
        What time do you want your loaf to be <strong>completely cooled</strong>?
      </label>
      <input
        v-model="targetDateTime"
        type="datetime-local"
        class="input-field"
        placeholder="Select date and time"
      />
      <p class="text-xs text-gray-600 mt-2">Include cooling time! (usually 1-2 hours)</p>
    </div>

    <div class="card">
      <label class="block text-sm font-bold mb-2">Bulk Fermentation Duration</label>
      <div class="space-y-2">
        <label class="flex items-center">
          <input v-model="bulkDuration" type="radio" value="180" class="mr-2" />
          <span>3 hours (warm room 75-80°F)</span>
        </label>
        <label class="flex items-center">
          <input v-model="bulkDuration" type="radio" value="360" class="mr-2" />
          <span>6 hours (room temp 68-72°F) - Default</span>
        </label>
        <label class="flex items-center">
          <input v-model="bulkDuration" type="radio" value="480" class="mr-2" />
          <span>8 hours (cool room 65°F)</span>
        </label>
        <label class="flex items-center">
          <input v-model="bulkDuration" type="radio" value="custom" class="mr-2" />
          <span>Custom:</span>
          <input
            v-if="bulkDuration === 'custom'"
            v-model.number="customBulkDuration"
            type="number"
            placeholder="minutes"
            class="input-field ml-2 w-20"
            min="60"
            max="1440"
          />
        </label>
      </div>
    </div>

    <div class="card">
      <label class="block text-sm font-bold mb-2">Final Proof Method</label>
      <div class="space-y-2">
        <label class="flex items-center">
          <input v-model="proofMethod" type="radio" value="room-temp" class="mr-2" />
          <span>Room temp (1-4 hours)</span>
        </label>
        <label class="flex items-center">
          <input v-model="proofMethod" type="radio" value="cold-proof" class="mr-2" />
          <span>Cold proof / Fridge overnight (24-48 hours)</span>
        </label>
      </div>
    </div>

    <button
      @click="generateSchedule"
      :disabled="!targetDateTime || loading"
      class="btn btn-primary w-full disabled:opacity-50"
    >
      {{ loading ? 'Generating...' : 'Generate My Bake Schedule' }}
    </button>

    <div v-if="schedule.length" class="mt-8">
      <h3 class="text-lg font-bold mb-4">Your Sourdough Timeline</h3>
      <ScheduleTimeline :schedule="schedule" :target-time="targetTime" />

      <div class="mt-6 flex gap-2">
        <button @click="goToTracker" class="btn btn-primary flex-1">
          Start Baking →
        </button>
        <button @click="resetCalculator" class="btn flex-1">
          Start Over
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useScheduleCalculator } from '../composables/useScheduleCalculator'
import { useActiveBakeStore } from '../stores/activeBake'
import ScheduleTimeline from '../components/ScheduleTimeline.vue'

const router = useRouter()
const { generateSchedule: calcSchedule } = useScheduleCalculator()
const activeBakeStore = useActiveBakeStore()

const targetDateTime = ref('')
const bulkDuration = ref('360')
const customBulkDuration = ref(360)
const proofMethod = ref('room-temp')
const loading = ref(false)
const schedule = ref([])

// Get template from localStorage (set in HomeView)
const selectedTemplate = JSON.parse(localStorage.getItem('selectedTemplate') || '{}')

const targetTime = computed(() => {
  if (!targetDateTime.value) return null
  return new Date(targetDateTime.value)
})

function generateSchedule() {
  if (!targetDateTime.value) {
    alert('Please select a target time')
    return
  }

  loading.value = true

  // Update template with user selections
  const workingTemplate = JSON.parse(JSON.stringify(selectedTemplate))

  const actualBulkDuration = bulkDuration.value === 'custom' ? customBulkDuration.value : parseInt(bulkDuration.value)
  workingTemplate.workflow.bulkFermentation.minutes = actualBulkDuration

  if (proofMethod.value === 'cold-proof') {
    workingTemplate.workflow.finalProof.minutes = 24 * 60 // 24 hours default
  }

  setTimeout(() => {
    schedule.value = calcSchedule(targetTime.value, workingTemplate)

    // Initialize active bake in store
    activeBakeStore.initializeBake(targetTime.value, workingTemplate)
    activeBakeStore.updateSchedule(schedule.value)

    loading.value = false
  }, 300)
}

function goToTracker() {
  router.push('/tracker')
}

function resetCalculator() {
  targetDateTime.value = ''
  bulkDuration.value = '360'
  schedule.value = []
}
</script>
