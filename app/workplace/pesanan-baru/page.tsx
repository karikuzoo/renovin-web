"use client";

import Image from "next/image";
import { Download, Search, Filter, Info, ArrowUpRight, ArrowDown, Calendar } from "lucide-react";

export default function PenerimaanBaru() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-medium text-zinc-900 mb-2">
            Penerimaan pesanan baru
          </h1>
          <p className="text-sm text-zinc-500">
            Tinjau kebutuhan klien dan terima pesanan sebelum menyusun rincian bahan.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
          <Download className="h-4 w-4" />
          Ekspor daftar
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="rounded-xl bg-[#2C4A3B] p-5 flex flex-col justify-between h-32 text-white">
          <p className="text-sm font-medium text-white/80">Menunggu penerimaan</p>
          <p className="text-4xl font-bold">4</p>
          <p className="text-xs text-white/70">Seluruh permintaan belum diterima</p>
        </div>
        {/* Card 2 */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
          <p className="text-sm font-medium text-zinc-500">Pesanan baru</p>
          <p className="text-4xl font-bold text-zinc-900">2</p>
          <p className="text-xs text-zinc-400">Brief & foto siap ditinjau</p>
        </div>
        {/* Card 3 */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
          <p className="text-sm font-medium text-zinc-500">Sedang ditinjau</p>
          <p className="text-4xl font-bold text-zinc-900">1</p>
          <p className="text-xs text-zinc-400">Ukuran ruang dalam verifikasi</p>
        </div>
        {/* Card 4 */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
          <p className="text-sm font-medium text-zinc-500">Perlu kelengkapan</p>
          <p className="text-4xl font-bold text-zinc-900">1</p>
          <p className="text-xs text-zinc-400">Menunggu denah dari klien</p>
        </div>
      </div>

      {/* Alert */}
      <div className="flex items-start gap-3 rounded-xl bg-[#E8EDEA] p-4 border border-[#2C4A3B]/10">
        <Info className="h-5 w-5 text-[#2C4A3B] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-zinc-900 mb-0.5">
            Terima pesanan terlebih dahulu, lalu susun nilai proyek.
          </p>
          <p className="text-sm text-zinc-600">
            Nilai proyek belum ditetapkan. Admin menginput bahan dan harga setelah pesanan diterima; total bahan menjadi nilai proyek.
          </p>
        </div>
      </div>

      {/* Orders Table Section */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Pesanan masuk</h2>
            <p className="text-sm text-zinc-500">Periksa kontak, lokasi, luas, dan lingkup sebelum menerima.</p>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600">
            <Calendar className="h-4 w-4" />
            4 Okt 2026
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex bg-zinc-100 rounded-md p-0.5">
            <button className="px-3 py-1 text-xs font-semibold rounded bg-white shadow-sm text-zinc-900 flex items-center gap-1.5">
              Semua <span className="text-zinc-400 font-normal">4</span>
            </button>
            <button className="px-3 py-1 text-xs font-semibold rounded text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5">
              Baru <span className="text-zinc-400 font-normal">2</span>
            </button>
            <button className="px-3 py-1 text-xs font-semibold rounded text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5">
              Ditinjau <span className="text-zinc-400 font-normal">1</span>
            </button>
            <button className="px-3 py-1 text-xs font-semibold rounded text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5">
              Perlu info <span className="text-zinc-400 font-normal">1</span>
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input type="text" placeholder="Cari proyek, klien, atau nomor pesanan" className="h-8 w-64 rounded-md border border-zinc-200 pl-8 pr-3 text-xs outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B]" />
            </div>
            <button className="flex h-8 items-center gap-2 rounded-md border border-zinc-200 px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50">
              <Filter className="h-3 w-3" />
              Terbaru
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
                <th className="px-4 py-3 w-10"><input type="checkbox" className="rounded border-zinc-300" /></th>
                <th className="px-4 py-3 font-medium">Foto / proyek / luas</th>
                <th className="px-4 py-3 font-medium">Klien / telepon</th>
                <th className="px-4 py-3 font-medium">Masuk / mulai</th>
                <th className="px-4 py-3 font-medium">Lokasi / lingkup renovasi</th>
                <th className="px-4 py-3 font-medium">Peninjauan</th>
                <th className="px-4 py-3 font-medium">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {/* Row 1 */}
              <tr className="hover:bg-zinc-50/50">
                <td className="px-4 py-4 align-top pt-5"><input type="checkbox" className="rounded border-zinc-300" /></td>
                <td className="px-4 py-4">
                  <div className="flex gap-3">
                    <div className="relative h-16 w-20 rounded-md overflow-hidden bg-zinc-200 shrink-0">
                      <Image src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=200" alt="Room" fill className="object-cover" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400">ORD-26008</p>
                      <p className="font-bold text-zinc-900 text-sm">Kamar Cilandak</p>
                      <p className="text-xs text-zinc-500">Kamar tidur</p>
                      <p className="text-xs font-bold text-zinc-900 mt-1">18 m²</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 align-top">
                  <p className="font-bold text-zinc-900 text-sm">Andi Saputra</p>
                  <p className="text-xs text-zinc-600 mt-0.5">0811-9900-456</p>
                  <button className="text-[10px] font-semibold text-zinc-500 flex items-center gap-1 hover:text-zinc-800 mt-1">
                    Hubungi klien <ArrowUpRight className="h-3 w-3" />
                  </button>
                </td>
                <td className="px-4 py-4 align-top">
                  <p className="font-bold text-zinc-900 text-sm">4 Okt 2026</p>
                  <p className="text-xs text-zinc-500 mb-2">09.32 WIB</p>
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Target mulai</p>
                  <p className="font-bold text-zinc-900 text-sm">2 Nov 2026</p>
                </td>
                <td className="px-4 py-4 align-top">
                  <p className="text-sm font-medium text-zinc-900 mb-2">Jl. Cilandak Tengah No. 16, Jakarta Selatan</p>
                  <p className="text-xs text-zinc-500">Cat dinding, plafon & lantai vinyl</p>
                </td>
                <td className="px-4 py-4 align-top">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700 border border-orange-200/50 mb-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span> Perlu info
                  </span>
                  <p className="text-[10px] text-zinc-500">Denah belum dilampirkan</p>
                </td>
                <td className="px-4 py-4 align-top">
                  <button className="flex w-full items-center justify-center gap-2 rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 mb-2">
                    <span className="h-3 w-3 border rounded-full inline-block"></span> Minta kelengkapan
                  </button>
                  <button className="flex w-full items-center justify-center gap-1 text-[11px] font-bold text-zinc-900 hover:text-[#2C4A3B]">
                    Lihat detail <ArrowUpRight className="h-3 w-3" />
                  </button>
                </td>
              </tr>
              
              {/* Row 2 */}
              <tr className="hover:bg-zinc-50/50">
                <td className="px-4 py-4 align-top pt-5"><input type="checkbox" className="rounded border-zinc-300" /></td>
                <td className="px-4 py-4">
                  <div className="flex gap-3">
                    <div className="relative h-16 w-20 rounded-md overflow-hidden bg-zinc-200 shrink-0">
                      <Image src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=200" alt="Room" fill className="object-cover" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400">ORD-26007</p>
                      <p className="font-bold text-zinc-900 text-sm">Dapur Pasar Minggu</p>
                      <p className="text-xs text-zinc-500">Dapur</p>
                      <p className="text-xs font-bold text-zinc-900 mt-1">24 m²</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 align-top">
                  <p className="font-bold text-zinc-900 text-sm">Rina Pratiwi</p>
                  <p className="text-xs text-zinc-600 mt-0.5">0857-1122-3344</p>
                  <button className="text-[10px] font-semibold text-zinc-500 flex items-center gap-1 hover:text-zinc-800 mt-1">
                    Hubungi klien <ArrowUpRight className="h-3 w-3" />
                  </button>
                </td>
                <td className="px-4 py-4 align-top">
                  <p className="font-bold text-zinc-900 text-sm">4 Okt 2026</p>
                  <p className="text-xs text-zinc-500 mb-2">09.10 WIB</p>
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">Target mulai</p>
                  <p className="font-bold text-zinc-900 text-sm">26 Okt 2026</p>
                </td>
                <td className="px-4 py-4 align-top">
                  <p className="text-sm font-medium text-zinc-900 mb-2">Jl. Pejaten Raya No. 27, Jakarta Selatan</p>
                  <p className="text-xs text-zinc-500">Keramik, backsplash & kabinet bawah</p>
                </td>
                <td className="px-4 py-4 align-top">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700 border border-orange-200/50 mb-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span> Baru
                  </span>
                  <p className="text-[10px] text-zinc-500">Brief & foto lengkap</p>
                </td>
                <td className="px-4 py-4 align-top">
                  <button className="flex w-full items-center justify-center gap-2 rounded-md bg-[#2C4A3B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#233A2E] mb-2">
                    <ArrowDown className="h-3 w-3" /> Terima pesanan
                  </button>
                  <button className="flex w-full items-center justify-center gap-1 text-[11px] font-bold text-zinc-900 hover:text-[#2C4A3B]">
                    Lihat detail <ArrowUpRight className="h-3 w-3" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
