import test from "node:test"
import assert from "node:assert/strict"

import {
  buildAlertSummary,
  filterAlertDirectoryItems,
  getAlertSeverityMeta,
  getAlertStatusMeta,
  getAlertTypeMeta,
  type AlertDirectoryItem,
} from "../../lib/alerts/alert-view-model.ts"

const alerts: AlertDirectoryItem[] = [
  {
    id: "a1",
    title: "Tre han tren song",
    message: "Barge cham 2 gio",
    type: "delay",
    severity: "critical",
    status: "open",
    triggeredAtLabel: "2026-04-05 09:00",
    locationLabel: "Song Duong",
    vehicleLabel: "Barge HP-01",
    containerLabel: "MSKU1234567",
    voyageLabel: "VG-001",
    acknowledgedByLabel: null,
    resolvedByLabel: null,
  },
  {
    id: "a2",
    title: "Bao tri dinh ky",
    message: "Can bao tri dong co",
    type: "maintenance",
    severity: "warning",
    status: "acknowledged",
    triggeredAtLabel: "2026-04-05 06:00",
    locationLabel: null,
    vehicleLabel: "Barge HP-02",
    containerLabel: null,
    voyageLabel: null,
    acknowledgedByLabel: "Admin",
    resolvedByLabel: null,
  },
  {
    id: "a3",
    title: "Ket thuc canh bao thoi tiet",
    message: "Da tro lai binh thuong",
    type: "weather",
    severity: "info",
    status: "resolved",
    triggeredAtLabel: "2026-04-04 22:00",
    locationLabel: "Hai Phong",
    vehicleLabel: null,
    containerLabel: null,
    voyageLabel: null,
    acknowledgedByLabel: "Admin",
    resolvedByLabel: "Admin",
  },
]

test("maps alert labels for type, severity, and status", () => {
  assert.equal(getAlertTypeMeta("delay").label, "Trễ hành trình")
  assert.equal(getAlertTypeMeta("route_deviation").label, "Lệch tuyến")
  assert.equal(getAlertSeverityMeta("critical").label, "Nghiêm trọng")
  assert.equal(getAlertSeverityMeta("warning").label, "Cảnh báo")
  assert.equal(getAlertStatusMeta("open").label, "Đang mở")
  assert.equal(getAlertStatusMeta("acknowledged").label, "Đã xác nhận")
  assert.equal(getAlertStatusMeta("resolved").label, "Đã giải quyết")
})

test("builds zero-safe alert summary", () => {
  assert.deepEqual(buildAlertSummary([]), {
    total: 0,
    open: 0,
    acknowledged: 0,
    resolved: 0,
    criticalOpen: 0,
  })

  assert.deepEqual(buildAlertSummary(alerts), {
    total: 3,
    open: 1,
    acknowledged: 1,
    resolved: 1,
    criticalOpen: 1,
  })
})

test("filters alerts by search, severity, and status", () => {
  assert.equal(
    filterAlertDirectoryItems(alerts, {
      searchTerm: "bao tri",
      severity: "all",
      status: "all",
    }).length,
    1,
  )

  assert.equal(
    filterAlertDirectoryItems(alerts, {
      searchTerm: "",
      severity: "critical",
      status: "open",
    })[0]?.id,
    "a1",
  )
})
