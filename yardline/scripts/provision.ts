import './env';
import { database } from '../src/server/db';
import { createYard } from '../src/server/operations';
import type { Actor, Yard } from '../src/lib/types';
const args = new Map<string, string>();
for (let i = 2; i < process.argv.length; i += 2) args.set(process.argv[i], process.argv[i + 1]);
const userId = args.get('--user-id'),
  name = args.get('--name'),
  code = args.get('--yard-code') ?? 'YD01';
async function main() {
  if (!userId || !name)
    throw new Error(
      'Usage: npm run db:provision -- --user-id SUPABASE_USER_UUID --name "Administrator Name" --yard-code YD01 --yard-name "North Yard"',
    );
  if (process.env.AUTH_MODE !== 'supabase' || process.env.PERSISTENCE !== 'postgres')
    throw new Error(
      'Provisioning is for the PostgreSQL + Supabase Auth configuration. Use Settings to switch roles in the local demo.',
    );
  await database().setup();
  await database().transaction(async (tx) => {
    await tx.run(
      'INSERT INTO user_profiles(id,display_name) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET display_name=excluded.display_name',
      [userId, name],
    );
    let yard = await tx.one<Yard>('SELECT * FROM yards WHERE code=?', [code.toUpperCase()]);
    if (!yard) {
      const actor: Actor = { id: userId, name, role: 'administrator' };
      const yardId = await createYard(
        tx,
        {
          code,
          name: args.get('--yard-name') ?? 'North Yard',
          width: 240,
          height: 180,
          boundary: [],
        },
        actor,
      );
      yard = (await tx.one<Yard>('SELECT * FROM yards WHERE id=?', [yardId]))!;
    }
    const role = args.get('--role') ?? 'administrator';
    if (!['administrator', 'operator', 'viewer'].includes(role))
      throw new Error('Role must be administrator, operator, or viewer.');
    await tx.run(
      'INSERT INTO yard_memberships(user_id,yard_id,role) VALUES(?,?,?) ON CONFLICT(user_id,yard_id) DO UPDATE SET role=excluded.role',
      [userId, yard.id, role],
    );
    console.log(
      `Provisioned ${name} as ${role} for ${yard.code} (${yard.name}). No password stored in the application database.`,
    );
  });
}
main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => database().close());
