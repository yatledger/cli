import { test, expect } from '@playwright/test'

const PASSWORD = 'Str0ng!Pass'
const NEW_PASSWORD = 'An0ther!Pass'

async function waitForApp(page, path = '/') {
  await page.goto(path, { waitUntil: 'networkidle' })
  await page.waitForSelector('.q-page-container', { timeout: 15000 })
}

async function getStoredSeed(page) {
  return page.evaluate(
    () =>
      new Promise((resolve) => {
        const req = indexedDB.open('yat')
        req.onsuccess = () => {
          const get = req.result
            .transaction('settings', 'readonly')
            .objectStore('settings')
            .get('seed')
          get.onsuccess = () => resolve(get.result || null)
          get.onerror = () => resolve(null)
        }
        req.onerror = () => resolve(null)
      })
  )
}

async function deleteDatabase(page) {
  await page.evaluate(
    () =>
      new Promise((resolve) => {
        const req = indexedDB.deleteDatabase('yat')
        req.onsuccess = req.onerror = req.onblocked = () => resolve()
      })
  )
}

async function login(page, password) {
  await waitForApp(page, '/login')
  await page.waitForSelector('input[type="password"]', { timeout: 10000 })
  await page.locator('input[type="password"]').first().fill(password)
  await page.getByRole('button', { name: 'Ok' }).click()
  await page.waitForTimeout(1500)
}

test.describe('wallet onboarding and session', () => {
  test('full lifecycle: signup, login, restore, clear', async ({ page, context }) => {
    await waitForApp(page)
    expect(await page.title()).toContain('yat')
    expect(await context.cookies()).toHaveLength(0)

    // Signup generates a 24-word mnemonic
    await waitForApp(page, '/sign')
    await page.waitForSelector('.text-h4', { timeout: 15000 })
    const mnemonic = (await page.locator('.text-h4').first().innerText()).trim()
    expect(mnemonic.split(/\s+/)).toHaveLength(24)

    await page.locator('input[type="password"]').first().fill(PASSWORD)
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Mnemonic must not be persisted in a cookie
    expect((await context.cookies()).some((c) => c.name === 'mn')).toBeFalsy()

    // Seed is stored encrypted (versioned) without plaintext
    const seed = await getStoredSeed(page)
    expect(seed).toMatchObject({ v: 1 })
    expect(seed.salt).toBeTruthy()
    expect(seed.nonce).toBeTruthy()
    expect(seed.ciphertext).toBeTruthy()
    expect(JSON.stringify(seed)).not.toContain(mnemonic.split(' ')[0])
    expect(JSON.stringify(seed)).not.toContain(PASSWORD)

    // Keys only live in memory after signup -> login is required
    expect(await page.locator('.q-footer').count()).toBe(0)

    // Wrong password must be rejected without unlocking
    await login(page, 'WrongPass123')
    expect(await page.locator('.q-footer').count()).toBe(0)
    expect(await page.locator('.q-notification.bg-negative').count()).toBeGreaterThan(0)

    // Correct password unlocks the wallet
    await login(page, PASSWORD)
    expect(await page.locator('.q-footer').count()).toBeGreaterThan(0)

    // Seed survives a reload and remains encrypted
    await page.reload({ waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)
    expect(await getStoredSeed(page)).not.toBeNull()

    // Restore from the captured mnemonic with a new password
    await deleteDatabase(page)
    await waitForApp(page, '/restore')
    await page.waitForSelector('input[type="password"]', { timeout: 10000 })
    await page.locator('textarea').first().fill(mnemonic)
    await page.locator('input[type="password"]').first().fill(NEW_PASSWORD)
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    expect(await getStoredSeed(page)).not.toBeNull()

    await login(page, NEW_PASSWORD)
    expect(await page.locator('.q-footer').count()).toBeGreaterThan(0)

    // Invalid mnemonic is rejected
    await deleteDatabase(page)
    await waitForApp(page, '/restore')
    await page.waitForSelector('input[type="password"]', { timeout: 10000 })
    await page.locator('textarea').first().fill('not a valid mnemonic phrase at all')
    await page.locator('input[type="password"]').first().fill('Whatever!123')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.waitForTimeout(1500)
    expect(await getStoredSeed(page)).toBeNull()
    expect(await page.locator('.q-notification.bg-negative').count()).toBeGreaterThan(0)

    // Clear removes the stored seed
    await waitForApp(page, '/sign')
    await page.waitForSelector('.text-h4', { timeout: 15000 })
    await page.locator('input[type="password"]').first().fill(PASSWORD)
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    await login(page, PASSWORD)
    await page.locator('.q-item:has-text("Clear")').first().click()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    expect(await getStoredSeed(page)).toBeNull()
  })
})
