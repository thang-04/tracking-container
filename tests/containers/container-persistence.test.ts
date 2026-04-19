import test from "node:test"
import assert from "node:assert/strict"

import { buildContainerMutationPlan, buildEdiBatchRowCreateData } from "../../lib/containers/container-persistence.ts"
import type { ParsedContainerImportRow } from "../../lib/containers/container-import.ts"

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
  note: "Lo hang test",
  // Bổ sung các trường mới
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

test("builds manual create payload with one created event when no yard location exists", () => {
  const now = new Date("2026-04-05T10:00:00.000Z")
  const result = buildContainerMutationPlan(baseResolvedInput, {
    mutationSource: "manual",
    actorUserId: "user-admin",
    now,
  })

  assert.equal(result.container.sourceType, "manual")
  assert.equal(result.container.currentStatus, "new")
  assert.equal(result.container.lastEventAt?.toISOString(), now.toISOString())
  assert.equal(result.events.length, 1)
  assert.equal(result.events[0]?.eventType, "created")
  assert.equal(result.events[0]?.sourceType, "user")
  assert.equal(result.events[0]?.toStatus, "new")
})

test("builds edi batch row payload with only supported database columns", () => {
  const row: ParsedContainerImportRow = {
    rowNo: 1,
    sourceType: "csv",
    rawData: {
      "Unit Nbr": "MSKU0382146",
      "Type ISO": "45G0",
      Category: "Import",
      "V-State": "Active",
      "T-State": "Yard",
      Position: "Y-HHIT-C13.62.02.2",
      "Line Op": "MAE",
      "Seal Nbr1": "SEAL-001",
      "Weight (kg)": "3,940 ",
      "I/B Actual Visit": "CAG611E",
      "O/B Actual Visit": "GEN_TRUCK",
      POD: "VNHHP",
      RLH: "RLH-001",
      RDH: "RDH-002",
      "Frght Kind": "Empty",
      "Reqs Power": "No",
      "Is OOG": "No",
      "Temp Required (C)": null,
      IMDG: null,
      "Hazardous?": "No",
      Stow: "MAEMTY",
      Grp: null,
      "Container no": "MSKU0382146",
      "Container Size": "40",
      "Container Status (Empty / Full)": "Empty",
      "Container type": "DRY",
      "Invoice Description": "Tariff Description",
      "Invoice Number": "INV-9001",
      "Invoice Amount": "1.250.000",
      "Vessel Code": "VSL001",
      "Vessel Name": "CCNI ANGOL",
      "Departure Date": "15/3/2026",
      Voyage: "611E",
    },
    data: {
      containerNo: "MSKU0382146",
      containerTypeCode: "40HC",
      customerCode: null,
      routeCode: null,
      shippingLineCode: "MAE",
      grossWeightKg: "3940",
      eta: null,
      billNo: "CAG611E",
      sealNo: "SEAL-001",
      currentPortCode: "VNHHP",
      currentYardCode: null,
      currentBlockCode: null,
      currentSlotCode: null,
      statusHint: "at_seaport_yard",
      note: null,
      // Bổ sung các trường mới
      category: "Import",
      vState: "Active",
      tState: "Yard",
      stow: "MAEMTY",
      grp: null,
      sealNo2: null,
      frghtKind: "Empty",
      ibActualVisit: "CAG611E",
      obActualVisit: "CAG611E",
      reqsPower: "No",
      tempRequiredC: null,
      rlh: "RLH-001",
      rdh: "RDH-002",
      isOog: "No",
      imdg: null,
      hazardous: "No",
    },
  }

  const result = buildEdiBatchRowCreateData(row, {
    batchId: "batch-001",
    validationStatus: "valid",
    importStatus: "imported",
    errorMessage: null,
    importedContainerId: "container-001",
  })

  assert.deepEqual(Object.keys(result).sort(), [
    "batchId",
    "containerNo",
    "errorMessage",
    "importStatus",
    "importedContainerId",
    "rawData",
    "rowNo",
    "validationStatus",
  ])
  assert.equal(result.batchId, "batch-001")
  assert.equal(result.rowNo, 1)
  assert.equal(result.containerNo, "MSKU0382146")
  assert.equal(result.validationStatus, "valid")
  assert.equal(result.importStatus, "imported")
  assert.equal(result.errorMessage, null)
  assert.equal(result.importedContainerId, "container-001")
})

test("builds import payload with edi_imported and yard_in events when slot is assigned", () => {
  const now = new Date("2026-04-05T10:00:00.000Z")
  const result = buildContainerMutationPlan(
    {
      ...baseResolvedInput,
      currentStatus: "at_dryport_yard",
      currentPortId: "port-bdu",
      currentYardId: "yard-st-01",
      currentBlockId: "block-a1",
      currentSlotId: "slot-a1-01-01",
    },
    {
      mutationSource: "edi",
      actorUserId: "user-admin",
      now,
      ediBatchId: "batch-001",
    },
  )

  assert.equal(result.container.sourceType, "edi")
  assert.equal(result.container.ediBatchId, "batch-001")
  assert.equal(result.events.length, 2)
  assert.equal(result.events[0]?.eventType, "edi_imported")
  assert.equal(result.events[0]?.sourceType, "edi")
  assert.equal(result.events[0]?.toStatus, "new")
  assert.equal(result.events[1]?.eventType, "yard_in")
  assert.equal(result.events[1]?.fromStatus, "new")
  assert.equal(result.events[1]?.toStatus, "at_dryport_yard")
  assert.equal(result.events[1]?.toSlotId, "slot-a1-01-01")
})
