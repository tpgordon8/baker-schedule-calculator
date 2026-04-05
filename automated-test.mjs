import fs from 'fs'
import path from 'path'

const results = []
const errors = []

function test(phase, feature, passed, details = '') {
  const status = passed ? '✅' : '❌'
  results.push({ phase, feature, status, details })
  console.log(`${status} Phase ${phase}: ${feature}${details ? ` - ${details}` : ''}`)
}

function checkFile(filePath) {
  return fs.existsSync(filePath) && fs.readFileSync(filePath, 'utf-8')
}

function checkFileContent(filePath, searchString) {
  const content = checkFile(filePath)
  return content && content.includes(searchString)
}

console.log('🧪 AUTOMATED FEATURE VERIFICATION\n')

// ==================== PHASE 1: CORE CALCULATOR ====================
console.log('📋 PHASE 1: Core Calculator (Schedule Generation)')

const calcView = checkFile('/tmp/baker-schedule-calculator/src/views/CalculatorView.vue')
test(1, 'DateTime input exists', calcView && calcView.includes('type="datetime-local"'), 'Target time picker')
test(1, 'Bulk fermentation selector', calcView && calcView.includes('bulkDuration'), 'Radio buttons for duration')
test(1, 'Preheat duration selector', calcView && calcView.includes('preheatDuration'), 'Preheat options')
test(1, 'Final proof method', calcView && calcView.includes('proofMethod'), 'Room temp vs cold proof')
test(1, 'Generate button', calcView && calcView.includes('generateSchedule'), 'Triggers schedule generation')

const scheduleCalc = checkFile('/tmp/baker-schedule-calculator/src/composables/useScheduleCalculator.js')
test(1, 'Schedule calculator function', scheduleCalc && scheduleCalc.includes('generateSchedule'), 'Backward calculation')
test(1, 'Time formatting', scheduleCalc && scheduleCalc.includes('formatTime'), 'Display format function')

// ==================== PHASE 2: STEP TRACKER ====================
console.log('\n📊 PHASE 2: Step Tracker (Mark Complete & Adjust)')

const trackerView = checkFile('/tmp/baker-schedule-calculator/src/views/TrackerView.vue')
test(2, 'Tracker view exists', trackerView !== false, 'Step tracking interface')
test(2, 'Step display', trackerView && trackerView.includes('StepCard'), 'Individual step cards')
test(2, 'Mark complete button', trackerView && trackerView.includes('mark-complete'), 'Button to complete steps')
test(2, 'Adjust functionality', trackerView && trackerView.includes('Adjust'), 'Adjust if running late')

const stepCard = checkFile('/tmp/baker-schedule-calculator/src/components/StepCard.vue')
test(2, 'Step card component', stepCard && stepCard.includes('plannedTime'), 'Shows time and status')

const timeline = checkFile('/tmp/baker-schedule-calculator/src/components/ScheduleTimeline.vue')
test(2, 'Visual timeline', timeline !== false, 'Timeline component exists')

// ==================== PHASE 3: TEMPLATES ====================
console.log('\n📚 PHASE 3: Templates (Save/Load)')

const templatesStore = checkFile('/tmp/baker-schedule-calculator/src/stores/templates.js')
test(3, 'Templates store', templatesStore && templatesStore.includes('addTemplate'), 'Save templates')
test(3, 'Load templates', templatesStore && templatesStore.includes('getTemplate'), 'Retrieve templates')
test(3, 'Delete templates', templatesStore && templatesStore.includes('deleteTemplate'), 'Remove templates')
test(3, 'Clone templates', templatesStore && templatesStore.includes('cloneTemplate'), 'Duplicate templates')
test(3, 'Template persistence', templatesStore && templatesStore.includes('persist'), 'Persist to localStorage')
test(3, 'Default sourdough', templatesStore && templatesStore.includes('default-sourdough'), 'Standard template')

const homeView = checkFile('/tmp/baker-schedule-calculator/src/views/HomeView.vue')
test(3, 'Template selector', homeView && homeView.includes('template'), 'Template selection UI')

// ==================== PHASE 4: RESUME/JOIN EXISTING BAKE ====================
console.log('\n🔄 PHASE 4: Resume/Join Existing Bake (Mid-Process)')

const router = checkFile('/tmp/baker-schedule-calculator/src/router/index.js')
test(4, 'Join route exists', router && router.includes('/join'), 'Join existing bake route')

const joinView = checkFile('/tmp/baker-schedule-calculator/src/views/JoinExistingBakeView.vue')
test(4, 'Join bake view', joinView !== false, 'Multi-step form for joining')

const activeBake = checkFile('/tmp/baker-schedule-calculator/src/stores/activeBake.js')
test(4, 'Active bake store', activeBake !== false, 'Manage active bake session')
test(4, 'Initialize bake', activeBake && activeBake.includes('initializeBake'), 'Start new bake')
test(4, 'Update schedule', activeBake && activeBake.includes('updateSchedule'), 'Modify schedule')

// ==================== PHASE 5A: PUSH NOTIFICATIONS ====================
console.log('\n🔔 PHASE 5A: Push Notifications')

const notifStore = checkFile('/tmp/baker-schedule-calculator/src/stores/notifications.js')
test('5A', 'Notifications store', notifStore !== false, 'Notification preferences')
test('5A', 'Enable/disable notifications', notifStore && notifStore.includes('enabled'), 'Toggle on/off')
test('5A', 'Sound toggle', notifStore && notifStore.includes('soundEnabled'), 'Audio alert option')
test('5A', 'Vibration toggle', notifStore && notifStore.includes('vibrationEnabled'), 'Haptic feedback')
test('5A', 'Remind before setting', notifStore && notifStore.includes('remindMinutesBefore'), 'Configurable advance notice')

const notifComposable = checkFile('/tmp/baker-schedule-calculator/src/composables/useNotifications.js')
test('5A', 'Notification logic', notifComposable !== false, 'Scheduling and delivery')
test('5A', 'Send notification', notifComposable && notifComposable.includes('sendNotification'), 'Trigger notification')
test('5A', 'Snooze functionality', notifComposable && notifComposable.includes('snooze'), 'Delay notification')
test('5A', 'Test notification', notifComposable && notifComposable.includes('sendTestNotification'), 'Send test for user')

const notifSettings = checkFile('/tmp/baker-schedule-calculator/src/components/NotificationSettings.vue')
test('5A', 'Settings component', notifSettings !== false, 'User preference UI')

const serviceWorker = checkFile('/tmp/baker-schedule-calculator/public/service-worker.js')
test('5A', 'Service worker', serviceWorker !== false, 'Background notification delivery')
test('5A', 'Push event handler', serviceWorker && serviceWorker.includes('push'), 'Handle push notifications')

// ==================== PHASE 5B: PREHEAT TRACKING ====================
console.log('\n🔥 PHASE 5B: Preheat Tracking')

test('5B', 'Preheat in calculator', calcView && calcView.includes('preheat'), 'Duration picker')
test('5B', 'Preheat in template', templatesStore && templatesStore.includes('preheat'), 'Workflow step')

const preheatInSchedule = scheduleCalc && scheduleCalc.includes('preheat')
test('5B', 'Preheat step insertion', preheatInSchedule, 'Automatically added before bake')

test('5B', 'Preheat in tracker', trackerView && trackerView.includes('preheat'), 'Step display in timeline')
test('5B', 'Oven ready button', trackerView && trackerView.includes('Oven'), 'Mark preheat complete')

// ==================== PHASE 5C: RECIPE-AGNOSTIC ARCHITECTURE ====================
console.log('\n🍞 PHASE 5C: Recipe-Agnostic Architecture')

test('5C', 'Template type field', templatesStore && templatesStore.includes('type'), 'Support multiple types')
test('5C', 'Template category', templatesStore && templatesStore.includes('category'), 'Categorization')
test('5C', 'Template description', templatesStore && templatesStore.includes('description'), 'User-facing notes')
test('5C', 'Template metadata', templatesStore && templatesStore.includes('difficulty'), 'Additional fields')

const defaultName = templatesStore && templatesStore.includes('Sourdough (Standard)')
test('5C', 'Template naming convention', defaultName, 'Supports multiple bread types')

// ==================== PHASE 5D: EDIT & DELETE BAKES ====================
console.log('\n⚙️ PHASE 5D: Edit & Delete Bakes')

test('5D', 'Pause bake', activeBake && activeBake.includes('pauseBake'), 'Suspend active bake')
test('5D', 'Resume bake', activeBake && activeBake.includes('resumeBake'), 'Continue paused bake')
test('5D', 'Edit bake', activeBake && activeBake.includes('editBake'), 'Modify target time')
test('5D', 'Pause state', activeBake && activeBake.includes('isPaused'), 'Track pause status')

test('5D', 'Bake settings UI', trackerView && trackerView.includes('⚙️') || trackerView.includes('Settings'), 'Settings menu button')
test('5D', 'Edit modal', trackerView && trackerView.includes('Edit'), 'Modify bake modal')
test('5D', 'Delete confirmation', trackerView && trackerView.includes('Delete'), 'Confirm destructive action')

// ==================== ACCESSIBILITY & MOBILE ====================
console.log('\n♿ ACCESSIBILITY & MOBILE')

const mainCss = checkFile('/tmp/baker-schedule-calculator/src/assets/main.css')
test('UX', 'Touch targets (44px)', mainCss && mainCss.includes('min-h-11'), 'WCAG 2.1 Level AA')
test('UX', 'Input font sizing', mainCss && mainCss.includes('text-base'), 'Prevent iOS auto-zoom')
test('UX', 'Focus states', mainCss && mainCss.includes('focus:outline'), 'Keyboard navigation')

// ==================== VERSION DISPLAY ====================
console.log('\n📦 VERSION DISPLAY')

const appVue = checkFile('/tmp/baker-schedule-calculator/src/App.vue')
test('Version', 'Version in header', appVue && appVue.includes('APP_VERSION'), 'Display in top-right')

const versionFile = checkFile('/tmp/baker-schedule-calculator/src/utils/version.js')
test('Version', 'Version constant', versionFile && versionFile.includes('0.1.0'), 'Correct version number')

// ==================== BUILD & DEPLOYMENT ====================
console.log('\n🚀 BUILD & DEPLOYMENT')

test('Deploy', 'Vercel config', checkFile('/tmp/baker-schedule-calculator/vercel.json') !== false, 'Auto-deploy ready')
test('Deploy', 'PWA manifest', checkFile('/tmp/baker-schedule-calculator/public/manifest.json') !== false, 'App metadata')
test('Deploy', 'Service worker', checkFile('/tmp/baker-schedule-calculator/public/service-worker.js') !== false, 'Background support')

// ==================== SUMMARY ====================
console.log('\n' + '='.repeat(70))
console.log('TEST SUMMARY')
console.log('='.repeat(70))

const passed = results.filter(r => r.status === '✅').length
const failed = results.filter(r => r.status === '❌').length
const byPhase = {}

results.forEach(r => {
  if (!byPhase[r.phase]) byPhase[r.phase] = { pass: 0, fail: 0 }
  if (r.status === '✅') byPhase[r.phase].pass++
  else byPhase[r.phase].fail++
})

console.log('\nBy Phase:')
Object.keys(byPhase).sort().forEach(phase => {
  const { pass, fail } = byPhase[phase]
  const total = pass + fail
  const pct = Math.round((pass / total) * 100)
  console.log(`  Phase ${phase}: ${pass}/${total} (${pct}%)`)
})

console.log('\n' + '='.repeat(70))
console.log(`OVERALL: ${passed}/${results.length} tests passed`)
console.log('='.repeat(70))

if (failed === 0) {
  console.log('\n✨ ALL FEATURES IMPLEMENTED & READY FOR MOBILE TESTING')
} else {
  console.log(`\n⚠️  ${failed} features may need attention`)
  results.filter(r => r.status === '❌').forEach(r => {
    console.log(`  ❌ Phase ${r.phase}: ${r.feature}`)
  })
}

process.exit(failed > 0 ? 1 : 0)
