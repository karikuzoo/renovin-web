"use client";

import {
  Check,
  Upload,
  MapPin,
  ChevronDown,
  Pencil,
  Lock,
  Bell,
} from "lucide-react";

export default function Pengaturan() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Pengaturan</h1>
          <p className="text-sm text-zinc-500">
            Sesuaikan identitas studio, akses admin, dan cara tim tetap terhubung.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-md bg-[#2C4A3B] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#233A2E]">
          <Check className="h-4 w-4" />
          Simpan perubahan
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-200">
        <div className="flex gap-6">
          <button className="border-b-2 border-[#2C4A3B] pb-3 text-sm font-bold text-zinc-900">
            Profil studio
          </button>
          <button className="pb-3 text-sm font-medium text-zinc-500 hover:text-zinc-700">
            Admin & keamanan
          </button>
          <button className="pb-3 text-sm font-medium text-zinc-500 hover:text-zinc-700">
            Notifikasi
          </button>
          <button className="pb-3 text-sm font-medium text-zinc-500 hover:text-zinc-700">
            Sinkronisasi mobile
          </button>
        </div>
        <div className="pb-3">
          <p className="text-xs text-zinc-400">Pengaturan ruang kerja studio</p>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (Profil studio) - 8 cols */}
        <div className="lg:col-span-8">
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <div className="mb-8">
              <h2 className="text-lg font-bold text-zinc-900 mb-1">
                Profil studio
              </h2>
              <p className="text-xs text-zinc-500">
                Identitas yang tampil pada dokumen pesanan dan informasi klien.
              </p>
            </div>

            {/* Logo Section */}
            <div className="flex items-center gap-6 mb-8">
              <div className="h-24 w-40 rounded-lg bg-[#F4F1ED] flex flex-col items-center justify-center p-4 border border-zinc-100">
                <span className="font-serif text-2xl text-[#2C4A3B] leading-none mb-1">
                  Renovin.
                </span>
                <span className="text-[8px] font-semibold tracking-widest text-[#2C4A3B]/60 uppercase">
                  Studio Interior
                </span>
              </div>
              <div>
                <button className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 mb-2">
                  <Upload className="h-3.5 w-3.5" />
                  Ubah logo
                </button>
                <p className="text-[10px] text-zinc-400">
                  PNG atau SVG · Ukuran maksimal 2 MB
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700">
                  Nama studio
                </label>
                <input
                  type="text"
                  defaultValue="Renovin. Studio Interior"
                  className="w-full rounded-md border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700">
                  Email studio
                </label>
                <input
                  type="email"
                  defaultValue="halo@renovin.id"
                  className="w-full rounded-md border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700">
                  Telepon studio
                </label>
                <input
                  type="text"
                  defaultValue="021 7500 2600"
                  className="w-full rounded-md border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700">
                  Situs web
                </label>
                <input
                  type="text"
                  defaultValue="www.renovin.id"
                  className="w-full rounded-md border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B]"
                />
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-xs font-bold text-zinc-700">
                Alamat studio
              </label>
              <div className="relative">
                <input
                  type="text"
                  defaultValue="Jl. Cipete Raya No. 18, Jakarta Selatan"
                  className="w-full rounded-md border border-zinc-200 px-3 py-2.5 pr-10 text-sm text-zinc-900 outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B]"
                />
                <MapPin className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700">
                  Zona waktu
                </label>
                <div className="relative">
                  <select className="w-full appearance-none rounded-md border border-zinc-200 px-3 py-2.5 pr-10 text-sm text-zinc-900 outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B] bg-white">
                    <option>WIB - Asia/Jakarta</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700">
                  Mata uang
                </label>
                <div className="relative">
                  <select className="w-full appearance-none rounded-md border border-zinc-200 px-3 py-2.5 pr-10 text-sm text-zinc-900 outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B] bg-white">
                    <option>Rupiah (IDR)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Profil admin) - 4 cols */}
        <div className="lg:col-span-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 h-full flex flex-col">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-zinc-900 mb-1">
                Profil admin
              </h2>
              <p className="text-xs text-zinc-500">
                Akun yang mengelola ruang kerja studio.
              </p>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8EDEA] text-sm font-bold text-[#2C4A3B]">
                  AP
                </div>
                <div>
                  <p className="font-bold text-zinc-900">Atmin Pusat</p>
                  <span className="inline-block mt-0.5 rounded bg-[#E8EDEA] px-2 py-0.5 text-[10px] font-semibold text-[#2C4A3B]">
                    • Administrator
                  </span>
                </div>
              </div>
              <button className="text-zinc-400 hover:text-zinc-600">
                <Pencil className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 mb-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700">
                  Nama lengkap
                </label>
                <input
                  type="text"
                  defaultValue="Atmin Pusat"
                  className="w-full rounded-md border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700">
                  Email admin
                </label>
                <input
                  type="email"
                  defaultValue="admin@renovin.id"
                  className="w-full rounded-md border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B]"
                />
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-zinc-700">
                  Kata sandi
                </label>
                <span className="text-[10px] text-zinc-400">
                  Diubah 20 Sep 2026
                </span>
              </div>
              <button className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 w-fit">
                <Lock className="h-3.5 w-3.5" />
                Ubah kata sandi
              </button>
            </div>

            <div className="flex items-center justify-between mb-auto">
              <div>
                <label className="text-xs font-bold text-zinc-900 block mb-0.5">
                  Verifikasi dua langkah
                </label>
                <p className="text-[10px] text-zinc-500">
                  Lapisan keamanan tambahan saat masuk.
                </p>
              </div>
              {/* Toggle switch OFF */}
              <button className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-[#2C4A3B] focus:ring-offset-2">
                <span className="sr-only">Use setting</span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute mx-auto h-4 w-8 rounded-full bg-zinc-200 transition-colors duration-200 ease-in-out"
                ></span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-zinc-200 bg-white shadow ring-0 transition-transform duration-200 ease-in-out translate-x-0"
                ></span>
              </button>
            </div>

            <div className="mt-8 pt-4 border-t border-zinc-100">
              <p className="text-[10px] text-zinc-400">
                Sesi aktif: desktop studio · Jakarta · hari ini
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Preferensi Notifikasi */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-zinc-900 mb-1">
            Preferensi notifikasi
          </h2>
          <p className="text-xs text-zinc-500">
            Tentukan informasi yang ingin diterima oleh admin studio.
          </p>
        </div>

        {/* Saluran Notifikasi Box */}
        <div className="flex items-center justify-between rounded-lg bg-zinc-50 p-3 mb-6">
          <div className="flex items-center gap-2 text-sm text-zinc-700">
            <Bell className="h-4 w-4 text-zinc-400" />
            <span className="font-semibold text-xs">Saluran notifikasi</span>
          </div>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1 rounded bg-[#E8EDEA] px-2 py-1 text-[10px] font-bold text-[#2C4A3B]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2C4A3B]"></span>
              Email
            </span>
            <span className="inline-flex items-center gap-1 rounded bg-[#E8EDEA] px-2 py-1 text-[10px] font-bold text-[#2C4A3B]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2C4A3B]"></span>
              Dalam aplikasi
            </span>
          </div>
        </div>

        {/* Toggles List */}
        <div className="space-y-6 mb-8">
          {/* Item 1 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-zinc-900 mb-0.5">Pesanan baru</p>
              <p className="text-xs text-zinc-500">
                Saat klien mengirim permintaan dan pesanan menunggu konfirmasi.
              </p>
            </div>
            <button className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none">
              <span className="pointer-events-none absolute mx-auto h-4 w-8 rounded-full bg-[#2C4A3B] transition-colors duration-200 ease-in-out"></span>
              <span className="pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-zinc-200 bg-white shadow ring-0 transition-transform duration-200 ease-in-out translate-x-4"></span>
            </button>
          </div>
          {/* Item 2 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-zinc-900 mb-0.5">
                Pembaruan proyek
              </p>
              <p className="text-xs text-zinc-500">
                Perubahan tahapan, progres, dan catatan dari tim lapangan.
              </p>
            </div>
            <button className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none">
              <span className="pointer-events-none absolute mx-auto h-4 w-8 rounded-full bg-[#2C4A3B] transition-colors duration-200 ease-in-out"></span>
              <span className="pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-zinc-200 bg-white shadow ring-0 transition-transform duration-200 ease-in-out translate-x-4"></span>
            </button>
          </div>
          {/* Item 3 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-zinc-900 mb-0.5">
                Pengingat pembayaran
              </p>
              <p className="text-xs text-zinc-500">
                Pembayaran diterima dan pengingat termin mendekati jatuh tempo.
              </p>
            </div>
            <button className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none">
              <span className="pointer-events-none absolute mx-auto h-4 w-8 rounded-full bg-[#2C4A3B] transition-colors duration-200 ease-in-out"></span>
              <span className="pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-zinc-200 bg-white shadow ring-0 transition-transform duration-200 ease-in-out translate-x-4"></span>
            </button>
          </div>
          {/* Item 4 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-zinc-900 mb-0.5">
                Ringkasan mingguan
              </p>
              <p className="text-xs text-zinc-500">
                Laporan singkat kinerja proyek dan keuangan setiap Senin.
              </p>
            </div>
            <button className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none">
              <span className="pointer-events-none absolute mx-auto h-4 w-8 rounded-full bg-zinc-200 transition-colors duration-200 ease-in-out"></span>
              <span className="pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-zinc-200 bg-white shadow ring-0 transition-transform duration-200 ease-in-out translate-x-0"></span>
            </button>
          </div>
        </div>

        {/* Locale Settings */}
        <div className="grid grid-cols-2 gap-6 pt-6 border-t border-zinc-100">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700">
              Bahasa antarmuka
            </label>
            <div className="relative">
              <select className="w-full appearance-none rounded-md border border-zinc-200 px-3 py-2.5 pr-10 text-sm text-zinc-900 outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B] bg-white">
                <option>Bahasa Indonesia</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700">
              Format tanggal
            </label>
            <div className="relative">
              <select className="w-full appearance-none rounded-md border border-zinc-200 px-3 py-2.5 pr-10 text-sm text-zinc-900 outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B] bg-white">
                <option>3 Okt 2026</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Save Action Bottom Banner */}
      <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-5">
        <div>
          <p className="text-sm font-bold text-zinc-900 mb-0.5">
            Pengaturan berlaku untuk ruang kerja studio ini.
          </p>
          <p className="text-xs text-zinc-500">
            Periksa preferensi sebelum menyimpan perubahan.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 shadow-sm">
            Batalkan
          </button>
          <button className="flex items-center gap-2 rounded-md bg-[#2C4A3B] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#233A2E]">
            <Check className="h-4 w-4" />
            Simpan perubahan
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 pb-4">
        <p>Renovin. · Ruang kerja studio interior</p>
        <p>Terakhir diperbarui 3 Okt 2026, 09.41 WIB</p>
      </div>
    </div>
  );
}
