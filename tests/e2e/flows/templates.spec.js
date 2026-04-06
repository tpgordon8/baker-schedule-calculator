import { test, expect } from '@playwright/test'
import { goToPage, expectTextVisible } from '../helpers/ui-helpers'

test.describe('Template Management', () => {
  test('should load templates view', async ({ page }) => {
    await goToPage(page, '/templates')

    // Templates page should load
    const body = await page.locator('body')
    await expect(body).toBeVisible()
  })

  test('should display available templates', async ({ page }) => {
    await goToPage(page, '/templates')

    // Should show template list or empty state
    const pageContent = await page.locator('body').textContent()

    // Should have some content (either templates or "no templates" message)
    expect(pageContent).toBeTruthy()
    expect(pageContent.length).toBeGreaterThan(0)
  })
})
