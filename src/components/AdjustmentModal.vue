<template>
  <div v-if="step" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white border-4 border-gray-900 p-6 max-w-md w-full">
      <h3 class="text-xl font-bold mb-4">Adjust {{ step.stepName }}</h3>

      <p class="text-sm text-gray-600 mb-4">
        Was this step completed on time, or did you run late?
      </p>

      <div class="card">
        <label class="block text-sm font-bold mb-3">How many minutes late?</label>
        <input
          v-model.number="delayMinutes"
          type="number"
          min="1"
          max="480"
          placeholder="Minutes"
          class="input-field w-full mb-3"
        />

        <div class="text-xs text-gray-600">
          <p>Planned: {{ formatTime(step.plannedTime) }}</p>
          <p v-if="delayMinutes > 0">
            Actual: {{ formatTime(new Date(step.plannedTime.getTime() + delayMinutes * 60000)) }}
          </p>
        </div>
      </div>

      <div class="flex gap-2 mt-6">
        <button
          @click="handleAdjust"
          class="btn btn-primary flex-1"
        >
          Apply Adjustment
        </button>
        <button
          @click="$emit('close')"
          class="btn flex-1"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue'
import { useScheduleCalculator } from '../composables/useScheduleCalculator'

defineProps({
  step: Object
})

const emit = defineEmits(['close', 'adjust'])

const { formatTime } = useScheduleCalculator()
const delayMinutes = ref(15)

function handleAdjust() {
  if (delayMinutes.value > 0) {
    emit('adjust', {
      type: 'late',
      delayMinutes: delayMinutes.value
    })
  }
}
</script>
