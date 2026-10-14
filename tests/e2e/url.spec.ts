import { expect, test, type Page } from '@playwright/test'
import { fileURLToPath } from 'node:url'

// IDs: 1 Nikola Jokić, 2 LeBron James, 3 Traded Guy, 4 Another Laker.
// Default order: Another Laker, Nikola Jokić, LeBron James, Traded Guy.
const SEARCH_FIXTURE = fileURLToPath(new URL('./fixtures/search.csv', import.meta.url))

const playerName = (page: Page) => page.getByRole('article').getByRole('heading').first()
const position = (page: Page) => page.getByRole('navigation').getByText(/\d+ \/ \d+/)
const at = (index: number, total: number) => new RegExp(`(^|\\s)${index} / ${total}$`)
const hash = (page: Page) => page.evaluate(() => window.location.hash)

test.beforeEach(async ({ page }) => {
  await page.route('**/data/*.csv', (route) => route.fulfill({ path: SEARCH_FIXTURE }))
})

async function open(page: Page, path = '/') {
  await page.goto(path)
  await expect(playerName(page)).toBeVisible()
}

test('the URL follows the current entry', async ({ page }) => {
  await open(page)
  await expect.poll(() => hash(page)).toBe('#/player/4')
  await page.keyboard.press('ArrowRight')
  await expect.poll(() => hash(page)).toBe('#/player/1')
})

test('search and non-default sort go into the URL; defaults stay out', async ({ page }) => {
  await open(page)
  await page.getByRole('searchbox').fill('lakers')
  await page.getByRole('combobox', { name: 'Sort by' }).selectOption('team')
  await expect.poll(() => hash(page)).toBe('#/player/4?q=lakers&sort=team')
  await page.getByRole('combobox', { name: 'Sort by' }).selectOption('pokemonId')
  await page.getByRole('searchbox').fill('')
  await expect.poll(() => hash(page)).toBe('#/player/4')
})

test('a shared link restores entry, search, and sort', async ({ page }) => {
  await open(page, '/#/player/2?q=lakers&sort=type')
  await expect(playerName(page)).toHaveText('LeBron James')
  await expect(page.getByRole('searchbox')).toHaveValue('lakers')
  await expect(page.getByRole('combobox', { name: 'Sort by' })).toHaveValue('type')
  await expect(position(page)).toHaveText(at(2, 2))
})

test('reloading keeps the same view', async ({ page }) => {
  await open(page)
  await page.keyboard.press('ArrowLeft')
  await page.getByRole('combobox', { name: 'Sort by' }).selectOption('type')
  await expect(playerName(page)).toHaveText('Traded Guy')
  await page.reload()
  await expect(playerName(page)).toHaveText('Traded Guy')
  await expect(page.getByRole('combobox', { name: 'Sort by' })).toHaveValue('type')
})

test('unknown player IDs and sorts fall back to defaults', async ({ page }) => {
  await open(page, '/#/player/999999?sort=bogus')
  await expect(playerName(page)).toHaveText('Another Laker')
  await expect(page.getByRole('combobox', { name: 'Sort by' })).toHaveValue('pokemonId')
  await expect.poll(() => hash(page)).toBe('#/player/4')
})

test('a link to a filtered-out player opens the first match', async ({ page }) => {
  await open(page, '/#/player/1?q=lakers')
  await expect(playerName(page)).toHaveText('Another Laker')
  await expect(position(page)).toHaveText(at(1, 2))
})

test('editing the hash in the same tab updates the view', async ({ page }) => {
  await open(page)
  await page.evaluate(() => (window.location.hash = '#/player/3?q=guy'))
  await expect(playerName(page)).toHaveText('Traded Guy')
  await expect(page.getByRole('searchbox')).toHaveValue('guy')
})

test('navigating does not pile up browser history', async ({ page }) => {
  await open(page)
  const before = await page.evaluate(() => window.history.length)
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight')
  await expect.poll(() => hash(page)).toBe('#/player/3')
  expect(await page.evaluate(() => window.history.length)).toBe(before)
})
