import test from "node:test"
import assert from "node:assert/strict"

import {
  buildTransportSummary,
  getVehicleStatusMeta,
  getVoyageStatusMeta,
  type TransportPendingContainerItem,
  type TransportVehicleItem,
  type TransportVoyageItem,
} from "../../lib/transport/transport-view-model.ts"

const vehicles: TransportVehicleItem[] = [
  {
    id: "v1",
    code: "SL-HP-001",
    name: "Song Duong 01",
    status: "available",
    statusLabel: "Sẵn sàng",
    capacityLabel: "8 TEU",
    locationLabel: "Hai Phong",
    updatedAtLabel: "2026-04-05 09:30",
  },
  {
    id: "v2",
    code: "SL-HP-002",
    name: "Song Duong 02",
    status: "in_use",
    statusLabel: "Đang khai thác",
    capacityLabel: "10 TEU",
    locationLabel: "Song Duong",
    updatedAtLabel: "2026-04-05 08:40",
  },
]

const voyages: TransportVoyageItem[] = [
  {
    id: "voy1",
    code: "VG-001",
    status: "loading",
    statusLabel: "Đang xếp hàng",
    routeLabel: "Hai Phong -> Ha Noi",
    vehicleLabel: "SL-HP-001",
    etaLabel: "2026-04-05 18:00",
    etdLabel: "2026-04-05 12:00",
    checkpointLabel: null,
    manifestCount: 3,
  },
]

const pendingContainers: TransportPendingContainerItem[] = [
  {
    id: "c1",
    containerNo: "MSKU1234567",
    originLabel: "Hai Phong",
    destinationLabel: "ICD Ha Noi",
    weightLabel: "24,500 kg",
    statusLabel: "Tại bãi cảng biển",
  },
  {
    id: "c2",
    containerNo: "TGHU7654321",
    originLabel: "Hai Phong",
    destinationLabel: "ICD Ha Noi",
    weightLabel: "18,100 kg",
    statusLabel: "Tại bãi cảng biển",
  },
]

test("maps transport statuses to Vietnamese labels", () => {
  assert.equal(getVehicleStatusMeta("available").label, "Sẵn sàng")
  assert.equal(getVehicleStatusMeta("maintenance").label, "Bảo dưỡng")
  assert.equal(getVehicleStatusMeta("in_use").label, "Đang khai thác")

  assert.equal(getVoyageStatusMeta("draft").label, "Nháp")
  assert.equal(getVoyageStatusMeta("planned").label, "Kế hoạch")
  assert.equal(getVoyageStatusMeta("loading").label, "Đang xếp hàng")
  assert.equal(getVoyageStatusMeta("departed").label, "Đã rời bến")
  assert.equal(getVoyageStatusMeta("arrived").label, "Đã đến")
  assert.equal(getVoyageStatusMeta("cancelled").label, "Đã hủy")
})

test("builds zero-safe transport summary", () => {
  assert.deepEqual(buildTransportSummary({
    vehicles: [],
    voyages: [],
    pendingContainers: [],
  }), {
    totalVehicles: 0,
    availableVehicles: 0,
    activeVoyages: 0,
    pendingContainers: 0,
    assignedContainers: 0,
  })

  assert.deepEqual(buildTransportSummary({
    vehicles,
    voyages,
    pendingContainers,
  }), {
    totalVehicles: 2,
    availableVehicles: 1,
    activeVoyages: 1,
    pendingContainers: 2,
    assignedContainers: 3,
  })
})
