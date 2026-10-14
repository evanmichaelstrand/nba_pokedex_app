import { expect, test, type Page } from '@playwright/test'

const dialog = (page: Page) => page.getByRole('dialog', { name: 'About' })
const open = async (page: Page) => {
  await page.goto('/')
  await expect(page.getByRole('article')).toBeVisible()
  await page.getByRole('contentinfo').getByRole('button', { name: 'About' }).click()
  await expect(dialog(page)).toBeVisible()
}

test('About explains each stat, its inputs and weights, and how to get in touch', async ({ page }) => {
  await open(page)
  await expect(dialog(page)).toContainText('assigns Pokémon stats to NBA players')
  for (const name of ['HP', 'Attack', 'Defense', 'Special Attack', 'Special Defense', 'Speed']) {
    await expect(dialog(page).getByRole('heading', { name: new RegExp(`^${name}$`) })).toBeVisible()
  }
  // The same one-line description the card's stat breakdown shows.
  await expect(dialog(page)).toContainText('Rim protection and work on the glass.')
  const defense = dialog(page).getByRole('listitem').filter({ has: page.getByRole('heading', { name: /^Defense$/ }) })
  await expect(defense.locator('dt')).toHaveText(['Interior defensive FG%', 'Rebounds', 'Blocks'])
  await expect(defense.locator('dd')).toHaveText(['50%', '30%', '20%'])
  for (const [name, url] of [
    ['Instagram', 'https://www.instagram.com/nbapokedex/'],
    ['TikTok', 'https://www.tiktok.com/@nbapokedex'],
    ['YouTube', 'https://www.youtube.com/@nbapokedex'],
  ]) {
    await expect(dialog(page).getByRole('link', { name })).toHaveAttribute('href', url)
  }
  await expect(dialog(page).getByRole('heading', { name: 'Adjustments' })).toBeVisible()
  await expect(dialog(page).getByRole('heading', { name: 'Drawbacks' })).toBeVisible()
  await expect(dialog(page).locator('.about-drawbacks li')).toHaveCount(3)
  await expect(dialog(page).getByRole('link', { name: 'nbapokedex@gmail.com' })).toHaveAttribute(
    'href',
    'mailto:nbapokedex@gmail.com',
  )
})

test('closes with the close button, Escape, or a click outside', async ({ page }) => {
  await open(page)
  await dialog(page).getByRole('button', { name: 'Close' }).click()
  await expect(dialog(page)).toBeHidden()

  await page.getByRole('contentinfo').getByRole('button', { name: 'About' }).click()
  await page.keyboard.press('Escape')
  await expect(dialog(page)).toBeHidden()

  await page.getByRole('contentinfo').getByRole('button', { name: 'About' }).click()
  await page.mouse.click(5, 5)
  await expect(dialog(page)).toBeHidden()
})

test('arrow keys inside About do not flip cards behind it', async ({ page }) => {
  await open(page)
  const position = page.getByRole('navigation').getByText(/\d+ \/ \d+/)
  const before = await position.textContent()
  await page.keyboard.press('ArrowRight')
  await expect(position).toHaveText(before!)
})
