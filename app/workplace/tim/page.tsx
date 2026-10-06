"use client";

import {
  Calendar,
  Plus,
  Search,
  ChevronDown,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const teamMembers = [
  {
    id: "NA",
    name: "Nadia A.",
    team: "Tim studio",
    role: "Desainer interior",
    project: "Rumah Cipete",
    task: "Penanggung jawab desain",
    allocation: 80,
    status: "Ditugaskan",
    phone: "0812 7100 1001",
  },
  {
    id: "RD",
    name: "Raka D.",
    team: "Tim studio",
    role: "Koordinator produksi",
    project: "Apartemen Senopati",
    task: "Penanggung jawab produksi",
    allocation: 90,
    status: "Ditugaskan",
    phone: "0812 7100 1002",
  },
  {
    id: "SP",
    name: "Sinta P.",
    team: "Tim studio",
    role: "Koordinator lapangan",
    project: "Kafe Kala",
    task: "Penanggung jawab instalasi",
    allocation: 90,
    status: "Ditugaskan",
    phone: "0812 7100 1003",
  },
  {
    id: "AP",
    name: "Andi Pratama",
    team: "Tim studio",
    role: "Pekerja kayu",
    project: "Apartemen Senopati",
    task: "Perakitan kabinet dapur",
    allocation: 85,
    status: "Ditugaskan",
    phone: "0812 7100 1004",
  },
  {
    id: "FH",
    name: "Fajar Hadi",
    team: "Tim studio",
    role: "Spesialis finishing",
    project: "Apartemen Senopati",
    task: "Pelapisan akhir furnitur",
    allocation: 75,
    status: "Ditugaskan",
    phone: "0812 7100 1005",
  },
  {
    id: "LS",
    name: "Luki Saputra",
    team: "Tim studio",
    role: "Teknisi listrik",
    project: "Kafe Kala",
    task: "Pemasangan lampu bar",
    allocation: 70,
    status: "Ditugaskan",
    phone: "0812 7100 1006",
  },
  {
    id: "DA",
    name: "Dewi Ananda",
    team: "Tim studio",
    role: "Drafter",
    project: "Belum ditugaskan",
    task: "Siap untuk proyek baru",
    allocation: 0,
    status: "Tersedia",
    phone: "0812 7100 1007",
  },
  {
    id: "BU",
    name: "Bagas Utama",
    team: "Tim studio",
    role: "Pekerja kayu",
    project: "Belum ditugaskan",
    task: "Siap untuk proyek baru",
    allocation: 0,
    status: "Tersedia",
    phone: "0812 7100 1008",
  },
];

export default function TimPekerja() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Tim pekerja</h1>
          <p className="text-sm text-zinc-500">
            Tim yang tepat untuk setiap tahap. Kelola peran, penugasan, dan
            ketersediaan.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
            <Calendar className="h-4 w-4" />
            Atur penugasan
          </button>
          <button className="flex items-center gap-2 rounded-md bg-[#2C4A3B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#233A2E]">
            <Plus className="h-4 w-4" />
            Tambah anggota
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
          <p className="text-sm font-medium text-zinc-500">Anggota tim</p>
          <p className="text-4xl font-bold text-zinc-900">8</p>
          <p className="text-xs text-zinc-400">Desain, produksi, dan lapangan</p>
        </div>
        <div className="rounded-xl bg-[#2C4A3B] p-5 flex flex-col justify-between h-32 text-white">
          <p className="text-sm font-medium text-white/80">Sedang ditugaskan</p>
          <p className="text-4xl font-bold">6</p>
          <p className="text-xs text-white/70">
            Tersebar di 3 proyek aktif
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
          <p className="text-sm font-medium text-zinc-500">Siap ditugaskan</p>
          <p className="text-4xl font-bold text-zinc-900">2</p>
          <p className="text-xs text-zinc-400">1 drafter · 1 pekerja kayu</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
          <p className="text-sm font-medium text-zinc-500">Penanggung jawab</p>
          <p className="text-4xl font-bold text-zinc-900">3</p>
          <p className="text-xs text-zinc-400">Nadia A. · Raka D. · Sinta P.</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">
              Anggota & penugasan
            </h2>
            <p className="text-sm text-zinc-500">
              Ketersediaan berdasarkan alokasi pekerjaan minggu ini.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-[#E8EDEA] px-3 py-1.5 text-xs font-semibold text-[#2C4A3B]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2C4A3B]"></span>
            3-9 Oktober 2026
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex bg-zinc-100 rounded-md p-0.5">
            <button className="px-3 py-1.5 text-xs font-semibold rounded bg-white shadow-sm text-zinc-900 flex items-center gap-1.5">
              Semua <span className="text-zinc-400 font-normal">8</span>
            </button>
            <button className="px-3 py-1.5 text-xs font-semibold rounded text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5">
              Ditugaskan <span className="text-zinc-400 font-normal">6</span>
            </button>
            <button className="px-3 py-1.5 text-xs font-semibold rounded text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5">
              Tersedia <span className="text-zinc-400 font-normal">2</span>
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari nama atau keahlian"
                className="h-9 w-64 rounded-md border border-zinc-200 pl-9 pr-3 text-xs outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B] placeholder:text-zinc-400"
              />
            </div>
            <button className="flex h-9 items-center gap-2 rounded-md border border-zinc-200 px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50">
              Semua peran <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="border-y border-zinc-100 text-[11px] bg-zinc-50/50 text-zinc-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-medium">Anggota</th>
                <th className="px-4 py-3 font-medium">Peran</th>
                <th className="px-4 py-3 font-medium">Proyek & penugasan</th>
                <th className="px-4 py-3 font-medium">Alokasi</th>
                <th className="px-4 py-3 font-medium">Ketersediaan</th>
                <th className="px-4 py-3 font-medium">Kontak</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {teamMembers.map((member, index) => (
                <tr key={index} className="hover:bg-zinc-50/50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8EDEA] text-[11px] font-bold text-[#2C4A3B]">
                        {member.id}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900 text-xs">
                          {member.name}
                        </p>
                        <p className="text-[10px] text-zinc-400">
                          {member.team}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-xs font-medium text-zinc-700">
                      {member.role}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-zinc-900 text-xs mb-0.5">
                      {member.project}
                    </p>
                    <p className="text-[10px] text-zinc-500">{member.task}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1 w-24">
                      <span className="text-[10px] font-semibold text-zinc-600">
                        {member.allocation}%
                      </span>
                      <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            member.allocation > 0 ? "bg-[#2C4A3B]" : "bg-transparent"
                          }`}
                          style={{ width: `${member.allocation}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-bold ${
                        member.status === "Ditugaskan"
                          ? "bg-[#F4F1ED] text-zinc-600"
                          : "bg-green-100/50 text-green-700"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          member.status === "Ditugaskan"
                            ? "bg-red-500"
                            : "bg-green-500"
                        }`}
                      ></span>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs font-medium text-zinc-700">
                    {member.phone}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button className="text-zinc-400 hover:text-zinc-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-2 p-4 border-t border-zinc-100">
          <p className="text-[11px] text-zinc-500">
            Menampilkan 1–8 dari 8 anggota · 2 anggota tersedia untuk proyek baru
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

      {/* Projects Assignment Section */}
      <div>
        <h2 className="text-lg font-bold text-zinc-900 mb-4">
          Penugasan per proyek
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {/* Project 1 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col">
            <h3 className="font-bold text-zinc-900 text-sm mb-1">
              Rumah Cipete
            </h3>
            <p className="text-[11px] text-zinc-500 mb-6">
              Pengembangan desain · Target 18 Okt
            </p>

            <div className="flex items-center justify-between mb-8">
              <div className="flex -space-x-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#E8EDEA] text-[9px] font-bold text-[#2C4A3B]">
                  NA
                </div>
              </div>
              <span className="text-[11px] text-zinc-500">1 anggota</span>
            </div>

            <div className="mt-auto border-t border-zinc-100 pt-3">
              <p className="text-[10px] text-zinc-500">
                Penanggung jawab · <span className="font-semibold text-zinc-700">Nadia A.</span>
              </p>
            </div>
          </div>

          {/* Project 2 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col">
            <h3 className="font-bold text-zinc-900 text-sm mb-1">
              Apartemen Senopati
            </h3>
            <p className="text-[11px] text-zinc-500 mb-6">
              Produksi furnitur · Target 12 Okt
            </p>

            <div className="flex items-center justify-between mb-8">
              <div className="flex -space-x-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#E8EDEA] text-[9px] font-bold text-[#2C4A3B] z-30">
                  RD
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#E8EDEA] text-[9px] font-bold text-[#2C4A3B] z-20">
                  AP
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#E8EDEA] text-[9px] font-bold text-[#2C4A3B] z-10">
                  FH
                </div>
              </div>
              <span className="text-[11px] text-zinc-500">3 anggota</span>
            </div>

            <div className="mt-auto border-t border-zinc-100 pt-3">
              <p className="text-[10px] text-zinc-500">
                Penanggung jawab · <span className="font-semibold text-zinc-700">Raka D.</span>
              </p>
            </div>
          </div>

          {/* Project 3 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col">
            <h3 className="font-bold text-zinc-900 text-sm mb-1">Kafe Kala</h3>
            <p className="text-[11px] text-zinc-500 mb-6">
              Instalasi di lokasi · Target 6 Okt
            </p>

            <div className="flex items-center justify-between mb-8">
              <div className="flex -space-x-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#E8EDEA] text-[9px] font-bold text-[#2C4A3B] z-20">
                  SP
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#E8EDEA] text-[9px] font-bold text-[#2C4A3B] z-10">
                  LS
                </div>
              </div>
              <span className="text-[11px] text-zinc-500">2 anggota</span>
            </div>

            <div className="mt-auto border-t border-zinc-100 pt-3">
              <p className="text-[10px] text-zinc-500">
                Penanggung jawab · <span className="font-semibold text-zinc-700">Sinta P.</span>
              </p>
            </div>
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
