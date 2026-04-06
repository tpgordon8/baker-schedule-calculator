/**
 * E2E Test Setup
 * Shared configuration and utilities for Playwright tests
 */

// Test data fixtures
export const testData = {
  validTemplate: {
    name: 'Standard Sourdough',
    type: 'sourdough',
    category: 'bread',
    difficulty: 'beginner',
    workflow: {
      feedStarter: { minutes: 180, description: 'Feed starter until bubbly' },
      autolyse: { minutes: 30, description: 'Rest flour + water' },
      mix: { minutes: 10, description: 'Mix in starter + salt' },
      bulkFermentation: { minutes: 360, description: 'First rise' },
      stretchAndFold: { minutes: 120, description: 'Stretch and fold' },
      benchRest: { minutes: 30, description: 'Bench rest' },
      finalProof: { minutes: 120, description: 'Final proof' },
      bake: { minutes: 45, description: 'Bake in oven' },
      cool: { minutes: 90, description: 'Cool before slicing' }
    }
  }
}

// Common test helpers
export const waitForElement = async (page, selector, timeout = 5000) => {
  await page.waitForSelector(selector, { timeout })
}

export const fillForm = async (page, fields) => {
  for (const [selector, value] of Object.entries(fields)) {
    await page.fill(selector, value)
  }
}

export const expectTextVisible = async (page, text) => {
  await page.getByText(text, { exact: false }).waitFor({ timeout: 5000 })
}
