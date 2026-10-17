'use client';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  ArrowLeftRight,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Container as ContainerIcon,
  Grid2X2,
  History,
  Info,
  Layers3,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Warehouse,
  X,
} from 'lucide-react';
import type { Container, Movement, Slot, Snapshot } from '@/lib/types';
import { api, authClient, exportCsv } from '@/lib/client-api';
import { Badge, Button, Empty, Field, relative, time } from './ui';
import { Legend, SlotDetails, YardMap } from './yard-map';
import { ConfirmOperation, MoveModal, RegisterForm, type Mutate } from './workflows';
import { Configuration } from './configuration';

type Page =
  'overview' | 'map' | 'containers' | 'register' | 'history' | 'configuration' | 'settings';
const nav = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'map', label: 'Yard Map', icon: Grid2X2 },
  { id: 'containers', label: 'Containers', icon: ContainerIcon },
  { id: 'register', label: 'Register Container', icon: Plus },
  { id: 'history', label: 'Movement History', icon: History },
  { id: 'configuration', label: 'Yard Configuration', icon: SlidersHorizontal },
  { id: 'settings', label: 'Settings', icon: Settings2 },
] as const;
const pageMeta: Record<Page, { title: string; subtitle: string }> = {
  overview: {
    title: 'Operations overview',
    subtitle: 'Capacity, placement exceptions, and the latest recorded movements.',
  },
  map: {
    title: 'Yard map',
    subtitle: 'Locate containers and manage operator-confirmed positions.',
  },
  containers: {
    title: 'Container inventory',
    subtitle: 'Every arrival, recorded position, and container ready to move.',
  },
  register: {
    title: 'Register container',
    subtitle: 'Identify the container, then confirm where it was physically placed.',
  },
  history: {
    title: 'Movement history',
    subtitle: 'A permanent record of arrivals, placements, relocations, and dispatches.',
  },
  configuration: {
    title: 'Yard configuration',
    subtitle: 'Configure your plot, generate storage blocks, and protect non-storage areas.',
  },
  settings: {
    title: 'Workspace settings',
    subtitle: 'Your connection, access, and the details behind this workspace.',
  },
};

export default function YardlineApp() {
  const [data, setData] = useState<Snapshot | null>(null),
    [page, setPage] = useState<Page>('map'),
    [loadError, setLoadError] = useState(''),
    [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState(''),
    [searchOpen, setSearchOpen] = useState(false),
    [mobileNav, setMobileNav] = useState(false),
    [toast, setToast] = useState('');
  const [tier, setTier] = useState(1),
    [blockId, setBlockId] = useState<string | null>(null),
    [selectedSlotId, setSelectedSlotId] = useState<string | null>(null),
    [selectedContainerId, setSelectedContainerId] = useState<string | null>(null),
    [mapFilter, setMapFilter] = useState('all');
  const [moveTarget, setMoveTarget] = useState<Container | null>(null),
    [confirmation, setConfirmation] = useState<{
      container: Container;
      kind: 'dispatch' | 'verify';
    } | null>(null),
    [preferredSlot, setPreferredSlot] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null),
    requestId = useRef(0),
    mutationPending = useRef(false);
  const load = useCallback(async (yardId?: string, quiet = false) => {
    if (mutationPending.current) return;
    const request = ++requestId.current;
    if (!quiet) setRefreshing(true);
    try {
      const state = await api<Snapshot>(
        `/api/state${yardId ? `?yard=${encodeURIComponent(yardId)}` : ''}`,
      );
      if (request === requestId.current) {
        setData(state);
        setLoadError('');
      }
    } catch (e) {
      if (request === requestId.current)
        setLoadError(e instanceof Error ? e.message : 'Could not load yard data.');
    } finally {
      if (request === requestId.current) setRefreshing(false);
    }
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [load]);
  const activeYardId = data?.yard.id;
  useEffect(() => {
    if (!activeYardId) return;
    const id = setInterval(() => {
      if (!document.hidden) void load(activeYardId, true);
    }, 30000);
    return () => clearInterval(id);
  }, [activeYardId, load]); // Periodic reads, not physical tracking.
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(''), 5500);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    const listener = (e: PointerEvent) => {
      if (!searchRef.current?.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener('pointerdown', listener);
    return () => document.removeEventListener('pointerdown', listener);
  }, []);
  const mutate: Mutate = async (action, payload) => {
    mutationPending.current = true;
    ++requestId.current;
    try {
      const result = await api<{ state: Snapshot; entityId: string | null }>(
        `/api/actions/${action}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      setData(result.state);
      setLoadError('');
      return result;
    } finally {
      mutationPending.current = false;
    }
  };
  function navigate(next: Page) {
    setPage(next);
    setMobileNav(false);
    setSearchOpen(false);
  }
  function selectSlot(slot: Slot) {
    setSelectedSlotId(slot.id);
    setSelectedContainerId(data?.containers.find((c) => c.current_slot_id === slot.id)?.id ?? null);
    setTier(slot.tier);
  }
  function locate(c: Container, state = data) {
    if (!state) return;
    navigate('map');
    setSelectedContainerId(c.id);
    setSelectedSlotId(c.current_slot_id);
    setQuery('');
    setMapFilter('all');
    const slot = state.slots.find((s) => s.id === c.current_slot_id);
    if (slot) {
      setBlockId(slot.block_id);
      setTier(slot.tier);
    } else setBlockId(null);
  }
  function registered(id: string, state: Snapshot) {
    const c = state.containers.find((c) => c.id === id)!;
    locate(c, state);
    setPreferredSlot(null);
    setToast(`${c.number} registered${c.current_slot_id ? ' and assigned' : ' as unassigned'}.`);
  }
  function moved(state: Snapshot) {
    const id = moveTarget!.id,
      c = state.containers.find((c) => c.id === id)!;
    setMoveTarget(null);
    locate(c, state);
    setToast(`Location saved · ${c.location_code}`);
  }
  function confirmed(state: Snapshot) {
    const kind = confirmation!.kind,
      id = confirmation!.container.id;
    setConfirmation(null);
    const c = state.containers.find((c) => c.id === id)!;
    setSelectedContainerId(c.id);
    setSelectedSlotId(c.current_slot_id);
    setToast(
      kind === 'dispatch'
        ? `${c.number} dispatched. History preserved.`
        : 'Physical location verified.',
    );
  }
  async function changeSlot(slot: Slot, status: string) {
    try {
      await mutate('update-slot', { yardId: data!.yard.id, slotId: slot.id, status });
      setToast(`Position marked ${status}.`);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Could not update position.');
    }
  }
  const selectedSlot = data?.slots.find((s) => s.id === selectedSlotId),
    selectedContainer = data?.containers.find((c) => c.id === selectedContainerId);
  const q = query.trim().toLowerCase();
  const searchResults =
    data && q
      ? data.containers
          .filter((c) =>
            [c.number, c.owner, c.status, c.location_code ?? ''].some((s) =>
              s.toLowerCase().includes(q),
            ),
          )
          .slice(0, 7)
      : [];
  if (!data)
    return (
      <div className="startup">
        <Brand />
        <div className="startup-content">
          {loadError ? (
            <>
              <Warehouse size={40} />
              <h1>Your yard connection needs attention.</h1>
              <p role="alert">{loadError}</p>
              {authClient() ? <Login onSignedIn={() => void load()} /> : null}
              <Button variant="secondary" onClick={() => void load()} busy={refreshing}>
                <RefreshCw size={16} />
                Retry connection
              </Button>
            </>
          ) : (
            <>
              <div className="loading-grid">
                {Array.from({ length: 12 }, (_, i) => (
                  <i key={i} />
                ))}
              </div>
              <h1>Opening your yard.</h1>
              <p>Loading the persisted layout and confirmed positions…</p>
            </>
          )}
        </div>
      </div>
    );
  const meta = pageMeta[page];
  return (
    <div className={`app-shell page-${page}`}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      {mobileNav ? (
        <button
          className="nav-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      ) : null}
      <aside className={`sidebar ${mobileNav ? 'is-open' : ''}`}>
        <Brand />
        <div className="workspace-label">ACTIVE FACILITY</div>
        <div className="yard-select-wrap">
          <Warehouse size={19} />
          <select
            aria-label="Select yard"
            value={data.yard.id}
            onChange={(e) => {
              setBlockId(null);
              setTier(1);
              setSelectedSlotId(null);
              setSelectedContainerId(null);
              void load(e.target.value);
            }}
          >
            {data.yards.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}
              </option>
            ))}
          </select>
          <ChevronDown size={14} />
          <span>
            {data.yard.code} · {data.blocks.length} storage blocks
          </span>
        </div>
        <div className="navigation-label">OPERATIONS CORE</div>
        <nav aria-label="Main navigation">
          {nav.map((item) => (
            <div key={item.id}>
              {item.id === 'configuration' ? (
                <div className="navigation-label administration-label">ADMINISTRATION</div>
              ) : null}
              <button
                aria-label={item.label}
                className={`nav-item ${page === item.id ? 'active' : ''}`}
                onClick={() => navigate(item.id)}
                aria-current={page === item.id ? 'page' : undefined}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                {item.id === 'containers' ? (
                  <span className="nav-count">
                    {data.metrics.occupied + data.metrics.unassigned}
                  </span>
                ) : item.id === 'map' && page === 'map' ? (
                  <span className="nav-active-dot" />
                ) : null}
              </button>
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="demo-note">
            <span className="demo-icon">
              <Layers3 size={17} />
            </span>
            <div>
              <strong>
                {data.yard.is_demo
                  ? 'Demonstration environment'
                  : data.persistence === 'sqlite'
                    ? 'Local workspace'
                    : 'Connected workspace'}
              </strong>
              <p>
                {data.yard.is_demo
                  ? 'Sample records. Real workflows.'
                  : data.persistence === 'sqlite'
                    ? 'Persisted on this server.'
                    : 'Database-backed yard operations.'}
              </p>
            </div>
          </div>
          <button className="user-profile" onClick={() => navigate('settings')}>
            <span className="avatar">
              {data.actor.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </span>
            <span>
              <strong>{data.actor.name}</strong>
              <small>{data.actor.role}</small>
            </span>
            <Settings2 size={16} />
          </button>
        </div>
      </aside>
      <div className="app-body">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Open navigation"
            onClick={() => setMobileNav(true)}
          >
            <Menu size={21} />
          </button>
          <div className="breadcrumbs">
            <span>Terminal ops</span>
            <ChevronRight size={13} />
            <span>{data.yard.name}</span>
            <ChevronRight size={13} />
            <strong>{nav.find((n) => n.id === page)?.label}</strong>
          </div>
          <div className="global-search" ref={searchRef}>
            <Search size={17} />
            <input
              aria-label="Search containers globally"
              placeholder="Search container, line or status…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setSearchOpen(false);
                if (e.key === 'Enter' && searchResults.length) locate(searchResults[0]);
              }}
            />
            {query ? (
              <button
                className="icon-button"
                aria-label="Clear search"
                onClick={() => setQuery('')}
              >
                <X size={14} />
              </button>
            ) : null}
            {searchOpen && q ? (
              <div className="search-dropdown">
                <div className="search-dropdown-label">
                  CONTAINER SEARCH · {searchResults.length}
                  {searchResults.length === 7 ? '+' : ''} RESULTS
                </div>
                {searchResults.length ? (
                  searchResults.map((c) => (
                    <button key={c.id} onClick={() => locate(c)}>
                      <span className="search-result-icon">
                        <ContainerIcon size={17} />
                      </span>
                      <span>
                        <strong>{c.number}</strong>
                        <small>
                          {c.owner || 'Owner unspecified'} · {c.size} ft
                        </small>
                      </span>
                      <span className="search-result-location">
                        {c.location_code ?? c.status}
                        <ArrowUpRight size={14} />
                      </span>
                    </button>
                  ))
                ) : (
                  <Empty heading="No containers found">
                    Try part of a number, a shipping line, or a status.
                  </Empty>
                )}
              </div>
            ) : null}
          </div>
          <div className="toolbar-actions">
            <Button variant="secondary" onClick={() => navigate('map')}>
              <Grid2X2 size={15} />
              Grid view
            </Button>
            {data.actor.role !== 'viewer' ? (
              <Button
                onClick={() => {
                  setPreferredSlot(null);
                  navigate('register');
                }}
              >
                <Plus size={15} />
                Register container
              </Button>
            ) : null}
            <button
              className="toolbar-avatar"
              aria-label="Open account profile"
              onClick={() => navigate('settings')}
            >
              {data.actor.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </button>
          </div>
          <button
            className="icon-button help-button"
            aria-label="Open workspace information"
            onClick={() => navigate('settings')}
          >
            <CircleHelp size={19} />
          </button>
        </header>
        <main id="main-content">
          <div className={`page-heading ${page === 'overview' ? 'overview-hero' : ''}`}>
            <div className="page-heading-copy">
              <div className="eyebrow">
                {data.yard.name.toUpperCase()} <span>/</span> {data.yard.code}
              </div>
              <h1>{meta.title}</h1>
              <p>{meta.subtitle}</p>
              {page === 'overview' ? (
                <div className="overview-hero-note">
                  <span>Operator-confirmed positions</span>
                  <span>
                    {data.blocks.length} storage blocks · {data.yard.name}
                  </span>
                </div>
              ) : null}
            </div>
            <div className="page-actions">
              {page === 'overview' ? (
                <Button onClick={() => navigate('map')}>
                  View yard map <ArrowUpRight size={16} />
                </Button>
              ) : null}
              {page === 'map' || page === 'overview' ? (
                <Button
                  variant="secondary"
                  onClick={() => void load(data.yard.id)}
                  busy={refreshing}
                >
                  <RefreshCw size={15} />
                  Refresh
                </Button>
              ) : null}
              <Badge tone="blue">{data.yard.is_demo ? 'Demonstration yard' : data.yard.code}</Badge>
            </div>
          </div>
          {loadError ? (
            <div className="inline-notice error global-error" role="alert">
              <Info size={18} />
              <span>{loadError}</span>
              <button className="text-button" onClick={() => void load(data.yard.id)}>
                Reload confirmed state
              </button>
            </div>
          ) : null}
          {page === 'map' || page === 'overview' ? <Metrics data={data} /> : null}
          {page === 'map' ? (
            <>
              <div className="map-layout">
                <section className="panel map-panel yard-grid-theme">
                  <div className="map-panel-heading">
                    <div>
                      <h2>
                        <span className="heading-marker" />
                        Storage grid
                      </h2>
                    </div>
                    <div className="map-controls">
                      <select
                        aria-label="Filter map positions"
                        value={mapFilter}
                        onChange={(e) => setMapFilter(e.target.value)}
                      >
                        <option value="all">All positions</option>
                        <option value="occupied">Occupied</option>
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="blocked">Blocked</option>
                        <option value="restricted">Restricted</option>
                        <option value="attention">Needs verification</option>
                      </select>
                    </div>
                  </div>
                  <div className="map-toolbar">
                    <div className="block-tabs" role="group" aria-label="Yard block">
                      <button
                        className={!blockId ? 'active' : ''}
                        aria-pressed={!blockId}
                        onClick={() => setBlockId(null)}
                      >
                        Full yard
                      </button>
                      {data.blocks.map((b) => (
                        <button
                          key={b.id}
                          className={blockId === b.id ? 'active' : ''}
                          aria-pressed={blockId === b.id}
                          onClick={() => setBlockId(b.id)}
                        >
                          <span className="mono">{b.code}</span>
                        </button>
                      ))}
                    </div>
                    <div className="tier-selector">
                      <Layers3 size={14} />
                      <span>Stacking tier</span>
                      {Array.from(
                        { length: Math.max(1, ...data.blocks.map((b) => b.max_tiers)) },
                        (_, i) => (
                          <button
                            key={i + 1}
                            className={tier === i + 1 ? 'active' : ''}
                            onClick={() => setTier(i + 1)}
                            aria-label={`View tier ${i + 1}`}
                            aria-pressed={tier === i + 1}
                          >
                            T{i + 1}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                  <div className="yard-map-surface" role="region" aria-label="Yard layout">
                    <YardMap
                      data={data}
                      tier={tier}
                      blockId={blockId}
                      selectedSlotId={selectedSlotId}
                      onSelect={selectSlot}
                      onBlock={setBlockId}
                      filter={mapFilter}
                      variant="readable"
                    />
                  </div>
                  <Legend />
                  <div className="map-footer">
                    <span>
                      <ShieldCheck size={14} />
                      Positions are confirmed by your team.
                    </span>
                    <span>
                      {
                        data.slots.filter(
                          (s) => s.tier === tier && (!blockId || s.block_id === blockId),
                        ).length
                      }{' '}
                      positions · Tier {tier}
                    </span>
                  </div>
                </section>
                <SlotDetails
                  data={data}
                  slot={selectedSlot}
                  container={selectedContainer}
                  onMove={setMoveTarget}
                  onDispatch={(c) => setConfirmation({ container: c, kind: 'dispatch' })}
                  onVerify={(c) => setConfirmation({ container: c, kind: 'verify' })}
                  onSlotStatus={(s, status) => void changeSlot(s, status)}
                  onSelect={selectSlot}
                  onRegister={(s) => {
                    setPreferredSlot(s.id);
                    navigate('register');
                  }}
                />
              </div>
              <div className="below-map">
                <div className="unassigned-banner">
                  <span className="unassigned-icon">
                    <ContainerIcon size={20} />
                  </span>
                  <div>
                    <strong>{data.metrics.unassigned} containers awaiting a position</strong>
                    <p>Received at the gate. Ready for operator-confirmed placement.</p>
                  </div>
                  <button className="text-button" onClick={() => navigate('containers')}>
                    View inventory
                    <ArrowRight size={15} />
                  </button>
                </div>
                {data.yard.is_demo && data.containers.some((c) => c.number === 'MSCU1234566') ? (
                  <button
                    className="demo-search-hint"
                    onClick={() => locate(data.containers.find((c) => c.number === 'MSCU1234566')!)}
                  >
                    <Search size={15} />
                    <span>
                      Try locating <strong>MSCU1234566</strong>
                    </span>
                    <ArrowUpRight size={15} />
                  </button>
                ) : null}
              </div>
            </>
          ) : null}
          {page === 'overview' ? (
            <Overview
              data={data}
              onLocate={locate}
              onMap={() => navigate('map')}
              onHistory={() => navigate('history')}
            />
          ) : null}
          {page === 'containers' ? (
            <ContainerTable data={data} onLocate={locate} onMove={setMoveTarget} />
          ) : null}
          {page === 'register' ? (
            <RegisterForm
              key={`${data.yard.id}-${preferredSlot ?? ''}`}
              data={data}
              mutate={mutate}
              preferredSlot={preferredSlot}
              onRegistered={registered}
            />
          ) : null}
          {page === 'history' ? <HistoryTable data={data} onLocate={locate} /> : null}
          {page === 'configuration' ? (
            <Configuration
              data={data}
              mutate={mutate}
              onSaved={(state) => {
                setData(state);
                if (state.yard.id !== data.yard.id) {
                  setBlockId(null);
                  setTier(1);
                  setSelectedSlotId(null);
                  setSelectedContainerId(null);
                }
              }}
            />
          ) : null}
          {page === 'settings' ? (
            <Settings data={data} onReload={() => void load(data.yard.id)} onNotify={setToast} />
          ) : null}
        </main>
      </div>
      {toast ? (
        <div className="toast" role="status">
          <CheckCircle2 size={19} />
          <span>{toast}</span>
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => setToast('')}
          >
            <X size={15} />
          </button>
        </div>
      ) : null}
      {moveTarget ? (
        <MoveModal
          data={data}
          container={moveTarget}
          mutate={mutate}
          onClose={() => setMoveTarget(null)}
          onSaved={moved}
        />
      ) : null}
      {confirmation ? (
        <ConfirmOperation
          data={data}
          container={confirmation.container}
          kind={confirmation.kind}
          mutate={mutate}
          onClose={() => setConfirmation(null)}
          onSaved={confirmed}
        />
      ) : null}
    </div>
  );
}

function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark">
        <span />
        <span />
        <span />
        <span />
      </span>
      <span>
        <strong>YARDLINE</strong>
        <small>TERMINAL WORKSPACE</small>
      </span>
    </div>
  );
}
function Metrics({ data }: { data: Snapshot }) {
  const cards = [
    {
      label: 'Containers in yard',
      value: data.metrics.occupied,
      detail: `Across ${data.blocks.length} storage blocks`,
      icon: ContainerIcon,
      color: 'blue',
    },
    {
      label: 'Available positions',
      value: data.metrics.available,
      detail: `${data.metrics.assignable} ready for placement*`,
      icon: Grid2X2,
      color: 'green',
    },
    {
      label: 'Yard utilization',
      value: `${data.metrics.utilization}%`,
      detail: `${data.metrics.occupied} of ${data.metrics.usable} usable positions`,
      icon: Layers3,
      color: 'violet',
    },
    {
      label: 'Awaiting verification',
      value: data.metrics.attention,
      detail: 'Unverified or last checked over 24h ago',
      icon: ShieldCheck,
      color: 'amber',
    },
  ];
  return (
    <section className="metrics-grid" aria-label="Yard occupancy statistics">
      {cards.map((c) => (
        <div className="metric" key={c.label}>
          <div className="metric-top">
            <span>{c.label}</span>
            <span className={`metric-icon ${c.color}`}>
              <c.icon size={17} />
            </span>
          </div>
          <div className="metric-value">
            {c.value}
            {c.label === 'Yard utilization' ? (
              <div className="metric-progress">
                <i style={{ width: `${data.metrics.utilization}%` }} />
              </div>
            ) : null}
          </div>
          <p>{c.detail}</p>
        </div>
      ))}
    </section>
  );
}
function Overview({
  data,
  onLocate,
  onMap,
  onHistory,
}: {
  data: Snapshot;
  onLocate: (c: Container) => void;
  onMap: () => void;
  onHistory: () => void;
}) {
  const recent = data.movements.filter((m) => m.event_type !== 'arrival').slice(0, 6);
  return (
    <>
      <div className="overview-grid">
        <section className="panel overview-map yard-grid-theme">
          <div className="panel-heading">
            <div>
              <h2>Yard Layout</h2>
              <p>Recorded storage positions · Ground level · Tier 1</p>
            </div>
            <Button variant="ghost" onClick={onMap}>
              Open yard map
              <ArrowUpRight size={15} />
            </Button>
          </div>
          <div className="yard-map-surface" role="region" aria-label="Yard layout">
            <YardMap
              data={data}
              tier={1}
              blockId={null}
              selectedSlotId={null}
              onBlock={onMap}
              onSelect={(slot) => {
                const c = data.containers.find((c) => c.current_slot_id === slot.id);
                if (c) onLocate(c);
                else onMap();
              }}
              compact
              variant="readable"
            />
          </div>
          <Legend />
        </section>
        <section className="panel occupancy-panel">
          <div className="panel-heading">
            <div>
              <h2>Storage by block</h2>
            </div>
            <Layers3 size={17} />
          </div>
          <div className="occupancy-blocks">
            {data.blocks.map((block) => {
              const slots = data.slots.filter((s) => s.block_id === block.id),
                ids = new Set(slots.map((s) => s.id)),
                used = data.containers.filter(
                  (c) => c.current_slot_id && ids.has(c.current_slot_id),
                ).length,
                capacity = Math.min(
                  block.capacity_limit,
                  slots.filter((s) => s.status === 'available').length,
                ),
                percent = capacity ? Math.round((used / capacity) * 100) : 0;
              return (
                <div className="occupancy-block" key={block.id}>
                  <div>
                    <span className="block-code">{block.code}</span>
                    <strong>{block.name}</strong>
                    <span>{percent}%</span>
                  </div>
                  <div className="capacity-track">
                    <i style={{ width: `${percent}%` }} />
                  </div>
                  <p>
                    {used} occupied<span>{Math.max(0, capacity - used)} available</span>
                  </p>
                </div>
              );
            })}
          </div>
          <div className="occupancy-foot">
            <Info size={16} />
            <p>
              {data.metrics.reserved + data.metrics.blocked + data.metrics.restricted} unavailable
              positions excluded from usable capacity. Roads and loading areas are never counted.
            </p>
          </div>
        </section>
      </div>
      <section className="panel recent-panel">
        <div className="panel-heading">
          <div>
            <h2>Recent yard activity</h2>
            <p>From recorded operations, with a permanent movement history.</p>
          </div>
          <Button variant="ghost" onClick={onHistory}>
            View all activity
            <ArrowRight size={15} />
          </Button>
        </div>
        <MovementRows movements={recent} data={data} onLocate={onLocate} />
      </section>
      <section className="overview-attention-section" aria-labelledby="overview-review-heading">
        <div className="panel-heading">
          <div>
            <h2 id="overview-review-heading">A place for every container.</h2>
            <p>Confirm placements and keep recorded locations up to date.</p>
          </div>
        </div>
        <div className="overview-attention">
          <div className="panel">
            <span className="overview-eyebrow">Placement queue</span>
            <h3>
              <ContainerIcon size={18} />
              Awaiting placement <Badge tone="amber">{data.metrics.unassigned}</Badge>
            </h3>
            {data.containers
              .filter((c) => c.status === 'unassigned')
              .slice(0, 4)
              .map((c) => (
                <button className="attention-row" onClick={() => onLocate(c)} key={c.id}>
                  <strong>{c.number}</strong>
                  <span>
                    {c.owner} · {c.size} ft
                  </span>
                  <ArrowUpRight size={15} />
                </button>
              ))}
          </div>
          <div className="panel">
            <span className="overview-eyebrow">Location review</span>
            <h3>
              <ShieldCheck size={18} />
              Location checks <Badge tone="amber">{data.metrics.attention}</Badge>
            </h3>
            {data.containers
              .filter(
                (c) =>
                  c.status === 'stored' &&
                  (!c.verified_at ||
                    new Date(data.generatedAt).getTime() - new Date(c.verified_at).getTime() >
                      86400000),
              )
              .slice(0, 4)
              .map((c) => (
                <button className="attention-row" onClick={() => onLocate(c)} key={c.id}>
                  <strong>{c.number}</strong>
                  <span>{relative(c.verified_at)}</span>
                  <ArrowUpRight size={15} />
                </button>
              ))}
          </div>
        </div>
      </section>
    </>
  );
}
function ContainerTable({
  data,
  onLocate,
  onMove,
}: {
  data: Snapshot;
  onLocate: (c: Container) => void;
  onMove: (c: Container) => void;
}) {
  const [query, setQuery] = useState(''),
    [status, setStatus] = useState('active'),
    [owner, setOwner] = useState(''),
    [block, setBlock] = useState(''),
    [page, setPage] = useState(0);
  const blockSlotIds = new Set(data.slots.filter((s) => s.block_id === block).map((s) => s.id));
  const filtered = data.containers.filter(
    (c) =>
      (status === 'all' ||
        (status === 'active' && c.status !== 'dispatched') ||
        c.status === status) &&
      (!owner || c.owner === owner) &&
      (!block || (!!c.current_slot_id && blockSlotIds.has(c.current_slot_id))) &&
      [c.number, c.owner, c.location_code ?? '']
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 12)),
    currentPage = Math.min(page, pages - 1),
    shown = filtered.slice(currentPage * 12, currentPage * 12 + 12);
  return (
    <section className="panel inventory-panel">
      <div className="panel-heading">
        <div>
          <h2>
            Container register <Badge>{filtered.length}</Badge>
          </h2>
          <p>Recorded identities and their confirmed storage positions.</p>
        </div>
        <Button
          variant="secondary"
          onClick={() =>
            exportCsv(
              'yardline-containers.csv',
              [
                'Container',
                'Size (ft)',
                'Type',
                'Shipping line',
                'Status',
                'Location',
                'Verified at',
                'Notes',
              ],
              filtered.map((c) => [
                c.number,
                c.size,
                c.type,
                c.owner,
                c.status,
                c.location_code,
                c.verified_at,
                c.notes,
              ]),
            )
          }
        >
          <ArrowDownToLine size={15} />
          Export CSV
        </Button>
      </div>
      <div className="table-toolbar">
        <div className="inline-search">
          <Search size={16} />
          <input
            aria-label="Filter container inventory"
            placeholder="Find container or location…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <select
          aria-label="Filter container status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
        >
          <option value="active">In yard</option>
          <option value="all">All statuses</option>
          <option value="stored">Stored</option>
          <option value="unassigned">Unassigned</option>
          <option value="dispatched">Dispatched</option>
        </select>
        <select
          aria-label="Filter shipping line"
          value={owner}
          onChange={(e) => {
            setOwner(e.target.value);
            setPage(0);
          }}
        >
          <option value="">All shipping lines</option>
          {[...new Set(data.containers.map((c) => c.owner).filter(Boolean))].sort().map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <select
          aria-label="Filter storage block"
          value={block}
          onChange={(e) => {
            setBlock(e.target.value);
            setPage(0);
          }}
        >
          <option value="">All blocks</option>
          {data.blocks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.code}
            </option>
          ))}
        </select>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Container number</th>
              <th>Size / type</th>
              <th>Shipping line</th>
              <th>Recorded location</th>
              <th>Status</th>
              <th>Last verified</th>
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((c) => (
              <tr key={c.id}>
                <td>
                  <button className="table-id" onClick={() => onLocate(c)}>
                    <ContainerIcon size={16} />
                    {c.number}
                  </button>
                </td>
                <td>
                  {c.size} ft <span className="cell-secondary">{c.type}</span>
                </td>
                <td>{c.owner || '—'}</td>
                <td>
                  <button
                    className={`location-link ${c.current_slot_id ? '' : 'muted'}`}
                    onClick={() => onLocate(c)}
                  >
                    {c.location_code ?? (c.status === 'dispatched' ? 'Dispatched' : 'Unassigned')}
                    {c.current_slot_id ? <ArrowUpRight size={12} /> : null}
                  </button>
                </td>
                <td>
                  <Badge
                    tone={
                      c.status === 'stored'
                        ? 'blue'
                        : c.status === 'unassigned'
                          ? 'amber'
                          : 'neutral'
                    }
                  >
                    {c.status}
                  </Badge>
                </td>
                <td>
                  <span className={c.status === 'stored' && !c.verified_at ? 'attention-text' : ''}>
                    {c.status === 'dispatched' ? '—' : relative(c.verified_at)}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button
                      className="icon-button"
                      aria-label={`Locate ${c.number}`}
                      onClick={() => onLocate(c)}
                    >
                      <MapPin size={16} />
                    </button>
                    {data.actor.role !== 'viewer' && c.status !== 'dispatched' ? (
                      <button
                        className="icon-button"
                        aria-label={`Move ${c.number}`}
                        onClick={() => onMove(c)}
                      >
                        <ArrowLeftRight size={16} />
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!shown.length ? (
        <Empty heading="No containers match these filters">
          Adjust the search or filters to see other records.
        </Empty>
      ) : null}
      <Pagination
        page={currentPage}
        pages={pages}
        count={filtered.length}
        pageSize={12}
        onPage={setPage}
      />
    </section>
  );
}
function HistoryTable({ data, onLocate }: { data: Snapshot; onLocate: (c: Container) => void }) {
  const [query, setQuery] = useState(''),
    [type, setType] = useState('all'),
    [page, setPage] = useState(0);
  const filtered = data.movements.filter(
    (m) =>
      (type === 'all' || m.event_type === type) &&
      [m.container_number, m.from_code ?? '', m.to_code ?? '', m.actor_name, m.notes]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 12)),
    current = Math.min(page, pages - 1);
  return (
    <section className="panel history-panel">
      <div className="panel-heading">
        <div>
          <h2>
            Movement log <Badge>{filtered.length}</Badge>
          </h2>
          <p>Every successful location change is saved with its responsible user.</p>
        </div>
        <Button
          variant="secondary"
          onClick={() =>
            exportCsv(
              'yardline-movements.csv',
              ['Timestamp', 'Container', 'Event', 'From', 'To', 'Operator', 'Notes'],
              filtered.map((m) => [
                m.occurred_at,
                m.container_number,
                m.event_type,
                m.from_code,
                m.to_code,
                m.actor_name,
                m.notes,
              ]),
            )
          }
        >
          <ArrowDownToLine size={15} />
          Export CSV
        </Button>
      </div>
      <div className="table-toolbar">
        <div className="inline-search">
          <Search size={16} />
          <input
            aria-label="Search movement history"
            placeholder="Search container, position or operator…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
          />
        </div>
        <select
          aria-label="Filter movement type"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(0);
          }}
        >
          <option value="all">All event types</option>
          {['arrival', 'placement', 'relocation', 'dispatch', 'verification'].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <MovementRows
        movements={filtered.slice(current * 12, current * 12 + 12)}
        data={data}
        onLocate={onLocate}
        showNotes
      />
      {!filtered.length ? (
        <Empty heading="No movement records found">
          Try another container number or event type.
        </Empty>
      ) : null}
      <Pagination
        page={current}
        pages={pages}
        count={filtered.length}
        pageSize={12}
        onPage={setPage}
      />
    </section>
  );
}
function MovementRows({
  movements,
  data,
  onLocate,
  showNotes = false,
}: {
  movements: Movement[];
  data: Snapshot;
  onLocate: (c: Container) => void;
  showNotes?: boolean;
}) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Container</th>
            <th>Event</th>
            <th>From</th>
            <th>To</th>
            <th>Recorded at</th>
            <th>Operator</th>
            {showNotes ? <th>Notes</th> : null}
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => (
            <tr key={m.id}>
              <td>
                <button
                  className="table-id"
                  onClick={() => {
                    const c = data.containers.find((c) => c.id === m.container_id);
                    if (c) onLocate(c);
                  }}
                >
                  {m.container_number}
                </button>
              </td>
              <td>
                <Badge
                  tone={
                    m.event_type === 'dispatch'
                      ? 'neutral'
                      : m.event_type === 'verification'
                        ? 'green'
                        : m.event_type === 'relocation'
                          ? 'violet'
                          : 'blue'
                  }
                >
                  {m.event_type}
                </Badge>
              </td>
              <td className="mono location-cell">
                {m.from_code ?? (m.event_type === 'arrival' ? 'Outside yard' : 'Unassigned')}
              </td>
              <td className="mono location-cell">
                {m.to_code ?? (m.event_type === 'dispatch' ? 'Outside yard' : 'Unassigned')}
              </td>
              <td className="nowrap">{time(m.occurred_at, true)}</td>
              <td className="nowrap">{m.actor_name}</td>
              {showNotes ? <td className="notes-cell">{m.notes || '—'}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Pagination({
  page,
  pages,
  count,
  pageSize,
  onPage,
}: {
  page: number;
  pages: number;
  count: number;
  pageSize: number;
  onPage: (p: number) => void;
}) {
  return (
    <div className="pagination">
      <span>
        {count
          ? `${page * pageSize + 1}–${Math.min((page + 1) * pageSize, count)} of ${count} records`
          : '0 records'}
      </span>
      <div>
        <Button
          variant="secondary"
          disabled={!page}
          aria-label="Previous page"
          onClick={() => onPage(page - 1)}
        >
          <ChevronLeft size={15} />
        </Button>
        <span>
          Page {page + 1} of {pages}
        </span>
        <Button
          variant="secondary"
          disabled={page >= pages - 1}
          aria-label="Next page"
          onClick={() => onPage(page + 1)}
        >
          <ChevronRight size={15} />
        </Button>
      </div>
    </div>
  );
}
function Settings({
  data,
  onReload,
  onNotify,
}: {
  data: Snapshot;
  onReload: () => void;
  onNotify: (s: string) => void;
}) {
  const [role, setRole] = useState(data.actor.role),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function switchRole() {
    setBusy(true);
    try {
      await api('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      onReload();
      onNotify(`Demo session changed to ${role}. Server permissions apply.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not change role.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="settings-layout">
      <section className="panel settings-panel">
        <div className="panel-heading">
          <h2>Workspace connection</h2>
          <Badge tone="green">Database connected</Badge>
        </div>
        <dl className="settings-data">
          <div>
            <dt>Storage adapter</dt>
            <dd>
              {data.persistence === 'sqlite'
                ? 'SQLite · persistent local file'
                : 'PostgreSQL · server connection'}
            </dd>
          </div>
          <div>
            <dt>Authentication</dt>
            <dd>
              {data.authMode === 'demo' ? 'Demo sessions · switchable roles' : 'Supabase Auth'}
            </dd>
          </div>
          <div>
            <dt>Workspace</dt>
            <dd>
              {data.yard.name} / {data.yard.code}
            </dd>
          </div>
          <div>
            <dt>Dataset</dt>
            <dd>
              {data.yard.is_demo ? 'Seeded demonstration records' : 'Operator-managed records'}
            </dd>
          </div>
          <div>
            <dt>Current user</dt>
            <dd>
              {data.actor.name} · {data.actor.role}
            </dd>
          </div>
          <div>
            <dt>Location source</dt>
            <dd>Operator-confirmed physical placement</dd>
          </div>
        </dl>
        <div className="inline-notice">
          <Info size={17} />
          <span>
            There are no GPS devices, RFID readers, tags, sensors, or physical yard modifications. A
            smartphone photograph helps identify the container; its location is confirmed by a
            person.
          </span>
        </div>
      </section>
      <section className="panel settings-panel">
        <div className="panel-heading">
          <h2>{data.authMode === 'demo' ? 'Explore the role model' : 'Your account'}</h2>
          <ShieldCheck size={18} />
        </div>
        {data.authMode === 'demo' ? (
          <div className="settings-body">
            <p>
              The demo has no passwords. Anyone with access to this instance can switch roles. This
              is a presentation workspace, and is unsuitable for public operational use.
            </p>
            {error ? <div className="inline-notice error">{error}</div> : null}
            <Field label="Demo session role">
              <select value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
                <option value="administrator">Administrator · configure and operate</option>
                <option value="operator">Operator · register, move, dispatch</option>
                <option value="viewer">Viewer · search and inspect only</option>
              </select>
            </Field>
            <Button busy={busy} onClick={() => void switchRole()}>
              Apply demo role
              <ArrowRight size={16} />
            </Button>
            <div className="role-descriptions">
              <p>
                <strong>Administrator</strong>Yard configuration and all container operations.
              </p>
              <p>
                <strong>Operator</strong>Register, assign, relocate, verify, and dispatch.
              </p>
              <p>
                <strong>Viewer</strong>Search, map, inventory, metrics, and history.
              </p>
            </div>
          </div>
        ) : (
          <div className="settings-body">
            <p>
              Yard permissions are checked by the server against your membership for each operation.
            </p>
            <Button
              variant="secondary"
              onClick={async () => {
                await authClient()?.auth.signOut();
                window.location.reload();
              }}
            >
              <LogOut size={16} />
              Sign out
            </Button>
          </div>
        )}
      </section>
      <section className="panel settings-panel full-span">
        <div className="panel-heading">
          <h2>Operational notes</h2>
          <Info size={17} />
        </div>
        <div className="settings-body operational-notes">
          <p>
            <strong>Recorded, rather than continuously tracked.</strong> A location is only as
            current as the last operator update. Amber dots identify stored containers whose
            location needs verification.
          </p>
          <p>
            <strong>Stacking follows a simple rule.</strong> Every lower tier must be filled with a
            container of the same length. Remove upper containers before moving a lower one. Each
            position holds one container up to its configured length.
          </p>
          <p>
            <strong>*Ready positions are a planning aid.</strong> Placement also depends on
            container length, block capacity, and stack accessibility. The server validates the
            chosen destination before committing.
          </p>
          <p>
            <strong>OCR is optional.</strong> Recognition runs in the browser using Tesseract. Its
            engine and English model are served by this application. Manual entry always works; no
            recognition result is saved without human review.
          </p>
        </div>
      </section>
    </div>
  );
}
function Login({ onSignedIn }: { onSignedIn: () => void }) {
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function signIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.currentTarget);
    try {
      const result = await authClient()!.auth.signInWithPassword({
        email: String(form.get('email')),
        password: String(form.get('password')),
      });
      if (result.error) throw result.error;
      onSignedIn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="login-form" onSubmit={signIn}>
      <Field label="Email">
        <input name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Password">
        <input name="password" type="password" autoComplete="current-password" required />
      </Field>
      {error ? (
        <p role="alert" className="danger-text">
          {error}
        </p>
      ) : null}
      <Button busy={busy}>Sign in to your yard</Button>
    </form>
  );
}
