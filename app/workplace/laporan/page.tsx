"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Calendar, ChevronDown, ChevronLeft, ChevronRight, Download, Layers, Receipt, Wallet, Inbox } from "lucide-react";
import {
  GROUP_ORDER,
  PERIOD_LABEL,
  chartBuckets,
  downloadReportCsv,
  fetchReportOrders,
  inPeriod,
  type PeriodKey,
  type ReportOrder,
} from "@/lib/reports";
import {
  formatRupiah,
  formatRupiahCompact,
  formatTanggal,
  getGroupLabel,
  getStatusGroupStyle,
  getStatusLabel,
} from "@/lib/orders";

const PAGE_SIZE = 10;

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return (err as { message?: string })?.message ?? "Terjadi kesalahan.";
}

const sumValue = (orders: ReportOrder[]) => orders.reduce((n, o) => n + (o.order_value ?? 0), 0);

export default function Laporan() {
  const [orders, setOrders] = useState<ReportOrder[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [period, setPeriod] = useState<PeriodKey>("3m");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let ignore = false;
    fetchReportOrders()
      .then((d) => {
        if (ignore) return;
        setOrders(d);
        setLoadError(null);
      })
      .catch((err: unknown) => {
        if (!ignore) setLoadError(errorMessage(err));
      });
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const periodOrders = useMemo(() => (orders ? inPeriod(orders, period) : []), [orders, period]);
  // Pesanan ditolak tidak dihitung ke nilai, sama seperti dashboard_summary
  const counted = useMemo(() => periodOrders.filter((o) => o.status_group !== "rejected"), [periodOrders]);
  const valued = counted.filter((o) => o.order_value !== null);
  const totalValue = sumValue(counted);
  const done = counted.filter((o) => o.status_group === "done");

  const { unit, buckets } = useMemo(
    () => (orders ? chartBuckets(periodOrders, period) : { unit: "bulan" as const, buckets: [] }),
    [orders, periodOrders, period],
  );
  const maxBucket = Math.max(1, ...buckets.map((b) => b.value));

  const groupCounts = GROUP_ORDER.map((g) => ({ group: g, count: periodOrders.filter((o) => o.status_group === g).length }));

  const byAdmin = useMemo(() => {
    const map = new Map<string, { name: string; value: number; count: number }>();
    for (const o of counted) {
      const key = o.assigned_admin_id ?? "none";
      const cur = map.get(key) ?? { name: o.assigned_admin_name ?? "Belum ada penanggung jawab", value: 0, count: 0 };
      cur.value += o.order_value ?? 0;
      cur.count += 1;
      map.set(key, cur);
    }
    return [...map.values()].sort((a, b) => b.value - a.value);
  }, [counted]);

  const latestDone = useMemo(
    () => (orders ?? []).filter((o) => o.completed_at).sort((a, b) => b.completed_at!.localeCompare(a.completed_at!))[0] ?? null,
    [orders],
  );

  const pageCount = Math.max(1, Math.ceil(periodOrders.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = periodOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Laporan</h1>
          <p className="text-sm text-zinc-500">Gambaran nilai dan perkembangan pesanan studio, berdasarkan tanggal pesanan masuk.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value as PeriodKey);
                setPage(1);
              }}
              className="h-9 min-w-[200px] appearance-none rounded-md border border-zinc-200 bg-white pl-9 pr-9 text-sm font-semibold text-zinc-700 outline-none hover:bg-zinc-50 focus:border-[#2C4A3B]"
            >
              {(Object.keys(PERIOD_LABEL) as PeriodKey[]).map((k) => (
                <option key={k} value={k}>
                  {PERIOD_LABEL[k]}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          </div>
          <button
            onClick={() => downloadReportCsv(periodOrders, PERIOD_LABEL[period])}
            disabled={!orders || periodOrders.length === 0}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md bg-[#2C4A3B] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#233A2E] disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Unduh CSV
          </button>
        </div>
      </div>

      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Gagal memuat laporan: {loadError}{" "}
          <button onClick={() => setReloadKey((k) => k + 1)} className="font-semibold underline">
            Coba lagi
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl bg-[#2C4A3B] p-4 sm:p-5 flex flex-col justify-between gap-2 min-h-28 sm:min-h-32 text-white">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-white/80">Nilai pesanan</p>
            <Wallet className="h-4 w-4 text-white/50" />
          </div>
          <div>
            <p className="text-2xl sm:text-4xl font-bold leading-tight whitespace-nowrap mb-1">{orders ? formatRupiahCompact(totalValue) : "–"}</p>
            <p className="text-xs text-white/70">Total RAB dari {valued.length} pesanan</p>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 flex flex-col justify-between gap-2 min-h-28 sm:min-h-32">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-zinc-500">Rata-rata per pesanan</p>
            <Receipt className="h-4 w-4 text-zinc-400" />
          </div>
          <div>
            <p className="text-2xl sm:text-4xl font-bold leading-tight whitespace-nowrap text-zinc-900 tracking-tight mb-1">
              {orders ? (valued.length ? formatRupiahCompact(totalValue / valued.length) : "–") : "–"}
            </p>
            <p className="text-xs text-zinc-400">Dari pesanan yang sudah punya RAB</p>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 flex flex-col justify-between gap-2 min-h-28 sm:min-h-32">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-zinc-500">Pesanan masuk</p>
            <Inbox className="h-4 w-4 text-zinc-400" />
          </div>
          <div>
            <p className="text-2xl sm:text-4xl font-bold leading-tight whitespace-nowrap text-zinc-900 mb-1">{orders ? periodOrders.length : "–"}</p>
            <p className="text-xs text-zinc-400">
              {groupCounts[0].count} baru · {groupCounts[3].count} ditolak
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 flex flex-col justify-between gap-2 min-h-28 sm:min-h-32">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-zinc-500">Proyek selesai</p>
            <Layers className="h-4 w-4 text-zinc-400" />
          </div>
          <div>
            <p className="text-2xl sm:text-4xl font-bold leading-tight whitespace-nowrap text-zinc-900 mb-1">
              {orders ? `${done.length} dari ${counted.length}` : "–"}
            </p>
            <p className="text-xs text-zinc-400">{groupCounts[1].count} masih dikerjakan</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-6 min-w-0">
          {/* Chart Card */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-zinc-900 mb-1">Nilai pesanan</h3>
              <p className="text-xs text-zinc-500">
                Total RAB per {unit}, berdasarkan
                tanggal pesanan masuk. Pesanan ditolak tidak dihitung.
              </p>
            </div>
            {!orders ? (
              <p className="py-16 text-center text-sm text-zinc-500">{loadError ? "" : "Memuat grafik…"}</p>
            ) : buckets.length === 0 || totalValue === 0 ? (
              <p className="py-16 text-center text-sm text-zinc-500">Belum ada nilai pesanan di periode ini.</p>
            ) : (
              <div className="overflow-x-auto pb-2">
                <div className="flex h-56 items-end gap-2" style={{ minWidth: `${buckets.length * 56}px` }}>
                  {buckets.map((b) => (
                    <div key={b.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                      <span className="text-[10px] font-semibold text-zinc-500 whitespace-nowrap">
                        {b.value ? formatRupiahCompact(b.value).replace("Rp ", "") : ""}
                      </span>
                      <div
                        title={`${b.count} pesanan · ${formatRupiah(b.value)}`}
                        className={`w-full max-w-10 rounded-t-sm ${b.value ? "bg-[#2C4A3B]" : "bg-zinc-100"}`}
                        style={{ height: `${Math.max(2, (b.value / maxBucket) * 100)}%` }}
                      />
                      <span className="text-[10px] font-medium text-zinc-500 whitespace-nowrap">{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Details Table Card */}
          <div className="rounded-xl border border-zinc-200 bg-white">
            <div className="p-6 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 mb-1">Rincian per pesanan</h3>
                <p className="text-xs text-zinc-500">{PERIOD_LABEL[period]} · terbaru di atas.</p>
              </div>
              <span className="shrink-0 whitespace-nowrap rounded-md bg-[#E8EDEA] px-2 py-1 text-xs font-semibold text-[#2C4A3B]">
                {periodOrders.length} pesanan
              </span>
            </div>
            {orders && periodOrders.length === 0 ? (
              <p className="px-6 pb-10 text-center text-sm text-zinc-500">Tidak ada pesanan di periode ini.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] [&_th]:whitespace-nowrap text-left text-sm text-zinc-600">
                  <thead className="border-y border-zinc-100 text-[11px] bg-zinc-50/50 text-zinc-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3 font-medium">Proyek / pesanan</th>
                      <th className="px-6 py-3 font-medium">Klien</th>
                      <th className="px-6 py-3 font-medium">Masuk</th>
                      <th className="px-6 py-3 font-medium">Status</th>
                      <th className="px-6 py-3 font-medium text-right">Nilai RAB</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {pageItems.map((o) => {
                      const style = getStatusGroupStyle(o.status_group);
                      return (
                        <tr key={o.id} className="hover:bg-zinc-50/50">
                          <td className="px-6 py-4 min-w-[200px]">
                            <Link href={`/workplace/pesanan/${o.id}`} className="font-semibold text-zinc-900 text-xs hover:text-[#2C4A3B]">
                              {o.title}
                            </Link>
                            <p className="text-[10px] text-zinc-400">
                              {o.code} · {o.assigned_admin_name ?? "Belum ada penanggung jawab"}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-zinc-700">{o.customer_name ?? "—"}</td>
                          <td className="px-6 py-4 text-xs text-zinc-600 whitespace-nowrap">{formatTanggal(o.submitted_at)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold ${style.bg} ${style.text}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                              {getStatusLabel(o.status)}
                            </span>
                          </td>
                          <td className={`px-6 py-4 text-right text-xs font-semibold whitespace-nowrap ${o.status_group === "rejected" ? "text-zinc-400 line-through" : "text-zinc-900"}`}>
                            {o.order_value === null ? <span className="font-normal text-zinc-400 no-underline">Belum dihitung</span> : formatRupiah(o.order_value)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 border-t border-zinc-100">
              <p className="text-[11px] text-zinc-500 font-medium">
                Total nilai {formatRupiah(totalValue)} dari {valued.length} pesanan ber-RAB (tanpa yang ditolak)
              </p>
              {pageCount > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 text-zinc-400 hover:bg-zinc-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold ${
                        n === currentPage ? "bg-[#2C4A3B] text-white" : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(currentPage + 1)}
                    disabled={currentPage === pageCount}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 text-zinc-400 hover:bg-zinc-50 disabled:opacity-40"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Sebaran status */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-1">Sebaran status</h3>
            <p className="text-xs text-zinc-500 mb-6">{periodOrders.length} pesanan masuk di periode ini.</p>
            <div className="space-y-5">
              {groupCounts.map(({ group, count }) => (
                <div key={group}>
                  <div className="flex justify-between text-[11px] font-semibold mb-2">
                    <span className="text-zinc-700">{getGroupLabel(group)}</span>
                    <span className="text-zinc-400">{count} pesanan</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStatusGroupStyle(group).dot}`}
                      style={{ width: `${periodOrders.length ? (count / periodOrders.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nilai per penanggung jawab */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-1">Per penanggung jawab</h3>
            <p className="text-xs text-zinc-500 mb-5">Nilai RAB pesanan yang ditangani, di periode ini.</p>
            {byAdmin.length === 0 ? (
              <p className="text-sm text-zinc-500">Belum ada data.</p>
            ) : (
              <ul className="space-y-3">
                {byAdmin.map((a) => (
                  <li key={a.name} className="flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-zinc-800">{a.name}</p>
                      <p className="text-[10px] text-zinc-400">{a.count} pesanan</p>
                    </div>
                    <span className="shrink-0 font-bold text-zinc-900">{formatRupiahCompact(a.value)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Serah terima terbaru */}
          <div className="rounded-xl bg-[#2C4A3B] p-6 text-white">
            <h3 className="text-lg font-bold mb-1">Serah terima terbaru</h3>
            {latestDone ? (
              <>
                <p className="text-[11px] text-white/70 mb-4">
                  {latestDone.title} · {latestDone.code}
                </p>
                <p className="text-sm font-semibold mb-4">Selesai pada {formatTanggal(latestDone.completed_at)}</p>
                <p className="text-xs text-white/80 mb-4">
                  Nilai {latestDone.order_value === null ? "—" : formatRupiahCompact(latestDone.order_value)} · {latestDone.customer_name}
                </p>
                <Link href={`/workplace/pesanan/${latestDone.id}`} className="flex items-center gap-1 text-sm font-semibold hover:text-white/80">
                  Lihat pesanan <ArrowUpRight className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <p className="text-sm text-white/80">{orders ? "Belum ada pesanan yang selesai." : "Memuat…"}</p>
            )}
          </div>

          {/* Pembayaran: menunggu keputusan tim */}
          <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-1">Pembayaran</h3>
            <p className="text-sm text-zinc-500">
              Pembayaran diterima, sisa tagihan, dan realisasi akan tampil di sini setelah fitur pembayaran (DP, termin, dan
              progress) tersedia.
            </p>
          </div>
        </div>
      </div>

      {/* Note */}
      <p className="text-[10px] text-zinc-500 pt-2">
        Catatan: nilai pesanan adalah total RAB untuk klien (bahan, jasa, penyesuaian, dan pajak), bukan laba bersih. Pesanan
        yang belum dihitung RAB-nya bernilai 0.
      </p>
    </div>
  );
}
