import test from "node:test"
import assert from "node:assert/strict"

import type { ValidatedContainerImportRow } from "../../lib/containers/container-mutation-types.ts"
import {
  fromContainerImportPreviewStorageRow,
  toContainerImportPreviewStorageRow,
} from "../../lib/containers/container-import-preview.ts"

const baseResolvedInput = {
  containerNo: "MSKU1234567",
  containerTypeId: "ct-40hc",
  customerId: "cust-alpha",
  routeId: "route-hcm-bdu",
  shippingLineId: "ship-mae",
  currentStatus: "new" as const,
  currentPortId: "port-hcm",
  currentYardId: null,
  currentBlockId: null,
  currentSlotId: null,
  customsStatus: "pending" as const,
  eta: new Date("2026-04-06T08:30:00.000Z"),
  grossWeightKg: "24500",
  billNo: "BL-001",
  sealNo: "SEAL-001",
  note: "Batch preview",
  category: null,
  vState: null,
  tState: null,
  stow: null,
  grp: null,
  sealNo2: null,
  frghtKind: null,
  ibActualVisit: null,
  obActualVisit: null,
  reqsPower: null,
  tempRequiredC: null,
  rlh: null,
  rdh: null,
  isOog: null,
  imdg: null,
  hazardous: null,
}

test("round-trips validated preview rows through stored preview session data", () => {
  const row: ValidatedContainerImportRow = {
    rowNo: 1,
    sourceType: "csv",
    rawData: {
      container_no: "MSKU1234567",
      container_type_code: "40HC",
    },
    data: {
      containerNo: "MSKU1234567",
      containerTypeCode: "40HC",
      customerCode: "CUST-ALPHA",
      routeCode: "RT-HCM-BDU",
      shippingLineCode: "MAE",
      grossWeightKg: "24500",
      eta: "2026-04-06T08:30",
      billNo: "BL-001",
      sealNo: "SEAL-001",
      currentPortCode: "PORT-HCM",
      currentYardCode: null,
      currentBlockCode: null,
      currentSlotCode: null,
      statusHint: null,
      note: "Batch preview",
      category: null,
      vState: null,
      tState: null,
      stow: null,
      grp: null,
      sealNo2: null,
      frghtKind: null,
      ibActualVisit: null,
      obActualVisit: null,
      reqsPower: null,
      tempRequiredC: null,
      rlh: null,
      rdh: null,
      isOog: null,
      imdg: null,
      hazardous: null,
    },
    errors: [],
    warnings: [],
    isValid: true,
    resolved: baseResolvedInput,
  }

  const stored = toContainerImportPreviewStorageRow(row)

  assert.deepEqual(stored.rawData, row.data)

  const restored = fromContainerImportPreviewStorageRow(stored)

  assert.equal(restored.rowNo, 1)
  assert.equal(restored.sourceType, "csv")
  assert.equal(restored.data.containerNo, "MSKU1234567")
  assert.equal(restored.data.containerTypeCode, "40HC")
  assert.equal(restored.data.customerCode, "CUST-ALPHA")
  assert.equal(restored.data.routeCode, "RT-HCM-BDU")
  assert.equal(restored.data.currentPortCode, "PORT-HCM")
  assert.equal(restored.data.note, "Batch preview")
})
