<template>
  <div>
    <!-- Active Bake Banner -->
    <div v-if="activeBakeStore.isActive" class="card border-l-4 border-gray-900 mb-6 bg-gray-50">
      <div class="text-sm font-bold text-gray-700 mb-2">🍞 You Have an Active Bake</div>
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

watch(selectedTemplate, (template) => {
  if (template) {
    // Auto-navigate to calculator after selection
    setTimeout(() => {
      router.push('/calculator')
    }, 500)
  }
})
</script>
