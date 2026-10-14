import { expect, test, type Page } from '@playwright/test'
import { fileURLToPath } from 'node:url'

// IDs: 1 Nikola Jokić, 2 LeBron James, 3 Traded Guy, 4 Another Laker.
const SEARCH_FIXTURE = fileURLToPath(new URL('./fixtures/search.csv', import.meta.url))

const slot = (page: Page, offset: number) => page.locator(`.deck-slot[data-offset="${offset}"]`)
const playerName = (page: Page) => page.getByRole('article').getByRole('heading').first()
const position = (page: Page) => page.getByRole('navigation').getByText(/\d+ \/ \d+/)
const at = (index: number, total: number) => new RegExp(`(^|\\s)${index} / ${total}$`)

/** Width (px) of the part of an element that is inside the viewport. */
async function visibleWidth(page: Page, offset: number): Promise<number> {
  const box = (await slot(page, offset).boundingBox())!
  const viewport = page.viewportSize()!
  return Math.max(0, Math.min(box.x + box.width, viewport.width) - Math.max(box.x, 0))
}

test('neighbors peek out on both sides of the focused card', async ({ page }) => {
  await page.goto('/')
  await expect(slot(page, 0)).toBeVisible()
  for (const offset of [-1, 1]) {
    await expect(slot(page, offset)).toHaveCount(1)
    expect(await visibleWidth(page, offset), `neighbor ${offset}`).toBeGreaterThan(15)
  }
})

test('neighbors are hidden from screen readers and keyboard focus', async ({ page }) => {
  await page.goto('/')
  await expect(slot(page, 0)).toBeVisible()
  for (const offset of [-2, -1, 1, 2]) {
    await expect(slot(page, offset)).toHaveAttribute('aria-hidden', 'true')
    await expect(slot(page, offset)).toHaveAttribute('inert', '')
  }
  await expect(page.getByRole('article')).toHaveCount(1)
})

test('reduced motion shows a single flat card', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(slot(page, 0)).toBeVisible()
  await expect(page.locator('.deck-slot')).toHaveCount(1)
  expect(await slot(page, 0).getAttribute('style')).toBeNull()
  await page.getByRole('button', { name: 'Next entry' }).click()
  await expect(position(page)).toHaveText(/(^|\s)2 \/ \d+$/)
})

test.describe('tiny filtered decks', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/data/*.csv', (route) => route.fulfill({ path: SEARCH_FIXTURE }))
    await page.goto('/')
    await expect(playerName(page)).toBeVisible()
  })

  test('a single match stays put and renders no neighbors', async ({ page }) => {
    await page.getByRole('searchbox').fill('jokic')
    await expect(page.locator('.deck-slot')).toHaveCount(1)
    await page.getByRole('button', { name: 'Next entry' }).click()
    await page.getByRole('button', { name: 'Previous entry' }).click()
    await expect(playerName(page)).toHaveText('Nikola Jokić')
    await expect(position(page)).toHaveText(at(1, 1))
  })

  test('two matches alternate without repeating a card on screen', async ({ page }) => {
    await page.getByRole('searchbox').fill('lakers')
    await expect(page.locator('.deck-slot')).toHaveCount(2)
    await page.getByRole('button', { name: 'Next entry' }).click()
    await expect(playerName(page)).toHaveText('LeBron James')
    await page.getByRole('button', { name: 'Next entry' }).click()
    await expect(playerName(page)).toHaveText('Another Laker')
  })
})
