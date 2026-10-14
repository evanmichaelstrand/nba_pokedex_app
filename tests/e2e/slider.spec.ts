import { expect, test, type Page } from '@playwright/test'
import { fileURLToPath } from 'node:url'

// Default order: Another Laker, Nikola Jokić, LeBron James, Traded Guy.
const SEARCH_FIXTURE = fileURLToPath(new URL('./fixtures/search.csv', import.meta.url))

const slider = (page: Page) => page.getByRole('slider', { name: 'Flip through the Pokédex' })
const playerName = (page: Page) => page.getByRole('article').getByRole('heading').first()
const position = (page: Page) => page.getByRole('navigation').getByText(/\d+ \/ \d+/)
const at = (index: number, total: number) => new RegExp(`(^|\\s)${index} / ${total}$`)
const logo = (page: Page) => page.locator('.background-logo-image')

test.beforeEach(async ({ page }) => {
  await page.route('**/data/*.csv', (route) => route.fulfill({ path: SEARCH_FIXTURE }))
  await page.goto('/')
  await expect(playerName(page)).toBeVisible()
})

test('spans the deck and tracks the current entry', async ({ page }) => {
  await expect(slider(page)).toHaveAttribute('max', '3')
  await expect(slider(page)).toHaveValue('0')
  await page.getByRole('button', { name: 'Next entry' }).click()
  await expect(slider(page)).toHaveValue('1')
  await expect(slider(page)).toHaveAttribute('aria-valuetext', '2 of 4: Nikola Jokić')
})

test('jumps to the chosen entry and spins the logo 20° per entry passed', async ({ page }) => {
  await slider(page).fill('3')
  await expect(playerName(page)).toHaveText('Traded Guy')
  await expect(position(page)).toHaveText(at(4, 4))
  await expect(logo(page)).toHaveAttribute('style', /rotate\(60deg\)/)
  await slider(page).fill('1')
  await expect(playerName(page)).toHaveText('Nikola Jokić')
  await expect(logo(page)).toHaveAttribute('style', /rotate\(20deg\)/)
})

test('arrow keys on the focused slider move exactly one entry', async ({ page }) => {
  await slider(page).focus()
  await page.keyboard.press('ArrowRight')
  await expect(playerName(page)).toHaveText('Nikola Jokić')
  await expect(position(page)).toHaveText(at(2, 4))
})

test('follows the filtered deck and hides when there is nothing to flip', async ({ page }) => {
  await page.getByRole('searchbox').fill('lakers')
  await expect(slider(page)).toHaveAttribute('max', '1')
  await page.getByRole('searchbox').fill('jokic')
  await expect(slider(page)).toHaveCount(0)
})

test('images wait while dragging and load on release', async ({ page }) => {
  const box = (await slider(page).boundingBox())!
  const y = box.y + box.height / 2
  await page.mouse.move(box.x + 4, y)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width * 0.7, y, { steps: 5 })
  await expect(page.locator('article img[data-deferred]')).not.toHaveCount(0)
  await page.mouse.up()
  await expect(page.locator('article img[data-deferred]')).toHaveCount(0)
})
