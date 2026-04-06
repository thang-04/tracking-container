import test from "node:test"
import assert from "node:assert/strict"

import * as XLSX from "xlsx"

import {
  parseCsvContainerRows,
  parseSpreadsheetContainerRows,
} from "../../lib/containers/container-import.ts"

function buildDischargeWorkbookBuffer() {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet([
    ["Displaying 1721 item(s) at 2026-03-16"],
    [
      "Unit Nbr",
      "Type ISO",
      "Category",
      "V-State",
      "T-State",
      "Position",
      "Line Op",
      "Seal Nbr1",
      "Weight (kg)",
      "I/B Actual Visit",
      "O/B Actual Visit",
      "POD",
      "RLH",
      "RDH",
      "Frght Kind",
      "Reqs Power",
      "Is OOG",
      "Temp Required (C)",
      "IMDG",
      "Hazardous?",
      "Stow",
      "Grp",
    ],
    [
      "MSKU0382146",
      "45G0",
      "Import",
      "Active",
      "Yard",
      "Y-HHIT-C13.62.02.2",
      "MAE",
      "",
      "3,940 ",
      "CAG611E",
      "GEN_TRUCK",
      "VNHHP",
      "",
      "",
      "Empty",
      "No",
      "No",
      "",
      "",
      "No",
      "MAEMTY",
      "",
    ],
  ])

  XLSX.utils.book_append_sheet(workbook, worksheet, "UnitFacilityVisit_20260316_1005")

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
}

test("parses discharge list workbook using exact source columns without batch selections", () => {
  const result = parseSpreadsheetContainerRows(
    "FINAL DISCHARGE LIST - CCNI ANGOL 611E (3).xlsx",
    buildDischargeWorkbookBuffer(),
  )

  assert.deepEqual(result.errors, [])
  assert.equal(result.template, "excel-discharge-list")
  assert.equal(result.sheetName, "UnitFacilityVisit_20260316_1005")
  assert.match(result.sourceSummary, /Excel/)
  assert.equal(result.rows.length, 1)

  const row = result.rows[0]

  assert.equal(row?.data.containerNo, "MSKU0382146")
  assert.equal(row?.data.containerTypeCode, "40HC")
  assert.equal(row?.data.customerCode, null)
  assert.equal(row?.data.routeCode, null)
  assert.equal(row?.data.shippingLineCode, "MAE")
  assert.equal(row?.data.grossWeightKg, "3940")
  assert.equal(row?.data.billNo, "CAG611E")
  assert.equal(row?.data.currentPortCode, "PORT-HPC")
  assert.equal(row?.data.statusHint, "at_seaport_yard")
  assert.match(row?.data.note ?? "", /Position: Y-HHIT-C13.62.02.2/)
  assert.match(row?.data.note ?? "", /POD: VNHHP/)
  assert.equal(row?.rawData["Unit Nbr"], "MSKU0382146")
  assert.equal(row?.rawData["Type ISO"], "45G0")
  assert.equal(row?.rawData["POD"], "VNHHP")
  assert.equal(Object.hasOwn(row?.rawData ?? {}, "container_no"), false)
  assert.equal(Object.hasOwn(row?.rawData ?? {}, "customer_code"), false)
  assert.equal(Object.hasOwn(row?.rawData ?? {}, "route_code"), false)

  assert.match(result.persistedText, /container_no,container_type_code,customer_code,route_code/)

  const reparsed = parseCsvContainerRows(result.persistedText)
  assert.deepEqual(reparsed.errors, [])
  assert.equal(reparsed.rows[0]?.data.containerNo, "MSKU0382146")
  assert.equal(reparsed.rows[0]?.data.customerCode, null)
  assert.equal(reparsed.rows[0]?.data.routeCode, null)
  assert.equal(reparsed.rows[0]?.data.currentPortCode, "PORT-HPC")
  assert.equal(reparsed.rows[0]?.data.statusHint, "at_seaport_yard")
})

function buildSheet1SummaryWorkbookBuffer() {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet([
    [
      "",
      "Container no",
      "Container Size",
      "Container Status (Empty / Full)",
      "Container type",
      "Invoice Description",
      "Invoice Number",
      "Invoice Amount",
      "Vessel Code",
      "Vessel Name",
      "Departure Date",
      "Voyage",
    ],
    ["", "", "", "", "", " (Tariff Description)", "", "", "", "", "", ""],
    [
      "",
      "MSKU0382146",
      "40",
      "Empty",
      "DRY",
      "",
      "INV-9001",
      "1.250.000",
      "",
      "CCNI ANGOL",
      "15/3/2026",
      "611E",
    ],
  ])

  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
}

test("parses Sheet1 summary workbook into canonical container rows without batch selections", () => {
  const result = parseSpreadsheetContainerRows(
    "FINAL DISCHARGE LIST - summary.xlsx",
    buildSheet1SummaryWorkbookBuffer(),
  )

  assert.deepEqual(result.errors, [])
  assert.equal(result.template, "excel-sheet1-summary")
  assert.equal(result.sheetName, "Sheet1")
  assert.equal(result.rows.length, 1)

  const row = result.rows[0]

  assert.equal(row?.data.containerNo, "MSKU0382146")
  assert.equal(row?.data.containerTypeCode, "40HC")
  assert.equal(row?.data.customerCode, null)
  assert.equal(row?.data.routeCode, null)
  assert.equal(row?.data.eta, "2026-03-15")
  assert.equal(row?.data.billNo, "INV-9001")
  assert.equal(row?.data.shippingLineCode, null)
  assert.match(row?.data.note ?? "", /CCNI ANGOL/)
  assert.match(row?.data.note ?? "", /611E/)
  assert.equal(row?.rawData["Container no"], "MSKU0382146")
  assert.equal(Object.hasOwn(row?.rawData ?? {}, "container_no"), false)
})

test("does not require customer and route selections for discharge list workbook imports", () => {
  const result = parseSpreadsheetContainerRows(
    "FINAL DISCHARGE LIST - CCNI ANGOL 611E (3).xlsx",
    buildDischargeWorkbookBuffer(),
  )

  assert.deepEqual(result.errors, [])
  assert.equal(result.rows.length, 1)
  assert.equal(result.rows[0]?.data.customerCode, null)
  assert.equal(result.rows[0]?.data.routeCode, null)
})
