/**
 * Centralized validation rules for all forms
 * Provides consistent error messages and validation logic
 */

export const validationRules = {
  /**
   * Validate target completion time
   */
  targetTime: {
    validate: (dateTime, startTime = null) => {
      if (!dateTime) return 'Target time is required'

      const target = new Date(dateTime)
      const now = new Date()

      if (target <= now) return 'Target must be in the future'

      if (startTime) {
        const start = new Date(startTime)
        if (target <= start) return 'Target must be after start time'
      }

      return null
    }
  },

  /**
   * Validate start time for retroactive/join bake
   */
  startTime: {
    validate: (dateTime) => {
      if (!dateTime) return 'Start time is required'

      const start = new Date(dateTime)
      const now = new Date()

      if (start > now) return 'Start time cannot be in the future'

      return null
    }
  },

  /**
   * Validate elapsed time on current step
   */
  elapsedTime: {
    validate: (hours, minutes, stepDuration = null) => {
      if (typeof hours !== 'number' || typeof minutes !== 'number') {
        return 'Invalid time values'
      }

      if (hours < 0 || minutes < 0) {
        return 'Time cannot be negative'
      }

      if (minutes > 59) {
        return 'Minutes must be less than 60'
      }

      const totalMinutes = hours * 60 + minutes

      if (stepDuration && totalMinutes > stepDuration) {
        return `Elapsed time (${totalMinutes}m) cannot exceed step duration (${stepDuration}m)`
      }

      return null
    }
  },

  /**
   * Validate bulk fermentation duration
   */
  bulkDuration: {
    validate: (duration) => {
      if (!duration) return 'Bulk fermentation duration required'
      if (duration < 180) return 'Bulk fermentation must be at least 3 hours'
      if (duration > 480) return 'Bulk fermentation cannot exceed 8 hours'
      return null
    }
  },

  /**
   * Validate preheat duration
   */
  preheatDuration: {
    validate: (duration) => {
      if (!duration) return 'Preheat duration required'
      if (duration < 15) return 'Preheat must be at least 15 minutes'
      if (duration > 60) return 'Preheat cannot exceed 60 minutes'
      return null
    }
  }
}

/**
 * Format validation error for display
 */
export function formatValidationError(error) {
  if (!error) return null
  if (typeof error === 'string') return error
  if (error.message) return error.message
  return 'Invalid input'
}

/**
 * Check if all required fields are valid
 */
export function validateForm(fields) {
  const errors = {}
  let isValid = true

  for (const [fieldName, { value, validator }] of Object.entries(fields)) {
    const error = validator(value)
    if (error) {
      errors[fieldName] = error
      isValid = false
    }
  }

  return { isValid, errors }
}
