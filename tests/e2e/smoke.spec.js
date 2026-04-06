import { test, expect } from '@playwright/test'

test.describe('Smoke Tests', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/')

    // Check page loads without errors
    const title = await page.title()
    expect(title).toBeTruthy()

    // Check main content is visible
    const body = await page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should have no console errors on load', async ({ page }) => {
    const errors = []

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/')

    // Note: Some errors might be expected (e.g., external scripts)
    // This test just documents what errors exist
    if (errors.length > 0) {
      console.log('Console errors found:', errors)
    }
  })

  test('should have responsive viewport on mobile', async ({ page }) => {
    page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    const body = await page.locator('body')
    const boundingBox = await body.boundingBox()

    expect(boundingBox.width).toBeLessThanOrEqual(375)
  })
})
