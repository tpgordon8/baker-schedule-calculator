<template>
  <div class="space-y-2">
    <div class="flex justify-between items-center text-sm">
      <span class="font-bold">Progress</span>
      <span class="text-gray-600">{{ completedSteps }} / {{ totalSteps }}</span>
    </div>
    <div class="w-full bg-gray-200 border border-gray-300 h-6 relative overflow-hidden">
      <div
        class="bg-gray-900 h-full transition-all"
        :style="{ width: progressPercent + '%' }"
      ></div>
      <div class="absolute inset-0 flex items-center justify-center">
        <span class="text-xs font-bold text-white drop-shadow">
          {{ progressPercent }}%
        </span>
      </div>
    </div>
    <div class="text-xs text-gray-600">
      <span v-if="remainingSteps > 0">{{ remainingSteps }} steps remaining</span>
      <span v-else class="text-green-700 font-bold">✓ All steps complete!</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  completedCount: {
    type: Number,
    default: 0
  },
  totalCount: {
    type: Number,
    default: 1
  }
})

const completedSteps = computed(() => props.completedCount)
const totalSteps = computed(() => props.totalCount)
const remainingSteps = computed(() => Math.max(0, totalSteps.value - completedSteps.value))

const progressPercent = computed(() => {
  if (totalSteps.value === 0) return 0
  return Math.round((completedSteps.value / totalSteps.value) * 100)
})
</script>
