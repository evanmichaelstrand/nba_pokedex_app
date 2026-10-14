import { expect, test, type Page } from '@playwright/test'

const logo = (page: Page) => page.locator('.background-logo-image')

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('article')).toBeVisible()
})

test('logo rotates 20° per step cumulatively', async ({ page }) => {
  await expect(logo(page)).toHaveAttribute('style', /rotate\(0deg\)/)
  for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowRight')
  await expect(logo(page)).toHaveAttribute('style', /rotate\(200deg\)/)
  await page.getByRole('button', { name: 'Previous entry' }).click()
  await expect(logo(page)).toHaveAttribute('style', /rotate\(180deg\)/)
})

test('logo never snaps back after a full turn', async ({ page }) => {
  for (let i = 0; i < 19; i++) await page.keyboard.press('ArrowRight')
  await expect(logo(page)).toHaveAttribute('style', /rotate\(380deg\)/)
})

test('rotation animates, and is instant under reduced motion', async ({ page }) => {
  const duration = () => logo(page).evaluate((el) => getComputedStyle(el).transitionDuration)
  expect(await duration()).toBe('0.35s')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  expect(await duration()).toBe('0s')
})

test('logo stays behind the card', async ({ page }) => {
  const card = (await page.getByRole('article').boundingBox())!
  const topElement = await page.evaluate(
    ({ x, y }) => document.elementFromPoint(x, y)?.closest('.background-logo') !== null,
    { x: card.x + card.width / 2, y: card.y + card.height / 2 },
  )
  expect(topElement).toBe(false)
})
