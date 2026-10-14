import { expect, test, type Page } from '@playwright/test'
import { fileURLToPath } from 'node:url'

const ORDER_FIXTURE = fileURLToPath(new URL('./fixtures/order.csv', import.meta.url))

const playerName = (page: Page) => page.getByRole('article').getByRole('heading').first()
const position = (page: Page) => page.getByRole('navigation').getByText(/\d+ \/ \d+/)
/** Matches "3 / 12" exactly (the text also holds a visually hidden "Entry " prefix). */
const at = (index: number, total: number) => new RegExp(`(^|\\s)${index} / ${total}$`)

test.describe('with a small deck', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/data/*.csv', (route) => route.fulfill({ path: ORDER_FIXTURE }))
    await page.goto('/')
    await expect(playerName(page)).toBeVisible()
  })

  test('starts at the lowest Pokémon ID', async ({ page }) => {
    await expect(playerName(page)).toHaveText('First Player')
    await expect(position(page)).toHaveText(at(1, 3))
  })

  test('buttons move through the deck and wrap around', async ({ page }) => {
    const next = page.getByRole('button', { name: 'Next entry' })
    const previous = page.getByRole('button', { name: 'Previous entry' })

    await next.click()
    await expect(playerName(page)).toHaveText('Middle Player')
    await expect(position(page)).toHaveText(at(2, 3))
    await next.click()
    await next.click()
    await expect(playerName(page)).toHaveText('First Player')
    await previous.click()
    await expect(playerName(page)).toHaveText('Last Player')
    await expect(position(page)).toHaveText(at(3, 3))
  })

  test('arrow keys navigate', async ({ page }) => {
    await page.keyboard.press('ArrowRight')
    await expect(playerName(page)).toHaveText('Middle Player')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await expect(playerName(page)).toHaveText('Last Player')
  })

  test('rapid presses do not skip or desync', async ({ page }) => {
    for (let i = 0; i < 7; i++) await page.keyboard.press('ArrowRight')
    // 7 steps in a deck of 3 lands on index 1.
    await expect(playerName(page)).toHaveText('Middle Player')
    await expect(position(page)).toHaveText(at(2, 3))
  })
})

test('every entry renders fully and fits the viewport', async ({ page }) => {
  test.setTimeout(120_000)
  // Images are irrelevant here and the NBA CDN rejects headless browsers.
  await page.route(/cdn\.nba\.com|githubusercontent\.com/, (route) => route.abort())
  await page.goto('/')
  await expect(position(page)).toBeVisible()
  const total = Number((await position(page).textContent())!.split('/')[1].trim())

  for (let i = 1; i <= total; i++) {
    await expect(position(page)).toHaveText(at(i, total))
    const problem = await page.evaluate(() => {
      const card = document.querySelector('article')
      const headings = [...(card?.querySelectorAll('h2') ?? [])].map((h) => h.textContent?.trim())
      if (headings.length !== 2 || headings.some((h) => !h)) return `missing names: ${JSON.stringify(headings)}`
      if (card?.querySelectorAll('.type-badge').length === 0) return 'no type badge'
      if (card?.querySelectorAll('li').length !== 6) return 'missing stat rows'
      const overflow = document.documentElement.scrollHeight - window.innerHeight
      return overflow > 0 ? `overflows by ${overflow}px` : null
    })
    expect(problem, `entry ${i}: ${await playerName(page).textContent()}`).toBeNull()
    await page.keyboard.press('ArrowRight')
  }
  await expect(position(page)).toHaveText(at(1, total))
})
