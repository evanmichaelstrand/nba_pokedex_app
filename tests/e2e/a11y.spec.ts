import { expect, test } from '@playwright/test'

test('card images have descriptive alt text', async ({ page }) => {
  await page.goto('/')
  const card = page.getByRole('article')
  await expect(card).toBeVisible()
  const player = (await card.getByRole('heading').first().textContent())!
  const pokemon = (await card.getByRole('heading').nth(1).textContent())!
  await expect(card.getByAltText(`${player} headshot`)).toBeVisible()
  await expect(card.getByAltText(`${pokemon} artwork`)).toBeVisible()
})

test('every image has an alt attribute', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('article')).toBeVisible()
  const missing = await page.locator('img:not([alt])').count()
  expect(missing).toBe(0)
})

test('the app is usable with the keyboard alone, with visible focus', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('article')).toBeVisible()
  const next = page.getByRole('button', { name: 'Next entry' })

  // Tab until the Next button has focus (search, sort, chart toggle, stat rows, and Previous come first).
  for (let i = 0; i < 30 && !(await next.evaluate((el) => el === document.activeElement)); i++) {
    await page.keyboard.press('Tab')
  }
  await expect(next).toBeFocused()
  const outline = await next.evaluate((el) => getComputedStyle(el).outlineStyle)
  expect(outline).not.toBe('none')

  await page.keyboard.press('Enter')
  await expect(page.getByRole('navigation').getByText(/\d+ \/ \d+/)).toHaveText(/(^|\s)2 \/ \d+$/)
})

test('navigation controls are real, labelled buttons', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Previous entry' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Next entry' })).toBeVisible()
  await expect(page.getByRole('searchbox', { name: /search/i })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Sort by' })).toBeVisible()
})
