<template>
  <div class="space-y-3">
    <div class="flex justify-between items-center">
      <span class="text-body-medium font-semibold text-primary">Progress</span>
      <span class="text-caption text-secondary">{{ completedSteps }} / {{ totalSteps }}</span>
    </div>

    <div class="progress-bar-labeled">
      <div class="progress-bar" :class="{ 'success': progressPercent === 100 }">
        <div
          class="progress-bar-fill"
          :style="{ width: progressPercent + '%' }"
          role="progressbar"
          :aria-valuenow="progressPercent"
          aria-valuemin="0"
          aria-valuemax="100"
        ></div>
      </div>
      <span class="text-label font-bold text-primary">{{ progressPercent }}%</span>
    </div>

    <div class="text-caption text-secondary">
      <span v-if="remainingSteps > 0">{{ remainingSteps }} steps remaining</span>
      <span v-else class="badge badge-success">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        All steps complete!
      </span>
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
