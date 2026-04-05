import { ref } from 'vue'
import { useNotificationsStore } from '../stores/notifications'

export function useNotifications() {
  const notificationsStore = useNotificationsStore()
  const activeNotifications = ref(new Map())

  /**
   * Request notification permission from browser
   */
  async function requestPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      notificationsStore.setPermissionGranted(true)
      return true
    }

    if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission()
        const granted = permission === 'granted'
        notificationsStore.setPermissionGranted(granted)
        notificationsStore.setPermissionRequested()
        return granted
      } catch (error) {
        console.error('Error requesting notification permission:', error)
        return false
      }
    }

    return false
  }

  /**
   * Send a notification
   */
  function sendNotification(title, options = {}) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      console.log('Notifications not available or not granted')
      return
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      })

      // Play sound if enabled
      if (notificationsStore.preferences.soundEnabled && options.sound) {
        playNotificationSound()
      }

      // Vibrate if enabled (mobile)
      if (notificationsStore.preferences.vibrationEnabled && 'vibrate' in navigator) {
        navigator.vibrate(100)
      }

      return notification
    } catch (error) {
      console.error('Error sending notification:', error)
      return null
    }
  }

  /**
   * Play notification sound
   */
  function playNotificationSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gain = audioContext.createGain()

      oscillator.connect(gain)
      gain.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'

      gain.gain.setValueAtTime(0.3, audioContext.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)
    } catch (error) {
      console.error('Error playing notification sound:', error)
    }
  }

  /**
   * Schedule notification for a step
   */
  function scheduleStepNotification(step) {
    if (!notificationsStore.preferences.enabled) return
    if (!notificationsStore.isStepNotificationEnabled(step.stepId)) return

    const now = new Date()
    const stepTime = new Date(step.plannedTime)
    const remindMinutes = notificationsStore.preferences.remindMinutesBefore
    const notifyTime = new Date(stepTime.getTime() - remindMinutes * 60000)

    const timeUntilNotification = notifyTime.getTime() - now.getTime()

    if (timeUntilNotification <= 0) {
      // Step is already due
      sendNotification(`⏱️ Time for ${step.stepName}`, {
        body: `It's time to start: ${step.stepName}`,
        sound: true,
        tag: `step-${step.stepId}`,
        requireInteraction: true
      })
      return
    }

    // Schedule notification for future
    const timeoutId = setTimeout(() => {
      sendNotification(`⏱️ Time for ${step.stepName}`, {
        body: `It's time to start: ${step.stepName}`,
        sound: true,
        tag: `step-${step.stepId}`,
        requireInteraction: true
      })
    }, timeUntilNotification)

    activeNotifications.value.set(step.stepId, timeoutId)
  }

  /**
   * Schedule notifications for all remaining steps
   */
  function scheduleAllNotifications(schedule) {
    if (!notificationsStore.preferences.enabled) return

    // Clear existing notifications
    clearAllNotifications()

    // Schedule each pending step
    schedule.forEach(step => {
      if (step.status === 'pending') {
        scheduleStepNotification(step)
      }
    })
  }

  /**
   * Snooze a notification (reschedule for X minutes later)
   */
  function snoozeNotification(step, snoozeMinutes = 15) {
    // Cancel existing notification
    if (activeNotifications.value.has(step.stepId)) {
      clearTimeout(activeNotifications.value.get(step.stepId))
    }

    // Schedule for snooze time
    const snoozeMs = snoozeMinutes * 60000
    const timeoutId = setTimeout(() => {
      sendNotification(`⏱️ Time for ${step.stepName}`, {
        body: `It's time to start: ${step.stepName} (snoozed reminder)`,
        sound: true,
        tag: `step-${step.stepId}-snooze`,
        requireInteraction: true
      })
    }, snoozeMs)

    activeNotifications.value.set(`${step.stepId}-snooze`, timeoutId)
  }

  /**
   * Clear notification for specific step
   */
  function clearStepNotification(stepId) {
    if (activeNotifications.value.has(stepId)) {
      clearTimeout(activeNotifications.value.get(stepId))
      activeNotifications.value.delete(stepId)
    }
  }

  /**
   * Clear all scheduled notifications
   */
  function clearAllNotifications() {
    activeNotifications.value.forEach((timeoutId) => {
      clearTimeout(timeoutId)
    })
    activeNotifications.value.clear()
  }

  /**
   * Send test notification
   */
  function sendTestNotification() {
    const notification = sendNotification('✓ Baker Schedule Notifications', {
      body: 'You will receive notifications when each step is due',
      sound: true
    })

    if (notification) {
      notificationsStore.markTestNotificationSent()
      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    }

    return notification !== null
  }

  /**
   * Pause all notifications
   */
  function pauseNotifications() {
    clearAllNotifications()
  }

  /**
   * Resume notifications
   */
  function resumeNotifications(schedule) {
    scheduleAllNotifications(schedule)
  }

  return {
    requestPermission,
    sendNotification,
    sendTestNotification,
    scheduleStepNotification,
    scheduleAllNotifications,
    snoozeNotification,
    clearStepNotification,
    clearAllNotifications,
    pauseNotifications,
    resumeNotifications,
    playNotificationSound
  }
}
