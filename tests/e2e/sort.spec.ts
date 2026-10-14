import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// Players: Nikola Jokić (DEN, Snorlax #143, normal), LeBron James (LAL, Beartic #614, ice),
// Traded Guy (BOS/CLE, Mega Tyranitar 10049, rock/dark), Another Laker (LAL, Pikachu #25, electric).
const SEARCH_FIXTURE = fileURLToPath(new URL('./fixtures/search.csv', import.meta.url))

const sortSelect = (page: Page) => page.getByRole('combobox', { name: 'Sort by' })
const playerName = (page: Page) => page.getByRole('article').getByRole('heading').first()
const position = (page: Page) => page.getByRole('navigation').getByText(/\d+ \/ \d+/)
const at = (index: number, total: number) => new RegExp(`(^|\\s)${index} / ${total}$`)

async function deckOrder(page: Page): Promise<string[]> {
  const total = Number((await position(page).textContent())!.split('/')[1].trim())
  const names: string[] = []
  for (let i = 1; i <= total; i++) {
    await expect(position(page)).toHaveText(at(i, total))
    names.push((await playerName(page).textContent())!)
    await page.getByRole('button', { name: 'Next entry' }).click()
  }
  return names
}

async function load(page: Page, csv: string) {
  await page.route('**/data/*.csv', (route) => route.fulfill({ body: csv, contentType: 'text/csv' }))
  await page.goto('/')
  await expect(playerName(page)).toBeVisible()
}

const fixture = readFileSync(SEARCH_FIXTURE, 'utf8')

test('defaults to Pokémon ID order', async ({ page }) => {
  await load(page, fixture)
  await expect(sortSelect(page)).toHaveValue('pokemonId')
  expect(await deckOrder(page)).toEqual(['Another Laker', 'Nikola Jokić', 'LeBron James', 'Traded Guy'])
})

test('sorts by team name', async ({ page }) => {
  await load(page, fixture)
  await sortSelect(page).selectOption('team')
  // Boston Celtics, Denver Nuggets, Los Angeles Lakers (×2 by Pokémon ID).
  expect(await deckOrder(page)).toEqual(['Traded Guy', 'Nikola Jokić', 'Another Laker', 'LeBron James'])
})

/** The fixture with each row given its own player and Pokémon base stat totals. */
function withTotals(totals: Array<[number, number]>): string {
  const [header, ...rows] = fixture.trim().split('\n')
  const cols = header.split(',')
  const player = cols.indexOf('base_stat_total')
  const pokemon = cols.indexOf('pokemon_base_stat_total')
  return [
    header,
    ...rows.map((row, i) => {
      const cells = row.split(',')
      ;[cells[player], cells[pokemon]] = totals[i].map(String)
      return cells.join(',')
    }),
  ].join('\n')
}

// Rows: Jokić, LeBron, Traded Guy, Another Laker.
const TOTALS: Array<[number, number]> = [[500, 450], [600, 300], [400, 700], [550, 600]]

test('sorts by player BST, highest first', async ({ page }) => {
  await load(page, withTotals(TOTALS))
  await sortSelect(page).selectOption('playerBst')
  expect(await deckOrder(page)).toEqual(['LeBron James', 'Another Laker', 'Nikola Jokić', 'Traded Guy'])
})

test('sorts by Pokémon BST, highest first', async ({ page }) => {
  await load(page, withTotals(TOTALS))
  await sortSelect(page).selectOption('pokemonBst')
  expect(await deckOrder(page)).toEqual(['Traded Guy', 'Another Laker', 'Nikola Jokić', 'LeBron James'])
})

test('hides Position until the data has positions', async ({ page }) => {
  await load(page, fixture)
  await expect(sortSelect(page).locator('option')).toHaveText(['Pokémon ID', 'NBA team', 'Player BST', 'Pokémon BST'])
})

test('sorts by position once the column exists', async ({ page }) => {
  const positions = ['C', 'F', 'G', 'G-F']
  const [header, ...rows] = fixture.trim().split('\n')
  await load(page, [`${header},position`, ...rows.map((r, i) => `${r},${positions[i]}`)].join('\n'))
  await sortSelect(page).selectOption('position')
  expect(await deckOrder(page)).toEqual(['Nikola Jokić', 'LeBron James', 'Traded Guy', 'Another Laker'])
})

test('keeps the current entry and does not rotate the logo', async ({ page }) => {
  await load(page, fixture)
  await page.getByRole('button', { name: 'Previous entry' }).click()
  await expect(playerName(page)).toHaveText('Traded Guy')
  await sortSelect(page).selectOption('team')
  await expect(playerName(page)).toHaveText('Traded Guy')
  await expect(position(page)).toHaveText(at(1, 4))
  await expect(page.locator('.background-logo-image')).toHaveAttribute('style', /rotate\(-20deg\)/)
})

test('combines with search', async ({ page }) => {
  await load(page, fixture)
  await sortSelect(page).selectOption('team')
  await page.getByRole('searchbox').fill('lakers')
  expect(await deckOrder(page)).toEqual(['Another Laker', 'LeBron James'])
})
