import { test } from '@playwright/test'
import { percySnapshot } from '@percy/playwright'

/**
 * Baseline Setup for Visual Regression Testing
 *
 * These tests establish the baseline screenshots for visual regression detection.
 * Run with: npm run test:visual
 *
 * Percy will use these as the baseline for future comparison runs.
 * If you intentionally change the UI, update baselines in Percy dashboard.
 */

test.describe('Visual Regression: Baselines', () => {
  test('should capture home page baseline', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Let animations settle
    await page.waitForTimeout(500)

    // Percy screenshot for baseline
    await percySnapshot(page, 'Home Page')
  })

  test('should capture calculator page baseline', async ({ page }) => {
    await page.goto('/calculator')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await percySnapshot(page, 'Calculator Page')
  })

  test('should capture join existing bake page baseline', async ({ page }) => {
    await page.goto('/join')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await percySnapshot(page, 'Join Existing Bake - Step 1')
  })

  test('should capture tracker page baseline', async ({ page }) => {
    await page.goto('/tracker')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await percySnapshot(page, 'Tracker Page')
  })

  test('should capture templates page baseline', async ({ page }) => {
    await page.goto('/templates')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await percySnapshot(page, 'Templates Page')
  })
})
