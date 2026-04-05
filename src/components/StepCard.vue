<template>
  <div class="step-card" :class="[step.status]">
    <div>
      <div class="font-bold">{{ step.stepName }}</div>
      <div class="text-xs text-gray-600">{{ step.notes }}</div>
      <div class="text-sm font-bold mt-2">{{ formatTime(step.plannedTime) }}</div>
    </div>

    <div class="flex gap-2">
      <button
        v-if="step.status === 'pending'"
        @click="$emit('mark-complete')"
        class="btn"
      >
        Done ✓
      </button>
      <button
        v-if="step.status === 'pending'"
        @click="$emit('adjust')"
        class="btn text-xs"
      >
        Adjust
      </button>
      <span v-if="step.status === 'completed'" class="text-green-700 font-bold">
        ✓ Done
      </span>
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
