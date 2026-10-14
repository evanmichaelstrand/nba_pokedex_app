import { expect, test, type Page } from '@playwright/test'

const card = (page: Page) => page.getByRole('article')
const toggle = (page: Page, name: 'Bars' | 'Radar') => card(page).getByRole('button', { name })

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(card(page)).toBeVisible()
})

test('shows the butterfly bars by default', async ({ page }) => {
  await expect(toggle(page, 'Bars')).toHaveAttribute('aria-pressed', 'true')
  await expect(card(page).getByRole('listitem')).toHaveCount(6)
  await expect(card(page).getByRole('img', { name: /^Stat radar/ })).toHaveCount(0)
})

test('switches to the radar and back', async ({ page }) => {
  await toggle(page, 'Radar').click()
  await expect(toggle(page, 'Radar')).toHaveAttribute('aria-pressed', 'true')
  await expect(card(page).getByRole('img', { name: /^Stat radar/ })).toBeVisible()
  await expect(card(page).locator('.radar-shape')).toHaveCount(2)
  await toggle(page, 'Bars').click()
  await expect(card(page).getByRole('listitem')).toHaveCount(6)
})

test('the choice sticks while navigating and after a reload', async ({ page }) => {
  await toggle(page, 'Radar').click()
  await page.keyboard.press('ArrowRight')
  await expect(card(page).getByRole('img', { name: /^Stat radar/ })).toBeVisible()
  await page.reload()
  await expect(card(page).getByRole('img', { name: /^Stat radar/ })).toBeVisible()
})

test('tapping the toggle does not navigate', async ({ page }) => {
  const position = page.getByRole('navigation').getByText(/\d+ \/ \d+/)
  const before = await position.textContent()
  await toggle(page, 'Radar').click()
  await expect(position).toHaveText(before!)
})
