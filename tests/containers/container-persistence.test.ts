import test from "node:test"
import assert from "node:assert/strict"

import { buildContainerMutationPlan } from "../../lib/containers/container-persistence.ts"

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
