"use client";

import {
  Calendar,
  Download,
  Wallet,
  CheckCircle2,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const chartData = [
  { date: "5 Sep", nilai: 60, diterima: 60 },
  { date: "10 Sep", nilai: 145, diterima: 72.5 },
  { date: "16 Sep", nilai: 120, diterima: 60 },
  { date: "19 Sep", nilai: 85, diterima: 85 },
  { date: "2 Okt", nilai: 45, diterima: 0 },
  { date: "3 Okt", nilai: 30, diterima: 0 },
];

const rincianData = [
  {
    project: "Rumah Tebet",
    id: "ORD-26006",
    nilai: "Rp 30 jt",
    diterima: "Rp 0 jt",
    sisa: "Rp 30 jt",
    status: "Belum bayar",
  },
  {
    project: "Studio Bintaro",
    id: "ORD-26005",
    nilai: "Rp 45 jt",
    diterima: "Rp 0 jt",
    sisa: "Rp 45 jt",
    status: "Belum bayar",
  },
  {
    project: "Kafe Kala",
    id: "ORD-26003",
    nilai: "Rp 85 jt",
    diterima: "Rp 85 jt",
    sisa: "Rp 0 jt",
    status: "Lunas",
  },
  {
    project: "Apartemen Senopati",
    id: "ORD-26002",
    nilai: "Rp 120 jt",
    diterima: "Rp 60 jt",
    sisa: "Rp 60 jt",
    status: "DP 50%",
  },
  {
    project: "Rumah Cipete",
    id: "ORD-26001",
    nilai: "Rp 145 jt",
    diterima: "Rp 72,5 jt",
    sisa: "Rp 72,5 jt",
    status: "DP 50%",
  },
  {
    project: "Kantor Aksara",
    id: "ORD-26004",
    nilai: "Rp 60 jt",
    diterima: "Rp 60 jt",
    sisa: "Rp 0 jt",
    status: "Lunas",
  },
];

export default function Laporan() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Laporan</h1>
          <p className="text-sm text-zinc-500">
            Gambaran kinerja studio dan keuangan dari seluruh pesanan yang
            tercatat.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 shadow-sm">
            <Calendar className="h-4 w-4" />
            5 Sep – 3 Okt 2026
          </button>
          <button className="flex items-center gap-2 rounded-md bg-[#2C4A3B] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#233A2E]">
            <Download className="h-4 w-4" />
            Unduh laporan
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="rounded-xl bg-[#2C4A3B] p-5 flex flex-col justify-between h-32 text-white relative overflow-hidden">
          <div className="flex justify-between items-start z-10 relative">
            <p className="text-sm font-medium text-white/80">
              Nilai seluruh pesanan
            </p>
            <Wallet className="h-4 w-4 text-white/50" />
          </div>
          <div className="z-10 relative mt-2">
            <p className="text-4xl font-bold mb-1">Rp 485 jt</p>
            <p className="text-xs text-white/70">6 pesanan studio</p>
          </div>
        </div>
        {/* Card 2 */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32 relative">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-zinc-500">
              Pembayaran diterima
            </p>
            <CheckCircle2 className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-2">
            <p className="text-4xl font-bold text-zinc-900 tracking-tight mb-1">
              Rp 277,5 jt
            </p>
            <p className="text-xs text-zinc-400">57,2% dari nilai pesanan</p>
          </div>
        </div>
        {/* Card 3 */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32 relative">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-zinc-500">
              Sisa pembayaran
            </p>
            <Clock className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-2">
            <p className="text-4xl font-bold text-zinc-900 tracking-tight mb-1">
              Rp 207,5 jt
            </p>
            <p className="text-xs text-zinc-400">
              Rp 132,5 jt termin · Rp 75 jt pesanan baru
            </p>
          </div>
        </div>
        {/* Card 4 */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32 relative">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-zinc-500">Proyek selesai</p>
            <Layers className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-2">
            <p className="text-4xl font-bold text-zinc-900 mb-1">1 dari 4</p>
            <p className="text-xs text-zinc-400">
              3 aktif · 2 pesanan belum menjadi proyek
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Chart Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 pb-8">
            <div className="mb-8">
              <h3 className="text-lg font-bold text-zinc-900 mb-1">
                Nilai pesanan & pembayaran
              </h3>
              <p className="text-xs text-zinc-500">
                Nilai berdasarkan tanggal masuk pesanan, dalam juta rupiah.
              </p>
            </div>
            <div className="flex items-center gap-6 mb-8 text-[11px] font-medium text-zinc-500">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#D4DFD7]"></span>
                Nilai pesanan
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-[#2C4A3B]"></span>
                Pembayaran diterima
              </div>
            </div>

            {/* Simulated Chart */}
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[500px]">
                <div className="relative h-48 w-full mt-4 flex">
                  {/* Y-axis labels and lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {[150, 100, 50, 0].map((val) => (
                  <div
                    key={val}
                    className="flex items-center w-full relative z-0"
                  >
                    <span className="text-[10px] text-zinc-400 w-8 pr-2 text-right">
                      {val} jt
                    </span>
                    <div className="flex-1 h-[1px] bg-zinc-100"></div>
                  </div>
                ))}
              </div>

              {/* Bars */}
              <div className="absolute inset-0 ml-8 flex items-end justify-between px-6 z-10 pb-0">
                {chartData.map((d, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="flex items-end gap-1.5 h-full">
                      <div className="flex flex-col items-center group relative">
                        {d.nilai > 0 && (
                          <span className="absolute -top-5 text-[10px] font-medium text-zinc-400">
                            {d.nilai}
                          </span>
                        )}
                        <div
                          className="w-5 bg-[#D4DFD7] rounded-t-sm"
                          style={{ height: `${(d.nilai / 150) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex flex-col items-center group relative">
                        <div
                          className="w-5 bg-[#2C4A3B] rounded-t-sm"
                          style={{ height: `${(d.diterima / 150) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* X-axis labels */}
            <div className="ml-8 mt-3 flex justify-between px-6">
              {chartData.map((d, i) => (
                <span
                  key={i}
                  className="text-[11px] font-medium text-zinc-500 w-12 text-center"
                >
                  {d.date}
                </span>
              ))}
            </div>
              </div>
            </div>
          </div>

          {/* Details Table Card */}
          <div className="rounded-xl border border-zinc-200 bg-white">
            <div className="p-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 mb-1">
                  Rincian keuangan per pesanan
                </h3>
                <p className="text-xs text-zinc-500">
                  Nilai kontrak, pembayaran tercatat, dan saldo tersisa.
                </p>
              </div>
              <span className="rounded-md bg-[#E8EDEA] px-2 py-1 text-xs font-semibold text-[#2C4A3B]">
                • 6 pesanan
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-600">
                <thead className="border-y border-zinc-100 text-[11px] bg-zinc-50/50 text-zinc-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 font-medium">Proyek / pesanan</th>
                    <th className="px-6 py-3 font-medium">Nilai</th>
                    <th className="px-6 py-3 font-medium">Diterima</th>
                    <th className="px-6 py-3 font-medium">Sisa</th>
                    <th className="px-6 py-3 font-medium text-right">
                      Pembayaran
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {rincianData.map((item, index) => (
                    <tr key={index} className="hover:bg-zinc-50/50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-zinc-900 text-xs">
                          {item.project}
                        </p>
                        <p className="text-[10px] text-zinc-400">{item.id}</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-zinc-700">
                        {item.nilai}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-zinc-700">
                        {item.diterima}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-zinc-700">
                        {item.sisa}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold ${
                            item.status === "Belum bayar"
                              ? "bg-orange-100/60 text-orange-700"
                              : item.status === "Lunas"
                              ? "bg-green-100/50 text-green-700"
                              : "bg-[#E8EDEA] text-[#2C4A3B]"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              item.status === "Belum bayar"
                                ? "bg-orange-500"
                                : item.status === "Lunas"
                                ? "bg-green-500"
                                : "bg-[#2C4A3B]"
                            }`}
                          ></span>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border-t border-zinc-100">
              <p className="text-[11px] text-zinc-500 font-medium">
                Total: Rp 485 jt · Diterima Rp 277,5 jt · Sisa Rp 207,5 jt
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
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Realisasi Pembayaran Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-1">
              Realisasi pembayaran
            </h3>
            <p className="text-xs text-zinc-500 mb-8">
              Terhadap total nilai pesanan Rp 485 jt.
            </p>

            <div className="flex flex-col items-center justify-center mb-8">
              <span className="text-5xl font-bold text-[#2C4A3B] tracking-tight mb-2">
                57,2%
              </span>
              <span className="text-xs text-zinc-500">
                dari nilai pesanan sudah diterima
              </span>
            </div>

            <div className="mb-6">
              <div className="flex h-3 w-full rounded-full overflow-hidden bg-zinc-100">
                <div className="h-full bg-[#2C4A3B] w-[57.2%]"></div>
                <div className="h-full bg-[#D4DFD7] w-[42.8%]"></div>
              </div>
              <div className="flex justify-between items-center mt-2 text-[10px] font-bold">
                <span className="text-[#2C4A3B]">Diterima 57,2%</span>
                <span className="text-zinc-400">Sisa 42,8%</span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-zinc-100">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 text-zinc-600">
                  <span className="h-2 w-2 rounded-sm bg-[#2C4A3B]"></span>
                  Diterima
                </div>
                <span className="font-bold text-zinc-900">Rp 277,5 jt</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 text-zinc-600">
                  <span className="h-2 w-2 rounded-sm bg-[#D4DFD7]"></span>
                  Sisa pembayaran
                </div>
                <span className="font-bold text-zinc-900">Rp 207,5 jt</span>
              </div>
            </div>
          </div>

          {/* Distribusi tahapan Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-1">
              Distribusi tahapan
            </h3>
            <p className="text-xs text-zinc-500 mb-6">
              4 proyek terkonfirmasi studio.
            </p>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-[11px] font-semibold mb-2">
                  <span className="text-zinc-700">Desain</span>
                  <span className="text-zinc-400">1 proyek</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#2C4A3B] w-1/4"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-semibold mb-2">
                  <span className="text-zinc-700">Produksi</span>
                  <span className="text-zinc-400">1 proyek</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#2C4A3B] w-1/4"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-semibold mb-2">
                  <span className="text-zinc-700">Instalasi</span>
                  <span className="text-zinc-400">1 proyek</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#2C4A3B] w-1/4"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-semibold mb-2">
                  <span className="text-zinc-700">Selesai</span>
                  <span className="text-zinc-400">1 proyek</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#2C4A3B] w-1/4"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Serah terima terbaru Card */}
          <div className="rounded-xl bg-[#2C4A3B] p-6 text-white flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Serah terima terbaru</h3>
              <p className="text-[11px] text-white/70 mb-4">
                Kantor Aksara · ORD-26004
              </p>
              <p className="text-sm font-semibold mb-6">
                Selesai pada 1 Oktober 2026
              </p>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs text-white/80">
                Nilai Rp 60 jt · Pembayaran lunas
              </p>
              <p className="text-[10px] text-white/60">
                Target terdekat: Kafe Kala - 6 Oktober
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Note and Footer */}
      <div className="pt-2">
        <p className="text-[10px] text-zinc-500 mb-6">
          Catatan: nilai pesanan bukan laba bersih. Sisa pembayaran termasuk pesanan baru yang belum dikonfirmasi; biaya operasional belum dicatat.
        </p>
        <div className="flex items-center justify-between text-xs text-zinc-400 pt-4 border-t border-zinc-200/50">
          <p>Renovin. · Ruang kerja studio interior</p>
          <p>Terakhir diperbarui 3 Okt 2026, 09.41 WIB</p>
        </div>
      </div>
    </div>
  );
}
