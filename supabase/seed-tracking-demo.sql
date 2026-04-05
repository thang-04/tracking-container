BEGIN;

-- This seed expects demo auth users to exist first.
-- Run `npm run seed:demo-auth` before executing this SQL.

CREATE TEMP TABLE demo_seed_users (
  email text PRIMARY KEY,
  full_name text NOT NULL,
  role public.profile_role NOT NULL,
  port_code text,
  customer_code text,
  phone text,
  job_title text
) ON COMMIT DROP;

INSERT INTO demo_seed_users (
  email,
  full_name,
  role,
  port_code,
  customer_code,
  phone,
  job_title
) VALUES
  (
    'admin.demo@tracking.local',
    'Tran Minh Admin',
    'admin',
    NULL,
    NULL,
    '0901000001',
    'System Administrator'
  ),
  (
    'seaport.demo@tracking.local',
    'Nguyen Hai Operations',
    'seaport_staff',
    'PORT-HCM',
    NULL,
    '0901000002',
    'Seaport Dispatcher'
  ),
  (
    'dryport.demo@tracking.local',
    'Le Thu Yard',
    'dryport_staff',
    'PORT-BDU',
    NULL,
    '0901000003',
    'Dryport Supervisor'
  ),
  (
    'customer.demo@tracking.local',
    'Pham Lan Customer',
    'customer',
    NULL,
    'CUST-ALPHA',
    '0901000004',
    'Customer Logistics Lead'
  );

DO $$
DECLARE
  missing_emails text;
BEGIN
  SELECT string_agg(required.email, ', ' ORDER BY required.email)
  INTO missing_emails
  FROM demo_seed_users required
  LEFT JOIN auth.users users
    ON users.email = required.email
  WHERE users.id IS NULL;

  IF missing_emails IS NOT NULL THEN
    RAISE EXCEPTION
      'Missing demo auth users: %. Run "npm run seed:demo-auth" first.',
      missing_emails;
  END IF;
END $$;

-- Demo customers
INSERT INTO customers (
  id, code, name, tax_code, contact_name, phone, email, address, is_active, created_at, updated_at
) VALUES
  ('10000000-0000-0000-0000-000000000001', 'CUST-ALPHA', 'Cong ty TNHH May Mac Alpha', '0312345678', 'Pham Lan', '02873000001', 'ops@alpha.example', 'KCN Tan Tao, TP HCM', true, NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000002', 'CUST-BETA', 'Cong ty CP Dien Tu Beta', '0209876543', 'Hoang Nam', '02253000002', 'supply@beta.example', 'Quan Le Chan, Hai Phong', true, NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000003', 'CUST-GAMMA', 'Cong ty Logistics Gamma', '3701122334', 'Vu Quynh', '02743000003', 'control@gamma.example', 'Di An, Binh Duong', true, NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  tax_code = EXCLUDED.tax_code,
  contact_name = EXCLUDED.contact_name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  address = EXCLUDED.address,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Demo shipping lines
INSERT INTO shipping_lines (
  id, code, name, country, is_active, created_at, updated_at
) VALUES
  ('11000000-0000-0000-0000-000000000001', 'MAE', 'Maersk Line', 'Denmark', true, NOW(), NOW()),
  ('11000000-0000-0000-0000-000000000002', 'MSC', 'Mediterranean Shipping Company', 'Switzerland', true, NOW(), NOW()),
  ('11000000-0000-0000-0000-000000000003', 'CMA', 'CMA CGM', 'France', true, NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  country = EXCLUDED.country,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Demo container types
INSERT INTO container_types (
  id, code, name, iso_code, length_ft, description, is_active, created_at, updated_at
) VALUES
  ('11111111-1111-1111-1111-111111111111', '40HC', 'Container 40HC', '45G1', 40, 'Container cao 40 feet cho hàng khối lượng lớn', true, NOW(), NOW()),
  ('11111111-1111-1111-1111-111111111112', '20GP', 'Container 20GP', '22G1', 20, 'Container tiêu chuẩn 20 feet', true, NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  iso_code = EXCLUDED.iso_code,
  length_ft = EXCLUDED.length_ft,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

INSERT INTO container_types (
  id, code, name, iso_code, length_ft, description, is_active, created_at, updated_at
) VALUES
  ('11111111-1111-1111-1111-111111111113', '40GP', 'Container 40GP', '42G1', 40, 'Container 40 feet general purpose', true, NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  iso_code = EXCLUDED.iso_code,
  length_ft = EXCLUDED.length_ft,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Demo ports
INSERT INTO ports (
  id, code, name, port_type, address, lat, lng, is_active, created_at, updated_at
) VALUES
  ('22222222-2222-2222-2222-222222222221', 'PORT-HPC', 'Cảng Hải Phòng', 'seaport', 'Hải Phòng, Việt Nam', 20.8449000, 106.6881000, true, NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'PORT-HCM', 'Cảng Cát Lái', 'seaport', 'TP. Hồ Chí Minh, Việt Nam', 10.7769000, 106.7358000, true, NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222223', 'PORT-HNI', 'ICD Hà Nội', 'dryport', 'Hà Nội, Việt Nam', 21.0278000, 105.8342000, true, NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222224', 'PORT-BDU', 'ICD Sóng Thần', 'dryport', 'Bình Dương, Việt Nam', 10.9270000, 106.7246000, true, NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  port_type = EXCLUDED.port_type,
  address = EXCLUDED.address,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Demo yards
INSERT INTO yards (
  id, port_id, code, name, description, is_active, created_at, updated_at
) VALUES
  ('23000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'YD-CL-01', 'Cat Lai Yard 01', 'Primary seaport yard for HCM route', true, NOW(), NOW()),
  ('23000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222224', 'YD-ST-01', 'Song Than Yard 01', 'Receiving yard at dryport', true, NOW(), NOW()),
  ('23000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222221', 'YD-HP-01', 'Hai Phong Yard 01', 'Northern loading yard', true, NOW(), NOW()),
  ('23000000-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222223', 'YD-HN-01', 'Ha Noi Yard 01', 'Dryport inbound yard', true, NOW(), NOW())
ON CONFLICT (port_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Demo yard blocks
INSERT INTO yard_blocks (
  id, yard_id, code, name, description, is_active, created_at, updated_at
) VALUES
  ('23100000-0000-0000-0000-000000000001', '23000000-0000-0000-0000-000000000001', 'A1', 'Block A1', 'Inbound block at Cat Lai', true, NOW(), NOW()),
  ('23100000-0000-0000-0000-000000000002', '23000000-0000-0000-0000-000000000001', 'B1', 'Block B1', 'Overflow block at Cat Lai', true, NOW(), NOW()),
  ('23100000-0000-0000-0000-000000000003', '23000000-0000-0000-0000-000000000002', 'A1', 'Block A1', 'Receiving block at Song Than', true, NOW(), NOW()),
  ('23100000-0000-0000-0000-000000000004', '23000000-0000-0000-0000-000000000003', 'A1', 'Block A1', 'Loading block at Hai Phong', true, NOW(), NOW()),
  ('23100000-0000-0000-0000-000000000005', '23000000-0000-0000-0000-000000000004', 'A1', 'Block A1', 'Inbound block at Ha Noi ICD', true, NOW(), NOW())
ON CONFLICT (yard_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Demo yard slots
INSERT INTO yard_slots (
  id, block_id, code, row_no, bay_no, tier_no, max_weight_kg, is_active, created_at, updated_at
) VALUES
  ('23200000-0000-0000-0000-000000000001', '23100000-0000-0000-0000-000000000001', 'A1-01-01', 1, 1, 1, 30000.000, true, NOW(), NOW()),
  ('23200000-0000-0000-0000-000000000002', '23100000-0000-0000-0000-000000000001', 'A1-01-02', 1, 2, 1, 30000.000, true, NOW(), NOW()),
  ('23200000-0000-0000-0000-000000000003', '23100000-0000-0000-0000-000000000002', 'B1-01-01', 1, 1, 1, 30000.000, true, NOW(), NOW()),
  ('23200000-0000-0000-0000-000000000004', '23100000-0000-0000-0000-000000000003', 'A1-01-01', 1, 1, 1, 30000.000, true, NOW(), NOW()),
  ('23200000-0000-0000-0000-000000000005', '23100000-0000-0000-0000-000000000003', 'A1-01-02', 1, 2, 1, 30000.000, true, NOW(), NOW()),
  ('23200000-0000-0000-0000-000000000006', '23100000-0000-0000-0000-000000000004', 'A1-01-01', 1, 1, 1, 30000.000, true, NOW(), NOW()),
  ('23200000-0000-0000-0000-000000000007', '23100000-0000-0000-0000-000000000004', 'A1-01-02', 1, 2, 1, 30000.000, true, NOW(), NOW()),
  ('23200000-0000-0000-0000-000000000008', '23100000-0000-0000-0000-000000000005', 'A1-01-01', 1, 1, 1, 30000.000, true, NOW(), NOW())
ON CONFLICT (block_id, code) DO UPDATE SET
  row_no = EXCLUDED.row_no,
  bay_no = EXCLUDED.bay_no,
  tier_no = EXCLUDED.tier_no,
  max_weight_kg = EXCLUDED.max_weight_kg,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Demo profiles linked to auth.users
INSERT INTO profiles (
  id, email, full_name, role, port_id, customer_id, phone, job_title, is_active, last_login_at, created_at, updated_at
)
SELECT
  users.id,
  seed_users.email,
  seed_users.full_name,
  seed_users.role,
  ports.id,
  customers.id,
  seed_users.phone,
  seed_users.job_title,
  true,
  NOW() - INTERVAL '15 minutes',
  NOW(),
  NOW()
FROM demo_seed_users seed_users
JOIN auth.users users
  ON users.email = seed_users.email
LEFT JOIN ports
  ON ports.code = seed_users.port_code
LEFT JOIN customers
  ON customers.code = seed_users.customer_code
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  port_id = EXCLUDED.port_id,
  customer_id = EXCLUDED.customer_id,
  phone = EXCLUDED.phone,
  job_title = EXCLUDED.job_title,
  is_active = EXCLUDED.is_active,
  last_login_at = EXCLUDED.last_login_at,
  updated_at = NOW();

-- Demo routes
INSERT INTO routes (
  id, code, name, origin_port_id, destination_port_id, standard_eta_hours, distance_km, is_active, created_at, updated_at
) VALUES
  ('33333333-3333-3333-3333-333333333331', 'RT-HPC-HNI', 'Hải Phòng - Hà Nội', '22222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222223', 8, 95.400, true, NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333332', 'RT-HCM-BDU', 'Cát Lái - Sóng Thần', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222224', 4, 38.200, true, NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  origin_port_id = EXCLUDED.origin_port_id,
  destination_port_id = EXCLUDED.destination_port_id,
  standard_eta_hours = EXCLUDED.standard_eta_hours,
  distance_km = EXCLUDED.distance_km,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Demo route checkpoints
INSERT INTO route_checkpoints (
  id, route_id, seq_no, name, lat, lng, radius_m, description, created_at, updated_at
) VALUES
  ('44444444-4444-4444-4444-444444444331', '33333333-3333-3333-3333-333333333331', 1, 'Cảng Hải Phòng', 20.8449000, 106.6881000, 500, 'Điểm xuất phát', NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444332', '33333333-3333-3333-3333-333333333331', 2, 'ICD Hà Nội', 21.0278000, 105.8342000, 500, 'Điểm đến', NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444333', '33333333-3333-3333-3333-333333333332', 1, 'Cảng Cát Lái', 10.7769000, 106.7358000, 500, 'Điểm xuất phát', NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444334', '33333333-3333-3333-3333-333333333332', 2, 'ICD Sóng Thần', 10.9270000, 106.7246000, 500, 'Điểm đến', NOW(), NOW())
ON CONFLICT (route_id, seq_no) DO UPDATE SET
  name = EXCLUDED.name,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  radius_m = EXCLUDED.radius_m,
  description = EXCLUDED.description,
  updated_at = NOW();

-- Demo vehicles
INSERT INTO vehicles (
  id, code, name, vehicle_type, registration_no, capacity_teu, capacity_weight_kg, status, current_lat, current_lng, note, created_at, updated_at
) VALUES
  ('55555555-5555-5555-5555-555555555551', 'VHL-001', 'Sà lan Sài Gòn 18', 'barge', 'SG-001.18', 120, 180000.000, 'in_use', 10.8800000, 106.7300000, 'Đang chạy tuyến Cát Lái - Sóng Thần', NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555552', 'VHL-002', 'Sà lan Bắc 12', 'barge', 'HP-012.12', 110, 170000.000, 'in_use', 20.9600000, 106.2100000, 'Đang chạy tuyến Hải Phòng - Hà Nội', NOW(), NOW()),
  ('55555555-5555-5555-5555-555555555553', 'VHL-003', 'Sà lan Dự phòng 03', 'barge', 'DP-003.03', 90, 150000.000, 'available', 10.7769000, 106.7358000, 'Phương tiện dự phòng tại Cát Lái', NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  vehicle_type = EXCLUDED.vehicle_type,
  registration_no = EXCLUDED.registration_no,
  capacity_teu = EXCLUDED.capacity_teu,
  capacity_weight_kg = EXCLUDED.capacity_weight_kg,
  status = EXCLUDED.status,
  current_lat = EXCLUDED.current_lat,
  current_lng = EXCLUDED.current_lng,
  note = EXCLUDED.note,
  updated_at = NOW();

-- Demo voyages
INSERT INTO voyages (
  id, code, vehicle_id, route_id, status, etd, eta, atd, ata, current_checkpoint_id, current_lat, current_lng, note, created_at, updated_at
) VALUES
  ('66666666-6666-6666-6666-666666666661', 'VY-20260405-001', '55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333332', 'departed', NOW() - INTERVAL '2 hours', NOW() + INTERVAL '2 hours', NOW() - INTERVAL '1 hour 45 minutes', NULL, '44444444-4444-4444-4444-444444444334', 10.8800000, 106.7300000, 'Chuyến đi đang trên hành trình', NOW(), NOW()),
  ('66666666-6666-6666-6666-666666666662', 'VY-20260405-002', '55555555-5555-5555-5555-555555555552', '33333333-3333-3333-3333-333333333331', 'loading', NOW() + INTERVAL '1 hour', NOW() + INTERVAL '9 hours', NULL, NULL, '44444444-4444-4444-4444-444444444331', 20.9600000, 106.2100000, 'Đang xếp hàng tại Hải Phòng', NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET
  vehicle_id = EXCLUDED.vehicle_id,
  route_id = EXCLUDED.route_id,
  status = EXCLUDED.status,
  etd = EXCLUDED.etd,
  eta = EXCLUDED.eta,
  atd = EXCLUDED.atd,
  ata = EXCLUDED.ata,
  current_checkpoint_id = EXCLUDED.current_checkpoint_id,
  current_lat = EXCLUDED.current_lat,
  current_lng = EXCLUDED.current_lng,
  note = EXCLUDED.note,
  updated_at = NOW();

INSERT INTO voyages (
  id, code, vehicle_id, route_id, status, etd, eta, atd, ata, current_checkpoint_id, current_lat, current_lng, note, created_at, updated_at
) VALUES
  ('66666666-6666-6666-6666-666666666663', 'VY-20260404-003', '55555555-5555-5555-5555-555555555553', '33333333-3333-3333-3333-333333333332', 'arrived', NOW() - INTERVAL '1 day 6 hours', NOW() - INTERVAL '1 day 2 hours', NOW() - INTERVAL '1 day 6 hours', NOW() - INTERVAL '1 day 2 hours 15 minutes', '44444444-4444-4444-4444-444444444334', 10.9270000, 106.7246000, 'Completed dryport delivery run', NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET
  vehicle_id = EXCLUDED.vehicle_id,
  route_id = EXCLUDED.route_id,
  status = EXCLUDED.status,
  etd = EXCLUDED.etd,
  eta = EXCLUDED.eta,
  atd = EXCLUDED.atd,
  ata = EXCLUDED.ata,
  current_checkpoint_id = EXCLUDED.current_checkpoint_id,
  current_lat = EXCLUDED.current_lat,
  current_lng = EXCLUDED.current_lng,
  note = EXCLUDED.note,
  updated_at = NOW();

UPDATE voyages
SET current_checkpoint_id = '44444444-4444-4444-4444-444444444333'
WHERE code = 'VY-20260405-001';

UPDATE voyages
SET
  route_id = '33333333-3333-3333-3333-333333333331',
  current_checkpoint_id = '44444444-4444-4444-4444-444444444332',
  current_lat = 21.0278000,
  current_lng = 105.8342000,
  updated_at = NOW()
WHERE code = 'VY-20260404-003';

-- Demo EDI batches
INSERT INTO edi_batches (
  id, batch_no, file_name, file_path, status, total_rows, success_rows, error_rows, uploaded_by, uploaded_at, processed_at, note, created_at, updated_at
) VALUES
  ('71000000-0000-0000-0000-000000000001', 'EDI-20260405-001', 'edi-arrival-20260405.csv', 'edi/demo/edi-arrival-20260405.csv', 'partial', 3, 2, 1, (SELECT id FROM profiles WHERE email = 'seaport.demo@tracking.local'), NOW() - INTERVAL '8 hours', NOW() - INTERVAL '7 hours 45 minutes', 'Demo partial import with one invalid row', NOW(), NOW()),
  ('71000000-0000-0000-0000-000000000002', 'EDI-20260404-001', 'edi-manifest-20260404.csv', 'edi/demo/edi-manifest-20260404.csv', 'imported', 2, 2, 0, (SELECT id FROM profiles WHERE email = 'seaport.demo@tracking.local'), NOW() - INTERVAL '1 day 8 hours', NOW() - INTERVAL '1 day 7 hours 30 minutes', 'Completed historical import batch', NOW(), NOW())
ON CONFLICT (batch_no) DO UPDATE SET
  file_name = EXCLUDED.file_name,
  file_path = EXCLUDED.file_path,
  status = EXCLUDED.status,
  total_rows = EXCLUDED.total_rows,
  success_rows = EXCLUDED.success_rows,
  error_rows = EXCLUDED.error_rows,
  uploaded_by = EXCLUDED.uploaded_by,
  uploaded_at = EXCLUDED.uploaded_at,
  processed_at = EXCLUDED.processed_at,
  note = EXCLUDED.note,
  updated_at = NOW();

-- Demo containers
INSERT INTO containers (
  id, container_no, container_type_id, shipping_line_id, customer_id, route_id, current_status, customs_status, current_port_id, current_yard_id, current_block_id, current_slot_id, current_voyage_id, eta, gross_weight_kg, seal_no, bill_no, source_type, edi_batch_id, last_event_at, note, created_at, updated_at
) VALUES
  ('77777777-7777-7777-7777-777777777771', 'MSKU1000001', '11111111-1111-1111-1111-111111111111', NULL, NULL, '33333333-3333-3333-3333-333333333332', 'at_seaport_yard', 'pending', '22222222-2222-2222-2222-222222222222', NULL, NULL, NULL, NULL, NOW() + INTERVAL '1 day', 22000.000, 'SEA-001', 'BL-001', 'manual', NULL, NOW() - INTERVAL '5 hours', 'Đang chờ xếp lên sà lan tại Cát Lái', NOW(), NOW()),
  ('77777777-7777-7777-7777-777777777772', 'MSKU1000002', '11111111-1111-1111-1111-111111111112', NULL, NULL, '33333333-3333-3333-3333-333333333332', 'on_barge', 'cleared', NULL, NULL, NULL, NULL, '66666666-6666-6666-6666-666666666661', NOW() + INTERVAL '4 hours', 19800.000, 'SEA-002', 'BL-002', 'edi', NULL, NOW() - INTERVAL '2 hours', 'Đang trên chuyến VY-20260405-001', NOW(), NOW()),
  ('77777777-7777-7777-7777-777777777773', 'MSKU1000003', '11111111-1111-1111-1111-111111111111', NULL, NULL, '33333333-3333-3333-3333-333333333332', 'on_barge', 'cleared', NULL, NULL, NULL, NULL, '66666666-6666-6666-6666-666666666661', NOW() + INTERVAL '4 hours', 22600.000, 'SEA-003', 'BL-003', 'manual', NULL, NOW() - INTERVAL '2 hours', 'Container đã được ghép manifest', NOW(), NOW()),
  ('77777777-7777-7777-7777-777777777774', 'MSKU1000004', '11111111-1111-1111-1111-111111111112', NULL, NULL, '33333333-3333-3333-3333-333333333331', 'at_dryport_yard', 'cleared', '22222222-2222-2222-2222-222222222223', NULL, NULL, NULL, NULL, NOW() + INTERVAL '8 hours', 20100.000, 'HNI-004', 'BL-004', 'manual', NULL, NOW() - INTERVAL '1 day', 'Đã về ICD Hà Nội', NOW(), NOW()),
  ('77777777-7777-7777-7777-777777777775', 'MSKU1000005', '11111111-1111-1111-1111-111111111111', NULL, NULL, '33333333-3333-3333-3333-333333333331', 'at_seaport_yard', 'pending', '22222222-2222-2222-2222-222222222221', NULL, NULL, NULL, NULL, NOW() + INTERVAL '9 hours', 21400.000, 'HPG-005', 'BL-005', 'manual', NULL, NOW() - INTERVAL '4 hours', 'Container đang ở Hải Phòng', NOW(), NOW()),
  ('77777777-7777-7777-7777-777777777776', 'MSKU1000006', '11111111-1111-1111-1111-111111111112', NULL, NULL, '33333333-3333-3333-3333-333333333331', 'on_barge', 'cleared', NULL, NULL, NULL, NULL, '66666666-6666-6666-6666-666666666662', NOW() + INTERVAL '8 hours', 19900.000, 'HPG-006', 'BL-006', 'edi', NULL, NOW() - INTERVAL '45 minutes', 'Container nằm trên chuyến VY-20260405-002', NOW(), NOW())
ON CONFLICT (container_no) DO UPDATE SET
  container_type_id = EXCLUDED.container_type_id,
  shipping_line_id = EXCLUDED.shipping_line_id,
  customer_id = EXCLUDED.customer_id,
  route_id = EXCLUDED.route_id,
  current_status = EXCLUDED.current_status,
  customs_status = EXCLUDED.customs_status,
  current_port_id = EXCLUDED.current_port_id,
  current_yard_id = EXCLUDED.current_yard_id,
  current_block_id = EXCLUDED.current_block_id,
  current_slot_id = EXCLUDED.current_slot_id,
  current_voyage_id = EXCLUDED.current_voyage_id,
  eta = EXCLUDED.eta,
  gross_weight_kg = EXCLUDED.gross_weight_kg,
  seal_no = EXCLUDED.seal_no,
  bill_no = EXCLUDED.bill_no,
  source_type = EXCLUDED.source_type,
  edi_batch_id = EXCLUDED.edi_batch_id,
  last_event_at = EXCLUDED.last_event_at,
  note = EXCLUDED.note,
  updated_at = NOW();

UPDATE containers
SET
  shipping_line_id = CASE container_no
    WHEN 'MSKU1000001' THEN '11000000-0000-0000-0000-000000000001'
    WHEN 'MSKU1000002' THEN '11000000-0000-0000-0000-000000000002'
    WHEN 'MSKU1000003' THEN '11000000-0000-0000-0000-000000000003'
    WHEN 'MSKU1000004' THEN '11000000-0000-0000-0000-000000000001'
    WHEN 'MSKU1000005' THEN '11000000-0000-0000-0000-000000000002'
    WHEN 'MSKU1000006' THEN '11000000-0000-0000-0000-000000000003'
    ELSE shipping_line_id
  END,
  customer_id = CASE container_no
    WHEN 'MSKU1000001' THEN '10000000-0000-0000-0000-000000000001'
    WHEN 'MSKU1000002' THEN '10000000-0000-0000-0000-000000000001'
    WHEN 'MSKU1000003' THEN '10000000-0000-0000-0000-000000000002'
    WHEN 'MSKU1000004' THEN '10000000-0000-0000-0000-000000000001'
    WHEN 'MSKU1000005' THEN '10000000-0000-0000-0000-000000000003'
    WHEN 'MSKU1000006' THEN '10000000-0000-0000-0000-000000000003'
    ELSE customer_id
  END,
  current_yard_id = CASE container_no
    WHEN 'MSKU1000001' THEN '23000000-0000-0000-0000-000000000001'
    WHEN 'MSKU1000004' THEN '23000000-0000-0000-0000-000000000004'
    WHEN 'MSKU1000005' THEN '23000000-0000-0000-0000-000000000003'
    ELSE current_yard_id
  END,
  current_block_id = CASE container_no
    WHEN 'MSKU1000001' THEN '23100000-0000-0000-0000-000000000001'
    WHEN 'MSKU1000004' THEN '23100000-0000-0000-0000-000000000005'
    WHEN 'MSKU1000005' THEN '23100000-0000-0000-0000-000000000004'
    ELSE current_block_id
  END,
  current_slot_id = CASE container_no
    WHEN 'MSKU1000001' THEN '23200000-0000-0000-0000-000000000001'
    WHEN 'MSKU1000004' THEN '23200000-0000-0000-0000-000000000008'
    WHEN 'MSKU1000005' THEN '23200000-0000-0000-0000-000000000006'
    ELSE current_slot_id
  END,
  edi_batch_id = CASE container_no
    WHEN 'MSKU1000002' THEN '71000000-0000-0000-0000-000000000001'
    WHEN 'MSKU1000006' THEN '71000000-0000-0000-0000-000000000001'
    ELSE edi_batch_id
  END,
  updated_at = NOW()
WHERE container_no IN (
  'MSKU1000001',
  'MSKU1000002',
  'MSKU1000003',
  'MSKU1000004',
  'MSKU1000005',
  'MSKU1000006'
);

INSERT INTO containers (
  id, container_no, container_type_id, shipping_line_id, customer_id, route_id, current_status, customs_status, current_port_id, current_yard_id, current_block_id, current_slot_id, current_voyage_id, eta, gross_weight_kg, seal_no, bill_no, source_type, edi_batch_id, last_event_at, note, created_at, updated_at
) VALUES
  ('77777777-7777-7777-7777-777777777777', 'MSKU1000007', '11111111-1111-1111-1111-111111111113', '11000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333332', 'hold', 'hold', '22222222-2222-2222-2222-222222222222', '23000000-0000-0000-0000-000000000001', '23100000-0000-0000-0000-000000000002', '23200000-0000-0000-0000-000000000003', NULL, NULL, 20500.000, 'HLD-007', 'BL-007', 'manual', NULL, NOW() - INTERVAL '90 minutes', 'Held for documentation review at Cat Lai', NOW(), NOW()),
  ('77777777-7777-7777-7777-777777777778', 'MSKU1000008', '11111111-1111-1111-1111-111111111112', '11000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333331', 'released', 'cleared', '22222222-2222-2222-2222-222222222223', NULL, NULL, NULL, NULL, NULL, 18500.000, 'REL-008', 'BL-008', 'edi', '71000000-0000-0000-0000-000000000002', NOW() - INTERVAL '1 day', 'Released to customer from Ha Noi ICD', NOW(), NOW()),
  ('77777777-7777-7777-7777-777777777779', 'MSKU1000009', '11111111-1111-1111-1111-111111111111', '11000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333332', 'new', 'pending', NULL, NULL, NULL, NULL, NULL, NOW() + INTERVAL '1 day', 21000.000, 'NEW-009', 'BL-009', 'manual', NULL, NOW() - INTERVAL '40 minutes', 'Newly created container awaiting yard inbound', NOW(), NOW())
ON CONFLICT (container_no) DO UPDATE SET
  container_type_id = EXCLUDED.container_type_id,
  shipping_line_id = EXCLUDED.shipping_line_id,
  customer_id = EXCLUDED.customer_id,
  route_id = EXCLUDED.route_id,
  current_status = EXCLUDED.current_status,
  customs_status = EXCLUDED.customs_status,
  current_port_id = EXCLUDED.current_port_id,
  current_yard_id = EXCLUDED.current_yard_id,
  current_block_id = EXCLUDED.current_block_id,
  current_slot_id = EXCLUDED.current_slot_id,
  current_voyage_id = EXCLUDED.current_voyage_id,
  eta = EXCLUDED.eta,
  gross_weight_kg = EXCLUDED.gross_weight_kg,
  seal_no = EXCLUDED.seal_no,
  bill_no = EXCLUDED.bill_no,
  source_type = EXCLUDED.source_type,
  edi_batch_id = EXCLUDED.edi_batch_id,
  last_event_at = EXCLUDED.last_event_at,
  note = EXCLUDED.note,
  updated_at = NOW();

-- Demo voyage containers
INSERT INTO voyage_containers (
  id, voyage_id, container_id, sequence_no, load_status, loaded_at, unloaded_at, note, created_at, updated_at
) VALUES
  ('88888888-8888-8888-8888-888888888871', '66666666-6666-6666-6666-666666666661', '77777777-7777-7777-7777-777777777772', 1, 'loaded', NOW() - INTERVAL '2 hours', NULL, 'Container thứ nhất trên manifest', NOW(), NOW()),
  ('88888888-8888-8888-8888-888888888872', '66666666-6666-6666-6666-666666666661', '77777777-7777-7777-7777-777777777773', 2, 'loaded', NOW() - INTERVAL '2 hours', NULL, 'Container thứ hai trên manifest', NOW(), NOW()),
  ('88888888-8888-8888-8888-888888888873', '66666666-6666-6666-6666-666666666662', '77777777-7777-7777-7777-777777777776', 1, 'planned', NULL, NULL, 'Đang chờ xếp lên chuyến VY-20260405-002', NOW(), NOW())
ON CONFLICT (voyage_id, container_id) DO UPDATE SET
  sequence_no = EXCLUDED.sequence_no,
  load_status = EXCLUDED.load_status,
  loaded_at = EXCLUDED.loaded_at,
  unloaded_at = EXCLUDED.unloaded_at,
  note = EXCLUDED.note,
  updated_at = NOW();

INSERT INTO voyage_containers (
  id, voyage_id, container_id, sequence_no, load_status, loaded_at, unloaded_at, note, created_at, updated_at
) VALUES
  ('88888888-8888-8888-8888-888888888873', '66666666-6666-6666-6666-666666666662', '77777777-7777-7777-7777-777777777776', 1, 'loaded', NOW() - INTERVAL '45 minutes', NULL, 'Loaded early while voyage is still in loading state', NOW(), NOW()),
  ('88888888-8888-8888-8888-888888888874', '66666666-6666-6666-6666-666666666663', '77777777-7777-7777-7777-777777777774', 1, 'unloaded', NOW() - INTERVAL '1 day 6 hours', NOW() - INTERVAL '1 day 2 hours 10 minutes', 'Historical unload at destination yard', NOW(), NOW()),
  ('88888888-8888-8888-8888-888888888875', '66666666-6666-6666-6666-666666666663', '77777777-7777-7777-7777-777777777778', 2, 'unloaded', NOW() - INTERVAL '1 day 6 hours', NOW() - INTERVAL '1 day 2 hours 5 minutes', 'Historical unload before customer release', NOW(), NOW())
ON CONFLICT (voyage_id, container_id) DO UPDATE SET
  sequence_no = EXCLUDED.sequence_no,
  load_status = EXCLUDED.load_status,
  loaded_at = EXCLUDED.loaded_at,
  unloaded_at = EXCLUDED.unloaded_at,
  note = EXCLUDED.note,
  updated_at = NOW();

-- Demo tracking positions
INSERT INTO tracking_positions (
  id, vehicle_id, voyage_id, lat, lng, speed, heading, geofence_status, source_type, recorded_at, created_at
) VALUES
  ('99999999-9999-9999-9999-999999999991', '55555555-5555-5555-5555-555555555551', '66666666-6666-6666-6666-666666666661', 10.8800000, 106.7300000, 16.500, 72.000, 'normal', 'gps', NOW() - INTERVAL '10 minutes', NOW()),
  ('99999999-9999-9999-9999-999999999992', '55555555-5555-5555-5555-555555555552', '66666666-6666-6666-6666-666666666662', 20.9600000, 106.2100000, 0.000, 0.000, 'normal', 'gps', NOW() - INTERVAL '8 minutes', NOW()),
  ('99999999-9999-9999-9999-999999999993', '55555555-5555-5555-5555-555555555553', NULL, 10.7769000, 106.7358000, 0.000, 0.000, 'normal', 'manual', NOW() - INTERVAL '5 minutes', NOW())
ON CONFLICT (id) DO UPDATE SET
  vehicle_id = EXCLUDED.vehicle_id,
  voyage_id = EXCLUDED.voyage_id,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  speed = EXCLUDED.speed,
  heading = EXCLUDED.heading,
  geofence_status = EXCLUDED.geofence_status,
  source_type = EXCLUDED.source_type,
  recorded_at = EXCLUDED.recorded_at;

-- Demo voyage checkpoints
INSERT INTO voyage_checkpoints (
  id, voyage_id, checkpoint_id, checkpoint_time, lat, lng, note, created_at
) VALUES
  ('73000000-0000-0000-0000-000000000001', '66666666-6666-6666-6666-666666666661', '44444444-4444-4444-4444-444444444333', NOW() - INTERVAL '1 hour 45 minutes', 10.7769000, 106.7358000, 'Departure checkpoint logged', NOW()),
  ('73000000-0000-0000-0000-000000000002', '66666666-6666-6666-6666-666666666663', '44444444-4444-4444-4444-444444444334', NOW() - INTERVAL '1 day 2 hours 15 minutes', 10.9270000, 106.7246000, 'Historical arrival checkpoint', NOW())
ON CONFLICT (id) DO UPDATE SET
  voyage_id = EXCLUDED.voyage_id,
  checkpoint_id = EXCLUDED.checkpoint_id,
  checkpoint_time = EXCLUDED.checkpoint_time,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  note = EXCLUDED.note;

UPDATE voyage_checkpoints
SET
  checkpoint_id = '44444444-4444-4444-4444-444444444332',
  lat = 21.0278000,
  lng = 105.8342000,
  note = 'Historical arrival checkpoint at Ha Noi ICD'
WHERE id = '73000000-0000-0000-0000-000000000002';

-- Demo EDI rows
INSERT INTO edi_batch_rows (
  id, batch_id, row_no, raw_data, container_no, validation_status, import_status, error_message, imported_container_id, replay_count, created_at, updated_at
) VALUES
  ('72000000-0000-0000-0000-000000000001', '71000000-0000-0000-0000-000000000001', 1, '{"container_no":"MSKU1000002","customer_code":"CUST-ALPHA","route_code":"RT-HCM-BDU"}'::jsonb, 'MSKU1000002', 'valid', 'imported', NULL, '77777777-7777-7777-7777-777777777772', 0, NOW(), NOW()),
  ('72000000-0000-0000-0000-000000000002', '71000000-0000-0000-0000-000000000001', 2, '{"container_no":"MSKU1000006","customer_code":"CUST-GAMMA","route_code":"RT-HPC-HNI"}'::jsonb, 'MSKU1000006', 'valid', 'imported', NULL, '77777777-7777-7777-7777-777777777776', 0, NOW(), NOW()),
  ('72000000-0000-0000-0000-000000000003', '71000000-0000-0000-0000-000000000001', 3, '{"container_no":"MSKU1999999","customer_code":null,"route_code":"RT-HCM-BDU"}'::jsonb, 'MSKU1999999', 'invalid', 'rejected', 'Missing customer_code mapping', NULL, 1, NOW(), NOW()),
  ('72000000-0000-0000-0000-000000000004', '71000000-0000-0000-0000-000000000002', 1, '{"container_no":"MSKU1000008","customer_code":"CUST-ALPHA","route_code":"RT-HPC-HNI"}'::jsonb, 'MSKU1000008', 'valid', 'imported', NULL, '77777777-7777-7777-7777-777777777778', 0, NOW(), NOW())
ON CONFLICT (batch_id, row_no) DO UPDATE SET
  raw_data = EXCLUDED.raw_data,
  container_no = EXCLUDED.container_no,
  validation_status = EXCLUDED.validation_status,
  import_status = EXCLUDED.import_status,
  error_message = EXCLUDED.error_message,
  imported_container_id = EXCLUDED.imported_container_id,
  replay_count = EXCLUDED.replay_count,
  updated_at = NOW();

-- Demo alerts
INSERT INTO alerts (
  id, alert_type, severity, status, container_id, voyage_id, vehicle_id, title, message, triggered_at, acknowledged_by, acknowledged_at, resolved_by, resolved_at, resolution_note, created_at, updated_at
) VALUES
  ('74000000-0000-0000-0000-000000000001', 'delay', 'warning', 'open', NULL, '66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555551', 'Voyage ETA drift', 'Active voyage is trending later than standard ETA.', NOW() - INTERVAL '35 minutes', NULL, NULL, NULL, NULL, NULL, NOW(), NOW()),
  ('74000000-0000-0000-0000-000000000002', 'hold', 'critical', 'open', '77777777-7777-7777-7777-777777777777', NULL, NULL, 'Container on hold', 'Container MSKU1000007 is blocked pending document review.', NOW() - INTERVAL '90 minutes', NULL, NULL, NULL, NULL, NULL, NOW(), NOW()),
  ('74000000-0000-0000-0000-000000000003', 'route_deviation', 'warning', 'acknowledged', NULL, '66666666-6666-6666-6666-666666666661', '55555555-5555-5555-5555-555555555551', 'Temporary route deviation', 'Barge deviated slightly from the reference route due to river traffic.', NOW() - INTERVAL '50 minutes', (SELECT id FROM profiles WHERE email = 'seaport.demo@tracking.local'), NOW() - INTERVAL '40 minutes', NULL, NULL, NULL, NOW(), NOW()),
  ('74000000-0000-0000-0000-000000000004', 'maintenance', 'info', 'resolved', NULL, NULL, '55555555-5555-5555-5555-555555555553', 'Routine maintenance complete', 'Standby barge completed inspection and is ready for allocation.', NOW() - INTERVAL '1 day', (SELECT id FROM profiles WHERE email = 'admin.demo@tracking.local'), NOW() - INTERVAL '23 hours 30 minutes', (SELECT id FROM profiles WHERE email = 'admin.demo@tracking.local'), NOW() - INTERVAL '22 hours', 'Inspection checklist completed.', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  alert_type = EXCLUDED.alert_type,
  severity = EXCLUDED.severity,
  status = EXCLUDED.status,
  container_id = EXCLUDED.container_id,
  voyage_id = EXCLUDED.voyage_id,
  vehicle_id = EXCLUDED.vehicle_id,
  title = EXCLUDED.title,
  message = EXCLUDED.message,
  triggered_at = EXCLUDED.triggered_at,
  acknowledged_by = EXCLUDED.acknowledged_by,
  acknowledged_at = EXCLUDED.acknowledged_at,
  resolved_by = EXCLUDED.resolved_by,
  resolved_at = EXCLUDED.resolved_at,
  resolution_note = EXCLUDED.resolution_note,
  updated_at = NOW();

-- Demo container timeline events
INSERT INTO container_events (
  id, container_id, event_type, event_time, from_status, to_status, from_slot_id, to_slot_id, voyage_id, description, source_type, actor_user_id, metadata, created_at
) VALUES
  ('75000000-0000-0000-0000-000000000001', '77777777-7777-7777-7777-777777777771', 'created', NOW() - INTERVAL '6 hours', NULL, 'new', NULL, NULL, NULL, 'Container created manually by operations', 'user', (SELECT id FROM profiles WHERE email = 'seaport.demo@tracking.local'), NULL, NOW()),
  ('75000000-0000-0000-0000-000000000002', '77777777-7777-7777-7777-777777777771', 'yard_in', NOW() - INTERVAL '5 hours', 'new', 'at_seaport_yard', NULL, '23200000-0000-0000-0000-000000000001', NULL, 'Container received into Cat Lai yard', 'user', (SELECT id FROM profiles WHERE email = 'seaport.demo@tracking.local'), '{"yard_code":"YD-CL-01"}'::jsonb, NOW()),
  ('75000000-0000-0000-0000-000000000003', '77777777-7777-7777-7777-777777777772', 'edi_imported', NOW() - INTERVAL '8 hours', NULL, 'new', NULL, NULL, NULL, 'Container imported from EDI batch', 'edi', (SELECT id FROM profiles WHERE email = 'seaport.demo@tracking.local'), '{"batch_no":"EDI-20260405-001"}'::jsonb, NOW()),
  ('75000000-0000-0000-0000-000000000004', '77777777-7777-7777-7777-777777777772', 'yard_out', NOW() - INTERVAL '3 hours', 'at_seaport_yard', 'on_barge', '23200000-0000-0000-0000-000000000002', NULL, '66666666-6666-6666-6666-666666666661', 'Container loaded from yard to active barge', 'user', (SELECT id FROM profiles WHERE email = 'seaport.demo@tracking.local'), '{"vehicle_code":"VHL-001"}'::jsonb, NOW()),
  ('75000000-0000-0000-0000-000000000005', '77777777-7777-7777-7777-777777777772', 'checkpoint_updated', NOW() - INTERVAL '20 minutes', NULL, NULL, NULL, NULL, '66666666-6666-6666-6666-666666666661', 'Latest route checkpoint recorded from GPS feed', 'gps', NULL, '{"checkpoint_id":"44444444-4444-4444-4444-444444444333"}'::jsonb, NOW()),
  ('75000000-0000-0000-0000-000000000006', '77777777-7777-7777-7777-777777777774', 'voyage_arrived', NOW() - INTERVAL '5 hours', 'on_barge', 'at_dryport_yard', NULL, '23200000-0000-0000-0000-000000000008', '66666666-6666-6666-6666-666666666663', 'Container discharged into dryport yard', 'user', (SELECT id FROM profiles WHERE email = 'dryport.demo@tracking.local'), '{"yard_code":"YD-HN-01"}'::jsonb, NOW()),
  ('75000000-0000-0000-0000-000000000007', '77777777-7777-7777-7777-777777777776', 'voyage_assigned', NOW() - INTERVAL '45 minutes', 'at_seaport_yard', 'on_barge', NULL, NULL, '66666666-6666-6666-6666-666666666662', 'Container assigned and loaded on northern voyage', 'user', (SELECT id FROM profiles WHERE email = 'seaport.demo@tracking.local'), '{"voyage_code":"VY-20260405-002"}'::jsonb, NOW()),
  ('75000000-0000-0000-0000-000000000008', '77777777-7777-7777-7777-777777777777', 'customs_changed', NOW() - INTERVAL '2 hours', 'at_seaport_yard', 'hold', NULL, NULL, NULL, 'Documentation issue moved container into hold state', 'user', (SELECT id FROM profiles WHERE email = 'seaport.demo@tracking.local'), '{"customs_status":"hold"}'::jsonb, NOW()),
  ('75000000-0000-0000-0000-000000000009', '77777777-7777-7777-7777-777777777777', 'alert_created', NOW() - INTERVAL '90 minutes', NULL, NULL, NULL, NULL, NULL, 'System opened a hold alert for operations follow-up', 'system', NULL, '{"alert_id":"74000000-0000-0000-0000-000000000002"}'::jsonb, NOW()),
  ('75000000-0000-0000-0000-000000000010', '77777777-7777-7777-7777-777777777778', 'released', NOW() - INTERVAL '1 day', 'at_dryport_yard', 'released', NULL, NULL, NULL, 'Container released to customer pickup', 'user', (SELECT id FROM profiles WHERE email = 'dryport.demo@tracking.local'), NULL, NOW()),
  ('75000000-0000-0000-0000-000000000011', '77777777-7777-7777-7777-777777777779', 'created', NOW() - INTERVAL '40 minutes', NULL, 'new', NULL, NULL, NULL, 'Container created and waiting for yard inbound', 'user', (SELECT id FROM profiles WHERE email = 'seaport.demo@tracking.local'), NULL, NOW())
ON CONFLICT (id) DO UPDATE SET
  container_id = EXCLUDED.container_id,
  event_type = EXCLUDED.event_type,
  event_time = EXCLUDED.event_time,
  from_status = EXCLUDED.from_status,
  to_status = EXCLUDED.to_status,
  from_slot_id = EXCLUDED.from_slot_id,
  to_slot_id = EXCLUDED.to_slot_id,
  voyage_id = EXCLUDED.voyage_id,
  description = EXCLUDED.description,
  source_type = EXCLUDED.source_type,
  actor_user_id = EXCLUDED.actor_user_id,
  metadata = EXCLUDED.metadata;

COMMIT;
