import { expect, test, type Page } from '@playwright/test'

const theme = (page: Page) => page.evaluate(() => document.documentElement.dataset.theme)
const toggle = (page: Page) => page.getByRole('button', { name: 'Dark mode' })

test('follows the device setting by default', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')
  await expect(page.getByRole('article')).toBeVisible()
  expect(await theme(page)).toBe('dark')
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true')

  await page.emulateMedia({ colorScheme: 'light' })
  await expect.poll(() => theme(page)).toBe('light')
})

test('the toggle switches themes and the choice survives a reload', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')
  await expect(page.getByRole('article')).toBeVisible()
  expect(await theme(page)).toBe('light')
  const lightBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)

  await toggle(page).click()
  await expect(toggle(page)).toHaveAttribute('aria-pressed', 'true')
  expect(await theme(page)).toBe('dark')
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).not.toBe(lightBg)

  await page.reload()
  await expect(page.getByRole('article')).toBeVisible()
  expect(await theme(page)).toBe('dark')
})
