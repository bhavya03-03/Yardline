---
name: Yardline Industrial Design System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434655'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#747686'
  outline-variant: '#c4c5d7'
  surface-tint: '#2151da'
  primary: '#0037b0'
  on-primary: '#ffffff'
  primary-container: '#1d4ed8'
  on-primary-container: '#cad3ff'
  inverse-primary: '#b7c4ff'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fd'
  on-secondary-container: '#57657b'
  tertiary: '#7f2500'
  on-tertiary: '#ffffff'
  tertiary-container: '#a73400'
  on-tertiary-container: '#ffc9b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b7c4ff'
  on-primary-fixed: '#001551'
  on-primary-fixed-variant: '#0039b5'
  secondary-fixed: '#d5e3fd'
  secondary-fixed-dim: '#b9c7e0'
  on-secondary-fixed: '#0d1c2f'
  on-secondary-fixed-variant: '#3a485c'
  tertiary-fixed: '#ffdbcf'
  tertiary-fixed-dim: '#ffb59c'
  on-tertiary-fixed: '#390c00'
  on-tertiary-fixed-variant: '#832700'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  headline-sm:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  code-container-id:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
  code-container-id-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
  label-tabular:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-dense: 0.375rem
  margin: 1rem
  margin-compact: 0.5rem
  space-xs: 0.25rem
  space-sm: 0.375rem
  space-md: 0.5rem
  space-lg: 0.75rem
  space-xl: 1rem
---

## Brand & Style

This design system is engineered for industrial intermodal logistics, container terminal dispatch, and high-throughput rail-and-port yard operations. The user environment spans glare-heavy outdoor tablet mountings in terminal tractors to dual-monitor multi-window control centers monitoring thousands of active TEUs (Twenty-Foot Equivalent Units).

The design ethos is **Industrial Precision Minimalism**:
- **Utilitarian Clarity**: Every pixel conveys operational state. Redundant visual noise, decorative illustrations, and whimsical micro-interactions are replaced by immediate cognitive parsing and clear data hierarchy.
- **Physical-Digital Alignment**: UI structures mimic physical yard topologies (bays, rows, tiers, blocks), using tight visual geometry, unambiguous spatial divisions, and rigid alignment.
- **High-Density Legibility**: Dense typography scales down gracefully to 11px without loss of character distinction. Container identification codes conform to ISO 6346 formatting, requiring dedicated monospace metrics to eliminate misreads under split-second operating conditions.

## Colors

The palette uses a high-contrast industrial structure anchored by crisp cool grays and deep slate tones, reserving chromatic saturation strictly for operational workflow states and primary dispatch interventions.

### Base Structural Palette
- **Canvas Base**: `#F4F5F7` (High-efficiency anti-glare terminal neutral)
- **Sub-canvas / Recessed Track**: `#F8F9FA`
- **Surface (Cards, Cells, Overlays)**: `#FFFFFF`
- **Borders & Dividers**: Primary rule `#CBD5E1`; Subtle boundary `#E2E8F0`
- **Typography**: Primary operational text `#0F172A`; Secondary metrics & metadata `#334155`; Diminished labels `#64748B`
- **Interactive Accent**: Base `#1D4ED8`; Hover/Active `#2563EB`; Subtle selection fill `#EFF6FF`

### Yard State Semantics
Each state couples an authoritative text/border token with a high-visibility, low-fatigue background wash:
- **Occupied / Staged**: Stroke/Text `#334155`, Fill `#F1F5F9`
- **Available / Spot Ready**: Stroke/Text `#059669`, Fill `#DCFCE7`
- **Reserved / In-Transit Allocation**: Stroke/Text `#D97706`, Fill `#FEF3C7`
- **Blocked / Maint. Hold / Restricted**: Stroke/Text `#DC2626`, Fill `#FEE2E2`
- **Needs Verification / Discrepancy**: Stroke/Text `#EA580C`, Fill `#FFEDD5`

## Typography

Typography prioritizes tabular scanning speed, horizontal compactness, and zero ambiguity between glyphs (e.g., `0` vs `O`, `1` vs `I`).

- **Interface Primary (Inter)**: Handles dense navigation, forms, metadata tags, and compact modal dialogs. Tight tracking (`-0.01em`) is applied to sizes 13px and above. `label-caps` enforces uppercase styling with `+0.04em` letter spacing for micro-headers and column titles.
- **Equipment & Asset Primary (JetBrains Mono)**: Applied to ISO container numbers (e.g., `MSCU-749201-4`), chassis IDs, seal codes, gross weight metrics, and yard slot designations (e.g., `BAY-04-R02-T3`). It maintains fixed character widths to ensure column vertical alignment across continuous inventory streams.

## Layout & Spacing

The layout model is governed by high-density data requirements and operational dashboards that avoid vertical paging whenever possible.

### Layout Mechanics
- **Grid Architecture**: 24-column flexible grid system optimized for widescreen displays (1920x1080 and ultra-wide monitoring desks). Sidebars default to collapsed 48px rail or 240px fixed inspection panels.
- **Rhythm**: Anchored to a strict 4px grid. Heights for standard controls:
  - Input & Button Compact: 28px
  - Input & Button Default: 32px
  - Data Grid Row (Dense): 24px
  - Data Grid Row (Standard): 32px
- **Screen Adaptations**:
  - **Desktop / Yard Master Consoles (≥1280px)**: Multi-pane view enabled. Yard 2D schematic canvas occupies 60-70% width, side inspection dock occupies remainder with zero scroll overhead on key controls.
  - **Terminal Vehicle Tablet (768px - 1279px)**: Single column with persistent status drawer. Touch targets pad to 40px minimum through invisible touch envelopes while retaining 32px visual footprint.

## Elevation & Depth

This design system avoids soft, floating, or diffuse decorative shadows. Depth is achieved via **structural outlines, tonal stacking, and high-precision contact lines**:

- **Layer 0 (Canvas Base)**: `#F4F5F7` solid foundation.
- **Layer 1 (Card / Module Surface)**: Pure `#FFFFFF` bounded by a 1px solid `#E2E8F0` border. No drop shadow.
- **Layer 2 (Selected Cell / Active Row)**: `#FFFFFF` bounded by a 1px solid `#1D4ED8` ring or 2px inset left-border.
- **Layer 3 (Context Menu / Yard Quick-Inspect Popover)**: Solid `#FFFFFF`, 1px solid `#CBD5E1`, with a functional micro-shadow: `0 2px 4px 0 rgba(15, 23, 42, 0.08)`.
- **Layer 4 (Critical Modal / Hazard Alert)**: Solid `#FFFFFF`, 1px solid `#0F172A`, overlay backdrop `rgba(15, 23, 42, 0.45)` with a non-diffuse industrial shadow: `0 4px 12px 0 rgba(15, 23, 42, 0.16)`.

## Shapes

The shape system strictly uses industrial, crisp geometries. Roundedness is locked at **Soft (Level 1: 4px maximum)**. 

- **Containers, Cells, Cards, and Inputs**: Uniform `4px` corner radius.
- **Yard Map Grid Slots**: `2px` or `0px` radius to reinforce physical container footprint geometry.
- **Badges, Tags, and Status Identifiers**: `2px` or `4px` radius. Pill-shaped (`9999px`) geometries are strictly forbidden, as they undermine the technical precision of logistics data and reduce horizontal space efficiency for long alphanumeric codes.

## Components

### Buttons
- **Primary**: Solid `#1D4ED8` background, `#FFFFFF` text, `4px` radius, height 32px (or 28px dense). Hover `#2563EB`, active `#1E40AF`.
- **Secondary / Outline**: `#FFFFFF` background, 1px border `#CBD5E1`, `#0F172A` text. Hover `#F8F9FA` with border `#94A3B8`.
- **Destructive**: `#DC2626` text, `#FFFFFF` background, 1px border `#FCA5A5`. Hover `#FEF2F2`.

### Status Badges & Slot Indicators
- Compact height (20px), horizontal padding `6px`.
- Composed of a 1px solid boundary matching the semantic status token, a matching background tint, and uppercase bold `JetBrains Mono` or `Inter` text.
- Must include a `6px` solid status dot preceding the text label for immediate chromatic recognition on outdoor/glare displays.

### Data Grid & Yard Inventory Table
- **Headers**: Height 28px, background `#F8F9FA`, border-bottom 1px solid `#CBD5E1`. Text styled with `label-caps` in `#475569`.
- **Rows**: Alternating fills (`#FFFFFF` to `#F8F9FA`), height 32px standard, 24px dense. Border-bottom 1px solid `#E2E8F0`.
- **Hover / Active State**: Background `#EFF6FF`, active row indicator 2px left border `#1D4ED8`.
- **Container Number Cells**: Styled in `code-container-id`, tracking normal, vertically aligned with equipment type tag (e.g., `40HC`, `20GP`).

### Inputs & Yard Search
- Fixed height (32px), `4px` radius, border 1px solid `#CBD5E1`, background `#FFFFFF`, font size 13px.
- Focus state: Border color `#1D4ED8` with a 1px outer ring `rgba(29, 78, 216, 0.2)`. Never use thick fuzzy halos.
- Search inputs for container numbers automatically format and uppercase input to ISO standard patterns (`[A-Z]{4}[0-9]{7}`).

### Container Bay Stack Block (Domain Specific)
- Mini-matrix representing stacked tiers (Tier 1 ground to Tier 5 top).
- Each cell bounded by 1px solid `#CBD5E1`, sized at 36px wide by 18px high.
- Background color dynamically maps to container status semantic tokens (Occupied, Reserved, Blocked, etc.).
- Mouseover reveals instant tool-tip popover with container weight, destination port, hazardous material (HAZMAT) placard indicator, and reefer temperature status.