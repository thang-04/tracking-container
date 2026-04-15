import test from "node:test"
import assert from "node:assert/strict"

import {
  buildContainerDirectoryStats,
  filterContainerDirectoryItems,
  getContainerStatusMeta,
  type ContainerDirectoryItem,
} from "../../lib/containers/container-view-model.ts"

const containers: ContainerDirectoryItem[] = [
  {
    id: "c1",
    containerNo: "MSKU1234567",
    typeLabel: "40FT HC",
    status: "at_seaport_yard",
    statusLabel: "Tại bãi cảng biển",
    locationLabel: "Hai Phong",
    destinationLabel: "ICD Ha Noi",
    etaLabel: "2026-04-06 14:00",
    weightLabel: "24,500 kg",
    shippingLineLabel: "Maersk",
    customerLabel: "ABC",
    routeLabel: "HP-HN",
    categoryLabel: null,
    vStateLabel: null,
    tStateLabel: null,
    customsStatusLabel: null,
    billNo: null,
    sealNo: null,
  },
  {
    id: "c2",
    containerNo: "TGHU7654321",
    typeLabel: "20FT",
    status: "in_transit",
    statusLabel: "Đang hành trình",
    locationLabel: "Song Duong",
    destinationLabel: "ICD Ha Noi",
    etaLabel: "2026-04-06 18:30",
    weightLabel: "18,000 kg",
    shippingLineLabel: null,
    customerLabel: null,
    routeLabel: "HP-HN",
    categoryLabel: null,
    vStateLabel: null,
    tStateLabel: null,
    customsStatusLabel: null,
    billNo: null,
    sealNo: null,
  },
  {
    id: "c3",
    containerNo: "OOLU0000001",
    typeLabel: "40FT",
    status: "released",
    statusLabel: "Đã giải phóng",
    locationLabel: "ICD Ha Noi",
    destinationLabel: "Khach hang",
    etaLabel: "Da den",
    weightLabel: "19,200 kg",
    shippingLineLabel: "OOCL",
    customerLabel: "XYZ",
    routeLabel: null,
    categoryLabel: null,
    vStateLabel: null,
    tStateLabel: null,
    customsStatusLabel: null,
    billNo: null,
    sealNo: null,
  },
]

test("maps container statuses to operational Vietnamese labels", () => {
  assert.equal(getContainerStatusMeta("new").label, "Mới tạo")
  assert.equal(getContainerStatusMeta("at_seaport_yard").label, "Tại bãi cảng biển")
  assert.equal(getContainerStatusMeta("on_barge").label, "Đã xếp lên sà lan")
  assert.equal(getContainerStatusMeta("in_transit").label, "Đang hành trình")
  assert.equal(getContainerStatusMeta("at_dryport_yard").label, "Tại bãi cảng cạn")
  assert.equal(getContainerStatusMeta("released").label, "Đã giải phóng")
  assert.equal(getContainerStatusMeta("hold").label, "Đang giữ")
})

test("builds zero-safe container statistics", () => {
  assert.deepEqual(buildContainerDirectoryStats([]), {
    total: 0,
    atSeaportYard: 0,
    onBarge: 0,
    inTransit: 0,
    atDryportYard: 0,
    released: 0,
    hold: 0,
  })

  assert.deepEqual(buildContainerDirectoryStats(containers), {
    total: 3,
    atSeaportYard: 1,
    onBarge: 0,
    inTransit: 1,
    atDryportYard: 0,
    released: 1,
    hold: 0,
  })
})

test("filters containers by search and status", () => {
  assert.equal(
    filterContainerDirectoryItems(containers, {
      searchTerm: "maersk",
      status: "all",
    }).length,
    1,
  )

  assert.equal(
    filterContainerDirectoryItems(containers, {
      searchTerm: "hp-hn",
      status: "in_transit",
    })[0]?.id,
    "c2",
  )
})
