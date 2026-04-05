<template>
  <div class="step-checklist">
    <div class="mb-2 text-sm text-gray-600">Select all steps you've already completed:</div>
    <div class="space-y-2">
      <label
        v-for="step in steps"
        :key="step.stepId"
        class="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50"
      >
        <input
          type="checkbox"
          :checked="modelValue.includes(step.stepId)"
          @change="toggleStep(step.stepId)"
          class="w-5 h-5"
        />
        <div class="flex-1">
          <div class="font-medium">{{ step.stepName }}</div>
          <div class="text-xs text-gray-600">{{ formatDuration(step.duration) }}</div>
        </div>
      </label>
    </div>
    <div v-if="modelValue.length > 0" class="mt-4 p-3 bg-gray-50 rounded text-sm">
      <strong>Completed:</strong> {{ completedNames }}
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  steps: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

function toggleStep(stepId) {
  const updated = props.modelValue.includes(stepId)
    ? props.modelValue.filter(id => id !== stepId)
    : [...props.modelValue, stepId]
  emit('update:modelValue', updated)
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

const completedNames = computed(() => {
  const completedSteps = props.steps.filter(s => props.modelValue.includes(s.stepId))
  return completedSteps.map(s => s.stepName).join(', ')
})
</script>
