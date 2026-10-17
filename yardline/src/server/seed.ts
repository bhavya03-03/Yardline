import type { Tx } from './db';
import type { Actor, Slot } from '@/lib/types';
import { checkDigit } from '@/lib/identity';
import { generateBlock, now, record, slotSelect, uid } from './operations';
import { demoNames } from './demo-profiles';

export const demoActor: Actor = {
  id: 'demo-administrator',
  name: demoNames.administrator,
  role: 'administrator',
};
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();
export async function seedDemo(tx: Tx) {
  // Keep existing demo identities and historical actor labels in sync without resetting yard data.
  for (const [role, name] of Object.entries(demoNames)) {
    const id = `demo-${role}`;
    await tx.run(
      'INSERT INTO user_profiles(id,display_name) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET display_name=excluded.display_name',
      [id, name],
    );
    await tx.run('UPDATE container_movements SET actor_name=? WHERE user_id=? AND actor_name<>?', [
      name,
      id,
      name,
    ]);
  }
  const existing = await tx.one<{ n: number }>('SELECT COUNT(*) AS n FROM yards');
  if (existing!.n) return;
  const yardId = uid();
  await tx.run(
    'INSERT INTO yards(id,code,name,width,height,boundary,is_demo,created_at) VALUES(?,?,?,?,?,?,?,?)',
    [
      yardId,
      'YD01',
      'North Yard',
      240,
      180,
      '[[0,0],[240,0],[240,155],[220,180],[0,180]]',
      1,
      hoursAgo(720),
    ],
  );
  for (const role of ['administrator', 'operator', 'viewer'])
    await tx.run('INSERT INTO yard_memberships(user_id,yard_id,role) VALUES(?,?,?)', [
      `demo-${role}`,
      yardId,
      role,
    ]);
  const blocks = [];
  for (let i = 0; i < 3; i++)
    blocks.push(
      await generateBlock(
        tx,
        {
          yardId,
          code: `B0${i + 1}`,
          name: ['Import storage', 'Export storage', 'Empty containers'][i],
          rows: 4,
          bays: 9,
          tiers: 3,
          x: 12,
          y: 12 + i * 51,
          width: 204,
          height: 37,
          maxSize: 40,
        },
        demoActor,
      ),
    );
  await tx.run(
    'INSERT INTO yard_zones(id,yard_id,kind,label,x,y,width,height) VALUES(?,?,?,?,?,?,?,?)',
    [uid(), yardId, 'road', 'MAIN ACCESS ROAD', 12, 51, 204, 10],
  );
  await tx.run(
    'INSERT INTO yard_zones(id,yard_id,kind,label,x,y,width,height) VALUES(?,?,?,?,?,?,?,?)',
    [uid(), yardId, 'road', 'SERVICE ROAD', 12, 102, 204, 10],
  );
  await tx.run(
    'INSERT INTO yard_zones(id,yard_id,kind,label,x,y,width,height) VALUES(?,?,?,?,?,?,?,?)',
    [uid(), yardId, 'loading', 'GATE & LOADING AREA', 12, 157, 184, 15],
  );
  await tx.run(
    'INSERT INTO yard_zones(id,yard_id,kind,label,x,y,width,height) VALUES(?,?,?,?,?,?,?,?)',
    [uid(), yardId, 'restricted', 'NO STORAGE', 220, 12, 14, 130],
  );
  const owners = ['MSC', 'Maersk', 'CMA CGM', 'Hapag-Lloyd', 'COSCO', 'ONE'];
  const prefixes = ['MSCU', 'MAEU', 'CMAU', 'HLCU', 'CSNU', 'ONEU'];
  let index = 0;
  for (let bi = 0; bi < blocks.length; bi++) {
    const slots = await tx.all<Slot>(
      `${slotSelect} WHERE r.block_id=? ORDER BY s.tier,r.ordinal,b.ordinal`,
      [blocks[bi]],
    );
    // 24 ground positions + six second-tier positions + two third tiers per block.
    const chosen = slots.filter(
      (s) =>
        (s.tier === 1 && (s.row_ordinal - 1) * 9 + s.bay_ordinal <= 24) ||
        (s.tier === 2 && s.row_ordinal === 1 && s.bay_ordinal >= 2 && s.bay_ordinal <= 7) ||
        (s.tier === 3 && s.row_ordinal === 1 && s.bay_ordinal >= 2 && s.bay_ordinal <= 3),
    );
    for (const slot of chosen) {
      const ownerIndex = index % 6,
        serial = index === 0 ? '123456' : String(240001 + index).padStart(6, '0');
      const firstTen = prefixes[ownerIndex] + serial,
        number = firstTen + checkDigit(firstTen),
        id = uid();
      const size = slot.bay_ordinal % 3 === 0 ? 20 : 40;
      const at = hoursAgo(48 + index * 1.7),
        verified = index % 9 === 0 ? null : hoursAgo(index % 32);
      await tx.run(
        'INSERT INTO containers(id,number,size,type,owner,status,current_yard_id,current_slot_id,identity_verified,registered_at,verified_at,notes) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
        [
          id,
          number,
          size,
          bi === 2 ? 'Empty' : index % 7 === 0 ? 'High cube' : 'Dry',
          owners[ownerIndex],
          'stored',
          yardId,
          slot.id,
          1,
          at,
          verified,
          index === 0
            ? 'Primary demonstration container. Operator-confirmed location.'
            : index % 9 === 0
              ? 'Location needs a physical verification.'
              : '',
        ],
      );
      await record(tx, id, null, null, 'arrival', demoActor, 'Demonstration arrival record.', at);
      // Several arrivals were first placed in another empty ground position, then relocated.
      if (slot.tier === 1 && slot.row_ordinal === 2 && slot.bay_ordinal <= 3) {
        const previous = slots.find(
          (s) => s.tier === 1 && s.row_ordinal === 4 && s.bay_ordinal === slot.bay_ordinal,
        )!;
        await record(
          tx,
          id,
          null,
          previous.id,
          'placement',
          demoActor,
          'Initial receiving position.',
          at,
        );
        await record(
          tx,
          id,
          previous.id,
          slot.id,
          'relocation',
          demoActor,
          'Consolidated after receiving inspection.',
          hoursAgo((index % 8) + 0.25),
        );
      } else
        await record(
          tx,
          id,
          null,
          slot.id,
          'placement',
          demoActor,
          'Operator confirmed physical placement.',
          at,
        );
      index++;
    }
    const unavailable = slots.filter((s) => s.row_ordinal === 4 && s.bay_ordinal >= 7);
    for (const s of unavailable)
      await tx.run('UPDATE storage_slots SET status=? WHERE id=?', [
        bi === 2 ? 'restricted' : bi === 1 ? 'reserved' : 'blocked',
        s.id,
      ]);
  }
  for (let i = 0; i < 4; i++) {
    const serial = String(850001 + i),
      firstTen = prefixes[i] + serial,
      id = uid(),
      at = hoursAgo(2 + i);
    await tx.run(
      'INSERT INTO containers(id,number,size,type,owner,status,current_yard_id,current_slot_id,identity_verified,registered_at,verified_at,notes) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        id,
        firstTen + checkDigit(firstTen),
        i % 2 ? 20 : 40,
        'Dry',
        owners[i],
        'unassigned',
        yardId,
        null,
        1,
        at,
        null,
        'Awaiting operator-confirmed placement.',
      ],
    );
    await record(
      tx,
      id,
      null,
      null,
      'arrival',
      demoActor,
      'Received at gate; destination not yet confirmed.',
      at,
    );
  }
  for (let i = 0; i < 2; i++) {
    const firstTen = 'TGHU' + String(760001 + i),
      id = uid(),
      at = hoursAgo(90 + i);
    const previous = await tx.one<Slot>(
      `${slotSelect} WHERE bl.id=? AND r.ordinal=4 AND b.ordinal=? AND s.tier=1`,
      [blocks[1], 4 + i],
    );
    await tx.run(
      'INSERT INTO containers(id,number,size,type,owner,status,current_yard_id,current_slot_id,identity_verified,registered_at,verified_at,notes) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        id,
        firstTen + checkDigit(firstTen),
        40,
        'Dry',
        'Textainer',
        'dispatched',
        yardId,
        null,
        1,
        at,
        null,
        'Released from demo yard.',
      ],
    );
    await record(tx, id, null, null, 'arrival', demoActor, '', at);
    await record(tx, id, null, previous!.id, 'placement', demoActor, '', at);
    await record(
      tx,
      id,
      previous!.id,
      null,
      'dispatch',
      demoActor,
      'Collected by authorized transport.',
      hoursAgo(i + 1),
    );
  }
}

export async function resetDemo(tx: Tx) {
  if (process.env.AUTH_MODE === 'supabase' || process.env.PERSISTENCE === 'postgres')
    throw new Error('Reset is restricted to the local SQLite demo.');
  const nonDemo = await tx.one<{ n: number }>('SELECT COUNT(*) AS n FROM yards WHERE is_demo=0');
  if (nonDemo!.n)
    throw new Error(
      'Reset refused: this database contains a non-demo yard. Use a new DATABASE_PATH to start a fresh demo.',
    );
  for (const table of [
    'container_movements',
    'containers',
    'storage_slots',
    'storage_bays',
    'storage_rows',
    'yard_zones',
    'storage_blocks',
    'yard_memberships',
    'yards',
    'user_profiles',
  ])
    await tx.run(`DELETE FROM ${table}`);
  await seedDemo(tx);
}
export const seedTimestamp = now;
