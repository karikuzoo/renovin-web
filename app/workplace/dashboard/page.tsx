"use client";

import Image from "next/image";
import { MoreHorizontal, Calendar, ArrowRight, ArrowUpRight, Download, Search, Filter, CheckCircle2 } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-medium text-zinc-900">
            Selamat pagi, <span className="italic">Atmin.</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-600">
          <Calendar className="h-4 w-4" />
          3 Okt 2026
        </div>
      </div>

      {/* Summary Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            RINGKASAN STUDIO
          </h2>
          <span className="text-xs text-zinc-400">
            Terakhir diperbarui hari ini, 09.41 WIB
          </span>
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
            <p className="text-sm font-medium text-zinc-500">Total pesanan</p>
            <p className="text-4xl font-bold text-zinc-900">6</p>
            <p className="text-xs text-zinc-400">2 pesanan baru menunggu konfirmasi</p>
          </div>
          {/* Card 2 */}
          <div className="rounded-xl bg-[#2C4A3B] p-5 flex flex-col justify-between h-32 text-white">
            <p className="text-sm font-medium text-white/80">Proyek dikerjakan</p>
            <p className="text-4xl font-bold">3</p>
            <p className="text-xs text-white/70">1 desain - 1 produksi - 1 instalasi</p>
          </div>
          {/* Card 3 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
            <p className="text-sm font-medium text-zinc-500">Proyek selesai</p>
            <p className="text-4xl font-bold text-zinc-900">1</p>
            <p className="text-xs text-zinc-400">Serah terima pada 1 Oktober</p>
          </div>
          {/* Card 4 */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
            <p className="text-sm font-medium text-zinc-500">Nilai pesanan</p>
            <p className="text-4xl font-bold tracking-tight text-zinc-900">Rp 485 jt</p>
            <p className="text-xs text-zinc-400">Total nilai dari 6 pesanan</p>
          </div>
        </div>
      </div>

      {/* Ongoing Projects Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-zinc-900">Proyek yang sedang berjalan</h2>
            <span className="rounded-full bg-[#E8EDEA] px-2 py-0.5 text-xs font-semibold text-[#2C4A3B]">
              3 aktif
            </span>
          </div>
          <button className="text-xs font-semibold text-[#2C4A3B] flex items-center gap-1 hover:underline">
            Lihat semua proyek <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {/* Project 1 */}
          <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden flex flex-col">
            <div className="relative h-32 bg-zinc-200">
              <Image src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=400" alt="Project" fill className="object-cover" />
              <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 text-[10px] font-semibold rounded text-zinc-700">Hunian - 120 m²</div>
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-zinc-400">ORD-26001</span>
                <button className="text-zinc-400 hover:text-zinc-600"><MoreHorizontal className="h-4 w-4" /></button>
              </div>
              <h3 className="font-bold text-zinc-900 mb-4">Rumah Cipete</h3>
              
              <div className="mt-auto">
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-semibold text-zinc-700">Pengembangan desain</span>
                  <span className="font-bold text-zinc-900">45%</span>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-400 font-medium mb-4 relative">
                  {/* Fake Progress Line */}
                  <div className="absolute top-2.5 left-2 right-2 h-0.5 bg-zinc-100 z-0"></div>
                  <div className="absolute top-2.5 left-2 w-[45%] h-0.5 bg-[#2C4A3B] z-0"></div>
                  
                  <div className="flex flex-col items-center gap-1 relative z-10">
                    <div className="h-5 w-5 rounded-full bg-[#E8EDEA] border border-white flex items-center justify-center"><CheckCircle2 className="h-3 w-3 text-[#2C4A3B]" /></div>
                    <span>Brief</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 relative z-10">
                    <div className="h-5 w-5 rounded-full bg-white border-2 border-[#2C4A3B] flex items-center justify-center"><div className="h-1.5 w-1.5 rounded-full bg-[#2C4A3B]"></div></div>
                    <span className="text-zinc-700 font-bold">Desain</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 relative z-10">
                    <div className="h-5 w-5 rounded-full bg-zinc-100 border border-white flex items-center justify-center"><div className="h-1 w-1 rounded-full bg-zinc-300"></div></div>
                    <span>Produksi</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 relative z-10">
                    <div className="h-5 w-5 rounded-full bg-zinc-100 border border-white flex items-center justify-center"><div className="h-1 w-1 rounded-full bg-zinc-300"></div></div>
                    <span>Instalasi</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 relative z-10">
                    <div className="h-5 w-5 rounded-full bg-zinc-100 border border-white flex items-center justify-center"><div className="h-1 w-1 rounded-full bg-zinc-300"></div></div>
                    <span>Selesai</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8EDEA] text-[8px] font-bold text-[#2C4A3B]">NA</div>
                    <span className="text-xs font-medium text-zinc-600">Nadia A.</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-medium">Target 18 Okt</span>
                </div>
              </div>
            </div>
          </div>

          {/* Project 2 */}
          <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden flex flex-col">
            <div className="relative h-32 bg-zinc-200">
              <Image src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=400" alt="Project" fill className="object-cover" />
              <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 text-[10px] font-semibold rounded text-zinc-700">Apartemen - 85 m²</div>
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-zinc-400">ORD-26002</span>
                <button className="text-zinc-400 hover:text-zinc-600"><MoreHorizontal className="h-4 w-4" /></button>
              </div>
              <h3 className="font-bold text-zinc-900 mb-4">Apartemen Senopati</h3>
              
              <div className="mt-auto">
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-semibold text-zinc-700">Produksi furnitur</span>
                  <span className="font-bold text-zinc-900">70%</span>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-400 font-medium mb-4 relative">
                  <div className="absolute top-2.5 left-2 right-2 h-0.5 bg-zinc-100 z-0"></div>
                  <div className="absolute top-2.5 left-2 w-[70%] h-0.5 bg-[#2C4A3B] z-0"></div>
                  
                  <div className="flex flex-col items-center gap-1 relative z-10"><div className="h-5 w-5 rounded-full bg-[#E8EDEA] border border-white flex items-center justify-center"><CheckCircle2 className="h-3 w-3 text-[#2C4A3B]" /></div><span>Brief</span></div>
                  <div className="flex flex-col items-center gap-1 relative z-10"><div className="h-5 w-5 rounded-full bg-[#E8EDEA] border border-white flex items-center justify-center"><CheckCircle2 className="h-3 w-3 text-[#2C4A3B]" /></div><span>Desain</span></div>
                  <div className="flex flex-col items-center gap-1 relative z-10"><div className="h-5 w-5 rounded-full bg-white border-2 border-[#2C4A3B] flex items-center justify-center"><div className="h-1.5 w-1.5 rounded-full bg-[#2C4A3B]"></div></div><span className="text-zinc-700 font-bold">Produksi</span></div>
                  <div className="flex flex-col items-center gap-1 relative z-10"><div className="h-5 w-5 rounded-full bg-zinc-100 border border-white flex items-center justify-center"><div className="h-1 w-1 rounded-full bg-zinc-300"></div></div><span>Instalasi</span></div>
                  <div className="flex flex-col items-center gap-1 relative z-10"><div className="h-5 w-5 rounded-full bg-zinc-100 border border-white flex items-center justify-center"><div className="h-1 w-1 rounded-full bg-zinc-300"></div></div><span>Selesai</span></div>
                </div>
                
                <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8EDEA] text-[8px] font-bold text-[#2C4A3B]">RD</div>
                    <span className="text-xs font-medium text-zinc-600">Raka D.</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-medium">Target 12 Okt</span>
                </div>
              </div>
            </div>
          </div>

          {/* Project 3 */}
          <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden flex flex-col">
            <div className="relative h-32 bg-zinc-200">
              <Image src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=400" alt="Project" fill className="object-cover" />
              <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 text-[10px] font-semibold rounded text-zinc-700">Komersial - 65 m²</div>
            </div>
            <div className="p-4 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-zinc-400">ORD-26003</span>
                <button className="text-zinc-400 hover:text-zinc-600"><MoreHorizontal className="h-4 w-4" /></button>
              </div>
              <h3 className="font-bold text-zinc-900 mb-4">Kafe Kala</h3>
              
              <div className="mt-auto">
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-semibold text-zinc-700">Instalasi di lokasi</span>
                  <span className="font-bold text-zinc-900">90%</span>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-400 font-medium mb-4 relative">
                  <div className="absolute top-2.5 left-2 right-2 h-0.5 bg-zinc-100 z-0"></div>
                  <div className="absolute top-2.5 left-2 w-[90%] h-0.5 bg-[#2C4A3B] z-0"></div>
                  
                  <div className="flex flex-col items-center gap-1 relative z-10"><div className="h-5 w-5 rounded-full bg-[#E8EDEA] border border-white flex items-center justify-center"><CheckCircle2 className="h-3 w-3 text-[#2C4A3B]" /></div><span>Brief</span></div>
                  <div className="flex flex-col items-center gap-1 relative z-10"><div className="h-5 w-5 rounded-full bg-[#E8EDEA] border border-white flex items-center justify-center"><CheckCircle2 className="h-3 w-3 text-[#2C4A3B]" /></div><span>Desain</span></div>
                  <div className="flex flex-col items-center gap-1 relative z-10"><div className="h-5 w-5 rounded-full bg-[#E8EDEA] border border-white flex items-center justify-center"><CheckCircle2 className="h-3 w-3 text-[#2C4A3B]" /></div><span>Produksi</span></div>
                  <div className="flex flex-col items-center gap-1 relative z-10"><div className="h-5 w-5 rounded-full bg-white border-2 border-[#2C4A3B] flex items-center justify-center"><div className="h-1.5 w-1.5 rounded-full bg-[#2C4A3B]"></div></div><span className="text-zinc-700 font-bold">Instalasi</span></div>
                  <div className="flex flex-col items-center gap-1 relative z-10"><div className="h-5 w-5 rounded-full bg-zinc-100 border border-white flex items-center justify-center"><div className="h-1 w-1 rounded-full bg-zinc-300"></div></div><span>Selesai</span></div>
                </div>
                
                <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E8EDEA] text-[8px] font-bold text-[#2C4A3B]">SP</div>
                    <span className="text-xs font-medium text-zinc-600">Sinta P.</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-medium">Target 6 Okt</span>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action Card */}
          <div className="rounded-xl bg-[#2C4A3B] p-6 text-white flex flex-col">
            <div className="h-10 w-10 border border-white/20 rounded flex items-center justify-center mb-6">
              <div className="h-4 w-3 border-2 border-white/80 rounded-sm"></div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Studio & lapangan, satu perkembangan.</h3>
            <p className="text-sm text-white/70 font-medium flex items-baseline gap-2 mb-8">
              <span className="text-3xl font-bold text-white">2/3</span> proyek dikerjakan
            </p>
            
            <div className="mt-auto space-y-4">
              <div className="flex justify-between items-center text-[10px] text-white/50 uppercase tracking-widest border-b border-white/10 pb-2">
                <span>Update terakhir</span>
                <span>09.40 WIB</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-400"></div>
                1 pembaruan Kafe Kala menunggu
              </div>
              
              <button className="flex items-center justify-between w-full pt-4 mt-2 text-sm font-semibold hover:text-white/80">
                Lihat detail progres <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table Section */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Detail pesanan</h2>
            <p className="text-sm text-zinc-500">Semua pesanan studio, dari permintaan awal hingga serah terima.</p>
          </div>
          <button className="flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
            <Download className="h-4 w-4" />
            Ekspor data
          </button>
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
              <input type="text" placeholder="Cari nama atau nomor pesanan" className="h-8 w-64 rounded-md border border-zinc-200 pl-8 pr-3 text-xs outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B]" />
            </div>
            <button className="flex h-8 items-center gap-2 rounded-md border border-zinc-200 px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50">
              <Filter className="h-3 w-3" />
              Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="border-y border-zinc-100 text-xs text-zinc-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3 w-10"><input type="checkbox" className="rounded border-zinc-300" /></th>
                <th className="px-4 py-3 font-medium">No. pesanan</th>
                <th className="px-4 py-3 font-medium">Proyek / layanan</th>
                <th className="px-4 py-3 font-medium">Klien</th>
                <th className="px-4 py-3 font-medium flex items-center gap-1">Tanggal masuk <ArrowRight className="h-3 w-3 rotate-90" /></th>
                <th className="px-4 py-3 font-medium">Nilai pesanan</th>
                <th className="px-4 py-3 font-medium">Status proyek</th>
                <th className="px-4 py-3 font-medium">Pembayaran</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {/* Row 1 */}
              <tr className="hover:bg-zinc-50/50">
                <td className="px-4 py-3"><input type="checkbox" className="rounded border-zinc-300" /></td>
                <td className="px-4 py-3 font-medium text-zinc-900">ORD-26006</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-zinc-900">Rumah Tebet</p>
                  <p className="text-xs text-zinc-500">Hunian - 45 m²</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-zinc-900">Dimas Putra</p>
                  <p className="text-xs text-zinc-500">Jakarta Selatan</p>
                </td>
                <td className="px-4 py-3 text-zinc-600">3 Okt 2026</td>
                <td className="px-4 py-3 font-semibold text-zinc-900">Rp 30.000.000</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700 border border-orange-200/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span> Pesanan baru
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-red-600 font-medium">Belum bayar</td>
                <td className="px-4 py-3 text-right"><button className="text-zinc-400 hover:text-zinc-600"><ArrowUpRight className="h-4 w-4" /></button></td>
              </tr>
              {/* Row 2 */}
              <tr className="hover:bg-zinc-50/50">
                <td className="px-4 py-3"><input type="checkbox" className="rounded border-zinc-300" /></td>
                <td className="px-4 py-3 font-medium text-zinc-900">ORD-26005</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-zinc-900">Studio Bintaro</p>
                  <p className="text-xs text-zinc-500">Komersial - 50 m²</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-zinc-900">Maya Lestari</p>
                  <p className="text-xs text-zinc-500">Tangerang Selatan</p>
                </td>
                <td className="px-4 py-3 text-zinc-600">2 Okt 2026</td>
                <td className="px-4 py-3 font-semibold text-zinc-900">Rp 45.000.000</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700 border border-orange-200/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span> Pesanan baru
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-red-600 font-medium">Belum bayar</td>
                <td className="px-4 py-3 text-right"><button className="text-zinc-400 hover:text-zinc-600"><ArrowUpRight className="h-4 w-4" /></button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
