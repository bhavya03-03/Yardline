export type Role = 'administrator' | 'operator' | 'viewer';
export type SlotStatus = 'available' | 'reserved' | 'blocked' | 'restricted';
export type ContainerStatus = 'stored' | 'unassigned' | 'dispatched';
export type EventType = 'arrival' | 'placement' | 'relocation' | 'dispatch' | 'verification';
export interface Yard {
  id: string;
  code: string;
  name: string;
  width: number;
  height: number;
  boundary: string;
  is_demo: number;
  created_at: string;
}
export interface Block {
  id: string;
  yard_id: string;
  code: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  max_tiers: number;
  capacity_limit: number;
  max_size: number;
}
export interface StorageRow {
  id: string;
  block_id: string;
  code: string;
  ordinal: number;
}
export interface Bay {
  id: string;
  row_id: string;
  code: string;
  ordinal: number;
  max_tiers: number;
}
export interface Slot {
  id: string;
  bay_id: string;
  tier: number;
  code: string;
  x: number;
  y: number;
  status: SlotStatus;
  max_size: number;
  capacity: number;
  yard_id: string;
  block_id: string;
  row_id: string;
  block_code: string;
  row_code: string;
  bay_code: string;
  row_ordinal: number;
  bay_ordinal: number;
}
export interface Container {
  id: string;
  number: string;
  size: number;
  type: string;
  owner: string;
  status: ContainerStatus;
  current_yard_id: string;
  current_slot_id: string | null;
  identity_verified: number;
  registered_at: string;
  verified_at: string | null;
  notes: string;
  has_photo?: number;
  location_code?: string | null;
}
export interface Movement {
  id: string;
  container_id: string;
  from_slot_id: string | null;
  to_slot_id: string | null;
  event_type: EventType;
  occurred_at: string;
  user_id: string | null;
  actor_name: string;
  notes: string;
  container_number: string;
  from_code: string | null;
  to_code: string | null;
}
export interface Zone {
  id: string;
  yard_id: string;
  kind: 'road' | 'loading' | 'restricted';
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface Actor {
  id: string;
  name: string;
  role: Role;
}
export interface Metrics {
  capacity: number;
  occupied: number;
  available: number;
  usable: number;
  reserved: number;
  blocked: number;
  restricted: number;
  assignable: number;
  utilization: number;
  unassigned: number;
  attention: number;
  movesToday: number;
}
export interface Snapshot {
  yards: Yard[];
  yard: Yard;
  blocks: Block[];
  rows: StorageRow[];
  bays: Bay[];
  slots: Slot[];
  zones: Zone[];
  containers: Container[];
  movements: Movement[];
  metrics: Metrics;
  actor: Actor;
  persistence: 'sqlite' | 'postgres';
  authMode: 'demo' | 'supabase';
  generatedAt: string;
}
