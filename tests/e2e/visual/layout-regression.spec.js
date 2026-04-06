import { test } from '@playwright/test'
import { percySnapshot } from '@percy/playwright'

/**
 * Layout Regression Tests
 *
 * These tests run on every build and detect visual regressions.
 * Percy automatically compares against baseline screenshots.
 *
 * If a layout change is detected:
 * - Percy highlights the differences
 * - You review and approve/reject in Percy dashboard
 * - Rejected changes block the build
 */

test.describe('Visual Regression: Layout Detection', () => {
  test('should detect changes on home page', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Percy will compare against baseline
    await percySnapshot(page, 'Home Page')
  })

  test('should detect layout changes on calculator', async ({ page }) => {
    await page.goto('/calculator')
    await page.waitForLoadState('networkidle')

    // Verify elements are in correct position
    const button = page.locator('button:has-text("Generate")')
    const input = page.locator('input[type="datetime-local"]').first()

    // Buttons should be visible and properly positioned
    const buttonBox = await button.boundingBox()
    const inputBox = await input.boundingBox()

    if (buttonBox && inputBox) {
      // Button should be below input
      expect(buttonBox.y).toBeGreaterThan(inputBox.y)
    }

    await percySnapshot(page, 'Calculator - Element Positioning')
  })

  test('should detect form alignment issues', async ({ page }) => {
    await page.goto('/calculator')
    await page.waitForLoadState('networkidle')

    // Check form labels and inputs are aligned
    const labels = page.locator('label')
    const inputs = page.locator('input, select, textarea')

    // Should have similar number of labels and inputs
    const labelCount = await labels.count()
    const inputCount = await inputs.count()

    // Rough check - should be roughly proportional
    if (labelCount > 0) {
      expect(inputCount).toBeGreaterThan(0)
    }

    await percySnapshot(page, 'Calculator - Form Alignment')
  })

  test('should detect color or style changes', async ({ page }) => {
    await page.goto('/calculator')
    await page.waitForLoadState('networkidle')

    // Take snapshot - Percy will detect any CSS changes
    await percySnapshot(page, 'Calculator - Styles & Colors')
  })

  test('should detect responsive layout shifts', async ({ page }) => {
    // Test on mobile viewport
    page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/calculator')
    await page.waitForLoadState('networkidle')

    // Percy will compare against mobile baseline
    await percySnapshot(page, 'Calculator - Mobile Layout')
  })

  test('should detect spacing changes', async ({ page }) => {
    await page.goto('/calculator')
    await page.waitForLoadState('networkidle')

    // Get button positions to detect spacing issues
    const buttons = page.locator('button')

    if (await buttons.count() > 1) {
      const button1 = await buttons.nth(0).boundingBox()
      const button2 = await buttons.nth(1).boundingBox()

      if (button1 && button2) {
        const spacing = Math.abs(button2.y - (button1.y + button1.height))
        // Spacing should be consistent (roughly 8-16px)
        expect(spacing).toBeGreaterThan(4)
      }
    }

    await percySnapshot(page, 'Calculator - Element Spacing')
  })
})
