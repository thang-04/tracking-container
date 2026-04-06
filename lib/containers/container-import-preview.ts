import type {
  CanonicalContainerImportRow,
  ParsedContainerImportRow,
  ValidatedContainerImportRow,
} from "./container-mutation-types.ts"

export type ContainerImportPreviewStorageRow = {
  rowNo: number
  rawData: Record<string, string | null>
}

export function toContainerImportPreviewStorageRow(
  row: ValidatedContainerImportRow,
): ContainerImportPreviewStorageRow {
  return {
    rowNo: row.rowNo,
    rawData: { ...row.data },
  }
}

export function fromContainerImportPreviewStorageRow(
  row: ContainerImportPreviewStorageRow,
): ParsedContainerImportRow {
  return {
    rowNo: row.rowNo,
    sourceType: "csv",
    rawData: { ...row.rawData },
    data: { ...row.rawData } as CanonicalContainerImportRow,
  }
}
