"use client";

import {
  Download,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDown,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Pesanan() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Pesanan</h1>
          <p className="text-sm text-zinc-500">
            Kelola setiap permintaan, nilai pesanan, dan pembayaran dalam satu
            tempat.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
            <Download className="h-4 w-4" />
            Ekspor data
          </button>
          <button className="flex items-center gap-2 rounded-md bg-[#2C4A3B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#233A2E]">
            <Plus className="h-4 w-4" />
            Pesanan baru
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
          <p className="text-sm font-medium text-zinc-500">Total pesanan</p>
          <p className="text-4xl font-bold text-zinc-900">6</p>
          <p className="text-xs text-zinc-400">
            2 baru · 3 dikerjakan · 1 selesai
          </p>
        </div>
        <div className="rounded-xl bg-[#2C4A3B] p-5 flex flex-col justify-between h-32 text-white">
          <p className="text-sm font-medium text-white/80">Nilai pesanan</p>
          <p className="text-4xl font-bold">Rp 485 jt</p>
          <p className="text-xs text-white/70">Total nilai dari 6 pesanan</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
          <p className="text-sm font-medium text-zinc-500">
            Pembayaran diterima
          </p>
          <p className="text-4xl font-bold tracking-tight text-zinc-900">
            Rp 277,5 jt
          </p>
          <p className="text-xs text-zinc-400">
            2 lunas · 2 uang muka 50%
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
          <p className="text-sm font-medium text-zinc-500">Sisa pembayaran</p>
          <p className="text-4xl font-bold tracking-tight text-zinc-900">
            Rp 207,5 jt
          </p>
          <p className="text-xs text-zinc-400">
            Termasuk Rp 75 jt pesanan baru
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Semua pesanan</h2>
            <p className="text-sm text-zinc-500">
              Dari permintaan awal hingga serah terima, tanpa detail yang
              terlewat.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600">
            <Calendar className="h-4 w-4" />
            3 Okt 2026
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex bg-zinc-100 rounded-md p-0.5">
            <button className="px-3 py-1 text-xs font-semibold rounded bg-white shadow-sm text-zinc-900 flex items-center gap-1.5">
              Semua <span className="text-zinc-400 font-normal">6</span>
            </button>
            <button className="px-3 py-1 text-xs font-semibold rounded text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5">
              Baru <span className="text-zinc-400 font-normal">2</span>
            </button>
            <button className="px-3 py-1 text-xs font-semibold rounded text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5">
              Dikerjakan <span className="text-zinc-400 font-normal">3</span>
            </button>
            <button className="px-3 py-1 text-xs font-semibold rounded text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5">
              Selesai <span className="text-zinc-400 font-normal">1</span>
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari nama atau nomor pesanan"
                className="h-8 w-56 rounded-md border border-zinc-200 pl-8 pr-3 text-xs outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B]"
              />
            </div>
            <button className="flex h-8 items-center gap-2 rounded-md border border-zinc-200 px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50">
              <ArrowDown className="h-3 w-3" />
              Pembayaran
            </button>
            <button className="flex h-8 items-center gap-2 rounded-md border border-zinc-200 px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50">
              <Filter className="h-3 w-3" />
              Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="border-y border-zinc-100 text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" className="rounded border-zinc-300" />
                </th>
                <th className="px-4 py-3 font-medium">No. pesanan</th>
                <th className="px-4 py-3 font-medium">Proyek / layanan</th>
                <th className="px-4 py-3 font-medium">Klien</th>
                <th className="px-4 py-3 font-medium">
                  <span className="flex items-center gap-1">
                    Tanggal masuk{" "}
                    <ArrowDown className="h-3 w-3 text-zinc-400" />
                  </span>
                </th>
                <th className="px-4 py-3 font-medium">Nilai pesanan</th>
                <th className="px-4 py-3 font-medium">Status proyek</th>
                <th className="px-4 py-3 font-medium">Pembayaran</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {/* Row 1 */}
              <tr className="hover:bg-zinc-50/50">
                <td className="px-4 py-3">
                  <input type="checkbox" className="rounded border-zinc-300" />
                </td>
                <td className="px-4 py-3 font-medium text-zinc-900">
                  ORD-26006
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-zinc-900">Rumah Tebet</p>
                  <p className="text-xs text-zinc-500">Hunian · 45 m²</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-zinc-900">Dimas Putra</p>
                  <p className="text-xs text-zinc-500">Jakarta Selatan</p>
                </td>
                <td className="px-4 py-3 text-zinc-600">3 Okt 2026</td>
                <td className="px-4 py-3 font-semibold text-zinc-900">
                  Rp 30.000.000
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700 border border-orange-200/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>{" "}
                    Pesanan baru
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-red-600 font-medium">
                  Belum bayar
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-zinc-400 hover:text-zinc-600">
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="hover:bg-zinc-50/50">
                <td className="px-4 py-3">
                  <input type="checkbox" className="rounded border-zinc-300" />
                </td>
                <td className="px-4 py-3 font-medium text-zinc-900">
                  ORD-26005
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-zinc-900">Studio Bintaro</p>
                  <p className="text-xs text-zinc-500">Komersial · 50 m²</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-zinc-900">Maya Lestari</p>
                  <p className="text-xs text-zinc-500">Tangerang Selatan</p>
                </td>
                <td className="px-4 py-3 text-zinc-600">2 Okt 2026</td>
                <td className="px-4 py-3 font-semibold text-zinc-900">
                  Rp 45.000.000
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700 border border-orange-200/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>{" "}
                    Pesanan baru
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-red-600 font-medium">
                  Belum bayar
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-zinc-400 hover:text-zinc-600">
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </td>
              </tr>

              {/* Row 3 */}
              <tr className="hover:bg-zinc-50/50">
                <td className="px-4 py-3">
                  <input type="checkbox" className="rounded border-zinc-300" />
                </td>
                <td className="px-4 py-3 font-medium text-zinc-900">
                  ORD-26003
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-zinc-900">Kafe Kala</p>
                  <p className="text-xs text-zinc-500">Komersial · 65 m²</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-zinc-900">Ari Wibowo</p>
                  <p className="text-xs text-zinc-500">Jakarta Selatan</p>
                </td>
                <td className="px-4 py-3 text-zinc-600">19 Sep 2026</td>
                <td className="px-4 py-3 font-semibold text-zinc-900">
                  Rp 85.000.000
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>{" "}
                    Instalasi
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-600 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Lunas
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-zinc-400 hover:text-zinc-600">
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </td>
              </tr>

              {/* Row 4 */}
              <tr className="hover:bg-zinc-50/50">
                <td className="px-4 py-3">
                  <input type="checkbox" className="rounded border-zinc-300" />
                </td>
                <td className="px-4 py-3 font-medium text-zinc-900">
                  ORD-26002
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-zinc-900">
                    Apartemen Senopati
                  </p>
                  <p className="text-xs text-zinc-500">Apartemen · 85 m²</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-zinc-900">Sarah Wijaya</p>
                  <p className="text-xs text-zinc-500">Jakarta Selatan</p>
                </td>
                <td className="px-4 py-3 text-zinc-600">16 Sep 2026</td>
                <td className="px-4 py-3 font-semibold text-zinc-900">
                  Rp 120.000.000
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-semibold text-yellow-700 border border-yellow-200/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-500"></span>{" "}
                    Produksi
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-600 font-medium">
                  DP 50%
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-zinc-400 hover:text-zinc-600">
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </td>
              </tr>

              {/* Row 5 */}
              <tr className="hover:bg-zinc-50/50">
                <td className="px-4 py-3">
                  <input type="checkbox" className="rounded border-zinc-300" />
                </td>
                <td className="px-4 py-3 font-medium text-zinc-900">
                  ORD-26001
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-zinc-900">Rumah Cipete</p>
                  <p className="text-xs text-zinc-500">Hunian · 120 m²</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-zinc-900">Budi Santoso</p>
                  <p className="text-xs text-zinc-500">Jakarta Selatan</p>
                </td>
                <td className="px-4 py-3 text-zinc-600">10 Sep 2026</td>
                <td className="px-4 py-3 font-semibold text-zinc-900">
                  Rp 145.000.000
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>{" "}
                    Desain
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-600 font-medium">
                  DP 50%
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-zinc-400 hover:text-zinc-600">
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </td>
              </tr>

              {/* Row 6 */}
              <tr className="hover:bg-zinc-50/50">
                <td className="px-4 py-3">
                  <input type="checkbox" className="rounded border-zinc-300" />
                </td>
                <td className="px-4 py-3 font-medium text-zinc-900">
                  ORD-26004
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-zinc-900">Kantor Aksara</p>
                  <p className="text-xs text-zinc-500">Komersial · 75 m²</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-zinc-900">PT Aksara</p>
                  <p className="text-xs text-zinc-500">Jakarta Pusat</p>
                </td>
                <td className="px-4 py-3 text-zinc-600">5 Sep 2026</td>
                <td className="px-4 py-3 font-semibold text-zinc-900">
                  Rp 60.000.000
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 border border-green-200/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>{" "}
                    Selesai
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-600 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> Lunas
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="text-zinc-400 hover:text-zinc-600">
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100">
          <p className="text-xs text-zinc-500">
            Menampilkan 1–6 dari 6 pesanan · Total Rp 485.000.000
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

      {/* Bottom Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Perlu konfirmasi */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-900">
                Perlu konfirmasi
              </h3>
              <p className="text-sm text-zinc-500">
                2 permintaan baru siap ditinjau.
              </p>
            </div>
            <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-bold text-orange-700">
              ⚡ 2 baru
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-zinc-900">
                  Rumah Tebet · Dimas Putra
                </p>
                <p className="text-xs text-zinc-500">
                  ORD-26006 · 3 Okt 2026
                </p>
              </div>
              <button className="text-xs font-bold text-[#2C4A3B] hover:underline flex items-center gap-1">
                Tinjau pesanan <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm text-zinc-900">
                  Studio Bintaro · Maya Lestari
                </p>
                <p className="text-xs text-zinc-500">
                  ORD-26005 · 2 Okt 2026
                </p>
              </div>
              <button className="text-xs font-bold text-[#2C4A3B] hover:underline flex items-center gap-1">
                Tinjau pesanan <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Jadwal pembayaran */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-zinc-900">
              Jadwal pembayaran
            </h3>
            <p className="text-sm text-zinc-500">
              Termin berikutnya untuk proyek yang sedang berjalan.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-900">
                Apartemen Senopati · Pelunasan
              </p>
              <p className="text-sm font-bold text-zinc-900">
                Rp 60 jt · 12 Okt
              </p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-900">
                Rumah Cipete · Pelunasan
              </p>
              <p className="text-sm font-bold text-zinc-900">
                Rp 72,5 jt · 18 Okt
              </p>
            </div>
          </div>

          <p className="text-[10px] text-zinc-400 mt-4 pt-3 border-t border-zinc-100">
            Tanggal estimasi mengikuti target proyek; belum jatuh tempo.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-zinc-400 pt-4 border-t border-zinc-200/50">
        <p>Renovin. · Ruang kerja studio interior</p>
        <p>Terakhir diperbarui 3 Okt 2026, 09.41 WIB</p>
      </div>
    </div>
  );
}
