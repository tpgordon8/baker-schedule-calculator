
export function usePaceCalculation() {
  /**
   * Calculate pace status based on actual elapsed time vs planned
   * @param {Array} schedule - Complete schedule array
   * @param {string} currentStepId - ID of current step
   * @param {number} elapsedMinutes - Minutes baker has spent so far (total)
   * @param {Date} actualStartTime - When the bake actually started
   * @param {Date} originalTarget - Original target completion time
   * @returns {Object} Pace information
   */
  function calculatePace(schedule, currentStepId, elapsedMinutes, actualStartTime, originalTarget) {
    if (!schedule || schedule.length === 0) {
      return null
    }

    const now = new Date()
    const actualStartMs = new Date(actualStartTime).getTime()
    const nowMs = now.getTime()
    const actualElapsedMs = nowMs - actualStartMs
    const actualElapsedMinutes = Math.round(actualElapsedMs / 60000)

    // Find current step and calculate planned elapsed time
    const currentStepIndex = schedule.findIndex(s => s.stepId === currentStepId)
    if (currentStepIndex === -1) {
      return null
    }

    // Sum duration of all completed steps (before current step)
    let plannedElapsedMinutes = 0
    for (let i = 0; i < currentStepIndex; i++) {
      plannedElapsedMinutes += schedule[i].duration
    }

    // Calculate variance
    const variance = actualElapsedMinutes - plannedElapsedMinutes
    let paceStatus = 'on-track'
    if (variance > 15) paceStatus = 'behind'
    if (variance < -15) paceStatus = 'ahead'

    // Calculate remaining time and projected completion
    let remainingMinutes = 0
    for (let i = currentStepIndex + 1; i < schedule.length; i++) {
      remainingMinutes += schedule[i].duration
    }
    // Add current step's remaining time (estimate: half of duration if partially complete)
    remainingMinutes += Math.ceil(schedule[currentStepIndex].duration / 2)

    const projectedCompletionMs = nowMs + remainingMinutes * 60000
    const projectedCompletion = new Date(projectedCompletionMs)
    const originalTargetMs = new Date(originalTarget).getTime()
    const minutesVariance = Math.round((projectedCompletionMs - originalTargetMs) / 60000)

    return {
      paceStatus, // 'ahead' | 'behind' | 'on-track'
      actualElapsedMinutes,
      plannedElapsedMinutes,
      variance, // positive = behind, negative = ahead
      projectedCompletion,
      originalTarget,
      minutesVariance, // positive = late, negative = early
      remainingMinutes,
      currentStepIndex
    }
  }

  /**
   * Format pace message for display
   * @param {Object} pace - Pace object from calculatePace
   * @returns {string} Human-readable pace message
   */
  function formatPaceMessage(pace) {
    if (!pace) return ''

    const { paceStatus, minutesVariance, projectedCompletion } = pace

    let message = ''
    if (paceStatus === 'on-track') {
      message = '✓ On track! '
    } else if (paceStatus === 'ahead') {
      message = '⚡ Ahead of schedule! '
    } else if (paceStatus === 'behind') {
      message = '⏱️ Behind schedule. '
    }

    const time = projectedCompletion.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short'
    })

    if (minutesVariance === 0) {
      message += `Finishing at ${time}`
    } else if (minutesVariance > 0) {
      message += `Finishing at ${time} (${minutesVariance}m late)`
    } else {
      message += `Finishing at ${time} (${Math.abs(minutesVariance)}m early)`
    }

    return message
  }

  /**
   * Calculate how much time reduction is needed to meet new target
   * @param {Date} currentTime
   * @param {Date} newTarget
   * @param {Array} remainingSteps
   * @returns {Object} Reduction information
   */
  function calculateReductionNeeded(currentTime, newTarget, remainingSteps) {
    const currentMs = new Date(currentTime).getTime()
    const newTargetMs = new Date(newTarget).getTime()
    const remainingScheduledMs = remainingSteps.reduce((sum, step) => sum + step.duration, 0) * 60000

    const timeAvailable = newTargetMs - currentMs
    const reductionNeeded = remainingScheduledMs - timeAvailable
    const reductionMinutes = Math.round(reductionNeeded / 60000)

    return {
      reductionNeeded: Math.max(0, reductionMinutes),
      possibleReduction: calculatePossibleReduction(remainingSteps),
      canAchieve: reductionMinutes <= calculatePossibleReduction(remainingSteps)
    }
  }

  /**
   * Calculate maximum possible time reduction
   * @param {Array} remainingSteps
   * @returns {number} Maximum minutes that can be reduced
   */
  function calculatePossibleReduction(remainingSteps) {
    // Can reduce bulk fermentation by up to 5 hours (from 8h to 3h)
    // Can reduce final proof by up to 3 hours (from 4h to 1h)
    // Total: up to 8 hours of reduction
    const bulkStep = remainingSteps.find(s => s.stepId === 'bulkFermentation')
    const proofStep = remainingSteps.find(s => s.stepId === 'finalProof')

    let maxReduction = 0
    if (bulkStep) maxReduction += Math.max(0, bulkStep.duration - 180) // Reduce to 3 hours minimum
    if (proofStep) maxReduction += Math.max(0, proofStep.duration - 60) // Reduce to 1 hour minimum

    return maxReduction
  }

  return {
    calculatePace,
    formatPaceMessage,
    calculateReductionNeeded,
    calculatePossibleReduction
  }
}
