# Tracking Container Project Context

## Purpose

This repo is the frontend shell for a container tracking system focused on barge transport from seaport to dry port.

Future agents should use this file as the primary project context instead of re-deriving the product scope from the prototype screens.

For database design and schema decisions, also read `docs/database-design.md` as the canonical MVP DB reference.

## Current Repo State

- Frontend prototype built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Radix, Lucide, and Recharts.
- UI language is Vietnamese.
- Current screens are mostly mock-data prototypes.
- No real backend, database, auth, EDI pipeline, or realtime tracking is implemented yet.
- Existing routes already cover the business shape well: dashboard, containers, transport, map, alerts, customs, users, settings.

## Product Scope To Prioritize

Only prioritize these modules unless the user explicitly expands scope:

1. User management and RBAC.
2. Master data: seaport, dry port, yard, block, slot, route, customer, shipping line, container type.
3. Container management: create, update, search, filter, timeline, current status.
4. Yard position management: inbound, outbound, slot transfer, occupancy check.
5. EDI import: upload, validate, preview, import, reject, error log, replay batch.
6. Barge and voyage management:
   - Vehicle must always be created first.
   - Then create voyage.
   - Then assign containers into the barge manifest.
   - Then update voyage checkpoints.
7. Map and realtime tracking: barge/container location, ETA, geofence, route deviation alert, delay alert.
8. Alert and incident handling: delay, hold, route deviation, congestion, maintenance, weather.
9. Reports and history: operations report, yard inventory, voyage efficiency, container history.
10. Customer portal: customer can only view authorized containers, ETA, status, and basic history.

## Explicit Non-Priority Scope

Do not spend delivery time on these unless the user asks again:

- AHP decision support.
- Simulation and optimization analytics.
- Deep BI/data warehouse work.
- Multi-service distributed architecture.
- Complex AI prediction features.

## Recommended Delivery Architecture

Target deployment is:

- Frontend and app server: Vercel
- Database platform: Supabase

Recommended practical architecture for MVP:

- One Next.js application deployed on Vercel.
- Supabase Postgres as the main database.
- Supabase Auth for login/session handling.
- Supabase Storage for EDI files, exports, and attachments.
- Supabase Realtime for live updates where feasible.
- Next.js Server Actions and/or Route Handlers for business workflows and privileged server-side logic.

This should be treated as a modular monolith, not microservices.

## Why This Stack

- Fastest path from the current frontend prototype to a usable MVP.
- Minimal infrastructure overhead.
- Supabase provides Postgres, auth, storage, and realtime in one platform.
- Vercel fits the current Next.js codebase directly.
- Easy to scale later by extracting heavy jobs or adding a separate backend only when needed.

## Product Roles

### Admin

- Full access to configuration, users, RBAC, master data, all operations, and reports.

### Seaport Staff

- Manage container arrival, yard placement, EDI intake review, voyage preparation, and departure updates.

### Dry Port Staff

- Manage arrival confirmation, yard receiving, slot transfer, release, and local status updates.

### Customer

- Read-only access to only their own containers, ETA, status, and basic history.

## Core Domain Model

Future agents should treat these as the core business entities:

- `users`
- `roles`
- `role_permissions`
- `customers`
- `shipping_lines`
- `container_types`
- `ports`
- `yards`
- `yard_blocks`
- `yard_slots`
- `routes`
- `route_checkpoints`
- `containers`
- `container_events`
- `container_current_state`
- `yard_slot_occupancies`
- `edi_batches`
- `edi_batch_rows`
- `edi_batch_errors`
- `vehicles`
- `voyages`
- `voyage_manifest_items`
- `voyage_checkpoints`
- `tracking_positions`
- `alerts`
- `report_views`

## Core Business Rules

- Container is the center of the system.
- Every important state change must be recorded into history.
- Current status must be queryable quickly without reconstructing from the whole event stream.
- A slot cannot be occupied by more than one active container at the same time.
- Customer data must be isolated by ownership rules.
- A barge manifest cannot be built before the vehicle exists.
- A voyage cannot be considered active without manifest items or checkpoint updates.
- Alerts must be traceable to container, voyage, route, or vehicle context.

## Recommended System Workflow

### 1. User And Access Workflow

- Admin creates users and assigns roles.
- Permissions are enforced by role and organization context.
- Customer access must be restricted to owned containers only.

### 2. Master Data Workflow

- Admin defines ports, dry ports, yards, blocks, slots, routes, customers, shipping lines, and container types first.
- Operational modules depend on this data and should not bypass it with free-text fields in final implementation.

### 3. Container Workflow

- Container can be created manually or from EDI import.
- Initial status is assigned based on origin and import result.
- System stores current location, current status, and full timeline.
- Search and filter must support container code, customer, shipping line, status, route, port, date range.

### 4. Yard Workflow

- Container enters yard.
- Operator assigns yard, block, and slot.
- System checks occupancy before saving.
- Container can move between slots and every movement must create a history event.
- When container leaves yard for voyage or release, occupancy is closed.

### 5. EDI Workflow

- User uploads EDI file to storage.
- System creates an import batch record.
- Parser validates file structure and row-level data.
- User sees preview before final import.
- Invalid rows are rejected with detailed error logs.
- Valid rows can be imported into containers and related records.
- Batch can be replayed after mapping/error correction.

### 6. Vehicle / Barge / Voyage Workflow

- Create vehicle first.
- Create voyage for that vehicle.
- Select eligible containers and add them to voyage manifest.
- Confirm departure.
- Update checkpoints during travel.
- Confirm arrival at destination port or dry port.
- Voyage efficiency is calculated from manifest volume, ETA, actual timestamps, and incidents.

### 7. Tracking And Map Workflow

- System receives manual or automated position updates for barge/voyage.
- Container location is derived from yard state, manifest assignment, and latest voyage progress.
- ETA is recalculated when checkpoint or position changes.
- Geofence and route rules generate deviation or delay alerts.
- Realtime UI subscribes to updates instead of full-page refresh where possible.

### 8. Alert Workflow

- Alert sources include delay, hold, route deviation, congestion, maintenance, weather.
- Alert must carry severity, status, source type, related entity, timestamp, and resolution notes.
- Operators acknowledge and resolve alerts.
- Alert history remains auditable.

### 9. Reporting Workflow

- Operational report: active containers, delays, throughput.
- Yard inventory report: occupancy by yard/block/slot and aging in yard.
- Voyage efficiency report: planned vs actual, ETA accuracy, incident count.
- Container history report: full trace from intake to final destination.

### 10. Customer Portal Workflow

- Customer logs in through a dedicated portal view.
- Customer sees only assigned containers.
- Customer can search by container number and view status, ETA, route progress, and basic timeline.
- Customer cannot access internal yard layout, internal alerts, or admin screens.

## Recommended Supabase Usage

### Postgres

- Main transactional database.
- Use relational schema first.
- Add PostGIS only if map/geofence needs move beyond simple coordinates and bounds checks.

### Auth

- Use Supabase Auth for authentication.
- Keep RBAC and screen-level permission mapping in application tables, not only in auth metadata.

### Storage

- Store raw EDI files, generated reports, and attachments.
- Database should reference storage paths, not duplicate binary content.

### Realtime

- Use for tracking positions, alert updates, and voyage status changes.
- Avoid sending every event to every screen; subscribe by channel or entity scope.

### Row Level Security

- Use RLS for customer-facing data isolation.
- Admin and staff operations should still go through controlled server-side logic for sensitive mutations.

## Recommended App Structure Direction

The current route shells can be reused as the foundation:

- `/users`: user management and RBAC
- `/containers`: container list, detail, filter, timeline, EDI
- `/transport`: vehicle, voyage, manifest, checkpoints
- `/map`: realtime tracking and map view
- `/alerts`: alert inbox and resolution
- `/settings`: master data and system settings

Suggested additions later if needed:

- `/customers`
- `/master-data`
- `/reports`
- `/portal`
- `/containers/[id]`
- `/voyages/[id]`

## Delivery Priorities

Future agents should implement in this order unless the user changes direction:

1. Auth and RBAC foundation.
2. Master data.
3. Container management.
4. Yard position management.
5. EDI import pipeline.
6. Vehicle and voyage management.
7. Tracking and alerts.
8. Reports.
9. Customer portal.

## Implementation Guidance For Future Agents

- Preserve the current frontend shell and reuse existing screens where possible.
- Convert mock state into real data flows incrementally.
- Do not redesign the stack away from Vercel + Supabase unless explicitly requested.
- Prefer practical MVP decisions over premature abstraction.
- Keep data model normalized enough for correctness, but add read models/views where the UI needs fast current-state queries.
- Treat timeline/history as first-class data, not an afterthought.
- Build privileged writes on the server side, not directly from the browser.
- Use Vietnamese copy by default unless the user asks for bilingual UI.

## Verification Defaults

- `npm run build`
- `node_modules\\.bin\\tsc.cmd --noEmit`

Note:

- `npm run lint` is declared in `package.json` but `eslint` is not installed in the current repo baseline.
- Future agents should install and configure linting only when asked or when starting implementation work that justifies it.

## Short Summary For New Agents

This repo is not a finished logistics system yet. It is a Vietnamese Next.js prototype for a barge-based container tracking product. The active product decision is to build a practical MVP on Vercel + Supabase with focus on RBAC, master data, container lifecycle, yard operations, EDI import, barge/voyage workflow, realtime tracking, alerts, reports, and customer lookup. Ignore simulation and AHP unless the user explicitly brings them back into scope.
