/**
 * Composable for consistent form error handling across the app
 * Provides centralized error state and messaging
 */

import { ref, computed } from 'vue'

export function useFormErrors() {
  const errors = ref({})
  const isValid = computed(() => Object.keys(errors.value).length === 0)

  function setError(field, message) {
    if (message) {
      errors.value[field] = message
    } else {
      delete errors.value[field]
    }
  }

  function setErrors(newErrors) {
    errors.value = newErrors
  }

  function clearError(field) {
    delete errors.value[field]
  }

  function clearAllErrors() {
    errors.value = {}
  }

  function hasError(field) {
    return !!errors.value[field]
  }

  function getError(field) {
    return errors.value[field] || null
  }

  return {
    errors,
    isValid,
    setError,
    setErrors,
    clearError,
    clearAllErrors,
    hasError,
    getError
  }
}
