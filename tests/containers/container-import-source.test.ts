import test from "node:test"
import assert from "node:assert/strict"

import * as XLSX from "xlsx"

import {
  readCsvImportSourcePayload,
  readEdiImportSourcePayload,
} from "../../lib/containers/container-import-source.ts"

test("uses persisted CSV source when file input is empty on import submit", async () => {
  const formData = new FormData()
  formData.set("persistedSourceText", "container_no,container_type_code,customer_code,route_code\nMSKU1234567,40HC,CUST-ALPHA,RT-HCM-BDU")
  formData.set("persistedFileName", "preview.csv")

  const result = await readCsvImportSourcePayload(formData)

  assert.deepEqual(result.errors, [])
  assert.equal(result.fileName, "preview.csv")
  assert.match(result.text ?? "", /MSKU1234567/)
})

test("prefers live CSV file over persisted source when both are present", async () => {
  const formData = new FormData()
  formData.set(
    "csvFile",
    new File(
      ["container_no,container_type_code,customer_code,route_code\nTGHU7654321,20GP,CUST-BETA,RT-HPC-HNI"],
      "live.csv",
      { type: "text/csv" },
    ),
  )
  formData.set("persistedSourceText", "stale")
  formData.set("persistedFileName", "stale.csv")

  const result = await readCsvImportSourcePayload(formData)

  assert.deepEqual(result.errors, [])
  assert.equal(result.fileName, "live.csv")
  assert.match(result.text ?? "", /TGHU7654321/)
})

test("uses persisted EDI text when textarea and file are both empty on import submit", async () => {
  const formData = new FormData()
  formData.set("persistedSourceText", "EQD+MSKU1234567+40HC'\nRFF+CU:CUST-ALPHA'\nRFF+RT:RT-HCM-BDU'\nUNT'")
  formData.set("persistedFileName", "preview.edi")

  const result = await readEdiImportSourcePayload(formData)

  assert.deepEqual(result.errors, [])
  assert.equal(result.fileName, "preview.edi")
  assert.match(result.text ?? "", /EQD\+MSKU1234567/)
})

test("treats zip-shaped upload as xlsx when filename has no .xlsx suffix", async () => {
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([["Unit Nbr"]]), "Sheet1")
  const workbookBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
  const formData = new FormData()
  formData.set(
    "csvFile",
    new File([new Uint8Array(workbookBuffer)], "FINAL DISCHARGE LIST (3)", {
      type: "application/octet-stream",
    }),
  )

  const result = await readCsvImportSourcePayload(formData)

  assert.deepEqual(result.errors, [])
  assert.equal(result.format, "xlsx")
  assert.equal(result.text, null)
  assert.ok(result.bytes && result.bytes.length > 0)
})

test("reads xlsx workbook uploads as spreadsheet bytes", async () => {
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet([["Unit Nbr", "Type ISO"], ["MSKU1234567", "45G0"]]),
    "UnitFacilityVisit_20260316_1005",
  )

  const workbookBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })
  const formData = new FormData()
  formData.set(
    "csvFile",
    new File([new Uint8Array(workbookBuffer)], "FINAL DISCHARGE LIST.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  )

  const result = await readCsvImportSourcePayload(formData)

  assert.deepEqual(result.errors, [])
  assert.equal(result.format, "xlsx")
  assert.equal(result.fileName, "FINAL DISCHARGE LIST.xlsx")
  assert.equal(result.text, null)
  assert.ok(result.bytes)
  assert.ok(result.bytes.length > 0)
})
