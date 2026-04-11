# Yard Management And Import Preview Design

Date: 2026-04-11

## Goal

Bring the `yard` management experience from `tracking_v2` into the current `tracking-container` repo as a real-data screen, and replace the import-preview row dialog with a right-side information panel that is easier to scan and understand.

The outcome of this design is:

- a new internal route in the sidebar for yard operations
- a server-side read model for yard occupancy and container placement
- a yard UI that follows the current repo's visual system instead of cloning `tracking_v2` 1:1
- a right-side preview sheet for `/containers/import/[batchId]` that presents row data, warnings, and errors more clearly than the current dialog

## Approved Decisions

- Keep the visual language of the current repo instead of copying the source UI pixel-for-pixel.
- Add yard management as a separate sidebar route, not as a tab under `Container`.
- Read real data from the current repo if `yard`, `block`, `slot`, and `container` records already exist.
- Use a dedicated read model for yard data instead of querying directly inside the page component.
- Replace the import-preview dialog with a right-side panel.
- Optimize the right-side panel for fast operational reading, especially for validation errors and warnings.

## Source And Target Mapping

### Source screens in `tracking_v2`

- `app/yard/page.tsx`
- `app/seaport-intake/page.tsx`

### Target areas in `tracking-container`

- new route: `app/(internal)/yard/page.tsx`
- sidebar navigation: `components/app-sidebar.tsx`
- yard read model: `lib/yard/get-yard-overview.ts`
- yard UI components: `components/yard/*`
- import preview page client: `components/containers/container-import-page-client.tsx`

## Product Fit

This design stays within the repo's MVP priorities:

- yard position management
- container current-state visibility
- import preview and validation review

It does not introduce new backend workflows such as yard transfer mutations, drag-and-drop moves, or realtime subscriptions. Those can be layered later onto the read model and UI structure defined here.

## Existing Data Constraints

The current schema already supports the required read experience:

- `Port`
- `Yard`
- `YardBlock`
- `YardSlot`
- `Container`
- `ContainerEvent`

Important constraint:

- `Container.currentSlotId` is unique when not null, which means a slot can be considered occupied when exactly one current container points at it.

Because of that, occupancy can be derived from current state without introducing a new table for this phase.

## Yard Read Model

Create a new server-side read model focused on yard visualization and operational inspection.

Suggested function:

- `getYardOverview()`

Suggested output shape:

- summary stats for all active yards
- yard groups by port
- block cards with occupancy and placement metadata
- a flattened container list for the table tab
- block detail data for grid rendering

### Data to read

- active ports related to yards
- active yards
- active blocks under each yard
- active slots under each block
- containers with current location references

### Derived values

- `occupiedSlotCount`: count of active slots that have a current container
- `availableSlotCount`: active slots minus occupied slots
- `occupancyPercent`: occupied divided by total active slots
- `highOccupancyBlocks`: blocks above a threshold such as 80% or 90%
- `container counts by status`: especially `at_seaport_yard`, `at_dryport_yard`, `hold`

### Placement logic

- A slot is occupied when at least one current container references its `id`.
- Because `currentSlotId` is unique, the read model can assume at most one current container per slot.
- Grid cells should prefer `rowNo` and `bayNo`.
- `tierNo` should be shown as metadata on the slot or used in block detail when present.
- Slots without sufficient coordinates should still count toward totals and stay visible in tabular detail, but should not be forced into a false grid position.

## `/yard` Route Design

The new route uses `DashboardLayout` and follows the current repo's spacing, cards, badges, tabs, and tables.

### Information architecture

1. KPI summary row
2. Search and filters
3. Main content tabs

### KPI row

Suggested cards:

- total active slots
- occupied slots
- available slots
- containers at seaport yard
- containers at dry port yard
- blocks at risk of saturation

The exact KPI count can be adjusted if the real dataset exposes a better operational signal, but the row should stay compact and scannable.

### Filters

Include:

- search by container number, slot code, block code, yard name
- filter by port
- filter by yard
- filter by block
- filter by container status
- filter by customs status

Filtering is client-side on the dataset returned by the read model for this phase. This keeps the MVP simple and responsive without adding a new server query API.

### Main tabs

#### `Sơ đồ bãi`

Purpose:

- give operators a block-level occupancy overview
- let them drill into a block quickly

Behavior:

- render block cards grouped by yard or port section
- show occupancy percentage with strong visual contrast
- show total slots and occupied slots
- click a block card to open block detail

#### `Danh sách container`

Purpose:

- provide a direct, searchable operational list
- support cases where grid coordinates are incomplete

Columns should prioritize:

- container number
- yard / block / slot
- current workflow status
- customs status
- type
- shipping line
- route or destination
- ETA or last known milestone

Clicking a row opens container detail.

## Yard Detail Interactions

### Block detail

A block detail view should show:

- block identity
- parent yard and port
- occupancy stats
- grid view if coordinates are available
- a note when some slots cannot be placed visually because coordinate data is incomplete

Grid behavior:

- empty slots use a neutral style
- occupied slots use an emphasized style
- slot label should remain compact
- clicking an occupied slot opens the container detail

### Container detail in yard

This is a read-only operational detail surface for now.

UI shell decision:

- block detail opens in a large `Dialog`
- container detail from the yard screen opens in a read-only `Dialog`
- the import preview screen is the only place in this scope that switches to a right-side `Sheet`

It should emphasize:

- container number
- current status
- customs status
- exact current location
- type and special flags if present
- shipping line
- customer
- route and destination
- ETA
- last known event time if already available through current data

## Import Preview Right-Side Panel

Replace the current row dialog in `ContainerImportPageClient` with a right-side `Sheet`.

### Why change

The preview page is a wide table intended for large, noisy import data. A dialog interrupts the table-reading flow and hides context. A right-side panel keeps the table visible while still surfacing row-level detail.

### Interaction

- clicking a preview row opens the right-side sheet
- selecting another row updates the sheet content
- closing the sheet does not reset current search or filters

### Panel content hierarchy

The sheet should favor operational readability over flat data dumping.

#### Header

- container number
- validation status badge
- high-level risk summary

#### Section: `Kiểm tra dữ liệu`

Shown first when errors or warnings exist.

- validation errors in a destructive callout
- warnings in a warning callout
- missing-master-data summary grouped by:
  - container type
  - port
  - shipping line
  - customer

#### Section: `Nhận diện`

- type
- category
- v-state
- t-state
- seals

#### Section: `Hành trình`

- shipping line
- bill number
- outbound visit
- ETA
- POD or current port code

#### Section: `Vị trí`

- current port code
- yard code
- block code
- slot code
- stow
- group

#### Section: `Đặc biệt`

- reefer requirement
- temperature
- RLH / RDH
- OOG
- IMDG
- hazardous

### Presentation rules

- errors are always visually stronger than warnings
- warnings are shown before neutral business details
- valid rows without warnings should lead with business and location information
- long raw text should wrap cleanly and not flatten the visual hierarchy

## Error And Empty-State Rules

### `/yard`

- If there are no yards, blocks, or slots, show an empty state instead of fallback mock data.
- If there are yards and slots but no containers, still show layout and occupancy at zero.
- If containers exist without a valid current slot, include them in the table with a clear label such as `Chưa gán slot`.
- If slot coordinates are incomplete, do not fabricate positions in the grid.

### Import preview sheet

- If a field is absent, use a neutral fallback label instead of leaving visual gaps.
- If the selected row is invalid, the sheet must make that obvious immediately.
- If the row is valid but will create missing master data, that should still be prominent.

## Non-Goals

This design intentionally does not include:

- slot transfer write actions
- drag-and-drop placement
- realtime refresh or subscriptions
- yard mutation APIs
- event timeline redesign
- import backend behavior changes

## Risks And Follow-Up

### Risk: incomplete slot coordinates

Some slots may not have full `rowNo` / `bayNo` / `tierNo` data. The implementation should degrade gracefully by:

- keeping occupancy correct
- keeping those slots visible in table/detail views
- not rendering misleading grid placements

### Risk: larger datasets

If yard data grows large, client-side filtering may eventually need server pagination or segmented loading. For the current MVP phase, client-side filtering is acceptable.

### Risk: mixed visual density

The import preview table is already dense. The new sheet should reduce cognitive load, not mirror the table structure line-for-line.

## Verification

Implementation based on this design must verify:

- `npm run build`
- `node_modules\\.bin\\tsc.cmd --noEmit`

Manual checks:

- `/yard` appears in the sidebar
- `/yard` loads without mock data
- occupancy and counts render from current database records
- block detail opens from the yard overview
- container detail opens from block cells and from the container list
- `/containers/import/[batchId]` opens a right-side panel on row click
- the right-side panel clearly distinguishes errors, warnings, and valid rows

## Implementation Handoff

After this spec is approved, the next step is to write a concrete implementation plan that covers:

- files to read and modify
- yard read-model structure
- yard UI component breakdown
- import preview sheet refactor
- verification order
