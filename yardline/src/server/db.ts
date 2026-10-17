import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { Pool, type PoolClient } from 'pg';

export interface Tx {
  all<T>(sql: string, params?: unknown[]): Promise<T[]>;
  one<T>(sql: string, params?: unknown[]): Promise<T | undefined>;
  run(sql: string, params?: unknown[]): Promise<void>;
}
type DbGlobal = typeof globalThis & { __yardlineDb?: Database };
export class Database {
  mode: 'sqlite' | 'postgres';
  private sqlite?: DatabaseSync;
  private pool?: Pool;
  private queue: Promise<unknown> = Promise.resolve();
  private initialized?: Promise<void>;
  constructor(path?: string) {
    this.mode = !path && process.env.PERSISTENCE === 'postgres' ? 'postgres' : 'sqlite';
    if (this.mode === 'postgres') {
      const connectionString = process.env.DATABASE_URL || process.env.NETLIFY_DB_URL;
      if (!connectionString)
        throw new Error(
          'DATABASE_URL or NETLIFY_DB_URL is required for PostgreSQL. No local fallback was used.',
        );
      this.pool = new Pool({ connectionString, max: 5 });
    } else {
      if (!path && process.env.PERSISTENCE && process.env.PERSISTENCE !== 'sqlite')
        throw new Error('PERSISTENCE must be sqlite or postgres.');
      const file =
        path ??
        resolve(/* turbopackIgnore: true */ process.env.DATABASE_PATH ?? './data/yardline.sqlite');
      if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true });
      this.sqlite = new DatabaseSync(file);
      this.sqlite.exec(
        'PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;',
      );
    }
  }
  private adapter(client?: PoolClient): Tx {
    const query = async <T>(sql: string, params: unknown[] = []): Promise<T[]> => {
      if (client) {
        let i = 0;
        return (
          await client.query(
            sql.replace(/\?/g, () => `$${++i}`),
            params,
          )
        ).rows as T[];
      }
      return this.sqlite!.prepare(sql).all(...(params as (string | number | null)[])) as T[];
    };
    return {
      all: query,
      one: async <T>(s: string, p?: unknown[]) => (await query<T>(s, p))[0],
      run: async (sql, params = []) => {
        if (client) {
          let i = 0;
          await client.query(
            sql.replace(/\?/g, () => `$${++i}`),
            params,
          );
        } else this.sqlite!.prepare(sql).run(...(params as (string | number | null)[]));
      },
    };
  }
  async setup() {
    this.initialized ??= this.transaction(async (tx) => {
      const sql = readFileSync(resolve('migrations/001_schema.sql'), 'utf8');
      for (const statement of sql
        .split(';')
        .map((s) => s.trim())
        .filter(Boolean))
        await tx.run(statement);
      if (this.mode === 'postgres') {
        // API-only architecture. Browser clients must never write around service validation.
        for (const table of [
          'yards',
          'storage_blocks',
          'storage_rows',
          'storage_bays',
          'storage_slots',
          'containers',
          'user_profiles',
          'yard_memberships',
          'container_movements',
          'yard_zones',
        ]) {
          await tx.run(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`);
          await tx.run(`REVOKE ALL ON TABLE ${table} FROM PUBLIC`);
          for (const role of ['anon', 'authenticated']) {
            if (await tx.one('SELECT 1 FROM pg_roles WHERE rolname=?', [role]))
              await tx.run(`REVOKE ALL ON TABLE ${table} FROM ${role}`);
          }
        }
      }
    }).catch((error) => {
      this.initialized = undefined;
      throw error;
    });
    return this.initialized;
  }
  async transaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
    const work = this.queue.then(async () => {
      const client = this.pool ? await this.pool.connect() : undefined;
      try {
        if (client) {
          await client.query('BEGIN');
          await client.query('SELECT pg_advisory_xact_lock(927154)');
        } else this.sqlite!.exec('BEGIN IMMEDIATE');
        const result = await fn(this.adapter(client));
        if (client) await client.query('COMMIT');
        else this.sqlite!.exec('COMMIT');
        return result;
      } catch (error) {
        if (client) await client.query('ROLLBACK');
        else this.sqlite!.exec('ROLLBACK');
        throw error;
      } finally {
        client?.release();
      }
    });
    this.queue = work.catch(() => {});
    return work;
  }
  async close() {
    await this.queue;
    this.sqlite?.close();
    await this.pool?.end();
  }
}
export function database() {
  return ((globalThis as DbGlobal).__yardlineDb ??= new Database());
}
