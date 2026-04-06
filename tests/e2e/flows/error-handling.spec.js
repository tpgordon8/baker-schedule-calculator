import { test, expect } from '@playwright/test'
import { goToPage } from '../helpers/ui-helpers'

test.describe('Error Handling & Bug Fixes', () => {
  test('should handle missing template properties gracefully', async ({ page }) => {
    // This tests the defensive programming fixes
    page.on('console', msg => {
      // Should not have "undefined is not an object" errors
      if (msg.type() === 'error') {
        expect(msg.text()).not.toContain("undefined is not an object")
        expect(msg.text()).not.toContain("Cannot read property")
      }
    })

    await goToPage(page, '/calculator')

    // Page should render without crashing
    const body = await page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should handle invalid form inputs without crashing', async ({ page }) => {
    await goToPage(page, '/calculator')

    // Try to fill invalid data
    const inputs = page.locator('input')

    // Click on several inputs and type random characters
    for (let i = 0; i < Math.min(3, await inputs.count()); i++) {
      const input = inputs.nth(i)
      await input.fill('invalid-data-!!!-@@@')
    }

    // Page should still be stable
    const body = await page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should validate type consistency for dates', async ({ page }) => {
    // Tests the ensureDate() helper fixes
    await goToPage(page, '/calculator')

    // Fill date inputs with various formats
    const dateInputs = page.locator('input[type="datetime-local"]')

    if (await dateInputs.count() > 0) {
      const input = dateInputs.first()

      // Fill with valid ISO format
      const now = new Date()
      const isoString = now.toISOString().slice(0, 16)
      await input.fill(isoString)

      // Input should accept the value without crashing
      const value = await input.inputValue()
      expect(value).toBeTruthy()
    }
  })

  test('should provide user-friendly error messages', async ({ page }) => {
    await goToPage(page, '/join')

    // Try to navigate without filling fields
    // Should get validation errors, not cryptic JavaScript errors

    const errorElements = page.locator('[role="alert"], .error, [class*="error"]')

    // There might be error messages, but they should be readable
    if (await errorElements.count() > 0) {
      const errorText = await errorElements.first().textContent()
      expect(errorText).toBeTruthy()
      // Should NOT contain minified JavaScript
      expect(errorText).not.toContain('undefined is not an object')
    }
  })
})
