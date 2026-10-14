import { expect, test, type Page } from '@playwright/test'
import { fileURLToPath } from 'node:url'

// Jokić: SPD +15. LeBron James: HP +20, ATK −5. The other two players have no adjustments.
const FIXTURE = fileURLToPath(new URL('./fixtures/adjustments.csv', import.meta.url))

const card = (page: Page) => page.getByRole('article')
const chip = (page: Page) => card(page).getByRole('button', { name: /^Stats adjusted by hand/ })
const tooltip = (page: Page) => card(page).getByRole('tooltip')

test.beforeEach(async ({ page }) => {
  await page.route('**/data/*.csv', (route) => route.fulfill({ path: FIXTURE }))
})

test('adjusted players show a notice listing each change', async ({ page }) => {
  await page.goto('/#/player/2')
  await expect(card(page)).toHaveAttribute('aria-label', /^LeBron James/)
  await expect(chip(page)).toHaveAccessibleName('Stats adjusted by hand: HP +20, ATK −5')

  await chip(page).click()
  await expect(tooltip(page)).toContainText('Manual adjustments')
  await expect(tooltip(page).locator('li')).toHaveText(['HP+20', 'ATK−5'])
  await expect(tooltip(page)).toContainText('BST +15')

  // Stays on the card.
  const cardBox = (await card(page).boundingBox())!
  const box = (await tooltip(page).boundingBox())!
  expect(box.x).toBeGreaterThanOrEqual(cardBox.x)
  expect(box.x + box.width).toBeLessThanOrEqual(cardBox.x + cardBox.width)

  await chip(page).click()
  await expect(tooltip(page)).toHaveCount(0)
})

test('players without adjustments show no notice', async ({ page }) => {
  await page.goto('/#/player/3')
  await expect(card(page)).toHaveAttribute('aria-label', /^Traded Guy/)
  await expect(chip(page)).toHaveCount(0)
})

test('keyboard: Enter opens, Escape closes', async ({ page }) => {
  await page.goto('/#/player/1')
  await chip(page).focus()
  await page.keyboard.press('Enter')
  await expect(tooltip(page)).toContainText('SPD')
  await expect(tooltip(page)).toContainText('+15')
  await page.keyboard.press('Escape')
  await expect(tooltip(page)).toHaveCount(0)
})

test('mouse hover shows the changes and leaving hides them', async ({ page, isMobile }) => {
  test.skip(isMobile, 'hover is a desktop interaction')
  await page.goto('/#/player/1')
  await chip(page).hover()
  await expect(tooltip(page)).toContainText('Manual adjustments')
  await page.getByRole('banner').hover()
  await expect(tooltip(page)).toHaveCount(0)
})
