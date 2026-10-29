"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { DateRangePicker } from "@/components/date-range-picker";
import { PRESETS, type DateRange } from "@/lib/date-range";
import Link from "next/link";
import {
  Download,
  Plus,
  Search,
  ArrowUpRight,
  ArrowDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Inbox,
  AlertCircle,
  X,
} from "lucide-react";
import {
  fetchOrders,
  acceptOrder,
  formatRupiah,
  formatRupiahCompact,
  formatTanggal,
  getStatusLabel,
  getStatusGroupStyle,
  type FetchOrdersResult,
} from "@/lib/orders";
import type { AdminOrder, OrderStatusGroup } from "@/types/admin-orders";
import { CreateOrderModal } from "@/components/create-order-modal";

const PAGE_SIZE = 10;

export default function Pesanan() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState<Record<OrderStatusGroup | "all", number>>({
    all: 0,
    new: 0,
    in_progress: 0,
    done: 0,
    rejected: 0,
  });
  const [totalValue, setTotalValue] = useState(0);
  const [summary, setSummary] = useState<FetchOrdersResult["summary"]>(null);

  // Filters & Pagination
  const [activeTab, setActiveTab] = useState<OrderStatusGroup | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  // Kata kunci yang benar-benar dikirim ke server, ±300 ms setelah berhenti mengetik
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Trigger reload from external actions
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const reloadOrders = useCallback(() => {
    setIsLoading(true);
    setReloadTrigger((v) => v + 1);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load orders from backend
  useEffect(() => {
    let ignore = false;

    async function execute() {
      try {
        const res: FetchOrdersResult = await fetchOrders({
          statusGroup: activeTab === "all" ? null : activeTab,
          search: debouncedSearch,
          page,
          pageSize: PAGE_SIZE,
          dateRange,
        });

        if (!ignore) {
          setOrders(res.orders);
          setTotal(res.total);
          setCounts(res.counts);
          setTotalValue(res.totalValue);
          setSummary(res.summary);
          setError(null);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (!ignore) {
          console.error("Gagal memuat pesanan:", err);
          const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat memuat data pesanan.";
          setError(msg);
          setIsLoading(false);
        }
      }
    }

    execute();

    return () => {
      ignore = true;
    };
  }, [activeTab, debouncedSearch, page, dateRange, reloadTrigger]);

  // Auto clear toast after 4 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Handle Accept Order
  const handleAcceptOrder = async (projectId: string, projectTitle: string) => {
    setAcceptingId(projectId);
    try {
      await acceptOrder(projectId);
      setToastMessage({
        type: "success",
        text: `Pesanan "${projectTitle}" berhasil diterima dan dipindahkan ke Diproses Admin.`,
      });
      reloadOrders();
    } catch (err: unknown) {
      console.error("Gagal menerima pesanan:", err);
      const msg = err instanceof Error ? err.message : "Gagal menerima pesanan.";
      setToastMessage({
        type: "error",
        text: `Gagal menerima pesanan: ${msg}`,
      });
    } finally {
      setAcceptingId(null);
    }
  };

  // Export data to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      setToastMessage({ type: "error", text: "Tidak ada data pesanan untuk diekspor." });
      return;
    }

    const headers = [
      "No. Pesanan",
      "Judul Proyek",
      "Jenis Ruangan",
      "Klien",
      "Email Klien",
      "Telepon Klien",
      "Tanggal Masuk",
      "Nilai Pesanan (IDR)",
      "Status",
      "Status Kelompok",
      "Total Luas (m2)",
    ];

    const csvRows = [headers.join(",")];

    orders.forEach((o) => {
      const row = [
        `"${o.code || ""}"`,
        `"${(o.title || "").replace(/"/g, '""')}"`,
        `"${(o.room_type || "").replace(/"/g, '""')}"`,
        `"${(o.customer_name || "").replace(/"/g, '""')}"`,
        `"${o.customer_email || ""}"`,
        `"${o.customer_phone || ""}"`,
        `"${o.submitted_at || ""}"`,
        o.order_value ?? 0,
        `"${o.status || ""}"`,
        `"${o.status_group || ""}"`,
        o.total_area ?? 0,
      ];
      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `pesanan-renovin-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage({ type: "success", text: "Data pesanan berhasil diekspor ke CSV." });
  };

  // Compute pagination details
  const startItem = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const endItem = Math.min((page + 1) * PAGE_SIZE, total);
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  // New orders for "Perlu konfirmasi" bottom card
  const newOrdersList = useMemo(() => {
    return orders.filter((o) => o.status === "sent_to_admin" || o.status_group === "new").slice(0, 3);
  }, [orders]);


  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm transition-all animate-in fade-in slide-in-from-bottom-3 ${
            toastMessage.type === "success"
              ? "bg-[#2C4A3B] text-white border-[#233A2E]"
              : "bg-red-600 text-white border-red-700"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-200" />
          )}
          <span className="font-medium">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/70 hover:text-white p-0.5 ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Pesanan</h1>
          <p className="text-sm text-zinc-500">
            Kelola setiap permintaan, nilai pesanan, dan pembayaran dalam satu tempat.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 shadow-2xs transition"
          >
            <Download className="h-4 w-4" />
            Ekspor data
          </button>
          <Link
            href="/workplace/pesanan/baru"
            className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md bg-[#2C4A3B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#233A2E] shadow-sm transition"
          >
            <Plus className="h-4 w-4" />
            Pesanan baru
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total pesanan */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 flex flex-col justify-between gap-2 min-h-28 sm:min-h-32">
          <p className="text-sm font-medium text-zinc-500">Total pesanan</p>
          <p className="text-2xl sm:text-4xl font-bold leading-tight whitespace-nowrap text-zinc-900">
            {isLoading ? <span className="inline-block h-8 w-12 bg-zinc-100 rounded animate-pulse"></span> : counts.all}
          </p>
          <p className="text-xs text-zinc-400">
            {counts.new} baru · {counts.in_progress} dikerjakan · {counts.done} selesai
          </p>
        </div>

        {/* Card 2: Nilai pesanan */}
        <div className="rounded-xl bg-[#2C4A3B] p-4 sm:p-5 flex flex-col justify-between gap-2 min-h-28 sm:min-h-32 text-white shadow-sm">
          <p className="text-sm font-medium text-white/80">Nilai pesanan</p>
          <p className="text-2xl sm:text-4xl font-bold leading-tight whitespace-nowrap tracking-tight">
            {isLoading ? (
              <span className="inline-block h-8 w-24 bg-white/20 rounded animate-pulse"></span>
            ) : (
              formatRupiahCompact(totalValue)
            )}
          </p>
          <p className="text-xs text-white/70">
            Total RAB dari {summary?.valued_orders ?? 0} pesanan (tanpa yang ditolak)
          </p>
        </div>

        {/* Card 3: Menunggu persetujuan super admin */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 flex flex-col justify-between gap-2 min-h-28 sm:min-h-32">
          <p className="text-sm font-medium text-zinc-500">Menunggu persetujuan</p>
          <p className="text-2xl sm:text-4xl font-bold leading-tight whitespace-nowrap tracking-tight text-zinc-900">
            {isLoading ? "–" : summary?.in_progress_by_status?.pending_approval ?? 0}
          </p>
          <p className="text-xs text-zinc-400">RAB menunggu keputusan super admin</p>
        </div>

        {/* Card 4: Pesanan yang belum punya RAB */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 flex flex-col justify-between gap-2 min-h-28 sm:min-h-32">
          <p className="text-sm font-medium text-zinc-500">Belum ada RAB</p>
          <p className="text-2xl sm:text-4xl font-bold leading-tight whitespace-nowrap tracking-tight text-zinc-900">
            {isLoading ? "–" : Math.max(0, (summary?.total_orders ?? 0) - (summary?.valued_orders ?? 0))}
          </p>
          <p className="text-xs text-zinc-400">Termasuk {counts.new} pesanan baru</p>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-2xs">
        {/* Table Title Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Semua pesanan</h2>
            <p className="text-sm text-zinc-500">
              Dari permintaan awal hingga serah terima, tanpa detail yang terlewat.
            </p>
          </div>
          {/* Filter tanggal pesanan masuk */}
          <DateRangePicker
            value={dateRange}
            onChange={(r) => {
              setDateRange(r);
              setPage(0);
            }}
            presets={[PRESETS.today, PRESETS["7d"], PRESETS["30d"], PRESETS.this_month, PRESETS.last_month]}
            allowAll="Semua tanggal"
            className="w-full shrink-0 sm:w-auto"
          />
        </div>

        {/* Error Banner if any */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-start justify-between">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Gagal memuat data dari database</p>
                <p className="text-xs mt-0.5 text-red-600">{error}</p>
              </div>
            </div>
            <button
              onClick={reloadOrders}
              className="text-xs font-bold text-red-800 underline hover:no-underline"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Tab Filters & Search Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          {/* Tabs */}
          <div className="flex bg-zinc-100 rounded-md p-0.5 overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab("all");
                setPage(0);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition ${
                activeTab === "all"
                  ? "bg-white shadow-xs text-zinc-900"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Semua <span className="text-zinc-400 font-normal">{counts.all}</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("new");
                setPage(0);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition ${
                activeTab === "new"
                  ? "bg-white shadow-xs text-zinc-900"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Baru <span className="text-zinc-400 font-normal">{counts.new}</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("in_progress");
                setPage(0);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition ${
                activeTab === "in_progress"
                  ? "bg-white shadow-xs text-zinc-900"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Dikerjakan <span className="text-zinc-400 font-normal">{counts.in_progress}</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("done");
                setPage(0);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition ${
                activeTab === "done"
                  ? "bg-white shadow-xs text-zinc-900"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Selesai <span className="text-zinc-400 font-normal">{counts.done}</span>
            </button>
            {counts.rejected > 0 && (
              <button
                onClick={() => {
                  setActiveTab("rejected");
                  setPage(0);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 transition ${
                  activeTab === "rejected"
                    ? "bg-white shadow-xs text-zinc-900"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                Ditolak <span className="text-zinc-400 font-normal">{counts.rejected}</span>
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                placeholder="Cari nama atau nomor pesanan"
                className="h-8 w-full sm:w-64 rounded-md border border-zinc-200 pl-8 pr-3 text-xs outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B] transition"
              />
            </div>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setPage(0);
                }}
                className="flex h-8 items-center rounded-md border border-zinc-200 px-2.5 text-xs text-zinc-500 hover:bg-zinc-50"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] [&_th]:whitespace-nowrap text-left text-sm text-zinc-600">
            <thead className="border-y border-zinc-100 text-[11px] text-zinc-500 font-semibold uppercase tracking-wider bg-[#FAF9F7]/50">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" className="rounded border-zinc-300 accent-[#2C4A3B]" />
                </th>
                <th className="px-4 py-3 font-medium">No. pesanan</th>
                <th className="px-4 py-3 font-medium">Proyek / layanan</th>
                <th className="px-4 py-3 font-medium">Klien</th>
                <th className="px-4 py-3 font-medium">
                  <span className="flex items-center gap-1">
                    Tanggal masuk <ArrowDown className="h-3 w-3 text-zinc-400" />
                  </span>
                </th>
                <th className="px-4 py-3 font-medium">Nilai pesanan</th>
                <th className="px-4 py-3 font-medium">Status proyek</th>
                {/* Kolom Pembayaran disembunyikan sampai aturan pembayaran (DP/termin) diputuskan tim */}
                <th className="px-4 py-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading ? (
                // Skeleton loading rows
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    <td className="px-4 py-4">
                      <div className="h-4 w-4 bg-zinc-100 rounded"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-24 bg-zinc-100 rounded"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-32 bg-zinc-100 rounded mb-1.5"></div>
                      <div className="h-3 w-20 bg-zinc-100 rounded"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-28 bg-zinc-100 rounded mb-1.5"></div>
                      <div className="h-3 w-24 bg-zinc-100 rounded"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-20 bg-zinc-100 rounded"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-4 w-24 bg-zinc-100 rounded"></div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 w-24 bg-zinc-100 rounded-full"></div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="h-4 w-6 bg-zinc-100 rounded ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-[#E8EDEA] flex items-center justify-center text-[#2C4A3B] mb-3">
                        <Inbox className="h-6 w-6" />
                      </div>
                      <p className="text-base font-bold text-zinc-900 mb-1">
                        Belum ada pesanan
                      </p>
                      <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                        {searchQuery
                          ? `Tidak ditemukan pesanan yang sesuai dengan kata kunci "${searchQuery}".`
                          : activeTab !== "all"
                          ? `Belum ada pesanan dengan status kelompok "${activeTab}".`
                          : "Belum ada pesanan yang masuk ke sistem. Buat pesanan baru sekarang."}
                      </p>
                      <Link
                        href="/workplace/pesanan/baru"
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2C4A3B] rounded-md hover:bg-[#233A2E] transition shadow-xs"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Buat pesanan baru
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                // Real rows
                orders.map((order) => {
                  const style = getStatusGroupStyle(order.status_group);
                  const isSentToAdmin = order.status === "sent_to_admin";
                  const isAcceptingThis = acceptingId === order.id;

                  return (
                    <tr key={order.id} className="hover:bg-zinc-50/60 transition-colors">
                      {/* Checkbox */}
                      <td className="px-4 py-3.5">
                        <input type="checkbox" className="rounded border-zinc-300 accent-[#2C4A3B]" />
                      </td>

                      {/* Code */}
                      <td className="whitespace-nowrap px-4 py-3.5 font-medium text-zinc-900 font-mono text-xs">
                        {order.code}
                      </td>

                      {/* Title & Room Type */}
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/workplace/pesanan/${order.id}`}
                          className="font-semibold text-zinc-900 hover:text-[#2C4A3B] transition"
                        >
                          {order.title}
                        </Link>
                        <p className="text-xs text-zinc-500">
                          {order.room_type || "Interior"} ·{" "}
                          {order.total_area > 0 ? `${order.total_area} m²` : "Luas belum diisi"}
                        </p>
                      </td>

                      {/* Customer Name & Phone */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-zinc-900">
                          {order.customer_name || "Tanpa nama"}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {order.customer_phone || order.customer_email || "-"}
                        </p>
                      </td>

                      {/* Submitted Date */}
                      <td className="px-4 py-3.5 text-zinc-600 text-xs">
                        {formatTanggal(order.submitted_at)}
                      </td>

                      {/* Order Value */}
                      <td className="px-4 py-3.5 font-semibold text-zinc-900 text-xs">
                        {formatRupiah(order.order_value)}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${style.bg} ${style.text}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`}></span>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isSentToAdmin && (
                            <button
                              onClick={() => handleAcceptOrder(order.id, order.title)}
                              disabled={isAcceptingThis}
                              className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#2C4A3B] hover:bg-[#233A2E] rounded-md transition shadow-2xs flex items-center gap-1 disabled:opacity-50"
                              title="Terima pesanan ini dan mulai proses"
                            >
                              {isAcceptingThis ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Memproses...
                                </>
                              ) : (
                                "Terima"
                              )}
                            </button>
                          )}
                          <Link
                            href={`/workplace/pesanan/${order.id}`}
                            className="p-1 text-zinc-400 hover:text-zinc-700 transition"
                            title="Lihat rincian bahan bangunan pesanan"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-4 pt-4 border-t border-zinc-100">
          <p className="text-xs text-zinc-500">
            Menampilkan {startItem}–{endItem} dari {total} pesanan · Total{" "}
            {formatRupiah(totalValue)}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || isLoading}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:opacity-40 transition"
              title="Halaman sebelumnya"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={`page-${i}`}
                onClick={() => setPage(i)}
                className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold transition ${
                  page === i
                    ? "bg-[#2C4A3B] text-white"
                    : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || isLoading}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:opacity-40 transition"
              title="Halaman berikutnya"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Cards: Perlu konfirmasi & Jadwal pembayaran */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Perlu konfirmasi (Dynamic from real backend data) */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-2xs">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-900">Perlu konfirmasi</h3>
              <p className="text-sm text-zinc-500">
                Permintaan pesanan baru siap ditinjau dan diterima admin.
              </p>
            </div>
            <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-bold text-orange-700">
              ⚡ {counts.new} baru
            </span>
          </div>

          <div className="space-y-4">
            {newOrdersList.length === 0 ? (
              <p className="text-xs text-zinc-400 py-3">
                Tidak ada pesanan baru yang menunggu konfirmasi saat ini.
              </p>
            ) : (
              newOrdersList.map((no) => (
                <div key={`bottom-new-${no.id}`} className="flex items-center justify-between">
                  <div>
                    <Link
                      href={`/workplace/pesanan/${no.id}`}
                      className="font-semibold text-sm text-zinc-900 hover:text-[#2C4A3B] transition"
                    >
                      {no.title} · {no.customer_name || "Tanpa nama"}
                    </Link>
                    <p className="text-xs text-zinc-500">
                      {no.code} · {formatTanggal(no.submitted_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleAcceptOrder(no.id, no.title)}
                      disabled={acceptingId === no.id}
                      className="text-xs font-bold text-[#2C4A3B] hover:underline flex items-center gap-1 disabled:opacity-50"
                    >
                      {acceptingId === no.id ? "Menerima..." : "Terima pesanan"}
                    </button>
                    <Link
                      href={`/workplace/pesanan/${no.id}`}
                      className="text-xs font-bold text-zinc-500 hover:text-zinc-800 flex items-center gap-0.5"
                    >
                      Tinjau <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pembayaran: menunggu fitur pembayaran (aturan termin dari client) */}
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 shadow-2xs flex flex-col justify-center">
          <h3 className="text-lg font-bold text-zinc-900">Jadwal pembayaran</h3>
          <p className="text-sm text-zinc-500 mt-1">
            Fitur pembayaran (uang muka, termin, pelunasan) sedang disiapkan. Jadwal dan
            status pembayaran akan tampil di sini setelah fitur tersedia.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-zinc-400 pt-4 border-t border-zinc-200/50">
        <p>Renovin. · Ruang kerja studio interior</p>
        <p>Data tersambung dengan backend Supabase view admin_orders</p>
      </div>

      {/* Create Order Modal */}
      <CreateOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setToastMessage({
            type: "success",
            text: "Pesanan baru berhasil dibuat dan ditambahkan ke daftar!",
          });
          reloadOrders();
        }}
      />
    </div>
  );
}
