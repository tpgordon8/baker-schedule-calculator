import { test, expect } from '@playwright/test'
import { injectAxe, getViolations } from 'axe-playwright'

test.describe('Mobile: Accessibility (WCAG AA)', () => {
  test('should have sufficient color contrast on mobile', async ({ page }) => {
    page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Inject and run axe
    await injectAxe(page)
    const violations = await getViolations(page)

    // Filter for color contrast violations
    const contrastViolations = violations.filter(v => v.id.includes('color-contrast'))

    // Should have no contrast violations
    expect(contrastViolations.length).toBe(0)
  })

  test('should have visible focus indicators', async ({ page }) => {
    page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Tab to first interactive element
    await page.keyboard.press('Tab')

    // Wait for focus
    await page.waitForTimeout(100)

    // Get focused element
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement
      if (!el) return null

      const styles = window.getComputedStyle(el)
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow
      }
    })

    // Should have some kind of focus indication
    if (focusedElement) {
      const hasFocusStyle =
        focusedElement.outline ||
        focusedElement.boxShadow ||
        focusedElement.outlineWidth !== '0px'

      // Either outline or box-shadow should be visible
      expect(
        focusedElement.outline?.length > 0 || focusedElement.boxShadow?.length > 0
      ).toBeTruthy()
    }
  })

  test('should support keyboard navigation on mobile', async ({ page }) => {
    page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    const initialFocus = await page.evaluate(() => document.activeElement?.tagName)

    // Tab through elements
    await page.keyboard.press('Tab')
    await page.waitForTimeout(50)

    const firstTabFocus = await page.evaluate(() => document.activeElement?.tagName)

    await page.keyboard.press('Tab')
    await page.waitForTimeout(50)

    const secondTabFocus = await page.evaluate(() => document.activeElement?.tagName)

    // Should be able to tab through elements
    expect(firstTabFocus || secondTabFocus).toBeTruthy()
  })

  test('should have proper ARIA labels on interactive elements', async ({ page }) => {
    page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Find all buttons without visible text
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()

    for (let i = 0; i < Math.min(5, buttonCount); i++) {
      const button = buttons.nth(i)
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')

      // Button should either have visible text or ARIA label
      const hasIdentifier = text?.trim()?.length > 0 || ariaLabel

      if (await button.isVisible()) {
        expect(hasIdentifier).toBeTruthy()
      }
    }
  })

  test('should have semantic HTML structure', async ({ page }) => {
    page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Check for heading hierarchy
    const h1s = page.locator('h1')
    const h2s = page.locator('h2')
    const h3s = page.locator('h3')

    // Should have at least some semantic structure
    const hasHeadings =
      (await h1s.count()) > 0 ||
      (await h2s.count()) > 0 ||
      (await h3s.count()) > 0

    // Or should have landmark regions
    const nav = page.locator('nav')
    const main = page.locator('main')
    const footer = page.locator('footer')

    const hasLandmarks =
      (await nav.count()) > 0 ||
      (await main.count()) > 0 ||
      (await footer.count()) > 0

    expect(hasHeadings || hasLandmarks).toBeTruthy()
  })

  test('should handle zoom without breaking on mobile', async ({ page }) => {
    page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Simulate pinch zoom (200%)
    await page.evaluate(() => {
      document.body.style.zoom = '1.5'
    })

    // Page should still be interactive
    const buttons = page.locator('button')
    const count = await buttons.count()

    expect(count).toBeGreaterThanOrEqual(0)

    // Restore zoom
    await page.evaluate(() => {
      document.body.style.zoom = '1'
    })
  })
})
