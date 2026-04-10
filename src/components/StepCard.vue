<template>
  <div
    class="card-accent"
    :aria-label="`${step.stepName}, ${step.status}, ${formatTime(step.plannedTime)}`"
  >
    <div class="flex-1">
      <div class="text-body font-semibold text-primary">{{ step.stepName }}</div>
      <div class="text-caption text-secondary mt-1">{{ step.notes }}</div>
      <div class="text-body-medium font-semibold mt-3 text-primary flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ formatTime(step.plannedTime) }}
      </div>
    </div>

    <div class="flex gap-2 ml-4">
      <button
        v-if="step.status === 'pending'"
        @click="$emit('mark-complete')"
        class="btn btn-success"
        :aria-label="`Mark ${step.stepName} as complete`"
        title="Mark this step complete"
      >
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        Done
      </button>
      <button
        v-if="step.status === 'pending'"
        @click="$emit('adjust')"
        class="btn btn-secondary"
        :aria-label="`Adjust ${step.stepName}`"
        title="Adjust if running late"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Adjust
      </button>
      <div v-if="step.status === 'completed'" class="flex items-center">
        <span class="badge badge-success">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          Complete
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import { useScheduleCalculator } from '../composables/useScheduleCalculator'

defineProps({
  step: Object,
  index: Number,
  totalSteps: Number
})

defineEmits(['mark-complete', 'adjust'])

const { formatTime } = useScheduleCalculator()
</script>
