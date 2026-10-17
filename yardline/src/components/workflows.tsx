'use client';
import { useRef, useState, type FormEvent } from 'react';
import Image from 'next/image';
import {
  ArrowRight,
  Camera,
  Container as ContainerIcon,
  ShieldCheck,
  CheckCircle2,
  Info,
  Layers3,
  MapPin,
  ScanLine,
  Upload,
  X,
} from 'lucide-react';
import type { Container, Snapshot } from '@/lib/types';
import { extractCandidates, identityStatus, normalizeNumber } from '@/lib/identity';
import { destinationProblem } from '@/lib/placement';
import { Badge, Button, Field, Modal } from './ui';
import { Legend, YardMap } from './yard-map';

export type Mutate = (
  action: string,
  payload: Record<string, unknown>,
) => Promise<{ state: Snapshot; entityId: string | null }>;
export function PositionPicker({
  data,
  value,
  onChange,
  size,
  moving,
}: {
  data: Snapshot;
  value: string | null;
  onChange: (id: string | null) => void;
  size: number;
  moving?: Container;
}) {
  const selected = data.slots.find((s) => s.id === value);
  const [block, setBlock] = useState<string | null>(selected?.block_id ?? null),
    [tier, setTier] = useState(selected?.tier ?? 1);
  const problem = selected ? destinationProblem(data, selected, size, moving) : null;
  return (
    <div className="position-picker">
      <div className="picker-toolbar">
        <Field label="Block">
          <select value={block ?? ''} onChange={(e) => setBlock(e.target.value || null)}>
            <option value="">All storage blocks</option>
            {data.blocks.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code} · {b.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tier">
          <select value={tier} onChange={(e) => setTier(Number(e.target.value))}>
            {Array.from({ length: Math.max(1, ...data.blocks.map((b) => b.max_tiers)) }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                Tier {i + 1}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <YardMap
        data={data}
        tier={tier}
        blockId={block}
        selectedSlotId={value}
        onBlock={setBlock}
        onSelect={(s) => onChange(s.id)}
        pickMode
      />
      <Legend />
      {selected ? (
        <div className={`destination-selection ${problem ? 'invalid' : 'valid'}`}>
          {problem ? <Info size={17} /> : <CheckCircle2 size={17} />}
          <div>
            <strong>{selected.code}</strong>
            <span>
              {problem ?? 'Available and stack valid. Confirm this is the physical destination.'}
            </span>
          </div>
          <button
            className="icon-button"
            onClick={() => onChange(null)}
            aria-label="Clear destination"
            type="button"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="picker-help">
          <MapPin size={16} />
          Select a slot on the map. Upper tiers require supporting containers.
        </div>
      )}
    </div>
  );
}

export function RegisterForm({
  data,
  mutate,
  preferredSlot,
  onRegistered,
}: {
  data: Snapshot;
  mutate: Mutate;
  preferredSlot?: string | null;
  onRegistered: (id: string, state: Snapshot) => void;
}) {
  const [number, setNumber] = useState(''),
    [size, setSize] = useState(40),
    [type, setType] = useState('High cube'),
    [owner, setOwner] = useState(''),
    [notes, setNotes] = useState('');
  const [slotId, setSlotId] = useState<string | null>(preferredSlot ?? null),
    [identityConfirmed, setIdentityConfirmed] = useState(false),
    [physicalConfirmed, setPhysicalConfirmed] = useState(false),
    [exception, setException] = useState(false);
  const [photo, setPhoto] = useState<string>(),
    [ocrStatus, setOcrStatus] = useState(''),
    [rawText, setRawText] = useState(''),
    [ocrBusy, setOcrBusy] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [step, setStep] = useState(1);
  const [intakeBlock, setIntakeBlock] = useState<string | null>(
    data.slots.find((s) => s.id === preferredSlot)?.block_id ?? data.blocks[0]?.id ?? null,
  );
  const [intakeTier, setIntakeTier] = useState(
    data.slots.find((s) => s.id === preferredSlot)?.tier ?? 1,
  );
  const placementRef = useRef<HTMLElement>(null);
  const upload = useRef<HTMLInputElement>(null),
    camera = useRef<HTMLInputElement>(null);
  const identity = identityStatus(number),
    selected = data.slots.find((s) => s.id === slotId),
    problem = selected ? destinationProblem(data, selected, size) : null;
  async function loadPhoto(file?: File) {
    if (!file) return;
    setError('');
    setRawText('');
    setOcrStatus('Photo ready. Run OCR, then review the number.');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPEG, PNG, or WebP photograph.');
      return;
    }
    if (file.size > 20_000_000) {
      setError('Choose a photograph smaller than 20 MB.');
      return;
    }
    try {
      const bitmap = await createImageBitmap(file),
        scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width * scale;
      canvas.height = bitmap.height * scale;
      canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const source = canvas.toDataURL('image/jpeg', 0.82);
      if (source.length > 2_800_000)
        throw new Error('The compressed image is too large. Try a closer crop.');
      setPhoto(source);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Unable to read this photograph. Use manual entry.',
      );
    }
  }
  async function recognize() {
    if (!photo) return;
    setOcrBusy(true);
    setOcrStatus('Loading OCR engine and English language data…');
    setError('');
    let worker: Awaited<ReturnType<(typeof import('tesseract.js'))['createWorker']>> | undefined;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    let initializing:
      Promise<Awaited<ReturnType<(typeof import('tesseract.js'))['createWorker']>>> | undefined;
    try {
      const { createWorker } = await import('tesseract.js');
      let rejectOcr: (reason: Error) => void = () => {};
      const failure = new Promise<never>((_, reject) => {
        rejectOcr = reject;
        timeout = setTimeout(() => reject(new Error('OCR timed out.')), 45000);
      });
      initializing = createWorker('eng', 1, {
        workerPath: '/ocr/worker.min.js',
        corePath: '/ocr/core',
        langPath: '/ocr/lang',
        workerBlobURL: false,
        errorHandler: (error) => rejectOcr(new Error(String(error))),
        logger: (m) => {
          if (m.status === 'recognizing text')
            setOcrStatus(`Reading photograph… ${Math.round(m.progress * 100)}%`);
        },
      });
      initializing
        .then((created) => {
          if (cancelled) void created.terminate();
        })
        .catch(() => {});
      worker = await Promise.race([initializing, failure]);
      const { data: result } = await Promise.race([worker.recognize(photo), failure]);
      setRawText(result.text);
      const candidates = extractCandidates(result.text);
      if (candidates.length) {
        setNumber(candidates[0]);
        setIdentityConfirmed(false);
        setOcrStatus(
          `${candidates.length} candidate${candidates.length === 1 ? '' : 's'} found · OCR confidence ${Math.round(result.confidence)}%. Review and correct before saving.`,
        );
      } else
        setOcrStatus('No container number recognized. Enter it manually using the photograph.');
    } catch {
      setOcrStatus(
        'OCR could not read this photograph or load its local model. Try a clearer crop or enter the number manually.',
      );
    } finally {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
      await worker?.terminate();
      setOcrBusy(false);
    }
  }
  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!number || (!identity.valid && !exception) || !identityConfirmed || ocrBusy) {
      setError('Review the container number and confirm its identity before continuing.');
      return;
    }
    if (step === 1) {
      setStep(2);
      return;
    }
    if (problem || (slotId && !physicalConfirmed)) {
      setError(problem ?? 'Confirm the physical destination before registering.');
      return;
    }
    setBusy(true);
    try {
      const result = await mutate('register', {
        yardId: data.yard.id,
        number,
        size,
        type,
        owner,
        notes,
        slotId,
        physicalConfirmed,
        allowException: exception,
        photo,
      });
      onRegistered(result.entityId!, result.state);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed.');
    } finally {
      setBusy(false);
    }
  }
  if (data.actor.role === 'viewer')
    return (
      <div className="panel permission-empty">
        <Info size={24} />
        <h2>Registration requires an operator role</h2>
        <p>
          You can search containers and inspect the yard. Ask an administrator to update your
          access.
        </p>
      </div>
    );
  const intakeRows = data.rows.filter((r) => r.block_id === intakeBlock);
  const intakeBays = data.bays.filter((b) => b.row_id === selected?.row_id);
  const selectDestination = (id: string | null) => {
    setSlotId(id);
    setPhysicalConfirmed(false);
    const destination = data.slots.find((s) => s.id === id);
    if (destination) {
      setIntakeBlock(destination.block_id);
      setIntakeTier(destination.tier);
    }
  };
  const selectCoordinate = (
    block: string | null,
    row: string | null,
    bay: string | null,
    tier: number,
  ) => {
    setIntakeBlock(block);
    setIntakeTier(tier);
    selectDestination(
      data.slots.find(
        (s) => s.block_id === block && s.row_id === row && s.bay_id === bay && s.tier === tier,
      )?.id ?? null,
    );
  };
  const equipment = [
    { code: '40HC', label: 'High cube dry', size: 40, type: 'High cube' },
    { code: '20GP', label: 'Standard dry', size: 20, type: 'Dry' },
    { code: '40HR', label: 'Refrigerated', size: 40, type: 'Reefer' },
    { code: '40OT', label: 'Open top', size: 40, type: 'Open top' },
    { code: '20TK', label: 'Tank ISO', size: 20, type: 'Tank' },
  ];
  return (
    <form onSubmit={submit} className="registration-form intake-workspace">
      {error ? (
        <div role="alert" className="inline-notice error full-span">
          {error}
        </div>
      ) : null}
      <div className="intake-main">
        <section className="panel intake-section">
          <div className="intake-section-heading">
            <h2>
              <span className="intake-number">1</span>Container Identification &amp; ISO Spec
            </h2>
            <span className="mono">ISO 6346</span>
          </div>
          <div className="intake-section-body">
            <div className="identity-input-heading">
              <span className="intake-label">Prefix · Serial · Check digit</span>
              {number ? (
                <Badge tone={identity.valid ? 'blue' : 'amber'}>
                  {identity.valid ? 'Checksum valid' : 'Review identity'}
                </Badge>
              ) : null}
            </div>
            <Field
              label="Container number"
              hint={number ? identity.message : 'ISO 6346 · e.g. MSCU1234566'}
            >
              <input
                required
                value={number}
                onChange={(e) => {
                  setNumber(normalizeNumber(e.target.value));
                  setIdentityConfirmed(false);
                }}
                placeholder="MSCU1234566"
                maxLength={25}
                className="container-number-input"
                spellCheck={false}
                autoCapitalize="characters"
                aria-invalid={number.length > 0 && !identity.valid && !exception}
              />
            </Field>
            {data.actor.role === 'administrator' && !identity.valid && number ? (
              <label className="checkbox-label exception">
                <input
                  type="checkbox"
                  checked={exception}
                  onChange={(e) => setException(e.target.checked)}
                />
                <span>Save as an administrator exception. Identity remains unverified.</span>
              </label>
            ) : null}
            <div className="intake-ocr">
              <div className="intake-subheading">
                <Camera size={15} />
                <strong>Photo-assisted identification</strong>
                <span>OPTIONAL</span>
              </div>
              <input
                ref={upload}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                aria-label="Upload container photograph"
                onChange={(e) => void loadPhoto(e.target.files?.[0])}
              />
              <input
                ref={camera}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                aria-label="Take container photograph"
                onChange={(e) => void loadPhoto(e.target.files?.[0])}
              />
              <div className="intake-photo-grid">
                {photo ? (
                  <div className="source-photo">
                    <Image
                      src={photo}
                      width={720}
                      height={420}
                      alt="Source photograph for container identification"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="intake-photo-empty">
                    <ScanLine size={28} />
                    <span>Upload or capture an ID photo</span>
                    <small>JPEG, PNG, WebP · max 20 MB</small>
                  </div>
                )}
                <div className="intake-photo-controls">
                  <div className="photo-actions">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => camera.current?.click()}
                    >
                      <Camera size={14} />
                      Take photo
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => upload.current?.click()}
                    >
                      <Upload size={14} />
                      Upload image
                    </Button>
                  </div>
                  {photo ? (
                    <Button
                      type="button"
                      variant="secondary"
                      busy={ocrBusy}
                      onClick={() => void recognize()}
                    >
                      <ScanLine size={14} />
                      Run OCR recognition
                    </Button>
                  ) : null}
                  <div className="intake-photo-warning">
                    <Info size={14} />
                    <span>
                      Review and correct the suggested number. Physical confirmation is required.
                    </span>
                  </div>
                </div>
              </div>
              {ocrStatus ? (
                <p className="ocr-status" role="status">
                  {ocrStatus}
                </p>
              ) : null}
              {rawText ? (
                <details className="ocr-raw">
                  <summary>View recognized source text</summary>
                  <pre>{rawText}</pre>
                </details>
              ) : null}
            </div>
            <div className="equipment-selector">
              <span className="intake-label">ISO equipment type &amp; form factor</span>
              <div className="equipment-presets" role="group" aria-label="Equipment presets">
                {equipment.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    aria-pressed={size === item.size && type === item.type}
                    onClick={() => {
                      setSize(item.size);
                      setType(item.type);
                    }}
                  >
                    <strong>{item.code}</strong>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="form-row">
              <Field label="Length">
                <select value={size} onChange={(e) => setSize(Number(e.target.value))}>
                  <option value={20}>20 ft</option>
                  <option value={40}>40 ft</option>
                  <option value={45}>45 ft</option>
                </select>
              </Field>
              <Field label="Container type">
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  {[
                    'Dry',
                    'High cube',
                    'Reefer',
                    'Open top',
                    'Flat rack',
                    'Tank',
                    'Empty',
                    'Other',
                  ].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
            </div>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={identityConfirmed}
                onChange={(e) => setIdentityConfirmed(e.target.checked)}
              />
              <span>
                I have checked the container number against the physical container or source record.
              </span>
            </label>
          </div>
        </section>
        <section className="panel intake-section">
          <div className="intake-section-heading">
            <h2>
              <span className="intake-number">2</span>Ingate Logistics &amp; Carrier Manifest
            </h2>
          </div>
          <div className="intake-section-body">
            <div className="form-row">
              <Field label="Shipping line / owner (optional)">
                <input
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="e.g. Mediterranean Shipping Company"
                  maxLength={80}
                />
              </Field>
              <div className="intake-readout">
                <span className="intake-label">Arrival timestamp</span>
                <strong>Recorded on save</strong>
                <small>Server-confirmed registration time</small>
              </div>
            </div>
            <Field label="Notes (optional)">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Condition, handover reference, or handling information"
                rows={3}
                maxLength={1500}
              />
            </Field>
            {step === 1 ? (
              <div className="form-actions">
                <Button
                  type="button"
                  disabled={
                    !number || (!identity.valid && !exception) || !identityConfirmed || ocrBusy
                  }
                  onClick={() => {
                    setStep(2);
                    placementRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                  }}
                >
                  Continue to placement
                  <ArrowRight size={16} />
                </Button>
              </div>
            ) : null}
          </div>
        </section>
        <section className="panel intake-section" ref={placementRef}>
          <div className="intake-section-heading">
            <h2>
              <span className="intake-number">3</span>Yard-slot Assignment Controls
            </h2>
            <span className="mono">{step === 2 ? 'CONFIRM PLACEMENT' : 'SELECT DESTINATION'}</span>
          </div>
          <div className="intake-section-body">
            <div className="intake-coordinates">
              <Field label="Yard block">
                <select
                  value={intakeBlock ?? ''}
                  onChange={(e) => selectCoordinate(e.target.value || null, null, null, intakeTier)}
                >
                  <option value="">All blocks</option>
                  {data.blocks.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} · {b.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Row">
                <select
                  value={selected?.row_id ?? ''}
                  disabled={!intakeBlock}
                  onChange={(e) => {
                    selectDestination(
                      data.slots.find(
                        (s) =>
                          s.block_id === intakeBlock &&
                          s.row_id === e.target.value &&
                          s.tier === intakeTier,
                      )?.id ?? null,
                    );
                  }}
                >
                  <option value="">Select row</option>
                  {intakeRows.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.code}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Bay">
                <select
                  value={selected?.bay_id ?? ''}
                  disabled={!selected}
                  onChange={(e) =>
                    selectCoordinate(
                      intakeBlock,
                      selected?.row_id ?? null,
                      e.target.value,
                      intakeTier,
                    )
                  }
                >
                  <option value="">Select bay</option>
                  {intakeBays.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Tier level">
                <select
                  value={intakeTier}
                  onChange={(e) =>
                    selectCoordinate(
                      intakeBlock,
                      selected?.row_id ?? null,
                      selected?.bay_id ?? null,
                      Number(e.target.value),
                    )
                  }
                >
                  {Array.from(
                    {
                      length: Math.max(
                        1,
                        ...data.blocks
                          .filter((b) => !intakeBlock || b.id === intakeBlock)
                          .map((b) => b.max_tiers),
                      ),
                    },
                    (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        Tier {i + 1}
                      </option>
                    ),
                  )}
                </select>
              </Field>
            </div>
            <div
              className={problem ? 'destination-selection invalid' : 'destination-selection valid'}
            >
              <MapPin size={19} />
              <div>
                <strong>{selected?.code ?? 'No destination selected'}</strong>
                <span>
                  {problem ??
                    (selected
                      ? 'Available and stack valid. Confirm the physical destination.'
                      : 'Choose a position in the yard matrix, or register as unassigned.')}
                </span>
              </div>
              {selected ? (
                <button
                  type="button"
                  className="icon-button"
                  aria-label="Clear destination"
                  onClick={() => selectDestination(null)}
                >
                  <X size={16} />
                </button>
              ) : null}
            </div>
            {slotId ? (
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={physicalConfirmed}
                  disabled={!!problem}
                  onChange={(e) => setPhysicalConfirmed(e.target.checked)}
                />
                <span>
                  I confirm this container is physically at <strong>{selected?.code}</strong>.
                </span>
              </label>
            ) : (
              <div className="inline-notice amber">
                <Info size={15} />
                No destination selected. This container will be saved as unassigned.
              </div>
            )}
          </div>
        </section>
        <section className="panel intake-preflight">
          <div className="intake-subheading">
            <ShieldCheck size={16} />
            <strong>Terminal ingate pre-flight</strong>
            <span>
              {[identityConfirmed, !!slotId && !problem, physicalConfirmed].filter(Boolean).length}{' '}
              / 3 CHECKS
            </span>
          </div>
          <div className="preflight-progress">
            <span
              style={{
                width:
                  ([identityConfirmed, !!slotId && !problem, physicalConfirmed].filter(Boolean)
                    .length /
                    3) *
                    100 +
                  '%',
              }}
            />
          </div>
          <div className="preflight-checks">
            <span>{identityConfirmed ? '\u2713' : '\u25cb'} Identity confirmed</span>
            <span>{slotId && !problem ? '\u2713' : '\u25cb'} Valid destination</span>
            <span>{physicalConfirmed ? '\u2713' : '\u25cb'} Physical placement</span>
          </div>
          <div className="intake-manifest mono">
            {number || 'AWAITING ID'} · {size} FT · {type.toUpperCase()} ·{' '}
            {selected?.code ?? 'UNASSIGNED'}
          </div>
          <div className="form-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setStep(1);
                setIdentityConfirmed(false);
                setPhysicalConfirmed(false);
              }}
            >
              Review details
            </Button>
            <Button
              type="submit"
              busy={busy}
              disabled={
                step !== 2 ||
                !!problem ||
                (!!slotId && !physicalConfirmed) ||
                !identityConfirmed ||
                (!identity.valid && !exception) ||
                ocrBusy
              }
            >
              <CheckCircle2 size={17} />
              {slotId ? 'Register & assign container' : 'Register as unassigned'}
            </Button>
          </div>
        </section>
      </div>
      <aside className="intake-aside" aria-label="Destination workspace">
        <section className="panel intake-section">
          <div className="intake-section-heading">
            <h2>Target Location Destination</h2>
            <MapPin size={15} />
          </div>
          <div className="intake-section-body">
            <strong className="intake-target-code">
              {selected?.code ?? 'AWAITING SLOT SELECTION'}
            </strong>
            <div className="intake-target-meta">
              <div>
                <span>Facility</span>
                <strong>
                  {data.yard.name} ({data.yard.code})
                </strong>
              </div>
              <div>
                <span>Sector</span>
                <strong>
                  {data.blocks.find((b) => b.id === intakeBlock)?.name ?? 'Full yard'}
                </strong>
              </div>
              <div>
                <span>State</span>
                <strong>
                  {problem ? 'Review required' : selected ? 'Slot available' : 'Unassigned'}
                </strong>
              </div>
            </div>
          </div>
        </section>
        <section className="panel intake-section intake-matrix">
          <div className="intake-section-heading">
            <h2>
              <Layers3 size={15} />
              {data.blocks.find((b) => b.id === intakeBlock)?.code ?? 'Yard'} Storage Matrix
            </h2>
            <span className="mono">TIER {intakeTier}</span>
          </div>
          <div className="intake-matrix-toolbar">
            <select
              aria-label="Preview storage block"
              value={intakeBlock ?? ''}
              onChange={(e) => selectCoordinate(e.target.value || null, null, null, intakeTier)}
            >
              <option value="">Full yard · all blocks</option>
              {data.blocks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.code} · {b.name}
                </option>
              ))}
            </select>
            <span>Click a slot to select</span>
          </div>
          <YardMap
            data={data}
            tier={intakeTier}
            blockId={intakeBlock}
            selectedSlotId={slotId}
            onBlock={(id) => selectCoordinate(id, null, null, intakeTier)}
            onSelect={(slot) => selectDestination(slot.id)}
            pickMode
            compact
          />
          <Legend />
        </section>
        <section className="panel intake-section">
          <div className="intake-section-heading">
            <h2>
              <ContainerIcon size={15} />
              Container Form Profile
            </h2>
            <span className="mono">{size} FT</span>
          </div>
          <div className="intake-section-body">
            <div className="equipment-diagram">
              <div className={size === 20 ? 'short' : ''}>
                <span>+</span>
              </div>
              <span>
                LENGTH: {size} FT · {type.toUpperCase()}
              </span>
            </div>
            <div className="intake-target-meta">
              <div>
                <span>Length</span>
                <strong>{size} ft</strong>
              </div>
              <div>
                <span>Equipment</span>
                <strong>{type}</strong>
              </div>
              <div>
                <span>Slot limit</span>
                <strong>{selected ? selected.max_size + ' ft' : 'Select a slot'}</strong>
              </div>
            </div>
          </div>
        </section>
        <section className="panel intake-section">
          <div className="intake-section-heading">
            <h2>
              <ShieldCheck size={15} />
              Terminal Intake Verification Protocol
            </h2>
          </div>
          <ol className="intake-protocol">
            <li>
              <strong>Physical identity.</strong> Match the confirmed number with the container or
              source record.
            </li>
            <li>
              <strong>Operator-confirmed location.</strong> Check the physical block, row, bay, and
              tier before saving.
            </li>
            <li>
              <strong>Stack validity.</strong> Lower tiers must support the selected position. The
              server validates every placement.
            </li>
          </ol>
          <div className="intake-protocol-note">
            <Info size={15} />
            OCR identifies a container. It does not determine its physical location.
          </div>
        </section>
      </aside>
    </form>
  );
}

export function MoveModal({
  data,
  container,
  mutate,
  onClose,
  onSaved,
}: {
  data: Snapshot;
  container: Container;
  mutate: Mutate;
  onClose: () => void;
  onSaved: (state: Snapshot) => void;
}) {
  const [slotId, setSlotId] = useState<string | null>(null),
    [confirmed, setConfirmed] = useState(false),
    [notes, setNotes] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const slot = data.slots.find((s) => s.id === slotId),
    problem = slot ? destinationProblem(data, slot, container.size, container) : null;
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await mutate('move', {
        yardId: data.yard.id,
        containerId: container.id,
        slotId,
        expectedSlotId: container.current_slot_id,
        physicalConfirmed: confirmed,
        notes,
      });
      onSaved(result.state);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Move failed.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={container.current_slot_id ? 'Move container' : 'Assign storage position'}
      description={`${container.number} · ${container.size} ft · ${container.owner || 'Owner not specified'}`}
      wide
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <div className="modal-body">
          <div className="current-position">
            <MapPin size={17} />
            <div>
              <span>Current recorded position</span>
              <strong>{container.location_code ?? 'Unassigned'}</strong>
            </div>
            <ArrowRight size={18} />
            <div>
              <span>New destination</span>
              <strong>{slot?.code ?? 'Select on the map below'}</strong>
            </div>
          </div>
          {error ? (
            <div role="alert" className="inline-notice error">
              {error}
            </div>
          ) : null}
          <PositionPicker
            data={data}
            value={slotId}
            onChange={(id) => {
              setSlotId(id);
              setConfirmed(false);
            }}
            size={container.size}
            moving={container}
          />
          <Field label="Reason / notes (optional)">
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Consolidating export containers"
              maxLength={1500}
            />
          </Field>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={confirmed}
              disabled={!slotId || !!problem}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span>
              I confirm the container has physically been placed at the selected destination.
            </span>
          </label>
        </div>
        <div className="modal-footer">
          <Button variant="secondary" type="button" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" busy={busy} disabled={!slotId || !confirmed || !!problem}>
            <Layers3 size={16} />
            {container.current_slot_id ? 'Confirm relocation' : 'Confirm placement'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export function ConfirmOperation({
  data,
  container,
  kind,
  mutate,
  onClose,
  onSaved,
}: {
  data: Snapshot;
  container: Container;
  kind: 'dispatch' | 'verify';
  mutate: Mutate;
  onClose: () => void;
  onSaved: (state: Snapshot) => void;
}) {
  const [confirmed, setConfirmed] = useState(false),
    [notes, setNotes] = useState(''),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const result = await mutate(kind, {
        yardId: data.yard.id,
        containerId: container.id,
        expectedSlotId: container.current_slot_id,
        confirmed,
        physicalConfirmed: confirmed,
        notes,
      });
      onSaved(result.state);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Operation failed.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={kind === 'dispatch' ? 'Dispatch from yard' : 'Verify physical location'}
      description={container.number}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <div className="modal-body">
          {error ? (
            <div className="inline-notice error" role="alert">
              {error}
            </div>
          ) : null}
          <div className="location-address">
            <span>RECORDED LOCATION</span>
            <strong>{container.location_code ?? 'Unassigned'}</strong>
          </div>
          <p>
            {kind === 'dispatch'
              ? 'Dispatch releases the current position and preserves the complete movement history.'
              : 'Only confirm this after checking the physical container at its recorded position.'}
          </p>
          {kind === 'dispatch' ? (
            <Field label="Dispatch reference / notes (optional)">
              <input value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1500} />
            </Field>
          ) : null}
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span>
              {kind === 'dispatch'
                ? 'I confirm this container has physically left the yard.'
                : 'I have physically verified this container at the recorded position.'}
            </span>
          </label>
        </div>
        <div className="modal-footer">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" busy={busy} disabled={!confirmed}>
            {kind === 'dispatch' ? 'Confirm dispatch' : 'Confirm verification'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
