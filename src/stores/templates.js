import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTemplatesStore = defineStore('templates', () => {
  // Default sourdough template
  const defaultTemplate = {
    id: 'default-sourdough',
    name: 'Standard Sourdough',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    workflow: {
      feedStarter: { minutes: 180, description: 'Feed starter until bubbly (3-4 hours)' },
      autolyse: { minutes: 30, description: 'Mix flour + water, let rest' },
      mix: { minutes: 10, description: 'Mix in starter and salt' },
      bulkFermentation: { minutes: 360, min: 180, max: 480, description: 'First rise (adjust for room temp)' },
      stretchAndFold: { minutes: 120, withinBulk: true, description: '4-6 sets every 30 min' },
      benchRest: { minutes: 30, description: 'Shape and rest after bulk' },
      finalProof: { minutes: 120, min: 60, max: 2880, description: 'Cold or room temp (1-48 hours)' },
      bake: { minutes: 45, coveredMinutes: 25, uncoveredMinutes: 20, temp: 450, description: 'With/without Dutch oven lid' },
      cool: { minutes: 90, description: 'Cool before slicing' }
    }
  }

  const templates = ref([defaultTemplate])

  function addTemplate(template) {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    templates.value.push(newTemplate)
    return newTemplate
  }

  function updateTemplate(id, updates) {
    const idx = templates.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      templates.value[idx] = {
        ...templates.value[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      }
    }
  }

  function deleteTemplate(id) {
    templates.value = templates.value.filter(t => t.id !== id)
  }

  function getTemplate(id) {
    return templates.value.find(t => t.id === id)
  }

  return {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplate
  }
}, {
  persist: true
})
