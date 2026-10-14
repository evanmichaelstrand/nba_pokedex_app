import { expect, test } from '@playwright/test'

const CSV = '**/data/*.csv'

test('app loads entries', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'NBA Pokédex' })).toBeVisible()
  await expect(page.getByText(/\d+ entries loaded/)).toBeVisible()
})

test('shows a loading state while the data downloads', async ({ page }) => {
  let release!: () => void
  const gate = new Promise<void>((resolve) => (release = resolve))
  await page.route(CSV, async (route) => {
    await gate
    await route.continue()
  })
  await page.goto('/')
  await expect(page.getByRole('status')).toHaveText(/Loading/)
  release()
  await expect(page.getByText(/\d+ entries loaded/)).toBeVisible()
})

test('shows a friendly error and recovers on retry', async ({ page }) => {
  let fail = true
  await page.route(CSV, (route) => (fail ? route.fulfill({ status: 500, body: 'boom' }) : route.continue()))
  await page.goto('/')
  await expect(page.getByRole('alert')).toContainText('Couldn’t load the Pokédex')

  fail = false
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(page.getByText(/\d+ entries loaded/)).toBeVisible()
})

test('shows an error for a malformed file', async ({ page }) => {
  await page.route(CSV, (route) => route.fulfill({ status: 200, body: 'not,a,real\ncsv,file,here' }))
  await page.goto('/')
  await expect(page.getByRole('alert')).toBeVisible()
})
