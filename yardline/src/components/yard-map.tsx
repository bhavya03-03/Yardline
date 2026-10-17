'use client';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import Image from 'next/image';
import { ArrowUpRight, ChevronLeft, Layers3, LocateFixed, MapPin, ShieldAlert } from 'lucide-react';
import type { Block, Container, Slot, Snapshot } from '@/lib/types';
import { Badge, Button, Empty, relative, time } from './ui';
import { apiFetch } from '@/lib/client-api';

export function YardMap({
  data,
  tier,
  blockId,
  selectedSlotId,
  onSelect,
  onBlock,
  filter = 'all',
  compact = false,
  pickMode = false,
  variant = 'standard',
  fitToPanel = false,
}: {
  data: Snapshot;
  tier: number;
  blockId: string | null;
  selectedSlotId: string | null;
  onSelect: (slot: Slot) => void;
  onBlock: (id: string | null) => void;
  filter?: string;
  compact?: boolean;
  pickMode?: boolean;
  variant?: 'standard' | 'readable';
  fitToPanel?: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewportRatio, setViewportRatio] = useState(0);
  useEffect(() => {
    const svg = svgRef.current;
    if (!fitToPanel || blockId || !svg) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (height > 0) setViewportRatio(width / height);
    });
    observer.observe(svg);
    return () => observer.disconnect();
  }, [fitToPanel, blockId]);
  const occupancy = useMemo(
    () =>
      new Map(data.containers.filter((c) => c.current_slot_id).map((c) => [c.current_slot_id!, c])),
    [data.containers],
  );
  const block = blockId ? data.blocks.find((b) => b.id === blockId) : null;
  const blocks = block ? [block] : data.blocks;
  const slots = data.slots.filter((s) => s.tier === tier && (!block || s.block_id === block.id));
  const boundary = JSON.parse(data.yard.boundary) as number[][];
  // Fit the schematic to the panel by adapting row heights, keeping text undistorted.
  const yScale =
    fitToPanel && !block && viewportRatio > 0
      ? Math.min(1, (data.yard.width + 6) / (viewportRatio * (data.yard.height + 6)))
      : 1;
  const projectY = (value: number) => value * yScale;
  const labelScale = Math.min(1, yScale / 0.8);
  const showVerification = variant !== 'readable';
  const viewBox = block
    ? `${block.x - 9} ${block.y - 9} ${block.width + 18} ${block.height + 18}`
    : `-3 ${projectY(-3)} ${data.yard.width + 6} ${projectY(data.yard.height + 6)}`;
  const selected = data.slots.find((s) => s.id === selectedSlotId);
  const statusOf = (s: Slot) => (occupancy.has(s.id) ? 'occupied' : s.status);
  const renderBlockGrid = (block: Block) => {
    const rows = data.rows.filter((row) => row.block_id === block.id);
    const maxBays = Math.max(
      0,
      ...data.bays
        .filter((bay) => rows.some((row) => row.id === bay.row_id))
        .map((bay) => bay.ordinal),
    );
    return (
      <div
        className="block-grid-scroll"
        tabIndex={variant === 'readable' ? undefined : 0}
        aria-label={`Bays in block ${block.code}`}
      >
        <div
          className="block-grid"
          role="group"
          aria-label={`${data.yard.name} block ${block.code} storage map, tier ${tier}`}
          style={{
            gridTemplateColumns:
              variant === 'readable'
                ? `clamp(16px, 4cqi, 32px) repeat(${maxBays}, minmax(0, 1fr))`
                : `30px repeat(${maxBays}, minmax(${compact ? 36 : 62}px, 1fr))`,
          }}
        >
          <span className="block-grid-corner">ROW</span>
          {Array.from({ length: maxBays }, (_, i) => (
            <span key={`bay-${i}`} className="block-grid-bay-label">
              BY{String(i + 1).padStart(2, '0')}
            </span>
          ))}
          {rows.map((row) => (
            <div key={row.id} className="block-grid-row">
              <span className="block-grid-row-label">{row.code}</span>
              {Array.from({ length: maxBays }, (_, i) => {
                const slot = slots.find((s) => s.row_id === row.id && s.bay_ordinal === i + 1);
                if (!slot)
                  return (
                    <span
                      key={`${row.id}-${i}`}
                      className="block-grid-void"
                      aria-label="No storage position"
                    />
                  );
                const container = occupancy.get(slot.id),
                  status = statusOf(slot),
                  attention =
                    container &&
                    (!container.verified_at ||
                      new Date(data.generatedAt).getTime() -
                        new Date(container.verified_at).getTime() >
                        24 * 3600000),
                  dimmed =
                    filter !== 'all' && (filter === 'attention' ? !attention : status !== filter);
                return (
                  <button
                    key={slot.id}
                    type="button"
                    className={`block-slot slot-${status} ${slot.id === selectedSlotId ? 'slot-selected' : ''} ${dimmed ? 'slot-dimmed' : ''}`}
                    data-slot-id={slot.id}
                    data-location-code={slot.code}
                    data-status={status}
                    aria-label={`${slot.code} · ${status}${container ? ` · ${container.number}` : ''}${attention ? ' · Needs verification' : ''}`}
                    aria-pressed={slot.id === selectedSlotId}
                    onClick={() => onSelect(slot)}
                  >
                    {container ? (
                      <>
                        <strong>{container.number.slice(0, 4)}</strong>
                        <span>{container.number.slice(4)}</span>
                        <small>{container.size} ft</small>
                        {attention && showVerification ? (
                          <i aria-label="Needs verification">!</i>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <strong>
                          {status === 'available' ? '+' : status === 'reserved' ? 'R' : '×'}
                        </strong>
                        <span>{status}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };
  if (block) {
    return (
      <div className="yard-canvas focused block-view">
        <button type="button" className="back-to-yard" onClick={() => onBlock(null)}>
          <ChevronLeft size={14} />
          All blocks<span>/ {block.code}</span>
        </button>
        <div className="block-view-heading">
          <div>
            <strong>
              {block.code} · {block.name}
            </strong>
            <span>Tier {tier} · Select a position to inspect it</span>
          </div>
          <Layers3 size={17} />
        </div>
        {renderBlockGrid(block)}
        <div className="block-view-footer">
          <span>Each bay is one vertical stack. You are viewing tier {tier}.</span>
          {variant !== 'readable' ? <span>Scroll to see all bays →</span> : null}
        </div>
        {!slots.length ? (
          <div className="inline-notice">No positions at this tier. Choose a lower tier.</div>
        ) : null}
      </div>
    );
  }
  return (
    <div
      className={`yard-canvas ${block ? 'focused' : ''} ${compact ? 'compact' : ''}`}
      style={
        variant === 'readable'
          ? { aspectRatio: `${data.yard.width + 6} / ${data.yard.height + 6}` }
          : undefined
      }
    >
      {variant !== 'readable' ? (
        <span className="canvas-caption">
          <MapPin size={12} />
          {data.yard.code} · LOCAL YARD PLAN
        </span>
      ) : null}
      <span className="north-arrow">
        <span>↑</span>N
      </span>
      <svg
        ref={svgRef}
        className="yard-svg"
        style={{ '--yard-label-scale': labelScale } as CSSProperties}
        viewBox={viewBox}
        aria-label={`${data.yard.name} storage map, tier ${tier}`}
        role="group"
      >
        <defs>
          <pattern
            id="restricted-hatch"
            width="3"
            height="3"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="3" height="3" fill="var(--hazard-soft)" />
            <line x1="0" x2="0" y1="0" y2="3" stroke="var(--hazard-border)" strokeWidth=".7" />
          </pattern>
          <pattern id="yard-dots" width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r=".16" fill="var(--border-strong)" />
          </pattern>
        </defs>
        {!block ? (
          <>
            <polygon
              points={(boundary.length
                ? boundary
                : [
                    [0, 0],
                    [data.yard.width, 0],
                    [data.yard.width, data.yard.height],
                    [0, data.yard.height],
                  ]
              )
                .map(([x, y]) => `${x},${projectY(y)}`)
                .join(' ')}
              className="yard-boundary"
            />
            <rect
              x="0"
              y="0"
              width={data.yard.width}
              height={projectY(data.yard.height)}
              fill="url(#yard-dots)"
              opacity=".5"
            />
            {data.zones.map((z) => (
              <g key={z.id} className={`map-zone zone-${z.kind}`}>
                <rect
                  x={z.x}
                  y={projectY(z.y)}
                  width={z.width}
                  height={projectY(z.height)}
                  rx=".6"
                  fill={z.kind === 'restricted' ? 'url(#restricted-hatch)' : undefined}
                />
                {z.height > z.width ? (
                  <text
                    x={z.x + z.width / 2}
                    y={projectY(z.y + z.height / 2)}
                    textAnchor="middle"
                    transform={`rotate(-90 ${z.x + z.width / 2} ${projectY(z.y + z.height / 2)})`}
                  >
                    {z.label}
                  </text>
                ) : (
                  <>
                    <text
                      x={z.x + z.width / 2}
                      y={projectY(z.y + z.height / 2) + labelScale}
                      textAnchor="middle"
                    >
                      {z.kind === 'road' ? '←   ' : ''}
                      {z.label}
                      {z.kind === 'road' ? '   →' : ''}
                    </text>
                    {z.kind === 'road' ? (
                      <line
                        x1={z.x + 3}
                        x2={z.x + z.width - 3}
                        y1={projectY(z.y + z.height - 2)}
                        y2={projectY(z.y + z.height - 2)}
                        stroke="var(--border-strong)"
                        strokeWidth=".3"
                        strokeDasharray="2 2"
                      />
                    ) : null}
                  </>
                )}
              </g>
            ))}
          </>
        ) : null}
        {blocks.map((b) => {
          const positions = data.slots.filter((s) => s.block_id === b.id),
            filled = positions.filter((s) => occupancy.has(s.id)).length;
          return (
            <g key={b.id}>
              <rect
                x={b.x - 1.8}
                y={projectY(b.y - 2)}
                width={b.width + 3.6}
                height={projectY(b.height + 3.5)}
                className="block-outline"
                rx="1.4"
              />
              <g
                className="block-label"
                role="button"
                tabIndex={0}
                aria-label={`Focus block ${b.code}`}
                onClick={() => onBlock(b.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onBlock(b.id);
                  }
                }}
              >
                <text x={b.x} y={projectY(b.y - 4)}>
                  {b.code} <tspan className="block-subtitle"> / {b.name}</tspan>
                </text>
                <text
                  x={b.x + b.width}
                  y={projectY(b.y - 4)}
                  textAnchor="end"
                  className="block-count"
                >
                  {filled} /{' '}
                  {Math.min(
                    b.capacity_limit,
                    positions.filter((s) => s.status === 'available').length,
                  )}{' '}
                  occupied ↗
                </text>
              </g>
              {data.rows
                .filter((r) => r.block_id === b.id)
                .map((r) => (
                  <text
                    key={r.id}
                    className="row-label"
                    textAnchor="end"
                    x={b.x - 2.7}
                    y={
                      projectY(
                        b.y +
                          ((r.ordinal - 0.5) * b.height) /
                            data.rows.filter((rr) => rr.block_id === b.id).length,
                      ) +
                      0.7 * labelScale
                    }
                  >
                    {r.code.replace('R0', '')}
                  </text>
                ))}
            </g>
          );
        })}
        {slots.map((slot) => {
          const b = data.blocks.find((b) => b.id === slot.block_id)!,
            rowCount = data.rows.filter((r) => r.block_id === b.id).length,
            bayCount = Math.max(
              ...data.bays
                .filter((bay) =>
                  data.rows.some((row) => row.id === bay.row_id && row.block_id === b.id),
                )
                .map((bay) => bay.ordinal),
            );
          const w = b.width / bayCount - 1.8,
            h = b.height / rowCount - 1.7,
            container = occupancy.get(slot.id),
            status = statusOf(slot),
            isSelected = slot.id === selectedSlotId,
            attention =
              container &&
              (!container.verified_at ||
                new Date(data.generatedAt).getTime() - new Date(container.verified_at).getTime() >
                  24 * 3600000),
            dimmed = filter !== 'all' && (filter === 'attention' ? !attention : status !== filter);
          const markerRadius = (variant === 'readable' ? 1.7 : 1.1) * labelScale;
          const markerX = slot.x + w - 1 - markerRadius;
          const markerY = projectY(slot.y + h / 2);
          const numberFontSize = Math.min(4.3 * labelScale, (w - 1.6) / 4.7);
          return (
            <g
              key={slot.id}
              data-slot-id={slot.id}
              data-location-code={slot.code}
              data-status={status}
              role="button"
              tabIndex={compact && variant !== 'readable' ? -1 : 0}
              aria-label={`${slot.code} · ${status}${container ? ` · ${container.number}` : ''}${attention ? ' · Needs verification' : ''}`}
              aria-pressed={isSelected}
              className={`map-slot slot-${status} ${isSelected ? 'slot-selected' : ''} ${dimmed ? 'slot-dimmed' : ''}`}
              onClick={() => onSelect(slot)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(slot);
                }
              }}
            >
              <title>
                {slot.code} · {container ? container.number : status}
                {attention ? ' · Verification needed' : ''}
              </title>
              <rect x={slot.x} y={projectY(slot.y)} width={w} height={projectY(h)} rx=".65" />
              {container ? (
                <>
                  <path
                    className="container-ribs"
                    d={Array.from(
                      { length: 8 },
                      (_, i) =>
                        `M${slot.x + 2 + (i * (w - 4)) / 7},${projectY(slot.y + 1)} v${projectY(h - 2)}`,
                    ).join(' ')}
                  />
                  <text
                    className={variant === 'readable' ? 'map-slot-number' : undefined}
                    style={variant === 'readable' ? { fontSize: numberFontSize } : undefined}
                    x={slot.x + w / 2}
                    y={projectY(slot.y + h / 2) + 0.85 * labelScale}
                    textAnchor="middle"
                  >
                    {container.number.slice(-7)}
                  </text>
                </>
              ) : (
                <text
                  x={slot.x + w / 2}
                  y={projectY(slot.y + h / 2) + 0.85 * labelScale}
                  textAnchor="middle"
                >
                  {status === 'available'
                    ? slot.bay_code.replace('BY', '')
                    : status === 'reserved'
                      ? 'R'
                      : status === 'blocked'
                        ? '×'
                        : '/'}
                </text>
              )}
              {attention && showVerification ? (
                <g className="map-verification-marker" aria-hidden="true">
                  <circle cx={markerX} cy={markerY} r={markerRadius} fill="var(--warning)" />
                  <text x={markerX} y={markerY} textAnchor="middle" dominantBaseline="central">
                    !
                  </text>
                </g>
              ) : null}
              {isSelected ? (
                <rect
                  className="selection-ring"
                  x={slot.x - 0.7}
                  y={projectY(slot.y - 0.7)}
                  width={w + 1.4}
                  height={projectY(h + 1.4)}
                  rx="1.2"
                />
              ) : null}
            </g>
          );
        })}
      </svg>
      {!block ? (
        <div className="map-scale">
          <span />
          <small>
            Local coordinates · {data.yard.width} × {data.yard.height} m
          </small>
        </div>
      ) : null}
      {pickMode ? (
        <span className="pick-hint">
          Select the actual destination{selected ? ` · ${selected.code}` : ''}
        </span>
      ) : null}
      {!slots.length ? (
        <div className="map-empty">
          <Empty heading="No positions at this tier">
            Choose a lower tier or generate a storage block in Yard Configuration.
          </Empty>
        </div>
      ) : null}
    </div>
  );
}
export function Legend({ showVerification = true }: { showVerification?: boolean }) {
  return (
    <div className="map-legend">
      <span>
        <i className="legend-occupied" />
        Occupied
      </span>
      <span>
        <i className="legend-available" />
        Available
      </span>
      <span>
        <i className="legend-reserved" />
        Reserved
      </span>
      <span>
        <i className="legend-restricted" />
        Blocked / restricted
      </span>
      {showVerification ? (
        <span>
          <i className="legend-attention" aria-hidden="true">
            !
          </i>
          Needs verification
        </span>
      ) : null}
    </div>
  );
}

export function SlotDetails({
  data,
  slot,
  container,
  onMove,
  onDispatch,
  onVerify,
  onSlotStatus,
  onSelect,
  onRegister,
}: {
  data: Snapshot;
  slot?: Slot;
  container?: Container;
  onMove: (c: Container) => void;
  onDispatch: (c: Container) => void;
  onVerify: (c: Container) => void;
  onSlotStatus: (s: Slot, status: string) => void;
  onSelect: (s: Slot) => void;
  onRegister: (s: Slot) => void;
}) {
  const canEdit = data.actor.role !== 'viewer';
  const stack = slot
    ? data.slots.filter((s) => s.bay_id === slot.bay_id).sort((a, b) => b.tier - a.tier)
    : [];
  const movements = container ? data.movements.filter((m) => m.container_id === container.id) : [];
  const latest = movements.find(
    (m) => m.event_type !== 'verification' && m.event_type !== 'arrival',
  );
  return (
    <aside className="detail-panel panel">
      <div className="panel-heading">
        <h2>{container ? 'Container details' : 'Position inspector'}</h2>
        <LocateFixed size={17} />
      </div>
      {!slot && !container ? (
        <>
          <div className="inspector-idle" aria-hidden="true">
            <LocateFixed size={30} />
            <span>NO POSITION SELECTED</span>
          </div>
          <div className="details-empty">
            <h3>Inspect a yard position</h3>
            <p>Select a position to see its contents, or search for a container above.</p>
          </div>
          <div className="detail-tip">
            <ShieldAlert size={18} />
            <p>
              <strong>Operator-confirmed location.</strong>Locations reflect the last operator
              update. Confirm physical placement after every move.
            </p>
          </div>
          <div className="detail-facts">
            <span>
              <Layers3 size={16} />
              {Math.max(0, ...data.blocks.map((b) => b.max_tiers))} stacking tiers
            </span>
            <span>
              <MapPin size={16} />
              {data.blocks.length} storage blocks
            </span>
          </div>
        </>
      ) : (
        <>
          <div className="container-summary">
            <Badge
              tone={
                container?.status === 'stored'
                  ? 'blue'
                  : container?.status === 'unassigned'
                    ? 'amber'
                    : slot?.status === 'blocked' || slot?.status === 'restricted'
                      ? 'red'
                      : slot?.status === 'available'
                        ? 'green'
                        : 'neutral'
              }
            >
              {container?.status ?? slot?.status}
            </Badge>
            <h3>{container?.number ?? slot?.code.split('-').slice(1).join(' · ')}</h3>
            <p>
              {container
                ? `${container.size} ft · ${container.type} · ${container.owner || 'Owner not specified'}`
                : 'Storage position · capacity 1 container'}
            </p>
          </div>
          {slot ? (
            <>
              <div className="location-address">
                <span>RECORDED LOCATION</span>
                <strong>{slot.code}</strong>
                <div>
                  <span>{data.yard.name}</span>
                  <ArrowUpRight size={15} />
                </div>
              </div>
              <div className="coordinate-grid">
                {[
                  ['Block', slot.block_code],
                  ['Row', slot.row_code],
                  ['Bay', slot.bay_code],
                  ['Tier', `T0${slot.tier}`],
                ].map(([key, value]) => (
                  <div key={key}>
                    <span>{key}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
              <div className="stack-heading">
                <h4>Stack at {slot.bay_code}</h4>
                <span>Top → bottom</span>
              </div>
              <div className="stack-list">
                {stack.map((s) => {
                  const occupant = data.containers.find((c) => c.current_slot_id === s.id);
                  return (
                    <button
                      key={s.id}
                      className={`stack-item ${s.id === slot.id ? 'active' : ''}`}
                      onClick={() => onSelect(s)}
                    >
                      <span>T0{s.tier}</span>
                      <strong>
                        {occupant?.number ?? (s.status === 'available' ? 'Available' : s.status)}
                      </strong>
                      <i className={occupant ? 'occupied' : 'free'} />
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="inline-notice amber">
              {container?.status === 'dispatched'
                ? 'This container has left the yard. Its location history is preserved.'
                : 'Unassigned · no storage position has been confirmed.'}
            </div>
          )}
          {container ? (
            <>
              <dl className="detail-data">
                <div>
                  <dt>Location verified</dt>
                  <dd>{relative(container.verified_at)}</dd>
                </div>
                <div>
                  <dt>Last movement</dt>
                  <dd>{latest ? time(latest.occurred_at, true) : 'No placement recorded'}</dd>
                </div>
                <div>
                  <dt>Registered</dt>
                  <dd>{time(container.registered_at, true)}</dd>
                </div>
                <div>
                  <dt>Identity</dt>
                  <dd>
                    {container.identity_verified
                      ? 'Check digit verified'
                      : 'Administrator exception'}
                  </dd>
                </div>
              </dl>
              {container.notes ? <p className="container-notes">{container.notes}</p> : null}
              {container.has_photo ? <Photo containerId={container.id} /> : null}
              {canEdit && container.status !== 'dispatched' ? (
                <div className="detail-actions">
                  <Button onClick={() => onMove(container)}>
                    {container.current_slot_id ? 'Move container' : 'Assign position'}
                    <ArrowUpRight size={16} />
                  </Button>
                  {container.current_slot_id ? (
                    <Button variant="secondary" onClick={() => onVerify(container)}>
                      Verify physical location
                    </Button>
                  ) : null}
                  <button className="text-button" onClick={() => onDispatch(container)}>
                    Dispatch from yard
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <>
              {canEdit && slot?.status === 'available' ? (
                <Button onClick={() => onRegister(slot)} className="full-width">
                  Register in this position
                </Button>
              ) : null}
              {data.actor.role === 'administrator' && slot ? (
                <label className="field slot-status-field">
                  <span>Position status</span>
                  <select value={slot.status} onChange={(e) => onSlotStatus(slot, e.target.value)}>
                    {['available', 'reserved', 'blocked', 'restricted'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}
            </>
          )}
        </>
      )}
    </aside>
  );
}
function Photo({ containerId }: { containerId: string }) {
  const [source, setSource] = useState(''),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function view() {
    setBusy(true);
    setError('');
    try {
      const response = await apiFetch(`/api/containers/${containerId}/photo`);
      if (!response.ok) throw new Error('Unable to load the attached photograph.');
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = () => setSource(String(reader.result));
      reader.readAsDataURL(blob);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load photograph.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="attached-photo">
      {source ? (
        <>
          <Image
            src={source}
            alt="Attached container identification photograph"
            width={640}
            height={400}
            unoptimized
          />
          <button className="text-button" onClick={() => setSource('')}>
            Hide photograph
          </button>
        </>
      ) : (
        <Button variant="ghost" busy={busy} onClick={() => void view()}>
          View attached photograph <ArrowUpRight size={14} />
        </Button>
      )}
      {error ? (
        <p className="danger-text" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
