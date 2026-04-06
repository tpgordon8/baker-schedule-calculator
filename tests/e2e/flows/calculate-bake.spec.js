import { test, expect } from '@playwright/test'
import { goToPage, clickButton, fillInput, waitForText, expectTextVisible } from '../helpers/ui-helpers'

test.describe('Calculate Bake Flow', () => {
  test.beforeEach(async ({ page }) => {
    await goToPage(page, '/')
  })

  test('should load home page and show calculate option', async ({ page }) => {
    // Home page should have a button to start calculating
    const calculateButton = page.getByRole('button', { name: /calculate|start/i })
    await calculateButton.waitFor({ state: 'visible', timeout: 5000 })
    expect(calculateButton).toBeTruthy()
  })

  test('should validate target time is required', async ({ page }) => {
    // Navigate to calculator
    await clickButton(page, 'Calculate Your Bake Schedule')

    // Try to generate schedule without entering target time
    await page.click('button:has-text("Generate")')

    // Should see validation error
    await expectTextVisible(page, 'target time')
    const url = page.url()
    expect(url).toContain('calculator')
  })

  test('should generate schedule with valid inputs', async ({ page }) => {
    // Navigate to calculator
    await page.goto('/calculator', { waitUntil: 'networkidle' })

    // Fill in target date/time (tomorrow at 6 PM)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateString = tomorrow.toISOString().split('T')[0]
    const timeString = '18:00'

    const dateInput = page.locator('input[type="datetime-local"]').first()
    await dateInput.fill(`${dateString}T${timeString}`)

    // Select bulk fermentation time (default is already selected)
    await page.click('button:has-text("Generate")')

    // Should see schedule generated
    await expectTextVisible(page, 'Timeline')

    // Verify schedule is displayed
    const scheduleTimeline = page.locator('[class*="timeline"], [class*="schedule"]')
    await scheduleTimeline.waitFor({ state: 'visible', timeout: 5000 })
  })
})
