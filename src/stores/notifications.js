import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationsStore = defineStore('notifications', () => {
  const preferences = ref({
    enabled: true,
    remindMinutesBefore: 0,           // 0 = at exact time, or 5, 15, 30
    soundEnabled: true,
    vibrationEnabled: true,
    disabledSteps: [],                // Steps to mute notifications for
    testNotificationSent: false
  })

  const permissionGranted = ref(false)
  const permissionRequested = ref(false)

  function setPreferences(newPrefs) {
    preferences.value = { ...preferences.value, ...newPrefs }
  }

  function toggleStep(stepId) {
    const idx = preferences.value.disabledSteps.indexOf(stepId)
    if (idx > -1) {
      preferences.value.disabledSteps.splice(idx, 1)
    } else {
      preferences.value.disabledSteps.push(stepId)
    }
  }

  function isStepNotificationEnabled(stepId) {
    return !preferences.value.disabledSteps.includes(stepId)
  }

  function setPermissionRequested() {
    permissionRequested.value = true
  }

  function setPermissionGranted(granted) {
    permissionGranted.value = granted
  }

  function markTestNotificationSent() {
    preferences.value.testNotificationSent = true
  }

  return {
    preferences,
    permissionGranted,
    permissionRequested,
    setPreferences,
    toggleStep,
    isStepNotificationEnabled,
    setPermissionRequested,
    setPermissionGranted,
    markTestNotificationSent
  }
}, {
  persist: true
})
