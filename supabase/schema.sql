begin;

create extension if not exists pgcrypto;

create type public.profile_role as enum (
  'admin',
  'seaport_staff',
  'dryport_staff',
  'customer'
);

create type public.port_type as enum (
  'seaport',
  'dryport'
);

create type public.container_status as enum (
  'new',
  'at_seaport_yard',
  'on_barge',
  'in_transit',
  'at_dryport_yard',
  'released',
  'hold'
);

create type public.customs_status as enum (
  'pending',
  'cleared',
  'hold'
);

create type public.container_source_type as enum (
  'manual',
  'edi'
);

create type public.container_event_type as enum (
  'created',
  'edi_imported',
  'yard_in',
  'yard_move',
  'yard_out',
  'voyage_assigned',
  'voyage_departed',
  'checkpoint_updated',
  'voyage_arrived',
  'customs_changed',
  'released',
  'alert_created'
);

create type public.container_event_source_type as enum (
  'system',
  'user',
  'edi',
  'gps'
);

create type public.edi_batch_status as enum (
  'uploaded',
  'validated',
  'imported',
  'partial',
  'rejected'
);

create type public.edi_validation_status as enum (
  'pending',
  'valid',
  'invalid'
);

create type public.edi_import_status as enum (
  'pending',
  'imported',
  'rejected'
);

create type public.vehicle_type as enum (
  'barge'
);

create type public.vehicle_status as enum (
  'available',
  'maintenance',
  'in_use'
);

create type public.voyage_status as enum (
  'draft',
  'planned',
  'loading',
  'departed',
  'arrived',
  'cancelled'
);

create type public.voyage_load_status as enum (
  'planned',
  'loaded',
  'unloaded'
);

create type public.tracking_geofence_status as enum (
  'normal',
  'entered',
  'exited',
  'deviated'
);

create type public.tracking_source_type as enum (
  'gps',
  'manual'
);

create type public.alert_type as enum (
  'delay',
  'hold',
  'route_deviation',
  'congestion',
  'maintenance',
  'weather'
);

create type public.alert_severity as enum (
  'info',
  'warning',
  'critical'
);

create type public.alert_status as enum (
  'open',
  'acknowledged',
  'resolved'
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  tax_code text,
  contact_name text,
  phone text,
  email text,
  address text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shipping_lines (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  country text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.container_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  iso_code text,
  length_ft integer,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ports (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  port_type public.port_type not null,
  address text,
  lat numeric(10,7),
  lng numeric(10,7),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.yards (
  id uuid primary key default gen_random_uuid(),
  port_id uuid not null references public.ports(id),
  code text not null,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_yards_port_code unique (port_id, code)
);

create table if not exists public.yard_blocks (
  id uuid primary key default gen_random_uuid(),
  yard_id uuid not null references public.yards(id),
  code text not null,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_yard_blocks_yard_code unique (yard_id, code)
);

create table if not exists public.yard_slots (
  id uuid primary key default gen_random_uuid(),
  block_id uuid not null references public.yard_blocks(id),
  code text not null,
  row_no integer,
  bay_no integer,
  tier_no integer,
  max_weight_kg numeric(14,3),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_yard_slots_block_code unique (block_id, code)
);

create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  origin_port_id uuid not null references public.ports(id),
  destination_port_id uuid not null references public.ports(id),
  standard_eta_hours integer,
  distance_km numeric(14,3),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_routes_origin_destination_diff check (origin_port_id <> destination_port_id)
);

create table if not exists public.route_checkpoints (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references public.routes(id),
  seq_no integer not null,
  name text not null,
  lat numeric(10,7) not null,
  lng numeric(10,7) not null,
  radius_m integer,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_route_checkpoints_route_seq unique (route_id, seq_no)
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role public.profile_role not null,
  port_id uuid references public.ports(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  phone text,
  job_title text,
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  vehicle_type public.vehicle_type not null default 'barge',
  registration_no text,
  capacity_teu integer,
  capacity_weight_kg numeric(14,3),
  status public.vehicle_status not null default 'available',
  current_lat numeric(10,7),
  current_lng numeric(10,7),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_vehicles_registration_no unique (registration_no)
);

create table if not exists public.voyages (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  vehicle_id uuid not null references public.vehicles(id),
  route_id uuid not null references public.routes(id),
  status public.voyage_status not null default 'draft',
  etd timestamptz,
  eta timestamptz,
  atd timestamptz,
  ata timestamptz,
  current_checkpoint_id uuid references public.route_checkpoints(id) on delete set null,
  current_lat numeric(10,7),
  current_lng numeric(10,7),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.edi_batches (
  id uuid primary key default gen_random_uuid(),
  batch_no text not null unique,
  file_name text not null,
  file_path text not null,
  status public.edi_batch_status not null default 'uploaded',
  total_rows integer not null default 0,
  success_rows integer not null default 0,
  error_rows integer not null default 0,
  uploaded_by uuid references public.profiles(id) on delete set null,
  uploaded_at timestamptz,
  processed_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.containers (
  id uuid primary key default gen_random_uuid(),
  container_no text not null unique,
  container_type_id uuid not null references public.container_types(id),
  shipping_line_id uuid references public.shipping_lines(id) on delete set null,
  customer_id uuid references public.customers(id) on delete set null,
  route_id uuid references public.routes(id) on delete set null,
  current_status public.container_status not null default 'new',
  customs_status public.customs_status not null default 'pending',
  current_port_id uuid references public.ports(id) on delete set null,
  current_yard_id uuid references public.yards(id) on delete set null,
  current_block_id uuid references public.yard_blocks(id) on delete set null,
  current_slot_id uuid references public.yard_slots(id) on delete set null,
  current_voyage_id uuid references public.voyages(id) on delete set null,
  eta timestamptz,
  gross_weight_kg numeric(14,3),
  seal_no text,
  bill_no text,
  source_type public.container_source_type not null default 'manual',
  edi_batch_id uuid references public.edi_batches(id) on delete set null,
  last_event_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.edi_batch_rows (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.edi_batches(id) on delete cascade,
  row_no integer not null,
  raw_data jsonb not null,
  container_no text,
  validation_status public.edi_validation_status not null default 'pending',
  import_status public.edi_import_status not null default 'pending',
  error_message text,
  imported_container_id uuid references public.containers(id) on delete set null,
  replay_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_edi_batch_rows_batch_row_no unique (batch_id, row_no)
);

create table if not exists public.voyage_containers (
  id uuid primary key default gen_random_uuid(),
  voyage_id uuid not null references public.voyages(id) on delete cascade,
  container_id uuid not null references public.containers(id),
  sequence_no integer,
  load_status public.voyage_load_status not null default 'planned',
  loaded_at timestamptz,
  unloaded_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_voyage_containers_voyage_container unique (voyage_id, container_id)
);

create table if not exists public.voyage_checkpoints (
  id uuid primary key default gen_random_uuid(),
  voyage_id uuid not null references public.voyages(id) on delete cascade,
  checkpoint_id uuid references public.route_checkpoints(id) on delete set null,
  checkpoint_time timestamptz not null,
  lat numeric(10,7),
  lng numeric(10,7),
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.tracking_positions (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  voyage_id uuid references public.voyages(id) on delete set null,
  lat numeric(10,7) not null,
  lng numeric(10,7) not null,
  speed numeric(10,3),
  heading numeric(10,3),
  geofence_status public.tracking_geofence_status not null default 'normal',
  source_type public.tracking_source_type not null default 'manual',
  recorded_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  alert_type public.alert_type not null,
  severity public.alert_severity not null,
  status public.alert_status not null default 'open',
  container_id uuid references public.containers(id) on delete set null,
  voyage_id uuid references public.voyages(id) on delete set null,
  vehicle_id uuid references public.vehicles(id) on delete set null,
  title text not null,
  message text not null,
  triggered_at timestamptz not null default now(),
  acknowledged_by uuid references public.profiles(id) on delete set null,
  acknowledged_at timestamptz,
  resolved_by uuid references public.profiles(id) on delete set null,
  resolved_at timestamptz,
  resolution_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.container_events (
  id uuid primary key default gen_random_uuid(),
  container_id uuid not null references public.containers(id) on delete cascade,
  event_type public.container_event_type not null,
  event_time timestamptz not null,
  from_status public.container_status,
  to_status public.container_status,
  from_slot_id uuid references public.yard_slots(id) on delete set null,
  to_slot_id uuid references public.yard_slots(id) on delete set null,
  voyage_id uuid references public.voyages(id) on delete set null,
  description text,
  source_type public.container_event_source_type not null default 'system',
  actor_user_id uuid references public.profiles(id) on delete set null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_port_id on public.profiles(port_id);
create index if not exists idx_profiles_customer_id on public.profiles(customer_id);

create index if not exists idx_yards_port_id on public.yards(port_id);
create index if not exists idx_yard_blocks_yard_id on public.yard_blocks(yard_id);
create index if not exists idx_yard_slots_block_id on public.yard_slots(block_id);

create index if not exists idx_routes_origin_port_id on public.routes(origin_port_id);
create index if not exists idx_routes_destination_port_id on public.routes(destination_port_id);
create index if not exists idx_route_checkpoints_route_id on public.route_checkpoints(route_id);

create index if not exists idx_vehicles_status on public.vehicles(status);

create index if not exists idx_voyages_vehicle_id on public.voyages(vehicle_id);
create index if not exists idx_voyages_route_id on public.voyages(route_id);
create index if not exists idx_voyages_status on public.voyages(status);
create index if not exists idx_voyages_eta on public.voyages(eta);

create index if not exists idx_edi_batches_status on public.edi_batches(status);
create index if not exists idx_edi_batches_uploaded_by on public.edi_batches(uploaded_by);
create index if not exists idx_edi_batches_uploaded_at on public.edi_batches(uploaded_at desc);

create index if not exists idx_containers_customer_id on public.containers(customer_id);
create index if not exists idx_containers_shipping_line_id on public.containers(shipping_line_id);
create index if not exists idx_containers_current_status on public.containers(current_status);
create index if not exists idx_containers_customs_status on public.containers(customs_status);
create index if not exists idx_containers_current_port_id on public.containers(current_port_id);
create index if not exists idx_containers_current_slot_id on public.containers(current_slot_id);
create index if not exists idx_containers_current_voyage_id on public.containers(current_voyage_id);
create index if not exists idx_containers_eta on public.containers(eta);
create index if not exists idx_containers_last_event_at on public.containers(last_event_at desc);

create unique index if not exists uq_containers_current_slot_id
  on public.containers(current_slot_id)
  where current_slot_id is not null;

create index if not exists idx_edi_batch_rows_batch_id on public.edi_batch_rows(batch_id);
create index if not exists idx_edi_batch_rows_container_no on public.edi_batch_rows(container_no);
create index if not exists idx_edi_batch_rows_validation_status on public.edi_batch_rows(validation_status);
create index if not exists idx_edi_batch_rows_import_status on public.edi_batch_rows(import_status);

create index if not exists idx_voyage_containers_container_id on public.voyage_containers(container_id);
create index if not exists idx_voyage_containers_load_status on public.voyage_containers(load_status);

create unique index if not exists uq_voyage_containers_active_container
  on public.voyage_containers(container_id)
  where load_status in ('planned', 'loaded');

create index if not exists idx_voyage_checkpoints_voyage_id on public.voyage_checkpoints(voyage_id);
create index if not exists idx_voyage_checkpoints_checkpoint_time on public.voyage_checkpoints(checkpoint_time desc);

create index if not exists idx_tracking_positions_vehicle_recorded_at
  on public.tracking_positions(vehicle_id, recorded_at desc);
create index if not exists idx_tracking_positions_voyage_recorded_at
  on public.tracking_positions(voyage_id, recorded_at desc);

create index if not exists idx_alerts_status on public.alerts(status);
create index if not exists idx_alerts_alert_type on public.alerts(alert_type);
create index if not exists idx_alerts_severity on public.alerts(severity);
create index if not exists idx_alerts_container_id on public.alerts(container_id);
create index if not exists idx_alerts_voyage_id on public.alerts(voyage_id);
create index if not exists idx_alerts_vehicle_id on public.alerts(vehicle_id);
create index if not exists idx_alerts_triggered_at on public.alerts(triggered_at desc);

create index if not exists idx_container_events_container_event_time
  on public.container_events(container_id, event_time desc);
create index if not exists idx_container_events_event_type on public.container_events(event_type);
create index if not exists idx_container_events_voyage_id on public.container_events(voyage_id);

drop trigger if exists trg_customers_set_updated_at on public.customers;
create trigger trg_customers_set_updated_at
before update on public.customers
for each row
execute function public.set_updated_at();

drop trigger if exists trg_shipping_lines_set_updated_at on public.shipping_lines;
create trigger trg_shipping_lines_set_updated_at
before update on public.shipping_lines
for each row
execute function public.set_updated_at();

drop trigger if exists trg_container_types_set_updated_at on public.container_types;
create trigger trg_container_types_set_updated_at
before update on public.container_types
for each row
execute function public.set_updated_at();

drop trigger if exists trg_ports_set_updated_at on public.ports;
create trigger trg_ports_set_updated_at
before update on public.ports
for each row
execute function public.set_updated_at();

drop trigger if exists trg_yards_set_updated_at on public.yards;
create trigger trg_yards_set_updated_at
before update on public.yards
for each row
execute function public.set_updated_at();

drop trigger if exists trg_yard_blocks_set_updated_at on public.yard_blocks;
create trigger trg_yard_blocks_set_updated_at
before update on public.yard_blocks
for each row
execute function public.set_updated_at();

drop trigger if exists trg_yard_slots_set_updated_at on public.yard_slots;
create trigger trg_yard_slots_set_updated_at
before update on public.yard_slots
for each row
execute function public.set_updated_at();

drop trigger if exists trg_routes_set_updated_at on public.routes;
create trigger trg_routes_set_updated_at
before update on public.routes
for each row
execute function public.set_updated_at();

drop trigger if exists trg_route_checkpoints_set_updated_at on public.route_checkpoints;
create trigger trg_route_checkpoints_set_updated_at
before update on public.route_checkpoints
for each row
execute function public.set_updated_at();

drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists trg_vehicles_set_updated_at on public.vehicles;
create trigger trg_vehicles_set_updated_at
before update on public.vehicles
for each row
execute function public.set_updated_at();

drop trigger if exists trg_voyages_set_updated_at on public.voyages;
create trigger trg_voyages_set_updated_at
before update on public.voyages
for each row
execute function public.set_updated_at();

drop trigger if exists trg_edi_batches_set_updated_at on public.edi_batches;
create trigger trg_edi_batches_set_updated_at
before update on public.edi_batches
for each row
execute function public.set_updated_at();

drop trigger if exists trg_containers_set_updated_at on public.containers;
create trigger trg_containers_set_updated_at
before update on public.containers
for each row
execute function public.set_updated_at();

drop trigger if exists trg_edi_batch_rows_set_updated_at on public.edi_batch_rows;
create trigger trg_edi_batch_rows_set_updated_at
before update on public.edi_batch_rows
for each row
execute function public.set_updated_at();

drop trigger if exists trg_voyage_containers_set_updated_at on public.voyage_containers;
create trigger trg_voyage_containers_set_updated_at
before update on public.voyage_containers
for each row
execute function public.set_updated_at();

drop trigger if exists trg_alerts_set_updated_at on public.alerts;
create trigger trg_alerts_set_updated_at
before update on public.alerts
for each row
execute function public.set_updated_at();

comment on table public.profiles is 'Application user profiles linked 1-1 with Supabase auth.users.';
comment on table public.customers is 'Customers that own or track containers.';
comment on table public.shipping_lines is 'Shipping line master data.';
comment on table public.container_types is 'Container type master data.';
comment on table public.ports is 'Seaport and dry port master data.';
comment on table public.yards is 'Yards belonging to ports.';
comment on table public.yard_blocks is 'Blocks inside a yard.';
comment on table public.yard_slots is 'Physical slots inside a block.';
comment on table public.routes is 'Standard transport routes.';
comment on table public.route_checkpoints is 'Standard checkpoints used for route tracking and geofence rules.';
comment on table public.containers is 'Central container table storing current state.';
comment on table public.container_events is 'Full container timeline and audit trail.';
comment on table public.edi_batches is 'EDI import batch at file level.';
comment on table public.edi_batch_rows is 'EDI rows for preview, validation and import result.';
comment on table public.vehicles is 'Transport vehicles, currently focused on barges.';
comment on table public.voyages is 'Trips performed by vehicles on routes.';
comment on table public.voyage_containers is 'Voyage manifest items.';
comment on table public.voyage_checkpoints is 'Actual checkpoints reached by a voyage.';
comment on table public.tracking_positions is 'Realtime or manual tracking coordinates.';
comment on table public.alerts is 'Operational alerts and incidents.';

commit;
