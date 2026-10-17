-- Portable core schema: applied to SQLite or PostgreSQL by db:setup.
-- Mutable location has ONE source of truth: containers.current_slot_id.
CREATE TABLE IF NOT EXISTS yards (
 id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE, name TEXT NOT NULL,
 width REAL NOT NULL CHECK(width > 0), height REAL NOT NULL CHECK(height > 0),
 boundary TEXT NOT NULL DEFAULT '[]', is_demo INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS storage_blocks (
 id TEXT PRIMARY KEY, yard_id TEXT NOT NULL REFERENCES yards(id),
 code TEXT NOT NULL, name TEXT NOT NULL,
 x REAL NOT NULL, y REAL NOT NULL, width REAL NOT NULL, height REAL NOT NULL,
 max_tiers INTEGER NOT NULL CHECK(max_tiers BETWEEN 1 AND 6),
 capacity_limit INTEGER NOT NULL CHECK(capacity_limit > 0),
 max_size INTEGER NOT NULL DEFAULT 40 CHECK(max_size IN (20,40,45)),
 UNIQUE(yard_id, code)
);
CREATE TABLE IF NOT EXISTS storage_rows (
 id TEXT PRIMARY KEY, block_id TEXT NOT NULL REFERENCES storage_blocks(id),
 code TEXT NOT NULL, ordinal INTEGER NOT NULL CHECK(ordinal > 0),
 UNIQUE(block_id, code), UNIQUE(block_id, ordinal)
);
CREATE TABLE IF NOT EXISTS storage_bays (
 id TEXT PRIMARY KEY, row_id TEXT NOT NULL REFERENCES storage_rows(id),
 code TEXT NOT NULL, ordinal INTEGER NOT NULL CHECK(ordinal > 0),
 max_tiers INTEGER NOT NULL CHECK(max_tiers BETWEEN 1 AND 6),
 UNIQUE(row_id, code), UNIQUE(row_id, ordinal)
);
CREATE TABLE IF NOT EXISTS storage_slots (
 id TEXT PRIMARY KEY, bay_id TEXT NOT NULL REFERENCES storage_bays(id),
 tier INTEGER NOT NULL CHECK(tier BETWEEN 1 AND 6), code TEXT NOT NULL UNIQUE,
 x REAL NOT NULL, y REAL NOT NULL,
 status TEXT NOT NULL DEFAULT 'available' CHECK(status IN ('available','reserved','blocked','restricted')),
 max_size INTEGER NOT NULL DEFAULT 40 CHECK(max_size IN (20,40,45)),
 capacity INTEGER NOT NULL DEFAULT 1 CHECK(capacity = 1),
 UNIQUE(bay_id, tier)
);
CREATE TABLE IF NOT EXISTS containers (
 id TEXT PRIMARY KEY, number TEXT NOT NULL UNIQUE,
 size INTEGER NOT NULL CHECK(size IN (20,40,45)), type TEXT NOT NULL DEFAULT 'Dry',
 owner TEXT NOT NULL DEFAULT '',
 status TEXT NOT NULL CHECK(status IN ('stored','unassigned','dispatched')),
 current_yard_id TEXT NOT NULL REFERENCES yards(id),
 current_slot_id TEXT UNIQUE REFERENCES storage_slots(id),
 identity_verified INTEGER NOT NULL DEFAULT 1,
 registered_at TEXT NOT NULL, verified_at TEXT,
 notes TEXT NOT NULL DEFAULT '', photo TEXT,
 CHECK((status = 'stored' AND current_slot_id IS NOT NULL) OR (status <> 'stored' AND current_slot_id IS NULL))
);
CREATE TABLE IF NOT EXISTS user_profiles (
 id TEXT PRIMARY KEY, display_name TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS yard_memberships (
 user_id TEXT NOT NULL REFERENCES user_profiles(id), yard_id TEXT NOT NULL REFERENCES yards(id),
 role TEXT NOT NULL CHECK(role IN ('administrator','operator','viewer')),
 PRIMARY KEY(user_id, yard_id)
);
CREATE TABLE IF NOT EXISTS container_movements (
 id TEXT PRIMARY KEY, container_id TEXT NOT NULL REFERENCES containers(id),
 from_slot_id TEXT REFERENCES storage_slots(id), to_slot_id TEXT REFERENCES storage_slots(id),
 event_type TEXT NOT NULL CHECK(event_type IN ('arrival','placement','relocation','dispatch','verification')),
 occurred_at TEXT NOT NULL, user_id TEXT REFERENCES user_profiles(id),
 actor_name TEXT NOT NULL, notes TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS yard_zones (
 id TEXT PRIMARY KEY, yard_id TEXT NOT NULL REFERENCES yards(id),
 kind TEXT NOT NULL CHECK(kind IN ('road','loading','restricted')),
 label TEXT NOT NULL, x REAL NOT NULL, y REAL NOT NULL,
 width REAL NOT NULL CHECK(width > 0), height REAL NOT NULL CHECK(height > 0)
);
CREATE INDEX IF NOT EXISTS idx_blocks_yard ON storage_blocks(yard_id);
CREATE INDEX IF NOT EXISTS idx_rows_block ON storage_rows(block_id);
CREATE INDEX IF NOT EXISTS idx_bays_row ON storage_bays(row_id);
CREATE INDEX IF NOT EXISTS idx_slots_bay ON storage_slots(bay_id);
CREATE INDEX IF NOT EXISTS idx_containers_yard ON containers(current_yard_id);
CREATE INDEX IF NOT EXISTS idx_movements_container ON container_movements(container_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_movements_time ON container_movements(occurred_at);
CREATE INDEX IF NOT EXISTS idx_memberships_yard ON yard_memberships(yard_id);
CREATE INDEX IF NOT EXISTS idx_zones_yard ON yard_zones(yard_id);
