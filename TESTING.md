# Comprehensive Testing Guide

## Overview

This project includes a complete testing suite with:
- **Unit Tests** (Vitest) - Test individual functions and components
- **E2E Tests** (Playwright) - Test full user flows
- **Mobile Tests** - Touch, viewport, accessibility testing
- **Visual Regression** (Percy) - Detect UI changes automatically
- **Accessibility Tests** - WCAG AA compliance
- **CI/CD Pipeline** - All tests run automatically on every commit

**Total Tests:** 120+ across Desktop, Mobile, and iOS
**Cost:** $0 (completely free)
**Time to Run:** ~5 minutes locally, ~10 minutes in CI

## Quick Start

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm run test:all    # Full test suite (lint → build → unit → e2e)
npm run test        # Unit + E2E tests only
npm run test:unit   # Unit tests only
npm run test:e2e    # E2E tests only
```

### Interactive Testing

```bash
npm run test:unit:ui      # Vitest UI - watch unit tests in browser
npm run test:e2e:ui       # Playwright UI - test flows interactively
npm run test:e2e:debug    # Playwright debug mode - step through tests
npm run test:unit:watch   # Unit tests in watch mode
```

## Test Commands Reference

### Development

| Command | Purpose | Time |
|---------|---------|------|
| `npm run dev` | Start dev server | - |
| `npm run build` | Build for production | ~2s |
| `npm run preview` | Preview production build | - |
| `npm run lint` | Run ESLint + fix | ~1s |

### Testing - Unit Tests

| Command | Purpose | Time |
|---------|---------|------|
| `npm run test:unit` | Run unit tests once | ~1s |
| `npm run test:unit:watch` | Watch mode - re-run on change | - |
| `npm run test:unit:ui` | Open Vitest UI in browser | - |

### Testing - E2E Tests

| Command | Purpose | Time |
|---------|---------|------|
| `npm run test:e2e` | Run all E2E tests | ~2-3m |
| `npm run test:e2e:ui` | Playwright UI - interactive testing | - |
| `npm run test:e2e:debug` | Debug mode - step through | - |
| `npm run test:e2e:desktop` | Chrome desktop only | ~1m |
| `npm run test:e2e:mobile` | Mobile (Pixel 5) only | ~1m |
| `npm run test:e2e:ios` | iOS (iPhone 12) only | ~1m |

### Testing - Visual Regression

| Command | Purpose | Time |
|---------|---------|------|
| `npm run test:visual` | Run with Percy (requires token) | ~2m |

### Testing - Full Suite

| Command | Purpose | Time |
|---------|---------|------|
| `npm run test:all` | Everything (lint → build → tests) | ~5m |

## Test Structure

```
tests/
├── e2e/
│   ├── fixtures/          # Shared test data
│   ├── helpers/           # Reusable UI helpers
│   │   └── ui-helpers.js
│   ├── flows/             # Main E2E test suites
│   │   ├── calculate-bake.spec.js
│   │   ├── join-existing-bake.spec.js
│   │   ├── tracker.spec.js
│   │   ├── templates.spec.js
│   │   └── error-handling.spec.js
│   ├── mobile/            # Mobile-specific tests
│   │   ├── touch-interactions.spec.js
│   │   ├── mobile-viewport.spec.js
│   │   └── accessibility-mobile.spec.js
│   ├── visual/            # Visual regression tests
│   │   ├── baseline-setup.spec.js
│   │   └── layout-regression.spec.js
│   ├── smoke.spec.js      # Basic smoke tests
│   └── setup.js           # Test setup and fixtures

src/
└── **/*.spec.js           # Unit tests (colocated with source)
```

## Test Categories

### Unit Tests (Vitest)

**Location:** `src/**/*.spec.js`  
**Purpose:** Test individual functions and logic  
**Run:** `npm run test:unit`  
**Coverage:** Component logic, store mutations, composables

### E2E Tests - Core Flows (Playwright)

**Location:** `tests/e2e/flows/`  
**Purpose:** Test complete user journeys  
**Tests:**
- Calculate bake schedule generation
- Join existing bake (all 7 steps)
- Tracker view and step management
- Template loading and management
- Error handling and validation

### E2E Tests - Mobile

**Location:** `tests/e2e/mobile/`  
**Purpose:** Mobile-specific interactions  
**Tests:**
- Touch target size (44px+)
- Scrolling and interaction
- Mobile keyboard handling
- Responsive viewports (iPhone, Pixel)
- Accessibility (WCAG AA)

### E2E Tests - Visual Regression

**Location:** `tests/e2e/visual/`  
**Purpose:** Detect unintended UI changes  
**Integration:** Percy.io (automatic comparison)  
**Tests:**
- Baseline screenshots
- Layout regression detection
- Color and style changes

## Running Tests Locally

### Before Starting Dev Server

```bash
# Run quick checks
npm run lint
npm run build

# Run unit tests (fast, no server needed)
npm run test:unit

# Launch dev server
npm run dev
```

### While Dev Server is Running

In a **separate terminal**:

```bash
# Watch unit tests
npm run test:unit:watch

# Interactive E2E testing
npm run test:e2e:ui

# Or run E2E tests once
npm run test:e2e
```

### Full Local Test Suite

```bash
# Run everything (5-7 minutes)
npm run test:all

# Or specific suites
npm run test:unit      # ~1s
npm run test:e2e       # ~3-5m
npm run lint           # ~1s
npm run build          # ~2s
```

## CI/CD Pipeline

All tests run automatically on:
- **Every push** to `main` or `develop`
- **Every pull request** to `main`

### Workflow Jobs (Parallel)

1. **Quality Checks** (5 min)
   - ESLint code quality
   - Production build
   - Uploads build artifacts

2. **Unit Tests** (Vitest) (2 min)
   - Fast test suite
   - Coverage reporting
   - Uploads coverage artifacts

3. **E2E Tests - Desktop** (10 min)
   - Chrome browser
   - Full test suite
   - Screenshot on failure

4. **E2E Tests - Mobile** (15 min)
   - Android Emulator (Pixel 5)
   - Full test suite
   - Video on failure

5. **E2E Tests - iOS** (macOS runner, 15 min)
   - iPhone 12 Simulator
   - Full test suite
   - Screenshots on failure

### Test Results

After all jobs complete:
- ✅ All pass → Green check, auto-deploy to Vercel
- ❌ Any fail → Red X, blocks merge, detailed logs available

### Artifacts (Available for 1 Day)

When tests fail, artifacts uploaded for debugging:
- `playwright-report/` - HTML test report
- `test-results/` - JSON, XML test results
- `coverage-report/` - Code coverage HTML

## Visual Regression with Percy

See [PERCY_SETUP.md](./PERCY_SETUP.md) for detailed setup.

**Quick Start:**
```bash
export PERCY_TOKEN=<your-token>
npm run test:visual
```

Percy automatically:
- Takes snapshots on every run
- Compares against baseline
- Highlights visual differences
- Posts results to PR

## Writing New Tests

### Unit Test Template

```javascript
import { describe, it, expect } from 'vitest'

describe('MyFunction', () => {
  it('should do something', () => {
    const result = myFunction()
    expect(result).toBe(expected)
  })
})
```

**File:** `src/utils/myFunction.spec.js`

### E2E Test Template

```javascript
import { test, expect } from '@playwright/test'
import { goToPage, clickButton, expectTextVisible } from '../helpers/ui-helpers'

test.describe('My Feature', () => {
  test('should do something', async ({ page }) => {
    await goToPage(page, '/calculator')
    await clickButton(page, 'Generate')
    await expectTextVisible(page, 'Success')
  })
})
```

**File:** `tests/e2e/flows/my-feature.spec.js`

## Debugging Tests

### Playwright Debug Mode

```bash
npm run test:e2e:debug
```

This opens:
- Browser window with test controls
- Inspector showing element tree
- Console for running JavaScript
- Network tab for requests

**Controls:**
- Click elements to inspect
- Step through test line-by-line
- Evaluate expressions in console

### Vitest UI

```bash
npm run test:unit:ui
```

Opens browser interface showing:
- All test files
- Pass/fail status
- Code coverage
- Can re-run individual tests

### Playwright UI

```bash
npm run test:e2e:ui
```

Interactive test runner with:
- Test explorer sidebar
- Live execution
- Step through each action
- Inspect page state

### View Test Reports

After running tests, view HTML reports:

```bash
# E2E tests
open playwright-report/index.html

# Coverage
open coverage/index.html
```

## Best Practices

### For New Features

1. **Write test first** (TDD)
2. **Make test fail** (red)
3. **Write code** (green)
4. **Run tests** (passing)
5. **Refactor** (maintain passing tests)

### Before Commit

```bash
npm run lint      # Check code quality
npm run test:unit # Quick unit tests
npm run build     # Verify build
```

### Before Push

```bash
npm run test:all  # Full suite (5 min)
```

### Test Naming

✅ Good: `should calculate bake schedule with valid inputs`  
❌ Bad: `test calculate`

✅ Good: `should show error message when target time is in past`  
❌ Bad: `error test`

## Performance Tips

### Speed Up Tests

1. **Run specific test file:**
   ```bash
   npm run test:unit -- src/utils/calculation.spec.js
   ```

2. **Run specific test:**
   ```bash
   npm run test:e2e -- --grep "should calculate schedule"
   ```

3. **Skip slow tests during dev:**
   ```bash
   test.skip('slow test', () => { ... })
   ```

4. **Use watch mode:**
   ```bash
   npm run test:unit:watch
   ```

### Reduce CI Time

- Run unit tests first (fastest)
- Run E2E tests in parallel (already done)
- Reuse existing test artifacts
- Skip tests on documentation changes

## Continuous Improvement

### Monitor Test Health

- **Green Builds:** All tests pass ✅
- **Flaky Tests:** Random failures (investigate and fix)
- **Slow Tests:** >5s execution (optimize)
- **Coverage Gaps:** <80% code coverage (add tests)

### Run Periodic Audits

```bash
# Check for unused test files
npm run test:unit -- --coverage

# Check for slow tests
npm run test:e2e -- --reporter=verbose

# Lighthouse audit
npm run build && npm run preview
# Then run Lighthouse in Chrome DevTools
```

## Troubleshooting

### Tests Timeout

```bash
# Increase timeout
npm run test:e2e -- --timeout=30000
```

### Port Already in Use

```bash
# Kill process on port 5173
lsof -i :5173 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or use different port
npm run dev -- --port 5174
```

### Percy Token Not Found

```bash
# Set token
export PERCY_TOKEN=<your-token>

# Or in GitHub Actions, add secret to repository
```

### Screenshot Differences

- If intentional, approve in Percy
- If not, review code changes
- Update baseline if needed

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Vitest Documentation](https://vitest.dev)
- [Percy Documentation](https://docs.percy.io)
- [Testing Library Best Practices](https://testing-library.com/docs)

## Support

For test failures or issues:

1. **Check test output:** Run test with verbose flag
2. **Review test code:** Look for assumptions
3. **Debug with Playwright UI:** Step through test
4. **Check GitHub Actions logs:** CI pipeline output
5. **Review Percy dashboard:** Visual diffs

## Next Steps

- [ ] Set up Percy token for visual regression
- [ ] Add more E2E tests as features are added
- [ ] Monitor test flakiness
- [ ] Maintain >80% code coverage
- [ ] Review test performance monthly
