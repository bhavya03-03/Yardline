# Yardline

A working container-location system for small yards. Next.js, React, TypeScript, Tailwind CSS, a local-coordinate SVG map, and a relational database. No tracking hardware, installed cameras, stickers, external map services, or physical yard modifications.

## Run the hackathon demo

Requires **Node.js 24.12 or newer** (the local adapter uses Node's built-in SQLite).

```powershell
cd yardline
npm ci
npm run db:seed
npm run dev
```

Open **http://localhost:3000**. On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`.

There are **no required environment variables, cloud accounts, passwords, or paid APIs** for the local demonstration. The seed also runs automatically on the first API request against an empty local database. Records persist in `data/yardline.sqlite` across refreshes and server restarts. SQLite failures return errors; the application never falls back to memory or fake success.

The initial screen is the populated yard map, with database-derived occupancy metrics. Every prominent control works, including registration, search, moves, dispatch, verification, filters, CSV export, configuration, and role switching.

For a production build served locally:

```powershell
npm run build
npm start
```

Stop the development server before building and starting on the same port. The SQLite adapter needs a persistent, writable disk and a Node server; do not deploy it to ephemeral serverless storage.

## Three-minute judging sequence

1. Inspect the full yard and switch between tiers 1–3. Blue slots contain actual registered containers. Hatched positions are unavailable.
2. Search **MSCU1234566** in the global search, or click the demonstration hint below the map. Its initial position is **YD01-B01-R01-BY01-T01**. The app focuses the right block, tier, and exact position.
3. Click **Move container**. Choose **YD01-B02-R04-BY01-T01** on the destination map. Check the physical placement confirmation, then **Confirm relocation**.
4. Return to **Full yard**. The previous slot is available and the destination is occupied. Search for MSCU1234566 again to see its updated location.
5. Open **Movement History** and filter by MSCU1234566. Inspect the recorded old and new position, timestamp, operator, and reason.
6. Open **Register Container**. Enter **TGHU7599330** (valid ISO check digit), select length 40 ft, and confirm the number against the source record. Alternatively use a photo and OCR, then correct its suggestion.
7. Continue to placement. Choose **YD01-B03-R04-BY01-T01**, confirm physical placement, and save. Success appears only after the database transaction commits.
8. Open **Overview**. Stored containers increase from 96 to 97 and available positions decrease from 201 to 200. Relocation alone does not change occupancy.
9. Optionally locate the newly registered container and dispatch it. Its slot becomes available and history is retained.

These are **seeded demonstration records**, labeled throughout the interface. They do not describe a shipping company's actual operations.

### Seed contents and reset

- North Yard, `YD01`, with an irregular plot boundary.
- Three blocks, four rows each, nine bays per row, three tiers: **324 persisted positions**.
- **96 stored**, **four unassigned**, and **two dispatched** containers across multiple shipping lines, lengths, and types.
- Nine blocked, nine reserved, and nine restricted positions. **297 usable positions**, **201 available**, initial utilization **32%**.
- Roads, loading and restricted non-storage areas, arrivals, placements, relocations, dispatches, and verification attention states.
- All numbered records use ISO 6346 check digits, including the primary demonstration container.

`npm run db:seed` is idempotent: it leaves an existing yard untouched. To deliberately recreate only the local demonstration database:

```powershell
npm run db:reset
```

Reset is **CLI-only**, refuses PostgreSQL / Supabase mode, and refuses databases containing a non-demo yard. There is no reset endpoint for ordinary users. To preserve custom yards and start another demonstration, set `DATABASE_PATH` to a new local file instead. Stop the server before resetting and restart it afterwards.

## Interface design

The workspace visual specification is `design.md`. Yard Map, Containers, Register Container, Movement History, Yard Configuration, and Settings use the Geist theme in `src/app/workspace.css`: near-white canvas (`#fafafa`), near-black ink and actions (`#171717`), white panels with hairline borders (`#ebebeb`), locally served Geist Sans and Geist Mono, and 6px app controls. Overview uses the later Figma-inspired specification in `src/app/overview-figma.css`: white canvas, black text, variable-weight editorial headings, pill actions, a full-width lime yard-map section, and a lilac placement/location-review section, separated by white space. Geist serves as the open-source font substitute. These styles are scoped to Overview. There are no decorative gradients on Overview. Amber and red remain meaningful warning and hazard colors in the operational grid.

Register Container retains its two-column intake layout: numbered identity/OCR, manifest and placement sections, a destination matrix, equipment profile, verification protocol, and a pre-flight summary. It stacks on smaller screens. Presets set the real size/type fields. The photograph and OCR result come from the operator's own upload or camera. Coordinates, destination validity, and occupancy come from the existing persisted yard. Handover references can be entered in the persisted notes field.

The earlier Stitch exports are retained in `yardlinestitch-reference/stitch_yardline_container_yard_management (1)/` for layout reference. The shared Geist stylesheet supersedes their lavender and blue theme. Account/profile access opens the existing identity and role controls in Settings; there is no separate profile route.

The existing public route remains `/`, initially displaying Yard Map. Sidebar navigation changes the workspace view on that route. No database schema, API contracts, authentication requirements, stored container data, movement rules, or persistence adapters were changed for the design. Black indicates actions/selection, light grey indicates occupancy, amber indicates reservations or review, and red indicates blocked/restricted positions or errors. Text and symbols accompany status colors.

Visual verification screenshots are saved under the ignored `output/playwright/` directory. Browser workflows use an isolated test database and do not modify the presentation database.

## Database and application architecture

```text
src/app/api/             HTTP routes; authentication and transaction boundary
src/server/operations.ts Validated yard and container operations
src/server/db.ts         SQLite and PostgreSQL adapters; transaction serialization
src/server/service.ts    Persisted layout, occupancy and movement read model
src/server/seed.ts       Repeatable, relational demonstration data
src/lib/                Shared types, identity checks, placement hints and API client
src/components/         Map, forms, reusable controls and operational screens
migrations/001_schema.sql Portable relational schema, keys, indexes and constraints
tests/backend.test.ts   Isolated database integration and validation tests
tests/e2e/              Browser and HTTP demonstration tests
```

The relationships are `yards → storage_blocks → storage_rows → storage_bays → storage_slots`. A slot has a stable UUID, unique hierarchical code, tier, map coordinates, status, capacity and length limit. Yard and block codes are immutable. Plot/name edits and new blocks preserve existing IDs and assignments. The generator supports different row lengths (`9,9,7,5`), per-block tiers and capacity limits, and rejects overlap with blocks and non-storage areas. The structured boundary editor takes ordered local-coordinate points; it is not a survey or a geographic map.

**Location source of truth:** `containers.current_slot_id`. It has a unique constraint and a foreign key. Occupancy is derived through joins; there is no separate mutable occupancy flag. Every successful arrival, placement, relocation, dispatch and verification appends a movement event. History is never deleted by operational actions. Photographs are optional, compressed, size-limited, and stored server-side; the snapshot excludes image payloads.

**Atomicity:** mutations and their resulting snapshot run in one transaction. SQLite uses `BEGIN IMMEDIATE`, foreign keys, WAL and a busy timeout. PostgreSQL uses an advisory transaction lock shared across service processes. A failed destination validation rolls back the previous assignment, history, and snapshot together. Requests include the expected old slot to reject stale operator changes. A second assignment to an occupied slot is rejected by both the service and the database.

**Stack rules:** all lower tiers must contain containers of matching length; the maximum tier comes from generated records; a slot accepts only one container within its length limit; block capacity is checked on the server; upper containers must move before a lower container can be relocated or dispatched. The prototype models one container per position rather than paired 20 ft footprints, weights, crane reach, reefer power, hazardous cargo segregation, or load engineering. Configure and operate it accordingly.

**Metrics:** availability excludes reserved, blocked and restricted positions and respects block capacity. Usable capacity excludes non-storage areas. Available upper tiers may still need supporting containers. The “ready for placement” count is a structural hint; final validation includes length and capacity. Dashboard reads are refreshed after each committed mutation and every 30 seconds while the tab is visible. This is database synchronization, **not live physical tracking**. Movement-history screens load the latest 1,000 events; all older records remain in the database.

### API

`GET /api/state?yard=<uuid>` returns accessible yards, the selected persisted layout, inventory, recent history, metrics, role and adapter identity.

`POST /api/actions/<action>` accepts JSON; yard-scoped operations require `yardId`:

| Action                       | Purpose                                                 | Required role            |
| ---------------------------- | ------------------------------------------------------- | ------------------------ |
| `create-yard`, `update-yard` | Create or safely edit a plot                            | Administrator            |
| `generate-block`             | Generate rows, bays and tiered positions atomically     | Administrator            |
| `create-zone`, `update-slot` | Configure non-storage areas or an empty slot's status   | Administrator            |
| `register`                   | Register identity, optional photo and initial placement | Administrator / operator |
| `move`                       | Place an unassigned container or relocate a stored one  | Administrator / operator |
| `dispatch`                   | Release the position and preserve departure history     | Administrator / operator |
| `verify`                     | Record a fresh physical location confirmation           | Administrator / operator |

Mutations return `{ state, entityId }` after successful validation. Errors have a stable `{ error: { code, message } }` envelope and appropriate 4xx/5xx statuses. Internal database errors are logged on the server; client responses omit SQL, credentials, and stack traces. Cross-origin browser mutations are rejected.

`GET /api/containers/<id>/photo` authorizes yard access and returns an attached image. `POST /api/session` switches the role in **demo mode only**.

## Authentication and Supabase / PostgreSQL

The local demonstration intentionally has **switchable, unauthenticated demo sessions**, with server-enforced administrator/operator/viewer permissions. It is suitable for a trusted presentation environment. Anyone with access to that instance can choose a demo role. Do not expose it as a secured production service.

A PostgreSQL adapter and Supabase sign-in path are included. No cloud project or credentials were available during implementation, so **the live Supabase integration has not been exercised**. The entire tested demonstration uses SQLite. To configure a Supabase-backed environment:

1. Copy `.env.example` to `.env.local` and set:

   ```dotenv
   PERSISTENCE=postgres
   DATABASE_URL=postgresql://YOUR_SERVER_CONNECTION
   AUTH_MODE=supabase
   DEMO_SEED=false
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
   ```

2. Use a server PostgreSQL connection (direct or pooler) with schema-setup permissions. Keep `DATABASE_URL` private. Only Supabase's public anon/publishable key goes to the browser. No service-role key is needed in the browser or application.
3. Run `npm run db:setup`. The runner applies the repeatable schema and enables PostgreSQL row-level security. It revokes direct table access from PUBLIC, `anon` and `authenticated`; browser clients use authenticated Next.js APIs, never direct table writes. The server connection must be the owner / trusted role that can access these tables.
4. For sample data, explicitly run `npm run db:seed`. For a fresh operational yard, skip this step.
5. Create a user through the Supabase Auth dashboard. Copy that user's UUID, then provision their profile and membership:

   ```powershell
   npm run db:provision -- --user-id USER_UUID --name "Yard Administrator" --yard-code YD01 --yard-name "North Yard"
   ```

   The script joins the existing yard with that code, or creates an empty 240 × 180 m plot. It never stores a password. Add `--role operator` or `--role viewer` for another user. User invitation / role administration through the UI is deferred.

6. Build and restart the app after setting public environment variables. Sign in with the user created in Supabase. The server verifies the bearer token through Supabase Auth and looks up that user's membership for each yard operation. Changing a browser role does not grant access. Demo role switching is disabled.

The adapter is selected explicitly. Missing PostgreSQL credentials or invalid authentication configuration produce errors and never silently switch to the demo adapter. SQLite records are not automatically migrated into PostgreSQL; seed it separately or plan a reviewed import.

## Camera and OCR

Registration offers **Take photo**, **Upload image**, or manual entry. On supported smartphones the browser's native capture picker opens the camera. Camera permission and a secure browser context may be required; uploads and manual entry remain available.

Tesseract.js is lazy-loaded and runs in the browser. Its worker, WebAssembly engines, and English language model are copied from installed npm packages into `public/ocr/` during installation and before dev/build. **OCR needs no external CDN or API at runtime**; the model is served by the same application. The application displays the source photograph, recognized text, candidate number and confidence, and requires an editable number plus human identity confirmation. It never invents OCR output or silently saves a suggestion. Failed OCR explicitly offers manual entry. Administrators can deliberately save a nonstandard or invalid-check-digit number as an unverified exception; operators cannot bypass identity validation.

OCR identifies the **container**, not its location. Every placement requires a person to confirm the actual physical slot. No automatic tracking is claimed. Recognition accuracy on weathered container photographs is not guaranteed; capture printed identification close up, in good light.

## Tests and verification

```powershell
npm test
npm run typecheck
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

Backend tests use isolated SQLite databases and verify generation, identity checks, duplicate prevention, foreign keys, unique occupancy, tier/length/capacity constraints, atomic rollback, competing writes, stale moves, audit records, dispatch metrics, verification and authorization.

Browser tests run a separate server on port 3100 with a fresh `output/e2e-<timestamp>.sqlite` database and `.next-e2e` build folder. They execute the judging flow, inspect old/new slot states and history, register and dispatch a container, test role enforcement, create an irregular yard through the UI, and check mobile navigation and horizontal overflow. To use an installed Chrome instead of downloading Chromium on Windows:

```powershell
$env:PLAYWRIGHT_CHANNEL='chrome'
npm run test:e2e
```

Tests can append records to the isolated test database; they do not touch `data/yardline.sqlite`. Reports/screenshots are written under `output/playwright/` and failures under `test-results/`.

Verified locally: **24 backend tests and seven browser tests passed**, including actual browser OCR with external HTTP services blocked, photo correction and persistence, the complete judging flow, failure-state preservation, permissions, and mobile layouts. Type checking, lint, and the production build are also checked. No live Supabase project was available for an integration test.

## Scope for the next stage

The core workflows, local persistence, structured configuration, location verification, browser OCR, CSV exports and role checks are implemented. Further work includes a verified cloud deployment, invitation/user-management UI, advanced block reshaping/removal, polygon editing on the map, CSV import/re-entry, photo retention policies, paginated server queries, stronger audit immutability, migrations beyond the initial schema, monitoring, backups, and more detailed physical stacking/footprint rules. Container re-entry after dispatch is deliberately rejected as a duplicate until a controlled re-entry workflow is added.
