# CODE REVIEW & ARCHITECTURE ANALYSIS REPORT
**Version:** 1.0  
**Date:** April 5, 2026  
**For:** Junior Developer Review Session  
**Status:** Critical Issues Identified

---

## EXECUTIVE SUMMARY

The Baker Schedule Calculator has solid foundational features but suffers from **critical data flow issues, poor state management, and inconsistent error handling**. The current implementation has prevented users from basic functionality (step selection) due to cascading failures in data initialization and availability.

**Severity:** CRITICAL - Core user workflows are broken  
**Priority:** Must fix before any new features

---

## PART 1: CRITICAL ISSUES

### 1. **ISSUE: Step Selector Dropdown Empty (Data Availability)**
**Location:** `src/views/ResumeView.vue`  
**Root Cause:** Multiple failures in data flow chain:
- `initializeBake()` creates empty `schedule: []`
- `updateSchedule()` is called from CalculatorView but user may skip calculator
- Resume view tries to display steps but array is empty
- Fallback logic tries to access `template` from bake, but template only stored after v1.0 fix

**Why It Fails:**
1. User starts bake via home page → creates bake with empty schedule
2. User navigates to "Check Progress" without generating schedule
3. Resume view tries to access schedule → finds empty array
4. No fallback exists (or fallback is broken)
5. User sees "Select a step..." with NO OPTIONS

**Correct Fix:**
- ✅ Store template in active bake on initialization
- ✅ Always generate steps from template as fallback
- ✅ Ensure data exists before rendering

**Status:** FIXED in v1.0

---

### 2. **ISSUE: Join Existing Bake Validation Too Strict**
**Location:** `src/views/JoinExistingBakeView.vue` lines 336-337  
**Root Cause:** Validation required `currentStepHours > 0 OR currentStepMinutes > 0`

**Why It Fails:**
- User just started current step (0h 0m elapsed) → validation fails
- User cannot proceed even though 0 elapsed time is valid
- Creates frustrating UX where you can't join a bake you just started

**Correct Fix:**
- ✅ Remove minimum time requirement
- ✅ Allow 0h 0m as valid input
- ✅ Only check if elapsed time exceeds step duration

**Status:** FIXED in v1.0

---

### 3. **ISSUE: SPA Routing Returns 404 on Page Refresh**
**Location:** `vercel.json` (was missing SPA config)  
**Root Cause:** Vercel doesn't route sub-page refreshes to index.html

**Why It Fails:**
- User refreshes on `/tracker` → Vercel looks for `/tracker/index.html` → NOT FOUND
- User refreshes on `/calculator` → 404 error
- Only works when navigating via client-side routing

**Correct Fix:**
- ✅ Add `rewrites` config to vercel.json
- ✅ Route all requests to `index.html` for SPA
- ✅ Let Vue Router handle actual routing

**Status:** FIXED in v1.0

---

## PART 2: DESIGN FLAWS (Architectural Issues)

### 4. **FLAW: No Clear Data Ownership**
**Problem:** Multiple sources of truth for the same data

**Examples:**
- Template exists in: `localStorage` (templates store) AND in memory in bake object
- Schedule exists in: computed property AND could exist in bake object
- User selections scattered across multiple stores

**Impact:**
- Confusion about where data "lives"
- Synchronization issues
- Hard to debug state
- Easy to make mistakes about what data is available where

**Junior Dev Mistake:**
Adding patches and fallbacks instead of fixing root cause (no clear data architecture)

---

### 5. **FLAW: Inconsistent Error Handling**
**Problem:** Some forms validate, others don't. No consistent pattern.

**Examples:**
```
HomeView - no error display for edit target time modal
ResumeView - has error display for pace calculation  
JoinExistingBakeView - has errors but validation logic unclear
TrackerView - settings button works but scattered logic
```

**Impact:**
- Users don't know why they can't proceed
- Developers don't know which pattern to follow
- Errors silently fail without feedback

**Junior Dev Mistake:**
Copy-pasting validation code instead of creating reusable pattern

---

### 6. **FLAW: Too Much Logic in Views**
**Problem:** ResumeView, CalculatorView, TrackerView have 200+ lines of logic

**Examples:**
- ResumeView calculates pace, formats dates, generates steps, handles modals
- CalculatorView manages form state, calculations, template selection
- TrackerView manages bake state AND displays UI

**Impact:**
- Hard to test
- Hard to reuse logic
- Makes components responsible for too much
- Makes debugging harder

**Junior Dev Mistake:**
"I'll just add this function to the component" instead of extracting to composables

---

### 7. **FLAW: No Input Validation Before Data Use**
**Problem:** Data assumed to exist but often doesn't

**Examples:**
- `selectedTemplate?.workflow` assumes structure but what if template is invalid?
- `activeBakeStore.bake?.template` assumes template was stored (it wasn't until v1.0)
- `availableSteps.map()` assumes array but could be undefined

**Impact:**
- Silent failures
- Runtime errors in production
- User frustration

**Junior Dev Mistake:**
Using optional chaining (`?.`) as a bandaid instead of ensuring data exists

---

## PART 3: SPECIFIC CODE ISSUES

### 8. **Issue: Computed Property Dependency Chain Broken**
**File:** `src/views/ResumeView.vue`

```javascript
// OLD - BROKEN
const availableSteps = computed(() => {
  return activeBakeStore.schedule  // Returns empty array, no fallback
})
```

**Problem:** If schedule is empty, returns empty array. No fallback logic.

**Fix:**
```javascript
// NEW - CORRECT
const availableSteps = computed(() => {
  const schedule = activeBakeStore.schedule || []
  if (schedule.length > 0) {
    return schedule.map(step => ({
      stepId: step.stepId,
      stepName: step.stepName,
      duration: step.duration
    }))
  }
  
  // FALLBACK: Generate from template if schedule is empty
  const template = activeBakeStore.bake?.template
  if (!template?.workflow) return []
  
  return Object.entries(template.workflow)
    .filter(([_, step]) => !step.withinBulk)
    .map(([stepId, stepData]) => ({
      stepId,
      stepName: stepData.name || stepId,
      duration: stepData.minutes
    }))
})
```

---

### 9. **Issue: Missing Template Storage**
**File:** `src/stores/activeBake.js`

```javascript
// OLD - BROKEN
function initializeBake(targetTime, template) {
  bake.value = {
    templateId: template.id,  // Only ID stored, not full template
    // ... no template stored!
  }
}
```

**Problem:** Only templateId stored, but full template object needed for fallbacks

**Fix:**
```javascript
// NEW - CORRECT
function initializeBake(targetTime, template) {
  bake.value = {
    templateId: template.id,
    template: template,  // Store full template object
    // ...
  }
}
```

---

### 10. **Issue: No Null Checks in Critical Paths**
**File:** `src/views/JoinExistingBakeView.vue` line 315-322

```javascript
// OLD - BROKEN
const currentStepError = computed(() => {
  const totalElapsed = currentStepHours.value * 60 + currentStepMinutes.value
  const currentStep = workflowSteps.value.find(s => s.stepId === currentStepId.value)
  // NO CHECK if currentStep is null!
  if (currentStep && totalElapsed > currentStep.duration) {
    return `Time exceeds step duration`
  }
  return ''
})
```

**Problem:** If step not found, `currentStep` is undefined. Comparison silently fails.

**Fix:**
```javascript
// NEW - CORRECT
const currentStepError = computed(() => {
  if (!currentStepId.value) return ''  // Check early
  
  const totalElapsed = currentStepHours.value * 60 + currentStepMinutes.value
  const currentStep = workflowSteps.value.find(s => s.stepId === currentStepId.value)
  
  if (!currentStep) return 'Step not found'  // Explicit error
  if (totalElapsed > currentStep.duration) {
    return `Time on current step (${totalElapsed}m) exceeds step duration (${currentStep.duration}m)`
  }
  return ''
})
```

---

## PART 4: MISSING FEATURES / PATTERNS

### 11. **Missing: Consistent Error Boundary**
**What's Missing:** Global error handling component

**Should Have:**
- Error boundary that catches validation failures
- Toast notifications for all user feedback
- Consistent error message format
- Loading states during async operations

---

### 12. **Missing: Clear Data Flow Diagram**
**What's Missing:** Documentation of how data moves through app

**Should Have:**
```
User Action → Store Action → Schedule Update → Component Re-render
     ↓             ↓                ↓                    ↓
HomeView      activeBake      schedule[]         TrackerView
   ↓                                                    ↓
(user clicks)                                     (displays steps)
```

---

### 13. **Missing: Validation Schema/Rules**
**What's Missing:** Centralized validation logic

**Should Have:**
```javascript
// src/utils/validationRules.js
export const rules = {
  targetTime: (time) => {
    if (!time) return 'Target time required'
    if (time < new Date()) return 'Target must be in future'
    return null
  },
  elapsedTime: (hours, minutes, stepDuration) => {
    const total = hours * 60 + minutes
    if (total > stepDuration) return 'Exceeds step duration'
    return null
  }
}
```

---

## PART 5: SUMMARY OF FIXES NEEDED

| # | Issue | Severity | Status |
|---|-------|----------|--------|
| 1 | Step selector empty | CRITICAL | ✅ FIXED |
| 2 | Join bake validation too strict | HIGH | ✅ FIXED |
| 3 | SPA routing 404s | CRITICAL | ✅ FIXED |
| 4 | No clear data ownership | HIGH | ⚠️ PARTIAL |
| 5 | Inconsistent error handling | HIGH | ⚠️ TODO |
| 6 | Too much logic in views | MEDIUM | ⚠️ TODO |
| 7 | No input validation | HIGH | ⚠️ TODO |
| 8 | Broken computed property chain | CRITICAL | ✅ FIXED |
| 9 | Missing template storage | CRITICAL | ✅ FIXED |
| 10 | No null checks | HIGH | ✅ FIXED |

---

## RECOMMENDATIONS FOR JUNIOR DEV

### For Current Codebase:
1. ✅ Always store full objects, not just IDs
2. ✅ Always check if data exists before using it
3. ✅ Create fallback logic for empty states
4. ✅ Validate at form level AND before using data
5. ✅ Never assume computed properties return data

### For Future Development:
1. Create a `validation.js` utility with reusable rules
2. Create an `errors.js` utility for consistent error messages
3. Extract form logic into separate composables
4. Add TypeScript for type safety
5. Create a data flow diagram in README

### Testing Before Deployment:
1. Test with empty data (no schedule)
2. Test with missing data (template not stored)
3. Test form validation edge cases
4. Test navigation/routing on all pages
5. Test with incomplete user workflows

---

## NEXT STEPS

All CRITICAL issues have been fixed. Recommend addressing HIGH priority items next to improve stability and maintainability.

**Report Created:** 2026-04-05  
**Ready for Implementation:** YES

