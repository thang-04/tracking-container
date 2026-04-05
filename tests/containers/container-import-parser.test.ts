import test from "node:test"
import assert from "node:assert/strict"

import {
  parseCsvContainerRows,
  parseEdiContainerRows,
} from "../../lib/containers/container-import.ts"

test("parses CSV rows into canonical container records and skips blank rows", () => {
  const csv = [
    "container_no,container_type_code,customer_code,route_code,shipping_line_code,gross_weight_kg,eta,bill_no,seal_no,current_port_code,current_yard_code,current_block_code,current_slot_code,note",
    "msku1234567,40HC,CUST-ALPHA,RT-HCM-BDU,MAE,24500,2026-04-06T08:30,BL-001,SEAL-001,PORT-HCM,YD-CL-01,A1,A1-01-01,Lo hang uu tien",
    "",
    "tghu7654321,20GP,CUST-BETA,RT-HPC-HNI,,18000,,,,,,,",
  ].join("\n")

  const result = parseCsvContainerRows(csv)

  assert.deepEqual(result.errors, [])
  assert.equal(result.rows.length, 2)
  assert.equal(result.rows[0]?.rowNo, 1)
  assert.equal(result.rows[0]?.data.containerNo, "MSKU1234567")
  assert.equal(result.rows[0]?.data.shippingLineCode, "MAE")
  assert.equal(result.rows[0]?.data.currentSlotCode, "A1-01-01")
  assert.equal(result.rows[1]?.rowNo, 2)
  assert.equal(result.rows[1]?.data.containerNo, "TGHU7654321")
  assert.equal(result.rows[1]?.data.shippingLineCode, null)
})

test("reports missing required CSV headers", () => {
  const csv = [
    "container_no,container_type_code,customer_code",
    "MSKU1234567,40HC,CUST-ALPHA",
  ].join("\n")

  const result = parseCsvContainerRows(csv)

  assert.deepEqual(result.rows, [])
  assert.deepEqual(result.errors, ["CSV thieu cot bat buoc: route_code"])
})

test("parses Tracking Container EDI v1 segments into canonical rows", () => {
  const edi = [
    "EQD+MSKU1234567+40HC'",
    "RFF+CU:CUST-ALPHA'",
    "RFF+RT:RT-HCM-BDU'",
    "TDT+MAE'",
    "MEA+WT:24500'",
    "DTM+ETA:2026-04-06T08:30'",
    "LOC+P:PORT-HCM'",
    "LOC+Y:YD-CL-01'",
    "LOC+B:A1'",
    "LOC+S:A1-01-01'",
    "RFF+BM:BL-001'",
    "SEL+SEAL-001'",
    "FTX+Lo hang uu tien'",
    "UNT'",
  ].join("\n")

  const result = parseEdiContainerRows(edi)

  assert.deepEqual(result.errors, [])
  assert.equal(result.rows.length, 1)
  assert.equal(result.rows[0]?.rowNo, 1)
  assert.equal(result.rows[0]?.data.containerNo, "MSKU1234567")
  assert.equal(result.rows[0]?.data.containerTypeCode, "40HC")
  assert.equal(result.rows[0]?.data.customerCode, "CUST-ALPHA")
  assert.equal(result.rows[0]?.data.routeCode, "RT-HCM-BDU")
  assert.equal(result.rows[0]?.data.currentYardCode, "YD-CL-01")
  assert.equal(result.rows[0]?.data.note, "Lo hang uu tien")
})
