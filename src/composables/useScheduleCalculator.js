import { subMinutes, format } from 'date-fns'

export function useScheduleCalculator() {
  /**
   * Calculate complete schedule working backward from target completion time
   * @param {Date} targetCompletionTime - When the loaf should be done and cooled
   * @param {Object} template - Workflow template with durations
   * @returns {Array} Schedule with all steps and timestamps
   */
  function generateSchedule(targetCompletionTime, template) {
    const workflow = template.workflow
    let currentTime = new Date(targetCompletionTime)

    // Work backward through the workflow
    const steps = [
      { id: 'cool', name: 'Cool', minutes: workflow.cool.minutes, description: workflow.cool.description },
      { id: 'bake', name: 'Bake', minutes: workflow.bake.minutes, description: workflow.bake.description },
      { id: 'finalProof', name: 'Final Proof', minutes: workflow.finalProof.minutes, description: workflow.finalProof.description },
      { id: 'benchRest', name: 'Bench Rest', minutes: workflow.benchRest.minutes, description: workflow.benchRest.description },
      { id: 'bulkFermentation', name: 'Bulk Fermentation', minutes: workflow.bulkFermentation.minutes, description: workflow.bulkFermentation.description },
      { id: 'stretchAndFold', name: 'Stretch & Fold', minutes: workflow.stretchAndFold.minutes, withinBulk: true, description: workflow.stretchAndFold.description },
      { id: 'mix', name: 'Mix Dough', minutes: workflow.mix.minutes, description: workflow.mix.description },
      { id: 'autolyse', name: 'Autolyse', minutes: workflow.autolyse.minutes, description: workflow.autolyse.description },
      { id: 'feedStarter', name: 'Feed Starter', minutes: workflow.feedStarter.minutes, description: workflow.feedStarter.description }
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
