import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { Database, type Tx } from '../src/server/db';
import { demoActor, seedDemo } from '../src/server/seed';
import {
  createYard,
  createZone,
  dispatchContainer,
  generateBlock,
  moveContainer,
  registerContainer,
  slotSelect,
  updateSlot,
  updateYard,
  verifyContainer,
} from '../src/server/operations';
import { AppError } from '../src/server/validation';
import { checkDigit, extractCandidates, identityStatus } from '../src/lib/identity';
import type { Actor, Container, Movement, Slot, Yard } from '../src/lib/types';
import { snapshot } from '../src/server/service';
let db: Database, yard: Yard, slots: Slot[];
const viewer: Actor = { id: 'demo-viewer', name: 'Rohan Mehta', role: 'viewer' };
const operator: Actor = { id: 'demo-operator', name: 'Priya Patel', role: 'operator' };
beforeEach(async () => {
  db = new Database(':memory:');
  await db.setup();
  await db.transaction(seedDemo);
  await db.transaction(async (tx) => {
    yard = (await tx.one<Yard>('SELECT * FROM yards'))!;
    slots = await tx.all<Slot>(slotSelect);
  });
});
afterEach(async () => {
  await db.close();
});
const number = (serial: number) => {
  const firstTen = 'TEST'.replace('TEST', 'TSTU') + String(serial).padStart(6, '0');
  return firstTen + checkDigit(firstTen);
};
const getSlot = (suffix: string) => slots.find((s) => s.code === `YD01-${suffix}`)!;
const primary = async (tx: Tx) =>
  (await tx.one<Container>("SELECT * FROM containers WHERE number='MSCU1234566'"))!;
const register = (slot: Slot | null, n = 991001) => ({
  yardId: yard.id,
  number: number(n),
  size: 40,
  type: 'Dry',
  owner: 'Test line',
  slotId: slot?.id ?? null,
  physicalConfirmed: !!slot,
});
const move = (c: Container, s: Slot) => ({
  yardId: yard.id,
  containerId: c.id,
  slotId: s.id,
  expectedSlotId: c.current_slot_id,
  physicalConfirmed: true,
});
const errorCode = (code: string) => (e: unknown) => e instanceof AppError && e.code === code;

test('seed produces relational positions, consistent counts and a known movable container', async () => {
  assert.equal(slots.length, 324);
  assert.equal(new Set(slots.map((s) => s.code)).size, 324);
  assert.equal(new Set(slots.map((s) => s.id)).size, 324);
  await db.transaction(async (tx) => {
    const state = await snapshot(tx, demoActor, yard.id);
    assert.equal(state.blocks.length, 3);
    assert.equal(state.metrics.occupied, 96);
    assert.equal(state.metrics.unassigned, 4);
    assert.equal(state.metrics.available, 201);
    assert.equal(state.metrics.usable, 297);
    assert.equal(state.metrics.utilization, 32);
    assert.equal((await primary(tx)).current_slot_id, getSlot('B01-R01-BY01-T01').id);
  });
});
test('reseeding updates demo identities and movement names without changing yard data or real users', async () => {
  await db.transaction(async (tx) => {
    const before = await snapshot(tx, demoActor, yard.id);
    await tx.run('INSERT INTO user_profiles(id,display_name) VALUES(?,?)', [
      'real-user',
      'Keep Name',
    ]);
    const realMovement = before.movements[0];
    await tx.run('UPDATE container_movements SET user_id=?,actor_name=? WHERE id=?', [
      'real-user',
      'Keep Name',
      realMovement.id,
    ]);
    for (const [index, [role, oldName]] of [
      ['administrator', 'Alex Morgan'],
      ['operator', 'Sam Patel'],
      ['viewer', 'Jordan Lee'],
    ].entries()) {
      await tx.run('UPDATE container_movements SET user_id=?,actor_name=? WHERE id=?', [
        `demo-${role}`,
        oldName,
        before.movements[index + 1].id,
      ]);
      await tx.run('UPDATE user_profiles SET display_name=? WHERE id=?', [oldName, `demo-${role}`]);
      await tx.run('UPDATE container_movements SET actor_name=? WHERE user_id=?', [
        oldName,
        `demo-${role}`,
      ]);
    }
    await seedDemo(tx);
    await seedDemo(tx);
    const profiles = await tx.all<{ id: string; display_name: string }>(
      'SELECT id,display_name FROM user_profiles ORDER BY id',
    );
    assert.deepEqual(
      profiles.map((profile) => ({ ...profile })),
      [
        { id: 'demo-administrator', display_name: 'Aarav Sharma' },
        { id: 'demo-operator', display_name: 'Priya Patel' },
        { id: 'demo-viewer', display_name: 'Rohan Mehta' },
        { id: 'real-user', display_name: 'Keep Name' },
      ],
    );
    const after = await snapshot(tx, demoActor, yard.id);
    assert.deepEqual(after.containers, before.containers);
    assert.deepEqual(after.slots, before.slots);
    assert.equal(after.movements.length, before.movements.length);
    const names: Record<string, string> = {
      'demo-administrator': 'Aarav Sharma',
      'demo-operator': 'Priya Patel',
      'demo-viewer': 'Rohan Mehta',
      'real-user': 'Keep Name',
    };
    for (const movement of after.movements) {
      assert.ok(movement.user_id);
      assert.equal(movement.actor_name, names[movement.user_id]);
    }
  });
});

test('ISO check digit validation and OCR candidates permit human correction', () => {
  assert.equal(checkDigit('MSCU123456'), 6);
  assert.equal(identityStatus('MSCU 123456 6').valid, true);
  assert.equal(identityStatus('MSCU1234567').valid, false);
  assert.deepEqual(extractCandidates('PHOTO: MSCU 123456 7'), ['MSCU1234567']);
  assert.equal(identityStatus(extractCandidates('MSCU1234567')[0].slice(0, -1) + '6').valid, true);
});
test('yard and irregular blocks generate persisted stable hierarchical location IDs', async () => {
  await db.transaction(async (tx) => {
    const id = await createYard(
      tx,
      {
        code: 'YD02',
        name: 'East Yard',
        width: 200,
        height: 120,
        boundary: [
          [0, 0],
          [200, 0],
          [200, 100],
          [100, 120],
          [0, 120],
        ],
      },
      demoActor,
    );
    await generateBlock(
      tx,
      {
        yardId: id,
        code: 'B07',
        name: 'Irregular block',
        rows: 3,
        bays: 6,
        rowBayCounts: [6, 4, 2],
        tiers: 2,
        x: 10,
        y: 10,
        width: 120,
        height: 60,
        maxSize: 40,
      },
      demoActor,
    );
    const generated = await tx.all<Slot>(`${slotSelect} WHERE bl.yard_id=?`, [id]);
    assert.equal(generated.length, 24);
    assert.ok(generated.some((s) => s.code === 'YD02-B07-R03-BY02-T02'));
    assert.ok(!generated.some((s) => s.code.includes('R03-BY03')));
  });
  const before = slots.map((s) => s.code);
  await db.transaction((tx) =>
    updateYard(
      tx,
      {
        yardId: yard.id,
        name: 'Renamed North Yard',
        width: 240,
        height: 180,
        boundary: JSON.parse(yard.boundary),
      },
      demoActor,
    ),
  );
  const after = await db.transaction((tx) =>
    tx.all<Slot>(`${slotSelect} WHERE bl.yard_id=?`, [yard.id]),
  );
  assert.deepEqual(
    after.map((s) => s.code),
    before,
  );
});
test('manual registration creates assignment and arrival plus placement history atomically', async () => {
  const slot = getSlot('B01-R04-BY01-T01');
  const id = await db.transaction((tx) => registerContainer(tx, register(slot), operator));
  await db.transaction(async (tx) => {
    const c = (await tx.one<Container>('SELECT * FROM containers WHERE id=?', [id]))!;
    assert.equal(c.current_slot_id, slot.id);
    assert.equal(c.status, 'stored');
    assert.ok(c.verified_at);
    const moves = await tx.all<Movement>('SELECT * FROM container_movements WHERE container_id=?', [
      id,
    ]);
    assert.deepEqual(moves.map((m) => m.event_type).sort(), ['arrival', 'placement']);
    assert.equal(moves.find((m) => m.event_type === 'placement')!.to_slot_id, slot.id);
  });
});
test('duplicate normalized identity is rejected', async () => {
  await assert.rejects(
    db.transaction((tx) =>
      registerContainer(tx, { ...register(null), number: 'MSCU 123456 6' }, operator),
    ),
    errorCode('DUPLICATE_CONTAINER'),
  );
});
test('occupied destination rejects assignment without creating partial container', async () => {
  await assert.rejects(
    db.transaction((tx) => registerContainer(tx, register(getSlot('B01-R01-BY01-T01')), operator)),
    errorCode('SLOT_OCCUPIED'),
  );
  const c = await db.transaction((tx) =>
    tx.one('SELECT id FROM containers WHERE number=?', [number(991001)]),
  );
  assert.equal(c, undefined);
});
test('upper tiers require every lower position to be occupied', async () => {
  await assert.rejects(
    db.transaction((tx) => registerContainer(tx, register(getSlot('B01-R04-BY01-T02')), operator)),
    errorCode('UNSUPPORTED_TIER'),
  );
});
test('matching lengths stack at specific tiers; different lengths are rejected', async () => {
  const bottom = getSlot('B01-R04-BY01-T01'),
    upper = getSlot('B01-R04-BY01-T02');
  await db.transaction((tx) => registerContainer(tx, register(bottom), operator));
  await assert.rejects(
    db.transaction((tx) =>
      registerContainer(tx, { ...register(upper, 991002), size: 20 }, operator),
    ),
    errorCode('STACK_SIZE_MISMATCH'),
  );
  await db.transaction((tx) => registerContainer(tx, register(upper, 991002), operator));
});
test('move records exact previous and new position and preserves occupancy', async () => {
  const c = await db.transaction(primary),
    destination = getSlot('B02-R04-BY01-T01');
  await db.transaction((tx) =>
    moveContainer(tx, { ...move(c, destination), notes: 'Test relocation' }, operator),
  );
  await db.transaction(async (tx) => {
    const updated = await primary(tx);
    assert.equal(updated.current_slot_id, destination.id);
    assert.equal(updated.status, 'stored');
    const history = (await tx.one<Movement>(
      "SELECT * FROM container_movements WHERE container_id=? AND event_type='relocation'",
      [c.id],
    ))!;
    assert.equal(history.from_slot_id, c.current_slot_id);
    assert.equal(history.to_slot_id, destination.id);
    assert.equal(history.user_id, operator.id);
    assert.equal((await snapshot(tx, demoActor, yard.id)).metrics.occupied, 96);
  });
});
test('failed move rolls back original location and writes no history', async () => {
  const c = await db.transaction(primary);
  const count = await db.transaction((tx) =>
    tx.one<{ n: number }>('SELECT COUNT(*) AS n FROM container_movements'),
  );
  await assert.rejects(
    db.transaction((tx) => moveContainer(tx, move(c, getSlot('B01-R04-BY01-T03')), operator)),
    errorCode('UNSUPPORTED_TIER'),
  );
  await db.transaction(async (tx) => {
    assert.equal((await primary(tx)).current_slot_id, c.current_slot_id);
    assert.equal(
      (await tx.one<{ n: number }>('SELECT COUNT(*) AS n FROM container_movements'))!.n,
      count!.n,
    );
  });
});
test('source stack must be accessible before relocation or dispatch', async () => {
  const c = await db.transaction((tx) =>
    tx.one<Container>('SELECT * FROM containers WHERE current_slot_id=?', [
      getSlot('B01-R01-BY02-T01').id,
    ]),
  );
  await assert.rejects(
    db.transaction((tx) => moveContainer(tx, move(c!, getSlot('B01-R04-BY01-T01')), operator)),
    errorCode('STACK_BLOCKED'),
  );
  await assert.rejects(
    db.transaction((tx) =>
      dispatchContainer(
        tx,
        {
          yardId: yard.id,
          containerId: c!.id,
          expectedSlotId: c!.current_slot_id,
          confirmed: true,
        },
        operator,
      ),
    ),
    errorCode('STACK_BLOCKED'),
  );
});
test('stale location rejects a concurrent operator update', async () => {
  const c = await db.transaction(primary);
  await db.transaction((tx) => moveContainer(tx, move(c, getSlot('B02-R04-BY01-T01')), operator));
  await assert.rejects(
    db.transaction((tx) => moveContainer(tx, move(c, getSlot('B02-R04-BY02-T01')), operator)),
    errorCode('STALE_LOCATION'),
  );
});
test('competing assignments result in exactly one successful occupancy', async () => {
  const s = getSlot('B01-R04-BY01-T01');
  const results = await Promise.allSettled([
    db.transaction((tx) => registerContainer(tx, register(s, 991001), operator)),
    db.transaction((tx) => registerContainer(tx, register(s, 991002), operator)),
  ]);
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  const count = await db.transaction((tx) =>
    tx.one<{ n: number }>('SELECT COUNT(*) AS n FROM containers WHERE current_slot_id=?', [s.id]),
  );
  assert.equal(count!.n, 1);
});
test('dispatch updates availability and preserves all location history', async () => {
  const c = await db.transaction(primary);
  await db.transaction((tx) =>
    dispatchContainer(
      tx,
      {
        yardId: yard.id,
        containerId: c.id,
        expectedSlotId: c.current_slot_id,
        confirmed: true,
        notes: 'Collected',
      },
      operator,
    ),
  );
  await db.transaction(async (tx) => {
    const updated = await primary(tx);
    assert.equal(updated.status, 'dispatched');
    assert.equal(updated.current_slot_id, null);
    const state = await snapshot(tx, demoActor, yard.id);
    assert.equal(state.metrics.occupied, 95);
    assert.equal(state.metrics.available, 202);
    const event = state.movements.find(
      (m) => m.container_id === c.id && m.event_type === 'dispatch',
    )!;
    assert.equal(event.from_slot_id, c.current_slot_id);
    assert.equal(event.to_slot_id, null);
    assert.ok(state.movements.some((m) => m.container_id === c.id && m.event_type === 'placement'));
  });
});
test('unassigned arrivals can be placed without duplicate registration', async () => {
  const c = (await db.transaction((tx) =>
    tx.one<Container>("SELECT * FROM containers WHERE status='unassigned' LIMIT 1"),
  ))!;
  await db.transaction((tx) => moveContainer(tx, move(c, getSlot('B01-R04-BY01-T01')), operator));
  await db.transaction(async (tx) => {
    assert.equal(
      (await tx.one<Container>('SELECT * FROM containers WHERE id=?', [c.id]))!.status,
      'stored',
    );
    assert.equal((await snapshot(tx, demoActor, yard.id)).metrics.unassigned, 3);
  });
});
test('reserved, blocked, restricted positions and nonexistent tiers reject placement', async () => {
  for (const suffix of ['B01-R04-BY07-T01', 'B02-R04-BY07-T01', 'B03-R04-BY07-T01'])
    await assert.rejects(
      db.transaction((tx) => registerContainer(tx, register(getSlot(suffix)), operator)),
      errorCode('SLOT_UNAVAILABLE'),
    );
  await assert.rejects(
    db.transaction((tx) =>
      registerContainer(
        tx,
        { ...register(null), slotId: 'invalid-tier-7', physicalConfirmed: true },
        operator,
      ),
    ),
    errorCode('INVALID_SLOT'),
  );
});
test('occupied slots cannot be blocked and supported stacks cannot lose support', async () => {
  await assert.rejects(
    db.transaction((tx) =>
      updateSlot(
        tx,
        { yardId: yard.id, slotId: getSlot('B01-R01-BY01-T01').id, status: 'blocked' },
        demoActor,
      ),
    ),
    errorCode('SLOT_OCCUPIED'),
  );
});
test('viewer cannot register, move, dispatch, verify or configure; operators cannot configure', async () => {
  const c = await db.transaction(primary);
  for (const work of [
    () => registerContainer(null as unknown as Tx, register(null), viewer),
    () => moveContainer(null as unknown as Tx, move(c, getSlot('B01-R04-BY01-T01')), viewer),
    () => dispatchContainer(null as unknown as Tx, {}, viewer),
    () => verifyContainer(null as unknown as Tx, {}, viewer),
    () => createYard(null as unknown as Tx, {}, viewer),
    () => generateBlock(null as unknown as Tx, {}, operator),
    () => updateSlot(null as unknown as Tx, {}, operator),
  ])
    await assert.rejects(work, errorCode('FORBIDDEN'));
});
test('location verification requires current position and records responsible operator', async () => {
  const c = await db.transaction(primary);
  await db.transaction((tx) =>
    verifyContainer(
      tx,
      {
        yardId: yard.id,
        containerId: c.id,
        expectedSlotId: c.current_slot_id,
        physicalConfirmed: true,
      },
      operator,
    ),
  );
  const events = await db.transaction((tx) =>
    tx.all<Movement>(
      "SELECT * FROM container_movements WHERE container_id=? AND event_type='verification'",
      [c.id],
    ),
  );
  assert.equal(events.length, 1);
  assert.equal(events[0].from_slot_id, events[0].to_slot_id);
  assert.equal(events[0].user_id, operator.id);
});
test('exceptional identity requires administrator permission and remains unverified', async () => {
  const p = { ...register(null), number: 'LOCAL12345', allowException: true };
  await assert.rejects(
    db.transaction((tx) => registerContainer(tx, p, operator)),
    errorCode('IDENTITY_UNVERIFIED'),
  );
  const id = await db.transaction((tx) => registerContainer(tx, p, demoActor));
  const c = await db.transaction((tx) =>
    tx.one<Container>('SELECT * FROM containers WHERE id=?', [id]),
  );
  assert.equal(c!.identity_verified, 0);
});
test('configuration rejects overlaps and shrinking plot across existing areas', async () => {
  await assert.rejects(
    db.transaction((tx) =>
      generateBlock(
        tx,
        {
          yardId: yard.id,
          code: 'B04',
          name: 'Overlap',
          rows: 2,
          bays: 3,
          tiers: 2,
          x: 12,
          y: 12,
          width: 40,
          height: 30,
          maxSize: 40,
        },
        demoActor,
      ),
    ),
    errorCode('AREA_OVERLAP'),
  );
  await assert.rejects(
    db.transaction((tx) =>
      updateYard(
        tx,
        { yardId: yard.id, name: 'Too small', width: 50, height: 50, boundary: [] },
        demoActor,
      ),
    ),
    errorCode('OUTSIDE_YARD'),
  );
  await assert.rejects(
    db.transaction((tx) =>
      createZone(
        tx,
        {
          yardId: yard.id,
          kind: 'road',
          label: 'Overlapping road',
          x: 12,
          y: 12,
          width: 30,
          height: 10,
        },
        demoActor,
      ),
    ),
    errorCode('AREA_OVERLAP'),
  );
});
test('capacity and size rules are enforced by server', async () => {
  await db.transaction((tx) =>
    tx.run('UPDATE storage_blocks SET capacity_limit=32 WHERE code=?', ['B01']),
  );
  await assert.rejects(
    db.transaction((tx) => registerContainer(tx, register(getSlot('B01-R04-BY01-T01')), operator)),
    errorCode('CAPACITY_LIMIT'),
  );
  await assert.rejects(
    db.transaction((tx) =>
      registerContainer(tx, { ...register(getSlot('B02-R04-BY01-T01')), size: 45 }, operator),
    ),
    errorCode('SIZE_LIMIT'),
  );
});
test('database foreign keys and unique assignments reject direct invalid references', async () => {
  await assert.rejects(
    db.transaction((tx) =>
      tx.run('UPDATE containers SET current_slot_id=? WHERE number=?', [
        'nonexistent-slot',
        'MSCU1234566',
      ]),
    ),
  );
  await assert.rejects(
    db.transaction((tx) =>
      tx.run('UPDATE containers SET current_slot_id=? WHERE number<>? AND status=?', [
        getSlot('B01-R01-BY01-T01').id,
        'MSCU1234566',
        'stored',
      ]),
    ),
  );
});
test('input validation rejects missing physical confirmation and malformed values', async () => {
  await assert.rejects(
    db.transaction((tx) =>
      registerContainer(
        tx,
        { ...register(getSlot('B01-R04-BY01-T01')), physicalConfirmed: false },
        operator,
      ),
    ),
    errorCode('CONFIRM_LOCATION'),
  );
  await assert.rejects(
    db.transaction((tx) => registerContainer(tx, { ...register(null), size: 99 }, operator)),
    errorCode('VALIDATION_ERROR'),
  );
});
