"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Download,
  Search,
  Mail,
  Phone,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  fetchClients,
  getClientStatusLabel,
  getClientStatusStyle,
  getInitials,
  downloadClientsCsv,
  type AdminClient,
} from "@/lib/clients";
import {
  formatRupiah,
  formatRupiahCompact,
  formatTanggal,
  formatTanggalWaktu,
  getStatusLabel,
} from "@/lib/orders";

const PAGE_SIZE = 10;

type Tab = "all" | "active" | "new";

export default function Klien() {
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [loadedAt, setLoadedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    fetchClients()
      .then((rows) => {
        if (ignore) return;
        setClients(rows);
        setLoadedAt(new Date().toISOString());
        setError(null);
      })
      .catch((err: unknown) => {
        if (ignore) return;
        console.error("Gagal memuat klien:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data klien.");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const activeClients = useMemo(() => clients.filter((c) => c.client_status === "active"), [clients]);
  const newClients = useMemo(() => clients.filter((c) => c.client_status === "new"), [clients]);
  const totalValue = useMemo(() => clients.reduce((sum, c) => sum + (c.total_order_value || 0), 0), [clients]);
  const totalOrders = useMemo(() => clients.reduce((sum, c) => sum + (c.order_count || 0), 0), [clients]);

  // Tab + pencarian (nama, email, telepon) di FE
  const filtered = useMemo(() => {
    const base = tab === "active" ? activeClients : tab === "new" ? newClients : clients;
    const kw = search.trim().toLowerCase();
    if (!kw) return base;
    return base.filter((c) =>
      [c.full_name, c.email, c.phone].some((v) => v?.toLowerCase().includes(kw)),
    );
  }, [tab, search, clients, activeClients, newClients]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  // Panel kanan: klien yang dipilih, atau baris pertama yang sedang tampil
  const selected = clients.find((c) => c.id === selectedId) ?? pageRows[0] ?? null;

  const changeTab = (t: Tab) => {
    setTab(t);
    setPage(0);
  };

  const namesPreview = (list: AdminClient[], sep: string) => {
    const names = list.slice(0, 3).map((c) => c.full_name ?? "Tanpa nama");
    if (list.length > 3) names.push(`+${list.length - 3} lainnya`);
    return names.join(sep) || "Belum ada";
  };

  const tabClass = (t: Tab) =>
    tab === t
      ? "px-3 py-1.5 text-xs font-semibold rounded bg-white shadow-sm text-zinc-900 flex items-center gap-1.5"
      : "px-3 py-1.5 text-xs font-semibold rounded text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5";

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Klien</h1>
          <p className="text-sm text-zinc-500">
            Kenali setiap klien dan temukan riwayat proyek serta kontaknya
            dengan mudah.
          </p>
        </div>
        <button
          onClick={() => downloadClientsCsv(filtered)}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          Ekspor data
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
          Gagal memuat data klien: {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
          <p className="text-sm font-medium text-zinc-500">Total klien</p>
          <p className="text-4xl font-bold text-zinc-900">{isLoading ? "–" : clients.length}</p>
          <p className="text-xs text-zinc-400">{totalOrders} pesanan dari semua klien</p>
        </div>
        <div className="rounded-xl bg-[#2C4A3B] p-5 flex flex-col justify-between h-32 text-white">
          <p className="text-sm font-medium text-white/80">Klien proyek aktif</p>
          <p className="text-4xl font-bold">{isLoading ? "–" : activeClients.length}</p>
          <p className="text-xs text-white/70 truncate">{namesPreview(activeClients, " · ")}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
          <p className="text-sm font-medium text-zinc-500">Klien baru</p>
          <p className="text-4xl font-bold text-zinc-900">{isLoading ? "–" : newClients.length}</p>
          <p className="text-xs text-zinc-400 truncate">{namesPreview(newClients, " & ")}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
          <p className="text-sm font-medium text-zinc-500">Nilai hubungan klien</p>
          <p className="text-4xl font-bold tracking-tight text-zinc-900">
            {isLoading ? "–" : formatRupiahCompact(totalValue)}
          </p>
          <p className="text-xs text-zinc-400">Total nilai {totalOrders} pesanan studio</p>
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
                  • {clients.length} klien
                </span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-2">
                <div className="flex bg-zinc-100 rounded-md p-0.5 w-fit">
                  <button onClick={() => changeTab("all")} className={tabClass("all")}>
                    Semua <span className="text-zinc-400 font-normal">{clients.length}</span>
                  </button>
                  <button onClick={() => changeTab("active")} className={tabClass("active")}>
                    Aktif <span className="text-zinc-400 font-normal">{activeClients.length}</span>
                  </button>
                  <button onClick={() => changeTab("new")} className={tabClass("new")}>
                    Baru <span className="text-zinc-400 font-normal">{newClients.length}</span>
                  </button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(0);
                    }}
                    placeholder="Cari nama atau kontak"
                    className="h-9 w-full sm:w-64 rounded-md border border-zinc-200 pl-9 pr-3 text-xs outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B] placeholder:text-zinc-400"
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
                  {isLoading && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-xs text-zinc-500">
                        <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                        Memuat data klien…
                      </td>
                    </tr>
                  )}
                  {!isLoading && pageRows.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-xs text-zinc-500">
                        {search
                          ? `Tidak ditemukan klien yang sesuai dengan kata kunci "${search}".`
                          : "Belum ada klien di tab ini."}
                      </td>
                    </tr>
                  )}
                  {pageRows.map((c) => {
                    const style = getClientStatusStyle(c.client_status);
                    const isSelected = selected?.id === c.id;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setSelectedId(c.id)}
                        className={`cursor-pointer hover:bg-zinc-50/50 ${isSelected ? "bg-zinc-50" : ""}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8EDEA] text-xs font-bold text-[#2C4A3B]">
                              {getInitials(c.full_name)}
                            </div>
                            <div>
                              <p className="font-semibold text-zinc-900">{c.full_name ?? "Tanpa nama"}</p>
                              <p className="text-[11px] text-zinc-500">Klien sejak {formatTanggal(c.client_since)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-zinc-900 mb-0.5 text-xs">{c.phone ?? "-"}</p>
                          <p className="text-[11px] text-zinc-500">{c.email ?? "-"}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-zinc-900 mb-0.5 text-xs">{c.related_order_title}</p>
                          <p className="text-[11px] text-zinc-500">{c.related_order_code}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold ${style.badge}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`}></span>
                            {getClientStatusLabel(c.client_status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-4 border-t border-zinc-100">
              <p className="text-xs text-zinc-500">
                {filtered.length === 0
                  ? "Tidak ada klien"
                  : `Menampilkan ${currentPage * PAGE_SIZE + 1}–${currentPage * PAGE_SIZE + pageRows.length} dari ${filtered.length} klien`}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 text-zinc-400 hover:bg-zinc-50 disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="flex h-7 min-w-7 px-2 items-center justify-center rounded-md bg-[#2C4A3B] text-xs font-semibold text-white">
                  {currentPage + 1}
                </span>
                <button
                  onClick={() => setPage(Math.min(pageCount - 1, currentPage + 1))}
                  disabled={currentPage >= pageCount - 1}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 text-zinc-400 hover:bg-zinc-50 disabled:opacity-40"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Profile Panels */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {!selected ? (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 text-xs text-zinc-500">
              {isLoading ? "Memuat…" : "Pilih klien untuk melihat profilnya."}
            </div>
          ) : (
            <>
              {/* Client Profile Card */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-zinc-900">Profil klien</h3>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8EDEA] text-sm font-bold text-[#2C4A3B]">
                    {getInitials(selected.full_name)}
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900">{selected.full_name ?? "Tanpa nama"}</p>
                    <p className="text-[11px] text-zinc-500">Klien sejak {formatTanggal(selected.client_since)}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold ${getClientStatusStyle(selected.client_status).badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${getClientStatusStyle(selected.client_status).dot}`}></span>
                    {getClientStatusLabel(selected.client_status)}
                  </span>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 text-sm text-zinc-600">
                    <Mail className="h-4 w-4 text-zinc-400" />
                    <span>{selected.email ?? "-"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-600">
                    <Phone className="h-4 w-4 text-zinc-400" />
                    <span>{selected.phone ?? "-"}</span>
                  </div>
                </div>

                <div className="rounded-lg bg-[#F4F1ED] p-4 mb-6 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-zinc-900">{selected.order_count}</p>
                    <p className="text-[10px] text-zinc-500">Pesanan</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-zinc-900">{selected.active_order_count}</p>
                    <p className="text-[10px] text-zinc-500">Dikerjakan</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-zinc-900">{selected.done_order_count}</p>
                    <p className="text-[10px] text-zinc-500">Selesai</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 rounded-md bg-[#2C4A3B] px-3 py-2 text-xs font-semibold text-white hover:bg-[#233A2E]">
                    <MessageSquare className="h-3.5 w-3.5" />
                    Hubungi klien
                  </button>
                </div>
              </div>

              {/* Related Project Card */}
              <div className="rounded-xl border border-zinc-200 bg-white p-6">
                <h3 className="text-lg font-bold text-zinc-900 mb-1">Proyek terkait</h3>
                <p className="text-[11px] text-zinc-500 mb-6">
                  {selected.related_order_title} · {selected.related_order_code}
                </p>

                <div className="mb-6 flex justify-between text-xs">
                  <span className="font-semibold text-zinc-700">Status</span>
                  <span className="font-bold text-zinc-900">{getStatusLabel(selected.related_order_status)}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 mb-6">
                  <p className="font-bold text-sm text-zinc-900">{formatRupiah(selected.related_order_value)}</p>
                  <span className="text-[10px] text-zinc-500">
                    Total semua pesanan: {formatRupiahCompact(selected.total_order_value)}
                  </span>
                </div>

                <p className="text-[10px] text-zinc-500">
                  {selected.related_order_admin_name ?? "Belum ada admin penanggung jawab"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-zinc-400 pt-4 border-t border-zinc-200/50">
        <p>Renovin. · Ruang kerja studio interior</p>
        <p>{loadedAt ? `Terakhir diperbarui ${formatTanggalWaktu(loadedAt)}` : ""}</p>
      </div>
    </div>
  );
}
