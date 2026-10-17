import type {
  Actor,
  Bay,
  Block,
  Container,
  Movement,
  Slot,
  Snapshot,
  StorageRow,
  Yard,
  Zone,
} from '@/lib/types';
import { database, type Tx } from './db';
import { seedDemo } from './seed';
import { AppError } from './validation';
import { slotSelect } from './operations';

type ReadyGlobal = typeof globalThis & { __yardlineReady?: Promise<void> };
export async function ready() {
  const shared = globalThis as ReadyGlobal;
  shared.__yardlineReady ??= (async () => {
    await database().setup();
    if (process.env.DEMO_SEED !== 'false' && process.env.AUTH_MODE !== 'supabase')
      await database().transaction(seedDemo);
  })().catch((e) => {
    shared.__yardlineReady = undefined;
    throw e;
  });
  return shared.__yardlineReady;
}
export async function snapshot(tx: Tx, actor: Actor, yardId?: string): Promise<Snapshot> {
  const demo = process.env.AUTH_MODE !== 'supabase';
  const yards = demo
    ? await tx.all<Yard>('SELECT * FROM yards ORDER BY created_at,code')
    : await tx.all<Yard>(
        'SELECT y.* FROM yards y JOIN yard_memberships m ON m.yard_id=y.id WHERE m.user_id=? ORDER BY y.created_at,y.code',
        [actor.id],
      );
  const yard = yardId ? yards.find((y) => y.id === yardId) : yards[0];
  if (!yard)
    throw new AppError(
      'NO_YARD',
      yardId
        ? 'You do not have access to this yard.'
        : 'No accessible yard. Run the seed procedure or have an administrator provision your yard.',
      403,
    );
  const blocks = await tx.all<Block>('SELECT * FROM storage_blocks WHERE yard_id=? ORDER BY code', [
    yard.id,
  ]);
  const rows = await tx.all<StorageRow>(
    'SELECT r.* FROM storage_rows r JOIN storage_blocks b ON b.id=r.block_id WHERE b.yard_id=? ORDER BY b.code,r.ordinal',
    [yard.id],
  );
  const bays = await tx.all<Bay>(
    'SELECT b.* FROM storage_bays b JOIN storage_rows r ON r.id=b.row_id JOIN storage_blocks bl ON bl.id=r.block_id WHERE bl.yard_id=? ORDER BY bl.code,r.ordinal,b.ordinal',
    [yard.id],
  );
  const slots = await tx.all<Slot>(
    `${slotSelect} WHERE bl.yard_id=? ORDER BY bl.code,r.ordinal,b.ordinal,s.tier`,
    [yard.id],
  );
  const containers = await tx.all<Container>(
    `SELECT c.id,c.number,c.size,c.type,c.owner,c.status,c.current_yard_id,c.current_slot_id,c.identity_verified,c.registered_at,c.verified_at,c.notes,CASE WHEN c.photo IS NULL THEN 0 ELSE 1 END AS has_photo,s.code AS location_code FROM containers c LEFT JOIN storage_slots s ON s.id=c.current_slot_id WHERE c.current_yard_id=? ORDER BY c.registered_at DESC`,
    [yard.id],
  );
  const movements = await tx.all<Movement>(
    `SELECT m.*,c.number AS container_number,f.code AS from_code,t.code AS to_code FROM container_movements m JOIN containers c ON c.id=m.container_id LEFT JOIN storage_slots f ON f.id=m.from_slot_id LEFT JOIN storage_slots t ON t.id=m.to_slot_id WHERE c.current_yard_id=? ORDER BY m.occurred_at DESC,m.id DESC LIMIT 1000`,
    [yard.id],
  );
  const zones = await tx.all<Zone>('SELECT * FROM yard_zones WHERE yard_id=?', [yard.id]);
  const occupiedIds = new Set(
    containers.filter((c) => c.current_slot_id).map((c) => c.current_slot_id),
  );
  const occupied = occupiedIds.size;
  const capacity = blocks.reduce((n, b) => n + b.capacity_limit, 0);
  const usable = blocks.reduce(
    (n, b) =>
      n +
      Math.min(
        b.capacity_limit,
        slots.filter((s) => s.block_id === b.id && s.status === 'available').length,
      ),
    0,
  );
  const occupiedBays = new Map<string, Set<number>>();
  for (const s of slots)
    if (occupiedIds.has(s.id)) {
      if (!occupiedBays.has(s.bay_id)) occupiedBays.set(s.bay_id, new Set());
      occupiedBays.get(s.bay_id)!.add(s.tier);
    }
  const assignable = slots.filter(
    (s) =>
      s.status === 'available' &&
      !occupiedIds.has(s.id) &&
      Array.from({ length: s.tier - 1 }, (_, i) => i + 1).every((t) =>
        occupiedBays.get(s.bay_id)?.has(t),
      ),
  ).length;
  const today = new Date().toISOString().slice(0, 10),
    cutoff = Date.now() - 24 * 3600000;
  const metrics = {
    capacity,
    occupied,
    usable,
    available: Math.max(0, usable - occupied),
    reserved: slots.filter((s) => s.status === 'reserved').length,
    blocked: slots.filter((s) => s.status === 'blocked').length,
    restricted: slots.filter((s) => s.status === 'restricted').length,
    assignable,
    utilization: usable ? Math.round((occupied / usable) * 100) : 0,
    unassigned: containers.filter((c) => c.status === 'unassigned').length,
    attention: containers.filter(
      (c) =>
        c.status === 'stored' &&
        (!c.verified_at || new Date(c.verified_at).getTime() < cutoff || !c.identity_verified),
    ).length,
    movesToday: movements.filter(
      (m) =>
        m.occurred_at.startsWith(today) &&
        m.event_type !== 'arrival' &&
        m.event_type !== 'verification',
    ).length,
  };
  return {
    yards,
    yard,
    blocks,
    rows,
    bays,
    slots,
    zones,
    containers,
    movements,
    metrics,
    actor,
    persistence: database().mode,
    authMode: demo ? 'demo' : 'supabase',
    generatedAt: new Date().toISOString(),
  };
}
