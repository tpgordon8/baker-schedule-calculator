<template>
  <div v-if="step" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="card-premium max-w-md w-full shadow-elevation-4">
      <h3 class="text-heading font-bold text-primary mb-2">Adjust {{ step.stepName }}</h3>

      <p class="text-body text-secondary mb-4">
        Was this step completed on time, or did you run late?
      </p>

      <div class="card-accent mb-6">
        <div class="form-group mb-4">
          <label class="form-label">How many minutes late?</label>
          <input
            v-model.number="delayMinutes"
            type="number"
            min="1"
            max="480"
            placeholder="Minutes"
            class="input-text"
          />
        </div>

        <div class="text-caption text-secondary space-y-1">
          <p>
            <span class="font-semibold text-primary">Planned:</span>
            {{ formatTime(step.plannedTime) }}
          </p>
          <p v-if="delayMinutes > 0">
            <span class="font-semibold text-primary">Actual:</span>
            {{ formatTime(new Date(step.plannedTime.getTime() + delayMinutes * 60000)) }}
          </p>
        </div>
      </div>

      <div class="flex gap-2">
        <button
          @click="handleAdjust"
          class="btn btn-primary flex-1"
        >
          Apply Adjustment
        </button>
        <button
          @click="$emit('close')"
          class="btn btn-secondary flex-1"
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
