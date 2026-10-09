"use client";

import Image from "next/image";
import {
  Plus,
  Search,
  ChevronDown,
  LayoutGrid,
  List,
  Info,
  ArrowUpRight,
  Copy,
  MoreHorizontal,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const materials = [
  {
    id: "CAT-001",
    name: "Cat interior",
    brand: "Renovin Select",
    category: "Cat & pelapis",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400",
    spec: "Warna warm white · 5 kg",
    detail: "3 warna · hasil akhir matte",
    colors: ["#D4C9B8", "#C2B8A3", "#A89F8E"],
    status: "Terbit",
    availability: "Tersedia",
    unit: "Satuan: pail",
  },
  {
    id: "GYP-001",
    name: "Papan gypsum",
    brand: "Jayaboard",
    category: "Plafon & rangka",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400",
    spec: "9 mm · 120 × 240 cm",
    detail: "Tepi tapered · plafon interior",
    colors: [],
    status: "Terbit",
    availability: "Tersedia",
    unit: "Satuan: lembar",
  },
  {
    id: "KRM-001",
    name: "Keramik porcelain",
    brand: "Roman",
    category: "Lantai & dinding",
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=400",
    spec: "60 × 60 cm · matte ivory",
    detail: "2 warna · permukaan matte",
    colors: [],
    status: "Terbit",
    availability: "Tersedia",
    unit: "Satuan: m²",
  },
  {
    id: "PRK-001",
    name: "Perekat keramik",
    brand: "Mortar Utama",
    category: "Mortar & semen",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400",
    spec: "Mortar instan · 25 kg",
    detail: "Untuk lantai & dinding interior",
    colors: [],
    status: "Terbit",
    availability: "Indent",
    availabilityNote: "3–5 hari",
    unit: "Satuan: sak",
  },
  {
    id: "HLW-001",
    name: "Hollow galvanis",
    brand: "Renovin Select",
    category: "Plafon & rangka",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400",
    spec: "4 × 4 cm · panjang 4 m",
    detail: "Tebal 0,4 mm · galvanis",
    colors: [],
    status: "Terbit",
    availability: "Tersedia",
    unit: "Satuan: batang",
  },
  {
    id: "SMN-001",
    name: "Semen Portland",
    brand: "Semen Indonesia",
    category: "Mortar & semen",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400",
    spec: "Tipe I · 40 kg",
    detail: "Semen abu-abu · konstruksi umum",
    colors: [],
    status: "Draft",
    availability: "Tersedia",
    unit: "Satuan: sak",
  },
];

export default function KatalogBahan() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">
            Katalog Bahan Bangunan
          </h1>
          <p className="text-sm text-zinc-500">
            Kelola pilihan cat dan material Renovin untuk kebutuhan renovasi
            klien.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-md bg-[#2C4A3B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#233A2E]">
          <Plus className="h-4 w-4" />
          Tambah bahan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
          <p className="text-sm font-medium text-zinc-500">Total bahan</p>
          <p className="text-4xl font-bold text-zinc-900">6</p>
          <p className="text-xs text-zinc-400">
            Cat dan material pilihan Renovin
          </p>
        </div>
        <div className="rounded-xl bg-[#2C4A3B] p-5 flex flex-col justify-between h-32 text-white">
          <p className="text-sm font-medium text-white/80">Bahan terbit</p>
          <p className="text-4xl font-bold">5</p>
          <p className="text-xs text-white/70">
            Dapat dipilih klien dari katalog
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
          <p className="text-sm font-medium text-zinc-500">Draft katalog</p>
          <p className="text-4xl font-bold text-zinc-900">1</p>
          <p className="text-xs text-zinc-400">
            Belum ditampilkan kepada klien
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
          <p className="text-sm font-medium text-zinc-500">Kategori bahan</p>
          <p className="text-4xl font-bold text-zinc-900">4</p>
          <p className="text-xs text-zinc-400">
            Dari pelapis hingga konstruksi
          </p>
        </div>
      </div>

      {/* Alert */}
      <div className="flex items-start gap-3 rounded-xl bg-[#E8EDEA] p-4 border border-[#2C4A3B]/10">
        <Info className="h-5 w-5 text-[#2C4A3B] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-zinc-900 mb-0.5">
            Pilihan bahan, bukan harga final proyek
          </p>
          <p className="text-sm text-zinc-600">
            Klien memilih bahan dari katalog untuk membentuk draft bahan. Harga
            disi admin pada rincian proyek setelah pesanan diterima, lalu
            ditetapkan pada rincian pesanan.
          </p>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Semua bahan</h2>
            <p className="text-sm text-zinc-500">
              Spesifikasi yang jelas untuk draft bahan yang lebih tepat.
            </p>
          </div>
          <div className="flex items-center border border-zinc-200 rounded-md overflow-hidden">
            <button className="flex h-8 w-8 items-center justify-center bg-zinc-100 text-zinc-700">
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center text-zinc-400 hover:text-zinc-700">
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Cari nama, merek, atau kode bahan..."
              className="h-9 w-full rounded-md border border-zinc-200 pl-9 pr-4 text-sm outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B] placeholder:text-zinc-400"
            />
          </div>
          <button className="flex h-9 items-center gap-2 rounded-md border border-zinc-200 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
            <ChevronDown className="h-3.5 w-3.5" />
            Semua kategori
          </button>
          <button className="flex h-9 items-center gap-2 rounded-md border border-zinc-200 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
            <ChevronDown className="h-3.5 w-3.5" />
            Semua status
          </button>
          <button className="flex h-9 items-center gap-2 rounded-md border border-zinc-200 px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Ketersediaan
          </button>
        </div>

        {/* Material Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-zinc-200 bg-white overflow-hidden flex flex-col"
            >
              {/* Image */}
              <div className="relative h-44 bg-[#E8E4DE]">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
                <span
                  className={`absolute top-3 left-3 rounded px-2 py-0.5 text-[10px] font-bold text-white ${
                    item.status === "Terbit" ? "bg-[#2C4A3B]" : "bg-zinc-500"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold text-zinc-500">
                    {item.category}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400">
                    {item.id}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-zinc-900">{item.name}</h3>
                <p className="text-xs text-zinc-500 mb-3">{item.brand}</p>

                <div className="mt-auto space-y-2">
                  <p className="text-xs font-medium text-zinc-700">
                    {item.spec}
                  </p>

                  <div className="flex items-center gap-2">
                    {item.colors.length > 0 && (
                      <div className="flex gap-1">
                        {item.colors.map((c, i) => (
                          <div
                            key={i}
                            className="h-3.5 w-3.5 rounded-full border border-zinc-200"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    )}
                    <p className="text-[10px] text-zinc-500">{item.detail}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          item.availability === "Tersedia"
                            ? "bg-green-500"
                            : "bg-orange-500"
                        }`}
                      />
                      <span
                        className={`text-xs font-medium ${
                          item.availability === "Tersedia"
                            ? "text-green-700"
                            : "text-orange-700"
                        }`}
                      >
                        {item.availability}
                        {item.availabilityNote &&
                          ` · ${item.availabilityNote}`}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      {item.unit}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                    <button className="text-xs font-bold text-zinc-900 hover:text-[#2C4A3B] flex items-center gap-1">
                      Edit bahan <ArrowUpRight className="h-3 w-3" />
                    </button>
                    <div className="flex items-center gap-1">
                      <button className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-6 pt-4 border-t border-zinc-100">
          <p className="text-xs text-zinc-500">
            Menampilkan 1–6 dari 6 bahan · 5 terbit, 1 draft
          </p>
          <div className="flex items-center gap-1">
            <button className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 text-zinc-400 hover:bg-zinc-50">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded-md bg-[#2C4A3B] text-xs font-semibold text-white">
              1
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 text-zinc-400 hover:bg-zinc-50">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-zinc-400 pt-4 border-t border-zinc-200/50">
        <p>Renovin. · Ruang kerja studio interior</p>
        <p>Terakhir diperbarui 4 Okt 2026, 10.30 WIB</p>
      </div>
    </div>
  );
}
