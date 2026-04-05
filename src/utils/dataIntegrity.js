/**
 * Data integrity checks and validators
 * Ensures data exists and has required structure before use
 */

/**
 * Check if template has valid workflow structure
 */
export function isValidTemplate(template) {
  if (!template) return false
  if (!template.id) return false
  if (!template.workflow) return false

  const requiredSteps = ['feedStarter', 'autolyse', 'mix', 'bulkFermentation', 'finalProof', 'bake', 'cool']
  const hasAllSteps = requiredSteps.every(step => step in template.workflow)

  return hasAllSteps
}

/**
 * Check if schedule step has required properties
 */
export function isValidScheduleStep(step) {
  if (!step) return false
  if (!step.stepId) return false
  if (!step.stepName) return false
  if (typeof step.duration !== 'number') return false
  if (!step.plannedTime) return false

  return true
}

/**
 * Check if entire schedule is valid
 */
export function isValidSchedule(schedule) {
  if (!Array.isArray(schedule)) return false
  if (schedule.length === 0) return false

  return schedule.every(step => isValidScheduleStep(step))
}

/**
 * Check if active bake has required structure
 */
export function isValidActiveBake(bake) {
  if (!bake) return false
  if (!bake.id) return false
  if (!bake.targetCompletionTime) return false
  if (!bake.actualStartTime) return false

  return true
}

/**
 * Safe access to nested properties with type checking
 */
export function safeGet(obj, path, defaultValue = null) {
  try {
    const value = path.split('.').reduce((current, prop) => current?.[prop], obj)
    return value ?? defaultValue
  } catch {
    return defaultValue
  }
}

/**
 * Check if template has all required step properties
 */
export function validateTemplateWorkflow(template) {
  if (!isValidTemplate(template)) {
    return { valid: false, error: 'Template is missing required workflow' }
  }

  const workflow = template.workflow
  const errors = []

  // Check each required step
  const requiredSteps = {
    feedStarter: { requiredFields: ['minutes', 'name'] },
    autolyse: { requiredFields: ['minutes', 'name'] },
    mix: { requiredFields: ['minutes', 'name'] },
    bulkFermentation: { requiredFields: ['minutes', 'name'] },
    finalProof: { requiredFields: ['minutes', 'name'] },
    bake: { requiredFields: ['minutes', 'name'] },
    cool: { requiredFields: ['minutes', 'name'] },
    preheat: { requiredFields: ['minutes', 'name'] }
  }

  for (const [stepId, requirements] of Object.entries(requiredSteps)) {
    const step = workflow[stepId]
    if (!step) {
      errors.push(`Missing step: ${stepId}`)
      continue
    }

    for (const field of requirements.requiredFields) {
      if (!(field in step)) {
        errors.push(`Step ${stepId} missing field: ${field}`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : null
  }
}
