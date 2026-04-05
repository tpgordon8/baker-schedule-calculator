<template>
  <div v-if="showing" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white border-4 border-gray-900 p-6 max-w-2xl w-full max-h-96 overflow-y-auto">
      <h3 class="text-xl font-bold mb-4">Adjust Your Schedule</h3>

      <!-- Option A: Fast-Track -->
      <div class="mb-6 p-4 border border-gray-300">
        <label class="flex items-start cursor-pointer">
          <input
            v-model="selectedOption"
            type="radio"
            value="fast-track"
            class="mt-1 mr-3"
          />
          <div class="flex-1">
            <div class="font-bold">⚡ Fast-Track Remaining Steps</div>
            <div class="text-sm text-gray-600 mt-1">
              Reduce bulk fermentation and final proof time to finish earlier.
            </div>
            <div v-if="selectedOption === 'fast-track'" class="mt-3 space-y-2">
              <div>
                <label class="text-sm font-bold block mb-1">New Target Time</label>
                <input
                  v-model="fastTrackTarget"
                  type="datetime-local"
                  class="input-field"
                />
              </div>
              <div class="text-xs text-gray-600 p-2 bg-gray-50">
                <p><strong>Current time:</strong> {{ formatTime(now) }}</p>
                <p><strong>Reduction needed:</strong> {{ calculatedReduction.reductionNeeded }} min</p>
                <p v-if="calculatedReduction.canAchieve" class="text-green-700">
                  ✓ Can achieve this target
                </p>
                <p v-else class="text-red-700">
                  ✗ Cannot reduce by that much (max {{ calculatedReduction.possibleReduction }} min)
                </p>
              </div>
            </div>
          </div>
        </label>
      </div>

      <!-- Option B: Extend Fermentation -->
      <div class="mb-6 p-4 border border-gray-300">
        <label class="flex items-start cursor-pointer">
          <input
            v-model="selectedOption"
            type="radio"
            value="extend"
            class="mt-1 mr-3"
          />
          <div class="flex-1">
            <div class="font-bold">🕐 Extend Fermentation Time</div>
            <div class="text-sm text-gray-600 mt-1">
              Take more time for bulk or final fermentation. Target time may shift.
            </div>
            <div v-if="selectedOption === 'extend'" class="mt-3 space-y-2">
              <div>
                <label class="text-sm font-bold block mb-1">Where should we add time?</label>
                <label class="flex items-center mb-2">
                  <input v-model="extendLocation" type="radio" value="bulk" class="mr-2" />
                  <span class="text-sm">Extend bulk fermentation</span>
                </label>
                <label class="flex items-center">
                  <input v-model="extendLocation" type="radio" value="proof" class="mr-2" />
                  <span class="text-sm">Extend final proof</span>
                </label>
              </div>
              <div>
                <label class="text-sm font-bold block mb-1">Add how much time?</label>
                <div class="flex gap-2">
                  <div class="flex-1">
                    <input
                      v-model.number="extendHours"
                      type="number"
                      min="0"
                      max="12"
                      placeholder="Hours"
                      class="input-field w-full"
                    />
                    <div class="text-xs text-gray-600">Hours</div>
                  </div>
                  <div class="flex-1">
                    <input
                      v-model.number="extendMinutes"
                      type="number"
                      min="0"
                      max="59"
                      placeholder="Min"
                      class="input-field w-full"
                    />
                    <div class="text-xs text-gray-600">Minutes</div>
                  </div>
                </div>
              </div>
              <div class="text-xs text-gray-600 p-2 bg-gray-50">
                <p><strong>New finish time:</strong> {{ formatTime(extendedCompletionTime) }}</p>
              </div>
            </div>
          </div>
        </label>
      </div>

      <!-- Buttons -->
      <div class="flex gap-2 mt-6">
        <button
          @click="apply"
          :disabled="!isValid"
          class="btn btn-primary flex-1 disabled:opacity-50"
        >
          Apply Adjustment
        </button>
        <button @click="cancel" class="btn flex-1">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useScheduleCalculator } from '../composables/useScheduleCalculator'
import { usePaceCalculation } from '../composables/usePaceCalculation'

const props = defineProps({
  isShowing: Boolean,
  currentTime: Date,
  originalTarget: Date,
  remainingSteps: Array
})

const emit = defineEmits(['apply', 'cancel'])

const { formatTime } = useScheduleCalculator()
const { calculateReductionNeeded } = usePaceCalculation()

const showing = ref(props.isShowing)
const selectedOption = ref('fast-track')
const fastTrackTarget = ref('')
const extendLocation = ref('bulk')
const extendHours = ref(0)
const extendMinutes = ref(1)

const now = computed(() => props.currentTime || new Date())

const calculatedReduction = computed(() => {
  if (selectedOption.value !== 'fast-track' || !fastTrackTarget.value) {
    return { reductionNeeded: 0, possibleReduction: 0, canAchieve: false }
  }
  return calculateReductionNeeded(now.value, new Date(fastTrackTarget.value), props.remainingSteps || [])
})

const extendedCompletionTime = computed(() => {
  const addMinutes = extendHours.value * 60 + extendMinutes.value
  const ms = now.value.getTime() + addMinutes * 60000
  return new Date(ms)
})

const isValid = computed(() => {
  if (selectedOption.value === 'fast-track') {
    return fastTrackTarget.value && calculatedReduction.value.canAchieve
  } else {
    return extendHours.value > 0 || extendMinutes.value > 0
  }
})

function apply() {
  if (selectedOption.value === 'fast-track') {
    emit('apply', {
      type: 'fast-track',
      newTarget: new Date(fastTrackTarget.value),
      reductionMinutes: calculatedReduction.value.reductionNeeded
    })
  } else {
    emit('apply', {
      type: 'extend',
      location: extendLocation.value,
      extendMinutes: extendHours.value * 60 + extendMinutes.value,
      newCompletionTime: extendedCompletionTime.value
    })
  }
}

function cancel() {
  emit('cancel')
}
</script>
