import test from "node:test"
import assert from "node:assert/strict"

import {
  type ParsedContainerImportRow,
  validateContainerImportRows,
} from "../../lib/containers/container-import.ts"

function createRow(
  rowNo: number,
  overrides: Partial<ParsedContainerImportRow["data"]> = {},
): ParsedContainerImportRow {
  return {
    rowNo,
    sourceType: "csv",
    rawData: {},
    data: {
      containerNo: `MSKU12345${rowNo.toString().padStart(2, "0")}`,
      containerTypeCode: "40HC",
      customerCode: "CUST-ALPHA",
      routeCode: "RT-HCM-BDU",
      shippingLineCode: "MAE",
      grossWeightKg: "24500",
      eta: "2026-04-06T08:30",
      billNo: `BL-00${rowNo}`,
      sealNo: `SEAL-00${rowNo}`,
      currentPortCode: "PORT-HCM",
      currentYardCode: "YD-CL-01",
      currentBlockCode: "A1",
      currentSlotCode: "A1-01-01",
      statusHint: null,
      note: "Lo hang test",
      ...overrides,
    },
  }
}

const validationContext = {
  containerTypes: [{ id: "ct-40hc", code: "40HC", isActive: true }],
  customers: [{ id: "cust-alpha", code: "CUST-ALPHA", isActive: true }],
  shippingLines: [{ id: "ship-mae", code: "MAE", isActive: true }],
  routes: [
    {
      id: "route-hcm-bdu",
      code: "RT-HCM-BDU",
      isActive: true,
      originPortId: "port-hcm",
      destinationPortId: "port-bdu",
    },
  ],
  ports: [
    { id: "port-hcm", code: "PORT-HCM", portType: "seaport", isActive: true },
    { id: "port-bdu", code: "PORT-BDU", portType: "dryport", isActive: true },
  ],
  yards: [{ id: "yard-cl-01", code: "YD-CL-01", portId: "port-hcm", isActive: true }],
  blocks: [{ id: "block-a1", code: "A1", yardId: "yard-cl-01", isActive: true }],
  slots: [{ id: "slot-a1-01-01", code: "A1-01-01", blockId: "block-a1", isActive: true }],
  existingContainerNos: [],
  occupiedSlotIds: [],
} as const

test("resolves a valid yard row into ids and seaport yard status", () => {
  const result = validateContainerImportRows([createRow(1)], validationContext)

  assert.equal(result.summary.totalRows, 1)
  assert.equal(result.summary.validRows, 1)
  assert.equal(result.summary.invalidRows, 0)
  assert.equal(result.rows[0]?.isValid, true)
  assert.equal(result.rows[0]?.resolved?.containerTypeId, "ct-40hc")
  assert.equal(result.rows[0]?.resolved?.currentStatus, "at_seaport_yard")
  assert.equal(result.rows[0]?.resolved?.currentSlotId, "slot-a1-01-01")
})

test("rejects duplicated container numbers and existing records", () => {
  const result = validateContainerImportRows(
    [
      createRow(1, { containerNo: "MSKU1234567", currentSlotCode: null, currentBlockCode: null, currentYardCode: null }),
      createRow(2, { containerNo: "MSKU1234567", currentSlotCode: null, currentBlockCode: null, currentYardCode: null }),
      createRow(3, {
        containerNo: "OOLU0000001",
        currentPortCode: "PORT-HCM",
        currentYardCode: null,
        currentBlockCode: null,
        currentSlotCode: null,
      }),
    ],
    {
      ...validationContext,
      existingContainerNos: ["OOLU0000001"],
    },
  )

  assert.equal(result.summary.validRows, 0)
  assert.equal(result.summary.invalidRows, 3)
  assert.match(result.rows[0]?.errors[0] ?? "", /Container_no/)
  assert.match(result.rows[1]?.errors.join(" ") ?? "", /Container_no/)
  assert.match(result.rows[2]?.errors.join(" ") ?? "", /Container_no/)
})

test("allows import rows without customer and route when not required", () => {
  const result = validateContainerImportRows(
    [
      createRow(1, {
        customerCode: null,
        routeCode: null,
        currentYardCode: null,
        currentBlockCode: null,
        currentSlotCode: null,
      }),
    ],
    validationContext,
  )

  assert.equal(result.summary.validRows, 1)
  assert.equal(result.summary.invalidRows, 0)
  assert.equal(result.rows[0]?.resolved?.customerId, null)
  assert.equal(result.rows[0]?.resolved?.routeId, null)
})

test("rejects partial yard hierarchy and occupied slots", () => {
  const result = validateContainerImportRows(
    [
      createRow(1, {
        currentPortCode: "PORT-HCM",
        currentYardCode: "YD-CL-01",
        currentBlockCode: null,
        currentSlotCode: null,
      }),
      createRow(2, {
        containerNo: "TGHU7654321",
      }),
    ],
    {
      ...validationContext,
      occupiedSlotIds: ["slot-a1-01-01"],
    },
  )

  assert.equal(result.summary.validRows, 0)
  assert.equal(result.summary.invalidRows, 2)
  assert.match(result.rows[0]?.errors.join(" ") ?? "", /yard, block, slot./i)
  assert.match(result.rows[1]?.errors.join(" ") ?? "", /Slot/)
})
