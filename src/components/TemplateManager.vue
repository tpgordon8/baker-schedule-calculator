<template>
  <div class="space-y-3">
    <div v-for="template in templatesStore.templates" :key="template.id" class="card-accent">
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <div class="text-body-medium font-semibold text-primary">{{ template.name }}</div>
          <div class="text-caption text-secondary mt-1">
            {{ Object.keys(template.workflow).length }} steps
            <span v-if="template.id !== 'default-sourdough'" class="ml-2 text-caption-sm">
              (Updated: {{ formatDate(template.updatedAt) }})
            </span>
          </div>
        </div>
        <div class="flex gap-1 flex-shrink-0 ml-3">
          <button
            @click="selectForClone(template)"
            class="btn btn-secondary btn-sm"
            title="Clone this template"
            aria-label="Clone template"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button
            v-if="template.id !== 'default-sourdough'"
            @click="selectForDelete(template)"
            class="btn btn-alert btn-sm"
            title="Delete template"
            aria-label="Delete template"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Clone Modal -->
    <div v-if="cloneModal.showing" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="card-premium max-w-sm w-full shadow-elevation-4">
        <h3 class="text-heading font-bold text-primary mb-2">Clone Template</h3>
        <p class="text-body text-secondary mb-4">New name for cloned template:</p>
        <div class="form-group mb-6">
          <input
            v-model="cloneModal.newName"
            type="text"
            class="input-text"
            placeholder="e.g., 'Quick Sourdough'"
          />
        </div>
        <div class="flex gap-2">
          <button
            @click="cloneTemplate"
            class="btn btn-primary flex-1"
          >
            Clone
          </button>
          <button
            @click="cloneModal.showing = false"
            class="btn btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteModal.showing" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="card-premium max-w-sm w-full shadow-elevation-4">
        <h3 class="text-heading font-bold text-alert mb-2">Delete Template?</h3>
        <p class="text-body text-secondary mb-6">
          Delete "{{ deleteModal.template?.name }}"? This cannot be undone.
        </p>
        <div class="flex gap-2">
          <button
            @click="confirmDelete"
            class="btn btn-alert flex-1"
          >
            Delete
          </button>
          <button
            @click="deleteModal.showing = false"
            class="btn btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useScheduleCalculator } from '../composables/useScheduleCalculator'
import { useTemplatesStore } from '../stores/templates'

const templatesStore = useTemplatesStore()
const { formatDate } = useScheduleCalculator()

const cloneModal = ref({
  showing: false,
  template: null,
  newName: ''
})

const deleteModal = ref({
  showing: false,
  template: null
})

function selectForClone(template) {
  cloneModal.value = {
    showing: true,
    template,
    newName: `${template.name} (Copy)`
  }
}

function cloneTemplate() {
  if (cloneModal.value.template && cloneModal.value.newName) {
    templatesStore.cloneTemplate(cloneModal.value.template.id, cloneModal.value.newName)
    cloneModal.value.showing = false
    cloneModal.value.newName = ''
  }
}

function selectForDelete(template) {
  deleteModal.value = {
    showing: true,
    template
  }
}

function confirmDelete() {
  if (deleteModal.value.template) {
    templatesStore.deleteTemplate(deleteModal.value.template.id)
    deleteModal.value.showing = false
    deleteModal.value.template = null
  }
}
</script>
