<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">Start a New Bake</h2>

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
import { useRouter } from 'vue-router'
import { useTemplatesStore } from '../stores/templates'
import { useActiveBakeStore } from '../stores/activeBake'
import { RouterLink } from 'vue-router'

const router = useRouter()
const templatesStore = useTemplatesStore()
const activeBakeStore = useActiveBakeStore()

const selectedTemplate = ref(null)

function selectTemplate(template) {
  selectedTemplate.value = template
  // Store the selected template for use in calculator
  localStorage.setItem('selectedTemplate', JSON.stringify(template))
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
