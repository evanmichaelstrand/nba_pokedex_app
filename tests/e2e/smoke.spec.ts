import { expect, test, type Page } from '@playwright/test'
import { fileURLToPath } from 'node:url'

const CSV = '**/data/*.csv'
const EDGE_FIXTURE = fileURLToPath(new URL('./fixtures/edge.csv', import.meta.url))

const card = (page: Page) => page.getByRole('article')

test('app loads and shows an entry', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'NBA Pokédex' })).toBeVisible()
  await expect(card(page)).toBeVisible()
  await expect(card(page).getByText(/^\d+%$/)).toBeVisible()
  await expect(card(page).getByRole('listitem')).toHaveCount(6)
})

test('a full session runs without JavaScript errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    // Image hosts can refuse headless browsers; the placeholder covers that, so it's not an app error.
    if (message.type() === 'error' && !message.text().startsWith('Failed to load resource')) {
      errors.push(message.text())
    }
  })

  await page.goto('/')
  await expect(card(page)).toBeVisible()
  for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowRight')
  await page.getByRole('button', { name: 'Previous entry' }).click()
  await page.getByRole('searchbox').fill('a')
  await page.getByRole('combobox', { name: 'Sort by' }).selectOption('team')
  await page.getByRole('searchbox').fill('zzzz')
  await expect(page.getByText('No matches')).toBeVisible()
  await page.getByRole('button', { name: 'Clear search' }).last().click()
  // Let the throttled URL write catch up before reloading.
  await expect.poll(() => page.evaluate(() => window.location.hash)).not.toContain('q=')
  await page.reload()
  await expect(card(page)).toBeVisible()

  expect(errors).toEqual([])
})

test('entry fits one viewport without vertical scrolling', async ({ page }) => {
  await page.goto('/')
  await expect(card(page)).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
  expect(overflow).toBeLessThanOrEqual(0)
})

test('renders other teams, single types, and form IDs cleanly', async ({ page }) => {
  await page.route(CSV, (route) => route.fulfill({ path: EDGE_FIXTURE }))
  await page.goto('/')
  const entry = card(page)
  await expect(entry.getByRole('heading', { name: 'Edge Case Player' })).toBeVisible()
  await expect(entry.getByText('Denver Nuggets')).toBeVisible()
  await expect(entry.getByText('Also played for: Cleveland Cavaliers, Boston Celtics')).toBeVisible()
  await expect(entry.getByRole('heading', { name: 'Mega Tyranitar' })).toBeVisible()
  await expect(entry.getByText('Rock', { exact: true })).toBeVisible()
  await expect(entry.getByText(/^#\d+$/)).toHaveCount(0)
})

test('header states the season', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('banner').getByText(/^\d{4}–\d{2} Regular Season$/)).toBeVisible()
})

test('headshots prefer the season photo and fall back to the latest one', async ({ page }) => {
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    'base64',
  )
  // Season photos are refused (as NBA.com does for a missing season); the latest photo works.
  await page.route('https://cdn.nba.com/headshots/**', (route) =>
    route.request().url().includes('/latest/')
      ? route.fulfill({ body: png, contentType: 'image/png' })
      : route.fulfill({ status: 403 }),
  )
  await page.goto('/')
  await expect(card(page).getByAltText(/headshot$/)).toHaveAttribute('src', /\/headshots\/nba\/latest\//)
})

test('season headshots are tried first', async ({ page }) => {
  const requested: string[] = []
  await page.route('https://cdn.nba.com/headshots/**', (route) => {
    requested.push(route.request().url())
    return route.fulfill({ status: 403 })
  })
  await page.goto('/')
  await expect(card(page).getByAltText(/headshot$/)).toHaveAttribute('src', /^data:/)
  expect(requested.some((url) => /\/headshots\/nba\/\d+\/\d{4}\/1040x760\//.test(url))).toBe(true)
})

test('team names show team logos, or a color dot if the logo fails', async ({ page }) => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5"/></svg>'
  await page.route('https://cdn.nba.com/logos/**', (route) => route.fulfill({ body: svg, contentType: 'image/svg+xml' }))
  await page.goto('/')
  await expect(card(page).locator('.entry-team .team-label-logo')).toBeVisible()

  await page.unroute('https://cdn.nba.com/logos/**')
  await page.route('https://cdn.nba.com/logos/**', (route) => route.fulfill({ status: 404 }))
  await page.reload()
  await expect(card(page).locator('.entry-team .team-label-dot')).toBeVisible()
  await expect(card(page).locator('.entry-team img')).toHaveCount(0)
})

test('failed images fall back to a placeholder', async ({ page }) => {
  await page.route('https://cdn.nba.com/**', (route) => route.fulfill({ status: 404 }))
  await page.goto('/')
  const headshot = card(page).getByAltText(/headshot$/)
  await expect(headshot).toHaveAttribute('src', /^data:image\/svg\+xml/)
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
  await expect(card(page)).toBeVisible()
})

test('shows a friendly error and recovers on retry', async ({ page }) => {
  let fail = true
  await page.route(CSV, (route) => (fail ? route.fulfill({ status: 500, body: 'boom' }) : route.continue()))
  await page.goto('/')
  await expect(page.getByRole('alert')).toContainText('Couldn’t load the Pokédex')

  fail = false
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(card(page)).toBeVisible()
})

test('shows an error for a malformed file', async ({ page }) => {
  await page.route(CSV, (route) => route.fulfill({ status: 200, body: 'not,a,real\ncsv,file,here' }))
  await page.goto('/')
  await expect(page.getByRole('alert')).toBeVisible()
})
