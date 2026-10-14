import { expect, test, type Page } from '@playwright/test'
import { fileURLToPath } from 'node:url'

const ORDER_FIXTURE = fileURLToPath(new URL('./fixtures/order.csv', import.meta.url))

const playerName = (page: Page) => page.getByRole('article').getByRole('heading').first()
const position = (page: Page) => page.getByRole('navigation').getByText(/\d+ \/ \d+/)
/** Matches "3 / 12" exactly (the text also holds a visually hidden "Entry " prefix). */
const at = (index: number, total: number) => new RegExp(`(^|\\s)${index} / ${total}$`)

test.describe('with a small deck', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/data/*.csv', (route) => route.fulfill({ path: ORDER_FIXTURE }))
    await page.goto('/')
    await expect(playerName(page)).toBeVisible()
  })

  test('starts at the lowest Pokémon ID', async ({ page }) => {
    await expect(playerName(page)).toHaveText('First Player')
    await expect(position(page)).toHaveText(at(1, 3))
  })

  test('buttons move through the deck and wrap around', async ({ page }) => {
    const next = page.getByRole('button', { name: 'Next entry' })
    const previous = page.getByRole('button', { name: 'Previous entry' })

    await next.click()
    await expect(playerName(page)).toHaveText('Middle Player')
    await expect(position(page)).toHaveText(at(2, 3))
    await next.click()
    await next.click()
    await expect(playerName(page)).toHaveText('First Player')
    await previous.click()
    await expect(playerName(page)).toHaveText('Last Player')
    await expect(position(page)).toHaveText(at(3, 3))
  })

  test('arrow keys navigate', async ({ page }) => {
    await page.keyboard.press('ArrowRight')
    await expect(playerName(page)).toHaveText('Middle Player')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await expect(playerName(page)).toHaveText('Last Player')
  })

  test('rapid presses do not skip or desync', async ({ page }) => {
    for (let i = 0; i < 7; i++) await page.keyboard.press('ArrowRight')
    // 7 steps in a deck of 3 lands on index 1.
    await expect(playerName(page)).toHaveText('Middle Player')
    await expect(position(page)).toHaveText(at(2, 3))
  })

  test('mouse drag left goes next, right goes previous', async ({ page }) => {
    await mouseDrag(page, -150)
    await expect(playerName(page)).toHaveText('Middle Player')
    await mouseDrag(page, 150)
    await mouseDrag(page, 150)
    await expect(playerName(page)).toHaveText('Last Player')
  })

  test('a short drag snaps back without navigating', async ({ page }) => {
    await mouseDrag(page, -40, 600)
    await expect(playerName(page)).toHaveText('First Player')
    await expect(page.locator('.deck-slot[data-offset="0"]')).toHaveAttribute('style', /translateX\(0%\)/)
  })

  test('rapid swipes do not skip or desync', async ({ page }) => {
    for (let i = 0; i < 5; i++) await mouseDrag(page, -150)
    // 5 steps in a deck of 3 lands on index 2.
    await expect(playerName(page)).toHaveText('Last Player')
    await expect(position(page)).toHaveText(at(3, 3))
  })

  test('touch swipes navigate', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'touch only')
    await touchSwipe(page, -150)
    await expect(playerName(page)).toHaveText('Middle Player')
    await touchSwipe(page, 150)
    await expect(playerName(page)).toHaveText('First Player')
    await touchSwipe(page, -30, 600)
    await expect(playerName(page)).toHaveText('First Player')
  })
})

async function swipeStart(page: Page) {
  const box = (await page.locator('.deck').boundingBox())!
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
}

/** Drags across the card with the mouse; holdMs pauses before releasing to make the gesture slow. */
async function mouseDrag(page: Page, dx: number, holdMs = 0) {
  const { x, y } = await swipeStart(page)
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + dx, y, { steps: 8 })
  if (holdMs) await page.waitForTimeout(holdMs)
  await page.mouse.up()
}

/** Real touch events via the Chrome DevTools Protocol (Playwright has no touch-drag API). */
async function touchSwipe(page: Page, dx: number, holdMs = 0) {
  const { x, y } = await swipeStart(page)
  const cdp = await page.context().newCDPSession(page)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] })
  for (let i = 1; i <= 8; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + (dx * i) / 8, y }] })
  }
  if (holdMs) await page.waitForTimeout(holdMs)
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await cdp.detach()
}

test('every entry renders fully and fits the viewport', async ({ page }) => {
  test.setTimeout(120_000)
  // Images are irrelevant here and the NBA CDN rejects headless browsers.
  await page.route(/cdn\.nba\.com|githubusercontent\.com/, (route) => route.abort())
  await page.goto('/')
  await expect(position(page)).toBeVisible()
  const total = Number((await position(page).textContent())!.split('/')[1].trim())

  for (let i = 1; i <= total; i++) {
    await expect(position(page)).toHaveText(at(i, total))
    const problem = await page.evaluate(() => {
      const card = document.querySelector('.deck-slot[data-offset="0"] article')
      const headings = [...(card?.querySelectorAll('h2') ?? [])].map((h) => h.textContent?.trim())
      if (headings.length !== 2 || headings.some((h) => !h)) return `missing names: ${JSON.stringify(headings)}`
      if (card?.querySelectorAll('.type-badge').length === 0) return 'no type badge'
      if (card?.querySelectorAll('li').length !== 6) return 'missing stat rows'
      const overflow = document.documentElement.scrollHeight - window.innerHeight
      return overflow > 0 ? `overflows by ${overflow}px` : null
    })
    expect(problem, `entry ${i}: ${await playerName(page).textContent()}`).toBeNull()
    await page.keyboard.press('ArrowRight')
  }
  await expect(position(page)).toHaveText(at(1, total))
})
