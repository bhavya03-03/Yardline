import type { Container, Slot, Snapshot } from './types';
export function destinationProblem(
  data: Snapshot,
  slot: Slot,
  size: number,
  moving?: Container,
): string | null {
  if (moving?.current_slot_id === slot.id) return 'Choose a different destination.';
  if (slot.status !== 'available') return `This position is ${slot.status}.`;
  const occupants = new Map(
    data.containers
      .filter((c) => c.current_slot_id && c.id !== moving?.id)
      .map((c) => [c.current_slot_id, c]),
  );
  if (occupants.has(slot.id)) return 'This position is already occupied.';
  if (size > slot.max_size) return `Maximum container length: ${slot.max_size} ft.`;
  const lower = data.slots.filter((s) => s.bay_id === slot.bay_id && s.tier < slot.tier);
  if (lower.length !== slot.tier - 1 || lower.some((s) => !occupants.has(s.id)))
    return 'Every lower tier must be occupied first.';
  if (lower.some((s) => occupants.get(s.id)?.size !== size))
    return 'Stack containers of the same length.';
  const block = data.blocks.find((b) => b.id === slot.block_id)!;
  const slotIds = new Set(data.slots.filter((s) => s.block_id === block.id).map((s) => s.id));
  if ([...occupants.keys()].filter((id) => id && slotIds.has(id)).length >= block.capacity_limit)
    return 'Block capacity limit reached.';
  return null;
}
