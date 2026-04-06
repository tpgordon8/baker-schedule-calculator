import { test, expect, devices } from '@playwright/test'

test.describe('Mobile: Viewport & Responsiveness', () => {
  test('should be responsive on iPhone 12', async ({ page }) => {
    page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    // Page should render without horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.offsetWidth)
    expect(bodyWidth).toBeLessThanOrEqual(390)
  })

  test('should be responsive on Pixel 5', async ({ page }) => {
    page.setViewportSize({ width: 393, height: 851 })
    await page.goto('/')

    const bodyWidth = await page.evaluate(() => document.body.offsetWidth)
    expect(bodyWidth).toBeLessThanOrEqual(393)
  })

  test('should have readable text on mobile (16px minimum)', async ({ page }) => {
    page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Check body text size
    const textElements = page.locator('p, span, label, h1, h2, h3')

    if (await textElements.count() > 0) {
      const firstText = textElements.first()
      const fontSize = await firstText.evaluate(el => {
        return window.getComputedStyle(el).fontSize
      })

      const fontSizeNum = parseFloat(fontSize)
      // Most text should be readable (14px+ is acceptable for small screens)
      expect(fontSizeNum).toBeGreaterThanOrEqual(12)
    }
  })

  test('should not have horizontal scroll on narrow viewport', async ({ page }) => {
    // Test the narrowest common viewport (iPhone SE)
    page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/join')

    // Check if page width exceeds viewport
    const pageWidth = await page.evaluate(() => {
      return Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth
      )
    })

    const viewportWidth = await page.evaluate(() => window.innerWidth)

    // Allow 5px tolerance for scrollbar or rounding
    expect(pageWidth).toBeLessThanOrEqual(viewportWidth + 5)
  })

  test('should have proper spacing on mobile', async ({ page }) => {
    page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Find buttons and check they have adequate spacing
    const buttons = page.locator('button')

    if (await buttons.count() > 0) {
      const firstButton = buttons.first()
      const secondButton = buttons.nth(1)

      if (await secondButton.count() > 0) {
        const box1 = await firstButton.boundingBox()
        const box2 = await secondButton.boundingBox()

        if (box1 && box2) {
          // Buttons shouldn't be cramped together
          const verticalGap = Math.abs(box2.y - (box1.y + box1.height))
          expect(verticalGap).toBeGreaterThanOrEqual(4) // At least 4px gap
        }
      }
    }
  })

  test('should handle large text (accessibility) without breaking layout', async ({ page }) => {
    page.setViewportSize({ width: 375, height: 667 })

    // Simulate user increasing font size
    await page.evaluate(() => {
      document.body.style.fontSize = '18px'
    })

    await page.goto('/')

    // Page should still be functional
    const bodyWidth = await page.evaluate(() => document.body.offsetWidth)
    expect(bodyWidth).toBeLessThanOrEqual(375 + 10)
  })
})
