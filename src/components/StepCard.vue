<template>
  <div
    class="step-card"
    :class="[step.status]"
    :aria-label="`${step.stepName}, ${step.status}, ${formatTime(step.plannedTime)}`"
  >
    <div class="flex-1">
      <div class="font-bold text-base">{{ step.stepName }}</div>
      <div class="text-xs text-gray-600 mt-1">{{ step.notes }}</div>
      <div class="text-sm font-bold mt-3 text-lg">⏰ {{ formatTime(step.plannedTime) }}</div>
    </div>

    <div class="flex gap-2 ml-4">
      <button
        v-if="step.status === 'pending'"
        @click="$emit('mark-complete')"
        class="btn py-3 px-4 font-bold whitespace-nowrap"
        :aria-label="`Mark ${step.stepName} as complete`"
        title="Mark this step complete"
      >
        ✓ Done
      </button>
      <button
        v-if="step.status === 'pending'"
        @click="$emit('adjust')"
        class="btn py-3 px-3 font-bold"
        :aria-label="`Adjust ${step.stepName}`"
        title="Adjust if running late"
      >
        Adjust
      </button>
      <div v-if="step.status === 'completed'" class="flex items-center">
        <span class="text-green-700 font-bold text-lg">✓ Done</span>
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
