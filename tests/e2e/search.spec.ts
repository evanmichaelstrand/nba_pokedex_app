import { expect, test, type Page } from '@playwright/test'
import { fileURLToPath } from 'node:url'

// Deck order (by Pokémon ID): Another Laker (25), Nikola Jokić (143), LeBron James (614), Traded Guy (10049).
const SEARCH_FIXTURE = fileURLToPath(new URL('./fixtures/search.csv', import.meta.url))

const search = (page: Page) => page.getByRole('searchbox', { name: /search/i })
const playerName = (page: Page) => page.getByRole('article').getByRole('heading').first()
const position = (page: Page) => page.getByRole('navigation').getByText(/\d+ \/ \d+/)
const at = (index: number, total: number) => new RegExp(`(^|\\s)${index} / ${total}$`)
const chip = (page: Page) => page.getByText(/^Filtered:/)

test.beforeEach(async ({ page }) => {
  await page.route('**/data/*.csv', (route) => route.fulfill({ path: SEARCH_FIXTURE }))
  await page.goto('/')
  await expect(playerName(page)).toHaveText('Another Laker')
})

test('searches player names, ignoring accents', async ({ page }) => {
  await search(page).fill('jokic')
  await expect(playerName(page)).toHaveText('Nikola Jokić')
  await expect(position(page)).toHaveText(at(1, 1))
  await expect(chip(page)).toContainText('jokic')
})

test('searches Pokémon display names', async ({ page }) => {
  await search(page).fill('mega tyranitar')
  await expect(playerName(page)).toHaveText('Traded Guy')
  await expect(position(page)).toHaveText(at(1, 1))
})

test('searches main teams by name and other teams by abbreviation', async ({ page }) => {
  await search(page).fill('lakers')
  await expect(position(page)).toHaveText(at(1, 2))
  await search(page).fill('cle')
  await expect(playerName(page)).toHaveText('Traded Guy')
})

test('searches Pokémon types, primary or secondary', async ({ page }) => {
  await search(page).fill('dark') // Mega Tyranitar is rock/dark
  await expect(playerName(page)).toHaveText('Traded Guy')
  await expect(position(page)).toHaveText(at(1, 1))
  await search(page).fill('Electric')
  await expect(playerName(page)).toHaveText('Another Laker')
  await expect(position(page)).toHaveText(at(1, 1))
})

test('navigation stays within the filtered deck', async ({ page }) => {
  await search(page).fill('lakers')
  await page.getByRole('button', { name: 'Next entry' }).click()
  await expect(playerName(page)).toHaveText('LeBron James')
  await page.getByRole('button', { name: 'Next entry' }).click()
  await expect(playerName(page)).toHaveText('Another Laker')
})

test('keeps the current entry when it is still in the deck', async ({ page }) => {
  await page.getByRole('button', { name: 'Previous entry' }).click()
  await page.getByRole('button', { name: 'Previous entry' }).click()
  await expect(playerName(page)).toHaveText('LeBron James')
  await search(page).fill('lakers')
  await expect(playerName(page)).toHaveText('LeBron James')
  await expect(position(page)).toHaveText(at(2, 2))
})

test('falls back to the first match, and stays there after clearing', async ({ page }) => {
  await page.getByRole('button', { name: 'Next entry' }).click()
  await expect(playerName(page)).toHaveText('Nikola Jokić')
  await search(page).fill('james')
  await expect(playerName(page)).toHaveText('LeBron James')
  await page.getByRole('navigation').getByRole('button', { name: 'Clear search' }).click()
  await expect(chip(page)).toHaveCount(0)
  await expect(search(page)).toHaveValue('')
  await expect(playerName(page)).toHaveText('LeBron James')
  await expect(position(page)).toHaveText(at(3, 4))
})

test('shows "No matches" with a way out', async ({ page }) => {
  await search(page).fill('zzzz')
  await expect(page.getByText('No matches')).toBeVisible()
  await expect(page.getByRole('article')).toHaveCount(0)
  await page.getByRole('button', { name: 'Clear search' }).last().click()
  await expect(position(page)).toHaveText(at(1, 4))
})

test('Escape clears the search', async ({ page }) => {
  await search(page).fill('lakers')
  await search(page).press('Escape')
  await expect(search(page)).toHaveValue('')
  await expect(position(page)).toHaveText(at(1, 4))
})

test('arrow keys edit the search text instead of navigating while typing', async ({ page }) => {
  await search(page).fill('lak')
  await search(page).press('ArrowLeft')
  await search(page).press('ArrowRight')
  await expect(playerName(page)).toHaveText('Another Laker')
  await expect(position(page)).toHaveText(at(1, 2))
})

test('searching does not rotate the logo', async ({ page }) => {
  await search(page).fill('lakers')
  await search(page).fill('')
  await expect(page.locator('.background-logo-image')).toHaveAttribute('style', /rotate\(0deg\)/)
})
