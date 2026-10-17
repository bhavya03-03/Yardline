import { randomUUID } from 'node:crypto';
import type { Tx } from './db';
import type { Actor, Block, Container, EventType, Slot, Yard, Zone } from '@/lib/types';
import { identityStatus, normalizeNumber } from '@/lib/identity';
import {
  AppError,
  blockSchema,
  dispatchSchema,
  moveSchema,
  parse,
  registrationSchema,
  slotSchema,
  updateYardSchema,
  verifySchema,
  yardSchema,
  zoneSchema,
} from './validation';

export const slotSelect = `SELECT s.*, b.row_id, r.block_id, bl.yard_id, bl.code AS block_code, r.code AS row_code, b.code AS bay_code, r.ordinal AS row_ordinal, b.ordinal AS bay_ordinal FROM storage_slots s JOIN storage_bays b ON b.id=s.bay_id JOIN storage_rows r ON r.id=b.row_id JOIN storage_blocks bl ON bl.id=r.block_id`;
export const uid = () => randomUUID();
export const now = () => new Date().toISOString();
export function requireRole(actor: Actor, allowed: Actor['role'][]) {
  if (!allowed.includes(actor.role))
    throw new AppError('FORBIDDEN', 'Your role does not permit this operation.', 403);
}
export async function getYard(tx: Tx, yardId: string) {
  const yard = await tx.one<Yard>('SELECT * FROM yards WHERE id=?', [yardId]);
  if (!yard) throw new AppError('NOT_FOUND', 'Yard not found.', 404);
  return yard;
}
function inside(x: number, y: number, points: number[][]) {
  let result = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i],
      [xj, yj] = points[j];
    const cross = (x - xi) * (yj - yi) - (y - yi) * (xj - xi);
    if (
      Math.abs(cross) < 0.00001 &&
      x >= Math.min(xi, xj) &&
      x <= Math.max(xi, xj) &&
      y >= Math.min(yi, yj) &&
      y <= Math.max(yi, yj)
    )
      return true;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) result = !result;
  }
  return result;
}
function within(yard: Yard, box: { x: number; y: number; width: number; height: number }) {
  const points = JSON.parse(yard.boundary) as number[][];
  if (box.x + box.width > yard.width || box.y + box.height > yard.height)
    throw new AppError('OUTSIDE_YARD', 'The area must fit inside the plot dimensions.');
  if (
    points.length &&
    ![
      [box.x, box.y],
      [box.x + box.width, box.y],
      [box.x, box.y + box.height],
      [box.x + box.width, box.y + box.height],
    ].every(([x, y]) => inside(x, y, points))
  )
    throw new AppError(
      'OUTSIDE_BOUNDARY',
      'The area must fit inside the configured plot boundary.',
    );
}
function overlaps(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
export async function createYard(tx: Tx, input: unknown, actor: Actor) {
  requireRole(actor, ['administrator']);
  const p = parse(yardSchema, input);
  if (p.boundary.length && p.boundary.length < 3)
    throw new AppError('INVALID_BOUNDARY', 'A boundary requires at least three points.');
  if (p.boundary.some(([x, y]) => x < 0 || y < 0 || x > p.width || y > p.height))
    throw new AppError('INVALID_BOUNDARY', 'Boundary points must fit inside the plot dimensions.');
  const id = uid();
  await tx.run(
    'INSERT INTO yards(id,code,name,width,height,boundary,is_demo,created_at) VALUES(?,?,?,?,?,?,?,?)',
    [id, p.code, p.name, p.width, p.height, JSON.stringify(p.boundary), 0, now()],
  );
  await tx.run('INSERT INTO yard_memberships(user_id,yard_id,role) VALUES(?,?,?)', [
    actor.id,
    id,
    'administrator',
  ]);
  return id;
}
export async function generateBlock(tx: Tx, input: unknown, actor: Actor) {
  requireRole(actor, ['administrator']);
  const p = parse(blockSchema, input);
  const yard = await getYard(tx, p.yardId);
  within(yard, p);
  const blocks = await tx.all<Block>('SELECT * FROM storage_blocks WHERE yard_id=?', [yard.id]);
  const zones = await tx.all<Zone>('SELECT * FROM yard_zones WHERE yard_id=?', [yard.id]);
  if ([...blocks, ...zones].some((b) => overlaps(p, b)))
    throw new AppError(
      'AREA_OVERLAP',
      'This block overlaps an existing block or non-storage area.',
    );
  if (p.rowBayCounts && p.rowBayCounts.length !== p.rows)
    throw new AppError('INVALID_ROWS', 'Supply one bay count for every row.');
  const counts = p.rowBayCounts ?? Array.from({ length: p.rows }, () => p.bays);
  const maxBays = Math.max(...counts);
  const count = counts.reduce((a, b) => a + b, 0) * p.tiers;
  if (count > 3000)
    throw new AppError('LAYOUT_LIMIT', 'Generate at most 3,000 positions per block.');
  if (p.capacityLimit && p.capacityLimit > count)
    throw new AppError(
      'INVALID_CAPACITY',
      'The capacity limit cannot exceed generated storage positions.',
    );
  const blockId = uid();
  await tx.run(
    'INSERT INTO storage_blocks(id,yard_id,code,name,x,y,width,height,max_tiers,capacity_limit,max_size) VALUES(?,?,?,?,?,?,?,?,?,?,?)',
    [
      blockId,
      yard.id,
      p.code,
      p.name,
      p.x,
      p.y,
      p.width,
      p.height,
      p.tiers,
      p.capacityLimit ?? count,
      p.maxSize,
    ],
  );
  for (let r = 1; r <= p.rows; r++) {
    const rowId = uid(),
      rowCode = `R${String(r).padStart(2, '0')}`;
    await tx.run('INSERT INTO storage_rows(id,block_id,code,ordinal) VALUES(?,?,?,?)', [
      rowId,
      blockId,
      rowCode,
      r,
    ]);
    for (let b = 1; b <= counts[r - 1]; b++) {
      const bayId = uid(),
        bayCode = `BY${String(b).padStart(2, '0')}`;
      await tx.run('INSERT INTO storage_bays(id,row_id,code,ordinal,max_tiers) VALUES(?,?,?,?,?)', [
        bayId,
        rowId,
        bayCode,
        b,
        p.tiers,
      ]);
      for (let t = 1; t <= p.tiers; t++) {
        const location = `${yard.code}-${p.code}-${rowCode}-${bayCode}-T${String(t).padStart(2, '0')}`;
        await tx.run(
          'INSERT INTO storage_slots(id,bay_id,tier,code,x,y,status,max_size,capacity) VALUES(?,?,?,?,?,?,?,?,?)',
          [
            uid(),
            bayId,
            t,
            location,
            p.x + ((b - 1) * p.width) / maxBays,
            p.y + ((r - 1) * p.height) / p.rows,
            'available',
            p.maxSize,
            1,
          ],
        );
      }
    }
  }
  return blockId;
}
export async function validateDestination(tx: Tx, slotId: string, yardId: string, size: number) {
  const slot = await tx.one<Slot>(`${slotSelect} WHERE s.id=?`, [slotId]);
  if (!slot || slot.yard_id !== yardId)
    throw new AppError('INVALID_SLOT', 'Choose a storage position in this yard.');
  if (slot.status !== 'available')
    throw new AppError('SLOT_UNAVAILABLE', `This position is ${slot.status}.`, 409);
  if (await tx.one('SELECT id FROM containers WHERE current_slot_id=?', [slotId]))
    throw new AppError(
      'SLOT_OCCUPIED',
      'This position is already occupied. Choose another position.',
      409,
    );
  if (size > slot.max_size)
    throw new AppError('SIZE_LIMIT', `This position accepts containers up to ${slot.max_size} ft.`);
  const lower = await tx.all<{ tier: number; container_id: string | null; size: number | null }>(
    `SELECT s.tier,c.id AS container_id,c.size FROM storage_slots s LEFT JOIN containers c ON c.current_slot_id=s.id WHERE s.bay_id=? AND s.tier<? ORDER BY s.tier`,
    [slot.bay_id, slot.tier],
  );
  if (lower.length !== slot.tier - 1 || lower.some((l) => !l.container_id))
    throw new AppError('UNSUPPORTED_TIER', 'Fill every lower tier before assigning this position.');
  if (lower.some((l) => l.size !== size))
    throw new AppError('STACK_SIZE_MISMATCH', 'Stack containers of the same length in a bay.');
  const block = await tx.one<Block>('SELECT * FROM storage_blocks WHERE id=?', [slot.block_id]);
  const occupied = await tx.one<{ n: number }>(
    `SELECT COUNT(*) AS n FROM containers c JOIN storage_slots s ON s.id=c.current_slot_id JOIN storage_bays b ON b.id=s.bay_id JOIN storage_rows r ON r.id=b.row_id WHERE r.block_id=?`,
    [slot.block_id],
  );
  if (occupied!.n >= block!.capacity_limit)
    throw new AppError('CAPACITY_LIMIT', 'This block has reached its configured capacity limit.');
  return slot;
}
export async function ensureAccessible(tx: Tx, slotId: string | null) {
  if (!slotId) return;
  const slot = await tx.one<{ bay_id: string; tier: number }>(
    'SELECT bay_id,tier FROM storage_slots WHERE id=?',
    [slotId],
  );
  if (
    await tx.one(
      'SELECT c.id FROM containers c JOIN storage_slots s ON s.id=c.current_slot_id WHERE s.bay_id=? AND s.tier>?',
      [slot!.bay_id, slot!.tier],
    )
  )
    throw new AppError(
      'STACK_BLOCKED',
      'Move the containers above this one before removing it.',
      409,
    );
}
export async function record(
  tx: Tx,
  containerId: string,
  from: string | null,
  to: string | null,
  type: EventType,
  actor: Actor,
  notes = '',
  at = now(),
) {
  await tx.run(
    'INSERT INTO container_movements(id,container_id,from_slot_id,to_slot_id,event_type,occurred_at,user_id,actor_name,notes) VALUES(?,?,?,?,?,?,?,?,?)',
    [uid(), containerId, from, to, type, at, actor.id, actor.name, notes],
  );
}
export async function registerContainer(tx: Tx, input: unknown, actor: Actor) {
  requireRole(actor, ['administrator', 'operator']);
  const p = parse(registrationSchema, input);
  await getYard(tx, p.yardId);
  const number = normalizeNumber(p.number),
    identity = identityStatus(number);
  if (!identity.valid && !(p.allowException && actor.role === 'administrator'))
    throw new AppError('IDENTITY_UNVERIFIED', identity.message, 422);
  if (!/^[A-Z0-9]{5,25}$/.test(number))
    throw new AppError('INVALID_NUMBER', 'Use 5–25 letters and digits for an exceptional record.');
  if (await tx.one('SELECT id FROM containers WHERE number=?', [number]))
    throw new AppError(
      'DUPLICATE_CONTAINER',
      'This container is already registered. Search for its existing record.',
      409,
    );
  if (p.slotId) {
    if (!p.physicalConfirmed)
      throw new AppError('CONFIRM_LOCATION', 'Confirm where the container was physically placed.');
    await validateDestination(tx, p.slotId, p.yardId, p.size);
  }
  const id = uid(),
    timestamp = now();
  await tx.run(
    'INSERT INTO containers(id,number,size,type,owner,status,current_yard_id,current_slot_id,identity_verified,registered_at,verified_at,notes,photo) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)',
    [
      id,
      number,
      p.size,
      p.type,
      p.owner,
      p.slotId ? 'stored' : 'unassigned',
      p.yardId,
      p.slotId,
      identity.valid ? 1 : 0,
      timestamp,
      p.slotId ? timestamp : null,
      p.notes,
      p.photo ?? null,
    ],
  );
  await record(tx, id, null, null, 'arrival', actor, p.notes, timestamp);
  if (p.slotId)
    await record(
      tx,
      id,
      null,
      p.slotId,
      'placement',
      actor,
      'Operator confirmed physical placement.',
      timestamp,
    );
  return id;
}
async function getContainer(tx: Tx, id: string, yardId: string) {
  const c = await tx.one<Container>('SELECT * FROM containers WHERE id=? AND current_yard_id=?', [
    id,
    yardId,
  ]);
  if (!c) throw new AppError('NOT_FOUND', 'Container not found in this yard.', 404);
  return c;
}
function checkExpected(c: Container, expected: string | null) {
  if (c.current_slot_id !== expected)
    throw new AppError(
      'STALE_LOCATION',
      'The recorded position changed. Refresh and review it before trying again.',
      409,
    );
}
export async function moveContainer(tx: Tx, input: unknown, actor: Actor) {
  requireRole(actor, ['administrator', 'operator']);
  const p = parse(moveSchema, input);
  const c = await getContainer(tx, p.containerId, p.yardId);
  checkExpected(c, p.expectedSlotId);
  if (c.status === 'dispatched')
    throw new AppError('ALREADY_DISPATCHED', 'A dispatched container cannot be moved.');
  if (c.current_slot_id === p.slotId)
    throw new AppError('SAME_SLOT', 'Choose a different destination.');
  await ensureAccessible(tx, c.current_slot_id);
  // Moving within a full block does not increase its occupancy.
  const oldSlot = c.current_slot_id;
  await tx.run("UPDATE containers SET current_slot_id=NULL,status='unassigned' WHERE id=?", [c.id]);
  await validateDestination(tx, p.slotId, p.yardId, c.size);
  await tx.run("UPDATE containers SET current_slot_id=?,status='stored',verified_at=? WHERE id=?", [
    p.slotId,
    now(),
    c.id,
  ]);
  await record(tx, c.id, oldSlot, p.slotId, oldSlot ? 'relocation' : 'placement', actor, p.notes);
}
export async function dispatchContainer(tx: Tx, input: unknown, actor: Actor) {
  requireRole(actor, ['administrator', 'operator']);
  const p = parse(dispatchSchema, input),
    c = await getContainer(tx, p.containerId, p.yardId);
  checkExpected(c, p.expectedSlotId);
  if (c.status === 'dispatched')
    throw new AppError('ALREADY_DISPATCHED', 'This container was already dispatched.');
  await ensureAccessible(tx, c.current_slot_id);
  await tx.run(
    "UPDATE containers SET current_slot_id=NULL,status='dispatched',verified_at=NULL WHERE id=?",
    [c.id],
  );
  await record(tx, c.id, c.current_slot_id, null, 'dispatch', actor, p.notes);
}
export async function verifyContainer(tx: Tx, input: unknown, actor: Actor) {
  requireRole(actor, ['administrator', 'operator']);
  const p = parse(verifySchema, input),
    c = await getContainer(tx, p.containerId, p.yardId);
  checkExpected(c, p.expectedSlotId);
  await tx.run('UPDATE containers SET verified_at=? WHERE id=?', [now(), c.id]);
  await record(
    tx,
    c.id,
    c.current_slot_id,
    c.current_slot_id,
    'verification',
    actor,
    'Operator physically confirmed the recorded position.',
  );
}
export async function updateSlot(tx: Tx, input: unknown, actor: Actor) {
  requireRole(actor, ['administrator']);
  const p = parse(slotSchema, input);
  const slot = await tx.one<Slot>(`${slotSelect} WHERE s.id=?`, [p.slotId]);
  if (!slot || slot.yard_id !== p.yardId)
    throw new AppError('NOT_FOUND', 'Position not found.', 404);
  if (await tx.one('SELECT id FROM containers WHERE current_slot_id=?', [p.slotId]))
    throw new AppError(
      'SLOT_OCCUPIED',
      'Move the container before changing this position’s status.',
      409,
    );
  if (p.status !== 'available') await ensureAccessible(tx, p.slotId);
  await tx.run('UPDATE storage_slots SET status=? WHERE id=?', [p.status, p.slotId]);
}
export async function createZone(tx: Tx, input: unknown, actor: Actor) {
  requireRole(actor, ['administrator']);
  const p = parse(zoneSchema, input),
    yard = await getYard(tx, p.yardId);
  within(yard, p);
  const blocks = await tx.all<Block>('SELECT * FROM storage_blocks WHERE yard_id=?', [yard.id]);
  const zones = await tx.all<Zone>('SELECT * FROM yard_zones WHERE yard_id=?', [yard.id]);
  if ([...blocks, ...zones].some((b) => overlaps(p, b)))
    throw new AppError('AREA_OVERLAP', 'This area overlaps an existing block or non-storage area.');
  await tx.run(
    'INSERT INTO yard_zones(id,yard_id,kind,label,x,y,width,height) VALUES(?,?,?,?,?,?,?,?)',
    [uid(), yard.id, p.kind, p.label, p.x, p.y, p.width, p.height],
  );
}
export async function updateYard(tx: Tx, input: unknown, actor: Actor) {
  requireRole(actor, ['administrator']);
  const p = parse(updateYardSchema, input);
  const old = await getYard(tx, p.yardId);
  if (p.boundary.length && p.boundary.length < 3)
    throw new AppError('INVALID_BOUNDARY', 'Use three or more boundary points.');
  if (p.boundary.some(([x, y]) => x < 0 || y < 0 || x > p.width || y > p.height))
    throw new AppError('INVALID_BOUNDARY', 'Boundary points must fit inside the plot.');
  const proposed = { ...old, ...p, boundary: JSON.stringify(p.boundary) };
  const areas = [
    ...(await tx.all<Block>('SELECT * FROM storage_blocks WHERE yard_id=?', [old.id])),
    ...(await tx.all<Zone>('SELECT * FROM yard_zones WHERE yard_id=?', [old.id])),
  ];
  for (const area of areas) within(proposed, area);
  await tx.run('UPDATE yards SET name=?,width=?,height=?,boundary=? WHERE id=?', [
    p.name,
    p.width,
    p.height,
    proposed.boundary,
    old.id,
  ]);
}
