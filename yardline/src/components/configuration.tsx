'use client';
import { useState, type FormEvent } from 'react';
import { CheckCircle2, Grid2X2, Info, MapPin, Route, Settings2 } from 'lucide-react';
import type { Snapshot } from '@/lib/types';
import { Badge, Button, Field } from './ui';
import type { Mutate } from './workflows';
export function Configuration({
  data,
  mutate,
  onSaved,
}: {
  data: Snapshot;
  mutate: Mutate;
  onSaved: (state: Snapshot) => void;
}) {
  const [tab, setTab] = useState('block'),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [error, setError] = useState('');
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    const form = new FormData(e.currentTarget);
    const p: Record<string, unknown> = Object.fromEntries(form.entries());
    p.yardId = data.yard.id;
    try {
      const action =
        tab === 'block'
          ? 'generate-block'
          : tab === 'zone'
            ? 'create-zone'
            : tab === 'new'
              ? 'create-yard'
              : 'update-yard';
      if (tab === 'plot' || tab === 'new') {
        try {
          p.boundary = JSON.parse(String(p.boundary || '[]'));
        } catch {
          throw new Error('Boundary must be a JSON array, e.g. [[0,0],[240,0],[240,180],[0,180]].');
        }
      }
      if (tab === 'block') {
        if (p.rowBayCounts) {
          p.rowBayCounts = String(p.rowBayCounts).split(',').map(Number);
        } else delete p.rowBayCounts;
        if (!p.capacityLimit) delete p.capacityLimit;
      }
      const result = await mutate(action, p);
      onSaved(result.state);
      setMessage(
        tab === 'block'
          ? `Block ${p.code} generated. All location IDs have been saved to the database.`
          : 'Configuration saved. Existing assignments and location IDs are preserved.',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Configuration failed.');
    } finally {
      setBusy(false);
    }
  }
  if (data.actor.role !== 'administrator')
    return (
      <div className="panel permission-empty">
        <Settings2 size={28} />
        <h2>Administrator access required</h2>
        <p>Your current role can view the yard but cannot change its layout.</p>
      </div>
    );
  return (
    <div className="config-layout">
      <section className="panel config-panel">
        <div className="tabs">
          {[
            ['block', 'Generate block'],
            ['plot', 'Edit plot'],
            ['zone', 'Non-storage area'],
            ['new', 'New yard'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => {
                setTab(id);
                setError('');
                setMessage('');
              }}
              className={tab === id ? 'active' : ''}
            >
              {label}
            </button>
          ))}
        </div>
        <form key={`${tab}-${data.yard.id}`} onSubmit={submit} className="config-form">
          {error ? (
            <div className="inline-notice error" role="alert">
              {error}
            </div>
          ) : null}
          {message ? (
            <div className="inline-notice success" role="status">
              <CheckCircle2 size={17} />
              {message}
            </div>
          ) : null}
          {tab === 'block' ? (
            <>
              <div className="section-number">
                LAYOUT GENERATOR <span>STABLE IDS, CREATED ON THE SERVER</span>
              </div>
              <h2>Generate storage block</h2>
              <p className="muted">
                Define the layout once. Rows, bays, and tiers are persisted together.
              </p>
              <div className="form-row">
                <Field label="Block code">
                  <input
                    name="code"
                    placeholder="B04"
                    pattern="[A-Za-z][A-Za-z0-9]{1,7}"
                    required
                    maxLength={8}
                  />
                </Field>
                <Field label="Block name">
                  <input name="name" placeholder="Receiving storage" required maxLength={80} />
                </Field>
              </div>
              <div className="form-row three">
                <Field label="Rows">
                  <input name="rows" type="number" min={1} max={20} defaultValue={4} required />
                </Field>
                <Field label="Bays per row">
                  <input name="bays" type="number" min={1} max={30} defaultValue={9} required />
                </Field>
                <Field label="Stack tiers">
                  <input name="tiers" type="number" min={1} max={6} defaultValue={3} required />
                </Field>
              </div>
              <Field
                label="Different bays per row (optional)"
                hint="A comma-separated count for each row. Overrides bays per row."
              >
                <input name="rowBayCounts" placeholder="9, 9, 7, 5" />
              </Field>
              <div className="form-row four">
                <Field label="X position (m)">
                  <input name="x" type="number" min={0} step="any" defaultValue={12} required />
                </Field>
                <Field label="Y position (m)">
                  <input name="y" type="number" min={0} step="any" defaultValue={12} required />
                </Field>
                <Field label="Width (m)">
                  <input
                    name="width"
                    type="number"
                    min={10}
                    step="any"
                    defaultValue={160}
                    required
                  />
                </Field>
                <Field label="Depth (m)">
                  <input
                    name="height"
                    type="number"
                    min={10}
                    step="any"
                    defaultValue={36}
                    required
                  />
                </Field>
              </div>
              <div className="form-row">
                <Field label="Max container length">
                  <select name="maxSize" defaultValue={40}>
                    <option value={20}>20 ft</option>
                    <option value={40}>40 ft</option>
                    <option value={45}>45 ft</option>
                  </select>
                </Field>
                <Field
                  label="Capacity limit (optional)"
                  hint="Defaults to the generated number of positions."
                >
                  <input
                    name="capacityLimit"
                    type="number"
                    min={1}
                    placeholder="All generated positions"
                  />
                </Field>
              </div>
              <div className="inline-notice">
                <Info size={17} />
                New blocks must fit inside the yard and cannot overlap storage blocks, roads, or
                restricted areas.
              </div>
              <Button busy={busy}>
                <Grid2X2 size={16} />
                Generate storage positions
              </Button>
            </>
          ) : null}
          {tab === 'plot' || tab === 'new' ? (
            <>
              <div className="section-number">
                {tab === 'new' ? 'YARD SETUP' : 'PLOT CONFIGURATION'}
              </div>
              <h2>
                {tab === 'new'
                  ? 'Create a yard that fits the site.'
                  : 'A layout that follows your yard.'}
              </h2>
              <p className="muted">
                Local coordinates work independently of geographic maps or internet services.
              </p>
              {tab === 'new' ? (
                <Field label="Unique yard code">
                  <input
                    name="code"
                    placeholder="YD02"
                    pattern="[A-Za-z][A-Za-z0-9]{1,7}"
                    required
                    maxLength={8}
                  />
                </Field>
              ) : (
                <div className="inline-notice">
                  <Info size={16} />
                  Yard code {data.yard.code} is stable. Existing location IDs will be preserved.
                </div>
              )}
              <Field label="Yard name">
                <input
                  name="name"
                  defaultValue={tab === 'plot' ? data.yard.name : ''}
                  placeholder="East Yard"
                  required
                  minLength={2}
                  maxLength={80}
                />
              </Field>
              <div className="form-row">
                <Field label="Plot width (m)">
                  <input
                    name="width"
                    type="number"
                    min={20}
                    max={2000}
                    defaultValue={tab === 'plot' ? data.yard.width : 240}
                    required
                  />
                </Field>
                <Field label="Plot depth (m)">
                  <input
                    name="height"
                    type="number"
                    min={20}
                    max={2000}
                    defaultValue={tab === 'plot' ? data.yard.height : 180}
                    required
                  />
                </Field>
              </div>
              <Field
                label="Boundary points (optional)"
                hint="JSON coordinates [x,y], in order. Leave [] for a rectangle. Existing storage areas must fit inside the edited plot."
              >
                <textarea
                  name="boundary"
                  rows={4}
                  className="mono"
                  defaultValue={tab === 'plot' ? data.yard.boundary : '[]'}
                />
              </Field>
              <Button busy={busy}>
                <MapPin size={16} />
                {tab === 'new' ? 'Create yard' : 'Save plot configuration'}
              </Button>
            </>
          ) : null}
          {tab === 'zone' ? (
            <>
              <div className="section-number">NON-STORAGE AREA</div>
              <h2>Configure non-storage area</h2>
              <p className="muted">Roads and loading areas never contribute to storage capacity.</p>
              <Field label="Area label">
                <input
                  name="label"
                  placeholder="East access road"
                  minLength={2}
                  maxLength={70}
                  required
                />
              </Field>
              <Field label="Area type">
                <select name="kind">
                  <option value="road">Access road</option>
                  <option value="loading">Loading area</option>
                  <option value="restricted">Restricted zone</option>
                </select>
              </Field>
              <div className="form-row four">
                <Field label="X position (m)">
                  <input name="x" type="number" min={0} step="any" required />
                </Field>
                <Field label="Y position (m)">
                  <input name="y" type="number" min={0} step="any" required />
                </Field>
                <Field label="Width (m)">
                  <input name="width" type="number" min={1} step="any" required />
                </Field>
                <Field label="Depth (m)">
                  <input name="height" type="number" min={1} step="any" required />
                </Field>
              </div>
              <Button busy={busy}>
                <Route size={16} />
                Create non-storage area
              </Button>
            </>
          ) : null}
        </form>
      </section>
      <aside className="config-aside">
        <section className="panel">
          <div className="panel-heading">
            <h2>Current layout</h2>
            <Badge>{data.yard.code}</Badge>
          </div>
          <div className="config-summary">
            <strong>{data.yard.name}</strong>
            <p>
              {data.yard.width} × {data.yard.height} m · {data.slots.length} generated positions
            </p>
          </div>
          {data.blocks.map((b) => (
            <div className="config-block" key={b.id}>
              <span className="block-code">{b.code}</span>
              <div>
                <strong>{b.name}</strong>
                <p>
                  {data.rows.filter((r) => r.block_id === b.id).length} rows · {b.max_tiers} tiers ·
                  limit {b.capacity_limit}
                </p>
              </div>
            </div>
          ))}
        </section>
        <div className="inline-notice">
          <Info size={18} />
          <span>
            To change an individual position’s availability, select an empty slot on the Yard Map.
            Occupied positions cannot be blocked.
          </span>
        </div>
      </aside>
    </div>
  );
}
