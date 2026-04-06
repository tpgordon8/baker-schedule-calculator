/**
 * UI Helper Functions for E2E Tests
 * Reusable functions for interacting with the app
 */

export async function goToPage(page, path = '/') {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
}

export async function fillInput(page, placeholder, value) {
  await page.fill(`input[placeholder="${placeholder}"]`, value)
}

export async function selectOption(page, ariaLabel, value) {
  await page.selectOption(`[aria-label="${ariaLabel}"]`, value)
}

export async function clickButton(page, text) {
  await page.click(`button:has-text("${text}")`)
}

export async function clickByAriaLabel(page, ariaLabel) {
  await page.click(`[aria-label="${ariaLabel}"]`)
}

export async function checkCheckbox(page, value) {
  await page.check(`input[value="${value}"]`)
}

export async function uncheckCheckbox(page, value) {
  await page.uncheck(`input[value="${value}"]`)
}

export async function waitForText(page, text, timeout = 5000) {
  await page.getByText(text, { exact: false }).waitFor({ timeout })
}

export async function expectTextVisible(page, text) {
  const element = page.getByText(text, { exact: false })
  await element.waitFor({ state: 'visible', timeout: 5000 })
}

export async function expectTextNotVisible(page, text) {
  const element = page.getByText(text, { exact: false })
  await element.waitFor({ state: 'hidden', timeout: 5000 })
}

export async function expectInputValue(page, placeholder, expectedValue) {
  const input = page.locator(`input[placeholder="${placeholder}"]`)
  await input.waitFor({ state: 'visible', timeout: 5000 })
  const actualValue = await input.inputValue()
  return actualValue === expectedValue
}

export async function getInputValue(page, placeholder) {
  return await page.inputValue(`input[placeholder="${placeholder}"]`)
}

export async function scrollToElement(page, selector) {
  await page.locator(selector).scrollIntoViewIfNeeded()
}

export async function takeScreenshot(page, name) {
  await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true })
}

export async function waitForNavigation(page, fn) {
  await Promise.all([page.waitForNavigation(), fn()])
}

export async function getCurrentUrl(page) {
  return page.url()
}

export async function expectUrlContains(page, pathSegment) {
  const url = page.url()
  return url.includes(pathSegment)
}
