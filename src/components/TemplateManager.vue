<template>
  <div class="space-y-3">
    <div v-for="template in templatesStore.templates" :key="template.id" class="card p-3">
      <div class="flex justify-between items-start">
        <div>
          <div class="font-bold">{{ template.name }}</div>
          <div class="text-xs text-gray-600">
            {{ Object.keys(template.workflow).length }} steps
            <span v-if="template.id !== 'default-sourdough'" class="ml-2">
              (Updated: {{ formatDate(template.updatedAt) }})
            </span>
          </div>
        </div>
        <div class="flex gap-1">
          <button
            @click="selectForClone(template)"
            class="btn text-xs py-1 px-2"
            title="Clone this template"
          >
            📋
          </button>
          <button
            v-if="template.id !== 'default-sourdough'"
            @click="selectForDelete(template)"
            class="btn text-xs py-1 px-2 text-red-700"
            title="Delete template"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <!-- Clone Modal -->
    <div v-if="cloneModal.showing" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white border-4 border-gray-900 p-6 max-w-sm w-full">
        <h3 class="text-lg font-bold mb-4">Clone Template</h3>
        <p class="text-sm text-gray-600 mb-3">New name for cloned template:</p>
        <input
          v-model="cloneModal.newName"
          type="text"
          class="input-field mb-3"
          placeholder="e.g., 'Quick Sourdough'"
        />
        <div class="flex gap-2">
          <button
            @click="cloneTemplate"
            class="btn btn-primary flex-1"
          >
            Clone
          </button>
          <button
            @click="cloneModal.showing = false"
            class="btn flex-1"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteModal.showing" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white border-4 border-gray-900 p-6 max-w-sm w-full">
        <h3 class="text-lg font-bold mb-3 text-red-700">Delete Template?</h3>
        <p class="text-sm text-gray-600 mb-4">
          Delete "{{ deleteModal.template?.name }}"? This cannot be undone.
        </p>
        <div class="flex gap-2">
          <button
            @click="confirmDelete"
            class="btn text-red-700 flex-1"
          >
            Delete
          </button>
          <button
            @click="deleteModal.showing = false"
            class="btn btn-primary flex-1"
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
