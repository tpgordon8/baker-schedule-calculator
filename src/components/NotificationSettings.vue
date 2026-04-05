<template>
  <div v-if="isShowing" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white border-4 border-gray-900 p-6 max-w-md w-full max-h-96 overflow-y-auto">
      <h3 class="text-xl font-bold mb-4">🔔 Notification Settings</h3>

      <!-- Enable/Disable Notifications -->
      <div class="mb-4 p-3 border border-gray-300 rounded">
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            v-model="localPrefs.enabled"
            type="checkbox"
            class="w-5 h-5"
          />
          <div class="flex-1">
            <div class="font-bold">Enable Notifications</div>
            <div class="text-xs text-gray-600">Get reminded when steps are due</div>
          </div>
        </label>
      </div>

      <!-- Remind Before -->
      <div v-if="localPrefs.enabled" class="mb-4 p-3 border border-gray-300 rounded">
        <label class="block text-sm font-bold mb-2">Remind me:</label>
        <select v-model.number="localPrefs.remindMinutesBefore" class="input-field w-full">
          <option :value="0">At the exact time</option>
          <option :value="5">5 minutes before</option>
          <option :value="15">15 minutes before</option>
          <option :value="30">30 minutes before</option>
        </select>
      </div>

      <!-- Sound Toggle -->
      <div v-if="localPrefs.enabled" class="mb-4 p-3 border border-gray-300 rounded">
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            v-model="localPrefs.soundEnabled"
            type="checkbox"
            class="w-5 h-5"
          />
          <div class="flex-1">
            <div class="font-bold">🔊 Sound Alert</div>
            <div class="text-xs text-gray-600">Play sound when notified</div>
          </div>
        </label>
      </div>

      <!-- Vibration Toggle -->
      <div v-if="localPrefs.enabled" class="mb-4 p-3 border border-gray-300 rounded">
        <label class="flex items-center gap-3 cursor-pointer">
          <input
            v-model="localPrefs.vibrationEnabled"
            type="checkbox"
            class="w-5 h-5"
          />
          <div class="flex-1">
            <div class="font-bold">📳 Vibration</div>
            <div class="text-xs text-gray-600">Buzz on mobile devices</div>
          </div>
        </label>
      </div>

      <!-- Test Notification -->
      <button
        v-if="localPrefs.enabled"
        @click="sendTest"
        class="btn w-full mb-4"
      >
        📨 Send Test Notification
      </button>

      <!-- Buttons -->
      <div class="flex gap-2">
        <button
          @click="save"
          class="btn btn-primary flex-1"
        >
          Save
        </button>
        <button
          @click="closeModal"
          class="btn flex-1"
        >
          Cancel
        </button>
      </div>

      <div v-if="testMessage" class="mt-4 p-3 rounded text-sm" :class="testMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'">
        {{ testMessage.text }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { useNotificationsStore } from '../stores/notifications'
import { useNotifications } from '../composables/useNotifications'

defineProps({
  isShowing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const notificationsStore = useNotificationsStore()
const { sendTestNotification } = useNotifications()

const localPrefs = reactive({
  enabled: true,
  remindMinutesBefore: 0,
  soundEnabled: true,
  vibrationEnabled: true
})

const testMessage = ref(null)

watch(
  () => notificationsStore.preferences,
  (newPrefs) => {
    Object.assign(localPrefs, newPrefs)
  },
  { immediate: true }
)

function sendTest() {
  const success = sendTestNotification()
  if (success) {
    testMessage.value = {
      type: 'success',
      text: '✓ Test notification sent!'
    }
  } else {
    testMessage.value = {
      type: 'error',
      text: '✗ Could not send notification. Check browser permissions.'
    }
  }

  setTimeout(() => {
    testMessage.value = null
  }, 3000)
}

function save() {
  notificationsStore.setPreferences(localPrefs)
  closeModal()
}

function closeModal() {
  emit('close')
}
</script>
