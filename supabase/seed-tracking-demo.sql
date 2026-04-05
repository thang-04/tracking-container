BEGIN;

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

COMMIT;
