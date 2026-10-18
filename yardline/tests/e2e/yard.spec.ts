import { expect, test, type Page } from '@playwright/test';
import type { Snapshot } from '../../src/lib/types';
import { checkDigit } from '../../src/lib/identity';

const state = async (page: Page, yardId?: string) =>
  (await (
    await page.request.get(`/api/state${yardId ? `?yard=${yardId}` : ''}`)
  ).json()) as Snapshot;
const primaryNumber = 'MSCU1234566';
async function locate(page: Page, number: string) {
  const search = page.getByRole('textbox', { name: 'Search containers globally' });
  await search.fill(number);
  await page.locator('.search-dropdown').getByRole('button').filter({ hasText: number }).click();
  await expect(page.locator('.container-summary h3')).toHaveText(number);
}
async function openNav(page: Page, name: string) {
  if (await page.getByRole('button', { name: 'Open navigation', exact: true }).isVisible())
    await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await page.getByRole('navigation').getByRole('button', { name, exact: true }).click();
}

test('shared workflow: map, relocation, mobile API registration, dashboard synchronization and dispatch', async ({
  page,
  request,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Yard map', exact: true })).toBeVisible();
  const initial = await state(page),
    primary = initial.containers.find((c) => c.number === primaryNumber)!;
  expect(initial.slots).toHaveLength(324);
  await expect(page.locator('[data-slot-id]')).toHaveCount(108);
  await locate(page, primaryNumber);
  const original = initial.slots.find((s) => s.id === primary.current_slot_id)!;
  await expect(page.locator('.location-address strong')).toHaveText(original.code);
  await expect(page.locator(`[data-slot-id="${original.id}"]`)).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Move container', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const destination = initial.slots.find((s) => s.code === 'YD01-B02-R04-BY01-T01')!;
  await dialog.locator(`[data-slot-id="${destination.id}"]`).click();
  await dialog
    .getByRole('textbox', { name: 'Reason / notes (optional)' })
    .fill('Judging demonstration relocation');
  await dialog.getByRole('checkbox').check();
  await dialog.getByRole('button', { name: 'Confirm relocation' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.locator('.location-address strong')).toHaveText(destination.code);
  const moved = await state(page);
  expect(moved.containers.find((c) => c.id === primary.id)!.current_slot_id).toBe(destination.id);
  expect(moved.metrics.occupied).toBe(initial.metrics.occupied);
  await page.getByRole('button', { name: 'Full yard', exact: true }).click();
  await expect(page.locator(`[data-slot-id="${original.id}"]`)).toHaveAttribute(
    'data-status',
    'available',
  );
  await expect(page.locator(`[data-slot-id="${destination.id}"]`)).toHaveAttribute(
    'data-status',
    'occupied',
  );
  await locate(page, primaryNumber);
  await expect(page.locator('.location-address strong')).toHaveText(destination.code);
  await openNav(page, 'Movement History');
  await page.getByRole('textbox', { name: 'Search movement history' }).fill(primaryNumber);
  await expect(page.getByRole('row').filter({ hasText: 'relocation' })).toContainText(
    original.code,
  );
  await expect(page.getByRole('row').filter({ hasText: 'relocation' })).toContainText(
    destination.code,
  );
  await expect(page.getByRole('button', { name: /register/i })).toHaveCount(0);
  const firstTen = 'TSTU' + String(920000 + Math.floor(Math.random() * 70000));
  const newNumber = firstTen + checkDigit(firstTen);
  const newSlot = moved.slots.find((s) => s.code === 'YD01-B03-R04-BY01-T01')!;
  // A separate client uses the same operator session and registration endpoint as Flutter.
  expect((await request.post('/api/session', { data: { role: 'operator' } })).ok()).toBeTruthy();
  const registration = await request.post('/api/actions/register', {
    data: {
      yardId: initial.yard.id,
      number: newNumber,
      size: 40,
      owner: 'Hackathon Shipping',
      slotId: newSlot.id,
      physicalConfirmed: true,
    },
  });
  expect(registration.ok()).toBeTruthy();
  const registered = await state(page);
  expect(registered.metrics.occupied).toBe(initial.metrics.occupied + 1);
  expect(registered.metrics.available).toBe(initial.metrics.available - 1);
  await openNav(page, 'Overview');
  await expect(
    page.locator('.metric').filter({ hasText: 'Containers in yard' }).locator('.metric-value'),
  ).toHaveText(String(initial.metrics.occupied + 1), { timeout: 35000 });
  await locate(page, newNumber);
  await expect(page.locator('.location-address strong')).toHaveText(newSlot.code);
  await page.getByRole('button', { name: 'Dispatch from yard', exact: true }).click();
  await page.getByRole('dialog').getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Confirm dispatch' }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  const dispatched = await state(page);
  expect(dispatched.metrics.occupied).toBe(initial.metrics.occupied);
  expect(dispatched.containers.find((c) => c.number === newNumber)?.status).toBe('dispatched');
  expect(
    dispatched.movements.filter((m) => m.container_number === newNumber).map((m) => m.event_type),
  ).toContain('dispatch');
  // Return the primary container to its presentation starting position.
  const current = dispatched.containers.find((c) => c.id === primary.id)!;
  const restored = await page.request.post('/api/actions/move', {
    data: {
      yardId: initial.yard.id,
      containerId: primary.id,
      slotId: original.id,
      expectedSlotId: current.current_slot_id,
      physicalConfirmed: true,
      notes: 'Restored after automated demonstration',
    },
  });
  expect(restored.ok()).toBeTruthy();
  expect(errors).toEqual([]);
});

test('API rejects duplicate, occupied and unsupported-tier moves without changing the original assignment', async ({
  request,
}) => {
  const initial = (await (await request.get('/api/state')).json()) as Snapshot,
    primary = initial.containers.find((c) => c.number === primaryNumber)!;
  const duplicate = await request.post('/api/actions/register', {
    data: { yardId: initial.yard.id, number: primaryNumber, size: 40 },
  });
  expect(duplicate.status()).toBe(409);
  for (const [code, error] of [
    ['YD01-B01-R01-BY02-T01', 'SLOT_OCCUPIED'],
    ['YD01-B01-R04-BY02-T03', 'UNSUPPORTED_TIER'],
  ]) {
    const dest = initial.slots.find((s) => s.code === code)!;
    const result = await request.post('/api/actions/move', {
      data: {
        yardId: initial.yard.id,
        containerId: primary.id,
        slotId: dest.id,
        expectedSlotId: primary.current_slot_id,
        physicalConfirmed: true,
      },
    });
    expect(result.status()).toBeGreaterThanOrEqual(400);
    expect((await result.json()).error.code).toBe(error);
  }
  const after = (await (await request.get('/api/state')).json()) as Snapshot;
  expect(after.containers.find((c) => c.id === primary.id)?.current_slot_id).toBe(
    primary.current_slot_id,
  );
  expect(after.movements.length).toBe(initial.movements.length);
});

test('viewer permissions apply in the UI and cannot be bypassed through the API', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Yard map', exact: true })).toBeVisible();
  await openNav(page, 'Settings');
  await page.getByLabel('Demo session role').selectOption('viewer');
  await page.getByRole('button', { name: 'Apply demo role' }).click();
  await expect(page.locator('.user-profile small')).toHaveText('viewer');
  await expect(page.getByRole('button', { name: /register/i })).toHaveCount(0);
  await locate(page, primaryNumber);
  await expect(page.getByRole('button', { name: 'Move container', exact: true })).toHaveCount(0);
  const initial = await state(page);
  const result = await page.request.post('/api/actions/register', {
    data: { yardId: initial.yard.id, number: 'TSTU999999' + checkDigit('TSTU999999'), size: 40 },
  });
  expect(result.status()).toBe(403);
  const config = await page.request.post('/api/actions/generate-block', {
    data: { yardId: initial.yard.id },
  });
  expect(config.status()).toBe(403);
});

test('mobile map, tier switching, search, detail panel and navigation fit the viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Yard map', exact: true })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy();
  await page.getByRole('button', { name: 'View tier 2', exact: true }).click();
  await expect(page.getByRole('group', { name: /storage map, tier 2/ })).toBeVisible();
  await locate(page, primaryNumber);
  await expect(page.locator('[data-slot-id][aria-pressed="true"]')).toHaveCount(1);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy();
  await page.screenshot({
    path: 'output/playwright/mobile-container-location.png',
    fullPage: true,
  });
  await openNav(page, 'Containers');
  await expect(page.getByRole('textbox', { name: 'Filter container inventory' })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBeTruthy();
  await openNav(page, 'Yard Map');
  await page.getByRole('button', { name: 'Full yard', exact: true }).click();
  await page.screenshot({ path: 'output/playwright/mobile-yard-map.png', fullPage: true });
});

test('administrator creates a yard, generates an irregular grid, and sees persisted positions on the map', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Yard map', exact: true })).toBeVisible();
  await openNav(page, 'Yard Configuration');
  await page.getByRole('button', { name: 'New yard', exact: true }).click();
  const code = `Y${Date.now().toString(36).slice(-6).toUpperCase()}`;
  await page.getByLabel('Unique yard code').fill(code);
  await page.getByLabel('Yard name', { exact: true }).fill('Test Receiving Yard');
  await page.getByRole('button', { name: 'Create yard', exact: true }).click();
  await expect(page.getByLabel('Select yard')).toHaveValue(/.+/);
  await expect(page.locator('.config-summary strong')).toHaveText('Test Receiving Yard');
  await page.getByRole('button', { name: 'Generate block', exact: true }).click();
  await page.getByLabel('Block code').fill('B01');
  await page.getByLabel('Block name').fill('Mixed rows');
  await page.getByLabel('Rows', { exact: true }).fill('3');
  await page.getByLabel('Different bays per row (optional)').fill('6,4,2');
  await page.getByLabel('Stack tiers').fill('2');
  await page.getByRole('button', { name: 'Generate storage positions' }).click();
  await expect(page.getByRole('status')).toContainText('Block B01 generated');
  await openNav(page, 'Yard Map');
  await expect(page.locator('[data-slot-id]')).toHaveCount(12);
  const current = await state(page, await page.getByLabel('Select yard').inputValue());
  expect(current.slots).toHaveLength(24);
  expect(current.slots.every((s) => s.code.startsWith(code + '-B01'))).toBeTruthy();
  // Restore North Yard as the selected presentation workspace (selection is client-side).
  await page.getByLabel('Select yard').selectOption({ label: 'North Yard' });
  await expect(page.locator('[data-slot-id]')).toHaveCount(108);
});

test('mobile photo registration appears in web inventory and history when the dashboard regains focus', async ({
  page,
  request,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Yard map', exact: true })).toBeVisible();
  const initial = await state(page);
  await openNav(page, 'Containers');
  const firstTen = 'TSTU880001',
    correct = firstTen + checkDigit(firstTen);
  // A synthetic source photo stands in for the image attached by the mobile client.
  // OCR and human confirmation happen in Flutter, not in this web dashboard test.
  const dataUrl = await page.evaluate((text) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 340;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 1600, 340);
    ctx.fillStyle = '#111';
    ctx.font = 'bold 130px Arial';
    ctx.fillText(text, 60, 215);
    return canvas.toDataURL('image/png');
  }, correct);
  expect((await request.post('/api/session', { data: { role: 'operator' } })).ok()).toBeTruthy();
  const registration = await request.post('/api/actions/register', {
    data: { yardId: initial.yard.id, number: correct, size: 40, photo: dataUrl },
  });
  expect(registration.ok()).toBeTruthy();
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await page.getByRole('textbox', { name: 'Filter container inventory' }).fill(correct);
  await expect(page.getByRole('row').filter({ hasText: correct })).toContainText('unassigned');
  await locate(page, correct);
  const stored = await state(page);
  const container = stored.containers.find((c) => c.number === correct)!;
  expect(container.has_photo).toBe(1);
  expect(container.status).toBe('unassigned');
  expect(container.identity_verified).toBe(1);
  await page.getByRole('button', { name: 'View attached photograph' }).click();
  await expect(page.getByAltText('Attached container identification photograph')).toBeVisible();
  await openNav(page, 'Movement History');
  await page.getByRole('textbox', { name: 'Search movement history' }).fill(correct);
  await expect(page.getByRole('row').filter({ hasText: correct })).toContainText('arrival');
  await expect(page.getByRole('button', { name: /register/i })).toHaveCount(0);
});

test('failed server mutation leaves the confirmed location, map and occupancy intact', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Yard map', exact: true })).toBeVisible();
  const initial = await state(page),
    container = initial.containers.find((c) => c.number === primaryNumber)!;
  await locate(page, primaryNumber);
  await page.getByRole('button', { name: 'Move container', exact: true }).click();
  const dialog = page.getByRole('dialog');
  const destination = initial.slots.find((s) => s.code === 'YD01-B02-R04-BY02-T01')!;
  await dialog.locator(`[data-slot-id="${destination.id}"]`).click();
  await dialog.getByRole('checkbox').check();
  await page.route('**/api/actions/move', (route) =>
    route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({
        error: {
          code: 'DATABASE_ERROR',
          message: 'Database unavailable. The original location is preserved.',
        },
      }),
    }),
  );
  await dialog.getByRole('button', { name: 'Confirm relocation' }).click();
  await expect(dialog.getByRole('alert')).toContainText('original location is preserved');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.locator('.location-address strong')).toHaveText(container.location_code!);
  const after = await state(page);
  expect(after.metrics.occupied).toBe(initial.metrics.occupied);
  expect(after.containers.find((c) => c.id === container.id)?.current_slot_id).toBe(
    container.current_slot_id,
  );
  expect(after.movements.length).toBe(initial.movements.length);
});
