"use client";

import {
  Download,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  PenSquare,
} from "lucide-react";

export default function Klien() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Klien</h1>
          <p className="text-sm text-zinc-500">
            Kenali setiap klien dan temukan riwayat proyek serta kontaknya
            dengan mudah.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
          <Download className="h-4 w-4" />
          Ekspor data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
          <p className="text-sm font-medium text-zinc-500">Total klien</p>
          <p className="text-4xl font-bold text-zinc-900">6</p>
          <p className="text-xs text-zinc-400">5 perorangan · 1 perusahaan</p>
        </div>
        <div className="rounded-xl bg-[#2C4A3B] p-5 flex flex-col justify-between h-32 text-white">
          <p className="text-sm font-medium text-white/80">Klien proyek aktif</p>
          <p className="text-4xl font-bold">3</p>
          <p className="text-xs text-white/70">
            Budi Santoso · Sarah Wijaya · Ari Wibowo
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
          <p className="text-sm font-medium text-zinc-500">Klien baru</p>
          <p className="text-4xl font-bold text-zinc-900">2</p>
          <p className="text-xs text-zinc-400">Dimas Putra & Maya Lestari</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
          <p className="text-sm font-medium text-zinc-500">Nilai hubungan klien</p>
          <p className="text-4xl font-bold tracking-tight text-zinc-900">
            Rp 485 jt
          </p>
          <p className="text-xs text-zinc-400">Total nilai 6 pesanan studio</p>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Table */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden flex flex-col">
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-zinc-900">Daftar klien</h2>
                <span className="rounded-md bg-[#E8EDEA] px-2 py-1 text-xs font-semibold text-[#2C4A3B]">
                  • 6 klien
                </span>
              </div>

              <div className="flex items-center justify-between mb-2">
                <div className="flex bg-zinc-100 rounded-md p-0.5">
                  <button className="px-3 py-1.5 text-xs font-semibold rounded bg-white shadow-sm text-zinc-900 flex items-center gap-1.5">
                    Semua <span className="text-zinc-400 font-normal">6</span>
                  </button>
                  <button className="px-3 py-1.5 text-xs font-semibold rounded text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5">
                    Aktif <span className="text-zinc-400 font-normal">3</span>
                  </button>
                  <button className="px-3 py-1.5 text-xs font-semibold rounded text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5">
                    Baru <span className="text-zinc-400 font-normal">2</span>
                  </button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Cari nama atau kontak"
                    className="h-9 w-64 rounded-md border border-zinc-200 pl-9 pr-3 text-xs outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B] placeholder:text-zinc-400"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-600">
                <thead className="border-y border-zinc-100 text-[11px] bg-zinc-50/50 text-zinc-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3 font-medium">Klien</th>
                    <th className="px-6 py-3 font-medium">Kontak</th>
                    <th className="px-6 py-3 font-medium">Proyek terkait</th>
                    <th className="px-6 py-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {/* Row 1 - Budi Santoso (Active/Selected look) */}
                  <tr className="hover:bg-zinc-50/50 relative">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8EDEA] text-xs font-bold text-[#2C4A3B]">
                          BS
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900">
                            Budi Santoso
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Jakarta Selatan
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-900 mb-0.5 text-xs">
                        0812 8500 0101
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        budi.santoso@email.com
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-900 mb-0.5 text-xs">
                        Rumah Cipete
                      </p>
                      <p className="text-[11px] text-zinc-500">ORD-26001</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-[#E8EDEA] px-2 py-1 text-[11px] font-semibold text-[#2C4A3B]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#2C4A3B]"></span>
                        Proyek aktif
                      </span>
                    </td>
                  </tr>

                  {/* Row 2 - Sarah Wijaya */}
                  <tr className="hover:bg-zinc-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8EDEA] text-xs font-bold text-[#2C4A3B]">
                          SW
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900">
                            Sarah Wijaya
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Jakarta Selatan
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-900 mb-0.5 text-xs">
                        0813 8600 0202
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        sarah.wijaya@email.com
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-900 mb-0.5 text-xs">
                        Apartemen Senopati
                      </p>
                      <p className="text-[11px] text-zinc-500">ORD-26002</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-[#E8EDEA] px-2 py-1 text-[11px] font-semibold text-[#2C4A3B]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#2C4A3B]"></span>
                        Proyek aktif
                      </span>
                    </td>
                  </tr>

                  {/* Row 3 - Ari Wibowo */}
                  <tr className="hover:bg-zinc-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8EDEA] text-xs font-bold text-[#2C4A3B]">
                          AW
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900">
                            Ari Wibowo
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Jakarta Selatan
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-900 mb-0.5 text-xs">
                        0812 8900 0303
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        ari@kafekala.id
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-900 mb-0.5 text-xs">
                        Kafe Kala
                      </p>
                      <p className="text-[11px] text-zinc-500">ORD-26003</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-[#E8EDEA] px-2 py-1 text-[11px] font-semibold text-[#2C4A3B]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#2C4A3B]"></span>
                        Proyek aktif
                      </span>
                    </td>
                  </tr>

                  {/* Row 4 - Dimas Putra */}
                  <tr className="hover:bg-zinc-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8EDEA] text-xs font-bold text-[#2C4A3B]">
                          DP
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900">
                            Dimas Putra
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Jakarta Selatan
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-900 mb-0.5 text-xs">
                        0812 8700 0606
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        dimas.putra@email.com
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-900 mb-0.5 text-xs">
                        Rumah Tebet
                      </p>
                      <p className="text-[11px] text-zinc-500">ORD-26006</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-orange-50 px-2 py-1 text-[11px] font-semibold text-orange-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                        Klien baru
                      </span>
                    </td>
                  </tr>

                  {/* Row 5 - Maya Lestari */}
                  <tr className="hover:bg-zinc-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8EDEA] text-xs font-bold text-[#2C4A3B]">
                          ML
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900">
                            Maya Lestari
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Tangerang Selatan
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-900 mb-0.5 text-xs">
                        0813 8800 0505
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        maya.lestari@email.com
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-900 mb-0.5 text-xs">
                        Studio Bintaro
                      </p>
                      <p className="text-[11px] text-zinc-500">ORD-26005</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-orange-50 px-2 py-1 text-[11px] font-semibold text-orange-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                        Klien baru
                      </span>
                    </td>
                  </tr>

                  {/* Row 6 - PT Aksara */}
                  <tr className="hover:bg-zinc-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8EDEA] text-xs font-bold text-[#2C4A3B]">
                          PA
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900">
                            PT Aksara
                          </p>
                          <p className="text-[11px] text-zinc-500">
                            Jakarta Pusat
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-900 mb-0.5 text-xs">
                        021 5700 0404
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        operasional@aksara.id
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-zinc-900 mb-0.5 text-xs">
                        Kantor Aksara
                      </p>
                      <p className="text-[11px] text-zinc-500">ORD-26004</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-[#E8EDEA] px-2 py-1 text-[11px] font-semibold text-[#2C4A3B]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#2C4A3B]"></span>
                        Selesai
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-zinc-100">
              <p className="text-xs text-zinc-500">
                Menampilkan 1–6 dari 6 klien
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

          {/* Alert Banner */}
          <div className="flex items-center justify-between rounded-xl bg-[#E8EDEA] p-5 border border-[#2C4A3B]/10">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-[#2C4A3B] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-zinc-900 mb-0.5">
                  Percakapan yang tepat, proyek yang lebih lancar.
                </p>
                <p className="text-xs text-zinc-600">
                  Dimas Putra dan Maya Lestari belum menerima konfirmasi
                  pesanan. Jadwalkan konsultasi awal.
                </p>
              </div>
            </div>
            <button className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm border border-zinc-200 hover:bg-zinc-50">
              <ArrowUpRight className="h-4 w-4 text-zinc-500" />
              Tinjau pesanan baru
            </button>
          </div>
        </div>

        {/* Right Column - Profile Panels */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* Client Profile Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-zinc-900">Profil klien</h3>
              <button className="text-zinc-400 hover:text-zinc-600">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8EDEA] text-sm font-bold text-[#2C4A3B]">
                BS
              </div>
              <div>
                <p className="font-bold text-zinc-900">Budi Santoso</p>
                <p className="text-[11px] text-zinc-500">
                  Klien sejak 10 Sep 2026
                </p>
              </div>
            </div>

            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#E8EDEA] px-2 py-1 text-[10px] font-semibold text-[#2C4A3B]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2C4A3B]"></span>
                Proyek aktif
              </span>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3 text-sm text-zinc-600">
                <Mail className="h-4 w-4 text-zinc-400" />
                <span>budi.santoso@email.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-600">
                <Phone className="h-4 w-4 text-zinc-400" />
                <span>0812 8500 0101</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-zinc-600">
                <MapPin className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                <span>Cipete, Jakarta Selatan</span>
              </div>
            </div>

            <div className="rounded-lg bg-[#F4F1ED] p-4 mb-6">
              <p className="text-[11px] font-bold text-zinc-900 mb-1.5">
                Preferensi & catatan
              </p>
              <p className="text-[11px] leading-relaxed text-zinc-600">
                Material kayu alami dan palet hangat. Pembaruan desain dikirim
                melalui aplikasi mobile.
              </p>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 rounded-md bg-[#2C4A3B] px-3 py-2 text-xs font-semibold text-white hover:bg-[#233A2E]">
                <MessageSquare className="h-3.5 w-3.5" />
                Hubungi klien
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50">
                <PenSquare className="h-3.5 w-3.5" />
                Ubah profil
              </button>
            </div>
          </div>

          {/* Related Project Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-1">
              Proyek terkait
            </h3>
            <p className="text-[11px] text-zinc-500 mb-6">
              Rumah Cipete · ORD-26001
            </p>

            <div className="mb-6">
              <div className="flex justify-between text-xs mb-2">
                <span className="font-semibold text-zinc-700">
                  Pengembangan desain
                </span>
                <span className="font-bold text-zinc-900">45%</span>
              </div>
              <div className="relative h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full w-[45%] bg-[#2C4A3B] rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 mb-6">
              <p className="font-bold text-sm text-zinc-900">Rp 145.000.000</p>
              <span className="inline-flex items-center gap-1 rounded bg-[#E8EDEA] px-2 py-0.5 text-[10px] font-bold text-[#2C4A3B]">
                <span className="h-1 w-1 rounded-full bg-[#2C4A3B]"></span>
                DP 50%
              </span>
            </div>

            <p className="text-[10px] text-zinc-500">
              Nadia A. - Target 18 Okt 2026
            </p>
          </div>
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
