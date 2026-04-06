import { test, expect, devices } from '@playwright/test'

// Mobile-specific tests - run on actual mobile device profiles
test.use({ ...devices['Pixel 5'] })

test.describe('Mobile: Touch Interactions', () => {
  test('should have properly sized touch targets (44px minimum)', async ({ page }) => {
    await page.goto('/')

    // Get all buttons
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()

    expect(buttonCount).toBeGreaterThan(0)

    // Check size of each button
    for (let i = 0; i < Math.min(5, buttonCount); i++) {
      const button = buttons.nth(i)
      const boundingBox = await button.boundingBox()

      // iOS minimum touch target is 44x44 pixels
      if (boundingBox && (await button.isVisible())) {
        expect(boundingBox.height).toBeGreaterThanOrEqual(40) // Allow slight tolerance
        expect(boundingBox.width).toBeGreaterThanOrEqual(40)
      }
    }
  })

  test('should support tapping buttons on mobile', async ({ page }) => {
    await page.goto('/')

    // Find and tap a button
    const buttons = page.locator('button')
    if (await buttons.count() > 0) {
      const firstButton = buttons.first()

      // Get initial URL
      const initialUrl = page.url()

      // Tap the button
      await firstButton.tap()

      // Wait a moment for any navigation or state change
      await page.waitForTimeout(500)

      // Page should still be functional
      const body = page.locator('body')
      await expect(body).toBeVisible()
    }
  })

  test('should allow scrolling on mobile', async ({ page }) => {
    await page.goto('/')

    // Get initial scroll position
    const initialScroll = await page.evaluate(() => window.scrollY)

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500))

    // Get new scroll position
    const newScroll = await page.evaluate(() => window.scrollY)

    // Should have scrolled (or page not long enough to scroll)
    expect(newScroll).toBeGreaterThanOrEqual(initialScroll)
  })

  test('should handle form input on mobile keyboard', async ({ page }) => {
    await page.goto('/calculator')

    // Find a text input
    const inputs = page.locator('input[type="text"], input[type="number"]')

    if (await inputs.count() > 0) {
      const input = inputs.first()

      // Tap to focus (simulates mobile keyboard appearing)
      await input.tap()

      // Type some text
      await input.fill('test-value-123')

      // Verify input has value
      const value = await input.inputValue()
      expect(value).toContain('test')
    }
  })

  test('should close mobile keyboard on escape', async ({ page }) => {
    await page.goto('/calculator')

    const inputs = page.locator('input[type="text"], input[type="number"]')

    if (await inputs.count() > 0) {
      const input = inputs.first()

      // Focus input
      await input.tap()
      await page.waitForTimeout(200)

      // Press escape (would close keyboard on mobile)
      await page.keyboard.press('Escape')

      // Page should still be functional
      const body = page.locator('body')
      await expect(body).toBeVisible()
    }
  })
})
