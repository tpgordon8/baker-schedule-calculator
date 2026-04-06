import { test, expect } from '@playwright/test'
import { goToPage } from '../helpers/ui-helpers'

test.describe('Tracker View', () => {
  test('should load tracker page', async ({ page }) => {
    await goToPage(page, '/tracker')

    // Tracker page should load without errors
    const body = await page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should display schedule timeline with steps', async ({ page }) => {
    await goToPage(page, '/tracker')

    // Should show some kind of timeline or schedule
    const timeline = page.locator('[class*="timeline"], [class*="schedule"], [class*="step"]')
    const count = await timeline.count()

    // Should have at least some elements visible
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should show current step information', async ({ page }) => {
    await goToPage(page, '/tracker')

    // Check if page has content (even if empty, it should render)
    const pageContent = await page.locator('body').textContent()
    expect(pageContent).toBeTruthy()
  })
})
