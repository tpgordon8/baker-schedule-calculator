import { subMinutes, format } from 'date-fns'

export function useScheduleCalculator() {
  /**
   * Ensure a value is a Date object
   * @param {Date|string} dateValue - Date or ISO string
   * @returns {Date} Date object
   */
  const ensureDate = (dateValue) => {
    if (!dateValue) return null
    if (dateValue instanceof Date) return dateValue
    if (typeof dateValue === 'string') return new Date(dateValue)
    return null
  }

  /**
   * Calculate complete schedule working backward from target completion time
   * @param {Date|string} targetCompletionTime - When the loaf should be done and cooled
   * @param {Object} template - Workflow template with durations
   * @returns {Array} Schedule with all steps and timestamps
   */
  function generateSchedule(targetCompletionTime, template) {
    if (!template || !template.workflow) {
      console.error('generateSchedule: Invalid template', template)
      return []
    }

    const workflow = template.workflow
    const targetDate = ensureDate(targetCompletionTime)
    if (!targetDate) {
      console.error('generateSchedule: Invalid target completion time', targetCompletionTime)
      return []
    }
    let currentTime = targetDate

    // Helper function to safely get workflow step with defaults
    const getStep = (stepId, defaultMinutes = 0) => {
      const step = workflow[stepId]
      if (!step || typeof step.minutes !== 'number') {
        console.warn(`generateSchedule: Missing or invalid step '${stepId}'`)
        return { minutes: defaultMinutes, description: '' }
      }
      return step
    }

    // Work backward through the workflow
    const steps = [
      { id: 'cool', name: 'Cool', ...getStep('cool', 90), description: workflow.cool?.description || 'Cool before slicing' },
      { id: 'bake', name: 'Bake', ...getStep('bake', 45), description: workflow.bake?.description || 'Bake loaf' },
      { id: 'preheat', name: 'Preheat Oven', ...getStep('preheat', 30), description: workflow.preheat?.description || 'Preheat oven' },
      { id: 'finalProof', name: 'Final Proof', ...getStep('finalProof', 120), description: workflow.finalProof?.description || 'Final rise' },
      { id: 'benchRest', name: 'Bench Rest', ...getStep('benchRest', 30), description: workflow.benchRest?.description || 'Bench rest' },
      { id: 'bulkFermentation', name: 'Bulk Fermentation', ...getStep('bulkFermentation', 360), description: workflow.bulkFermentation?.description || 'Bulk rise' },
      { id: 'stretchAndFold', name: 'Stretch & Fold', ...getStep('stretchAndFold', 120), withinBulk: true, description: workflow.stretchAndFold?.description || 'Stretch & fold' },
      { id: 'mix', name: 'Mix Dough', ...getStep('mix', 10), description: workflow.mix?.description || 'Mix dough' },
      { id: 'autolyse', name: 'Autolyse', ...getStep('autolyse', 30), description: workflow.autolyse?.description || 'Autolyse' },
      { id: 'feedStarter', name: 'Feed Starter', ...getStep('feedStarter', 180), description: workflow.feedStarter?.description || 'Feed starter' }
    ]

    const schedule = []

    // Stretch & fold is within bulk fermentation, skip in timeline
    for (const step of steps) {
      if (step.withinBulk) continue

      currentTime = subMinutes(currentTime, step.minutes)

      schedule.unshift({
        stepId: step.id,
        stepName: step.name,
        plannedTime: new Date(currentTime),
        actualTime: null,
        status: 'pending',
        duration: step.minutes,
        notes: step.description
      })
    }

    return schedule
  }

  /**
   * Format time for display
   * @param {Date} date - Date to format
   * @returns {string} Formatted time like "6:45 PM"
   */
  function formatTime(date) {
    return format(date, 'h:mm a')
  }

  /**
   * Format date for display
   * @param {Date} date - Date to format
   * @returns {string} Formatted date like "Tue, Apr 5"
   */
  function formatDate(date) {
    return format(date, 'EEE, MMM d')
  }

  /**
   * Get countdown string from now to a target time
   * @param {Date} targetTime - Target time
   * @returns {string} Countdown like "in 2h 30m"
   */
  function getCountdown(targetTime) {
    const now = new Date()
    const diffMs = targetTime - now
    const diffMins = Math.round(diffMs / 60000)

    if (diffMins < 0) return 'started'
    if (diffMins === 0) return 'now'
    if (diffMins < 60) return `in ${diffMins}m`

    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60

    if (mins === 0) return `in ${hours}h`
    return `in ${hours}h ${mins}m`
  }

  /**
   * Recalculate schedule if a step was completed late
   * @param {Array} currentSchedule - Current schedule
   * @param {string} completedStepId - ID of completed step
   * @param {Date} actualTime - Actual completion time
   * @param {Date} originalTarget - Original target completion time
   * @returns {Object} Updated schedule and new target time
   */
  function adjustScheduleForDelay(currentSchedule, completedStepId, actualTime, originalTarget) {
    const completedStep = currentSchedule.find(s => s.stepId === completedStepId)
    if (!completedStep) return { schedule: currentSchedule, newTarget: originalTarget }

    const delayMs = actualTime - completedStep.plannedTime
    const delayMins = Math.round(delayMs / 60000)

    // Push all remaining steps back by the delay
    const updated = currentSchedule.map(step => {
      if (new Date(step.plannedTime) > actualTime) {
        return {
          ...step,
          plannedTime: new Date(new Date(step.plannedTime).getTime() + delayMs)
        }
      }
      return step
    })

    // New target is original target + delay
    const newTarget = new Date(originalTarget.getTime() + delayMs)

    return { schedule: updated, newTarget, delayMins }
  }

  return {
    generateSchedule,
    formatTime,
    formatDate,
    getCountdown,
    adjustScheduleForDelay
  }
}
