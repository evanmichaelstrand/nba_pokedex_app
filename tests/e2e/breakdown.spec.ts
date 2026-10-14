import { expect, test, type Page } from '@playwright/test'
import { fileURLToPath } from 'node:url'

// Every fixture row carries LeBron James's real 2025-26 numbers (PPG 20.9, 91st pct; 60 GP; ...).
const SEARCH_FIXTURE = fileURLToPath(new URL('./fixtures/search.csv', import.meta.url))

const card = (page: Page) => page.getByRole('article')
const row = (page: Page, stat: string) => card(page).getByRole('button', { name: new RegExp(`^${stat}:`) })
const tooltip = (page: Page) => card(page).getByRole('tooltip')
const position = (page: Page) => page.getByRole('navigation').getByText(/\d+ \/ \d+/)

test.beforeEach(async ({ page }) => {
  await page.route('**/data/*.csv', (route) => route.fulfill({ path: SEARCH_FIXTURE }))
  await page.goto('/')
  await expect(card(page)).toBeVisible()
})

test('tapping a stat shows how it is built, and tapping elsewhere closes it', async ({ page }) => {
  await row(page, 'ATK').click()
  await expect(tooltip(page)).toBeVisible()
  await expect(tooltip(page)).toContainText('Points per game')
  await expect(tooltip(page)).toContainText('20.9')
  await expect(tooltip(page)).toContainText('91st pct')
  await expect(tooltip(page)).toContainText('2-point FG%')
  await expect(row(page, 'ATK')).toHaveAttribute('aria-expanded', 'true')

  await page.getByRole('banner').click()
  await expect(tooltip(page)).toHaveCount(0)
})

test('tapping the same stat again closes it; another stat switches', async ({ page }) => {
  await row(page, 'HP').click()
  await expect(tooltip(page)).toContainText('Games played')
  await row(page, 'SPD').click()
  await expect(tooltip(page)).toContainText('Average speed')
  await row(page, 'SPD').click()
  await expect(tooltip(page)).toHaveCount(0)
})

test('every stat has a breakdown with the mapped inputs', async ({ page }) => {
  const expected: Record<string, string[]> = {
    HP: ['Games played', 'Total minutes'],
    ATK: ['Points per game', '2-point FG%'],
    DEF: ['Interior defensive FG%', 'Rebounds per game', 'Blocks per game'],
    'SP\\. ATK': ['Assists per game', 'Turnovers per game', 'AST − TOV', '3-pointers made per game', 'Net offensive rating'],
    'SP\\. DEF': ['Perimeter defensive FG%', 'Steals per game', 'Net defensive rating'],
    SPD: ['Average speed', 'Charges drawn per game', 'Loose balls recovered per game', 'Box outs per game'],
  }
  for (const [stat, labels] of Object.entries(expected)) {
    await row(page, stat).click()
    await expect(tooltip(page).locator('dt')).toHaveText(labels)
    await row(page, stat).click()
  }
})

test('opening a breakdown does not navigate', async ({ page }) => {
  const before = await position(page).textContent()
  await row(page, 'DEF').click()
  await expect(tooltip(page)).toBeVisible()
  await expect(position(page)).toHaveText(before!)
})

test('keyboard: Enter opens, Escape closes', async ({ page }) => {
  await row(page, 'HP').focus()
  await page.keyboard.press('Enter')
  await expect(tooltip(page)).toContainText('Total minutes')
  await page.keyboard.press('Escape')
  await expect(tooltip(page)).toHaveCount(0)
})

test('mouse hover shows the breakdown and leaving hides it', async ({ page, isMobile }) => {
  test.skip(isMobile, 'hover is a desktop interaction')
  await row(page, 'ATK').hover()
  await expect(tooltip(page)).toContainText('Points per game')
  await page.getByRole('banner').hover()
  await expect(tooltip(page)).toHaveCount(0)
})

test('a swipe that starts on the bars still navigates', async ({ page }) => {
  const box = (await row(page, 'ATK').boundingBox())!
  const y = box.y + box.height / 2
  await page.mouse.move(box.x + box.width / 2, y)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 - 150, y, { steps: 8 })
  await page.mouse.up()
  await expect(position(page)).toHaveText(/(^|\s)2 \/ 4$/)
  await expect(tooltip(page)).toHaveCount(0)
})

test('real touch taps open and switch breakdowns', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'touch only')
  await row(page, 'ATK').tap()
  await expect(tooltip(page)).toContainText('Points per game')
  await row(page, 'SPD').tap()
  await expect(tooltip(page)).toContainText('Average speed')
  await row(page, 'SPD').tap()
  await expect(tooltip(page)).toHaveCount(0)
})
