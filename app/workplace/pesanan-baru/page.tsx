"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Calendar, Download, ImageOff, Info, Loader2, Search } from "lucide-react";
import { acceptOrder, fetchOrders, formatTanggal, getCoverPhotoUrl } from "@/lib/orders";
import type { AdminOrder } from "@/types/admin-orders";

type Tab = "all" | "complete" | "incomplete";

// Pesanan dianggap lengkap kalau sudah ada foto ruangan dan ukuran
const isComplete = (o: AdminOrder) => o.photo_count > 0 && o.measurement_count > 0;

function reviewNote(o: AdminOrder): string {
  if (o.photo_count === 0 && o.measurement_count === 0) return "Belum ada foto & ukuran";
  if (o.photo_count === 0) return "Belum ada foto ruangan";
  if (o.measurement_count === 0) return "Ukuran ruangan belum diisi";
  return `${o.photo_count} foto · ${o.measurement_count} ukuran`;
}

function formatJam(dateStr: string) {
  return new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date(dateStr)) + " WIB";
}

function whatsappLink(phone: string | null): string | null {
  const digits = phone?.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits.startsWith("0") ? "62" + digits.slice(1) : digits}`;
}

function downloadCsv(rows: AdminOrder[]) {
  const header = ["Nomor", "Proyek", "Jenis ruangan", "Luas (m2)", "Klien", "Telepon", "Email", "Masuk", "Catatan klien"];
  const lines = rows.map((o) => [
    o.code, o.title, o.room_type ?? "", String(o.total_area), o.customer_name ?? "", o.customer_phone ?? "",
    o.customer_email ?? "", o.submitted_at, o.notes ?? "",
  ]);
  const csv = [header, ...lines].map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `pesanan-baru-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PenerimaanBaru() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [photos, setPhotos] = useState<Record<string, string | null>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Semua pesanan berstatus baru (sent_to_admin) dari view admin_orders
  useEffect(() => {
    let ignore = false;
    fetchOrders({ statusGroup: "new", pageSize: 200 })
      .then(async (res) => {
        if (ignore) return;
        setOrders(res.orders);
        setError(null);
        const entries = await Promise.all(
          res.orders.map(async (o) => [o.id, await getCoverPhotoUrl(o.cover_photo_path)] as const),
        );
        if (!ignore) setPhotos(Object.fromEntries(entries));
      })
      .catch((err: unknown) => {
        if (ignore) return;
        console.error("Gagal memuat pesanan baru:", err);
        setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat pesanan baru.");
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const completeCount = useMemo(() => orders.filter(isComplete).length, [orders]);
  const noPhotoCount = useMemo(() => orders.filter((o) => o.photo_count === 0).length, [orders]);
  const noMeasureCount = useMemo(() => orders.filter((o) => o.measurement_count === 0).length, [orders]);

  const visible = useMemo(() => {
    const kw = search.trim().toLowerCase();
    return orders
      .filter((o) => (tab === "complete" ? isComplete(o) : tab === "incomplete" ? !isComplete(o) : true))
      .filter((o) => !kw || [o.code, o.title, o.customer_name, o.customer_phone].some((v) => v?.toLowerCase().includes(kw)))
      .sort((a, b) => (newestFirst ? -1 : 1) * (Date.parse(a.submitted_at) - Date.parse(b.submitted_at)));
  }, [orders, tab, search, newestFirst]);

  const handleAccept = async (o: AdminOrder) => {
    setAcceptingId(o.id);
    try {
      await acceptOrder(o.id);
      setToast({ type: "success", text: `Pesanan ${o.code} diterima. Lanjutkan menyusun RAB di halaman detail.` });
      setReloadKey((k) => k + 1);
    } catch (err) {
      console.error("Gagal menerima pesanan:", err);
      const msg = err instanceof Error ? err.message : (err as { message?: string })?.message ?? "Terjadi kesalahan.";
      setToast({ type: "error", text: `Gagal menerima pesanan: ${msg}` });
    } finally {
      setAcceptingId(null);
    }
  };

  const tabClass = (t: Tab) =>
    tab === t
      ? "px-3 py-1 text-xs font-semibold rounded bg-white shadow-sm text-zinc-900 flex items-center gap-1.5"
      : "px-3 py-1 text-xs font-semibold rounded text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5";

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 max-w-md rounded-xl border px-4 py-3 text-sm font-medium shadow-xl ${
            toast.type === "success" ? "bg-[#2C4A3B] text-white border-[#233A2E]" : "bg-red-600 text-white border-red-700"
          }`}
        >
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-medium text-zinc-900 mb-2">Penerimaan pesanan baru</h1>
          <p className="text-sm text-zinc-500">
            Tinjau kebutuhan klien dan terima pesanan sebelum menyusun rincian bahan.
          </p>
        </div>
        <button
          onClick={() => downloadCsv(visible)}
          disabled={visible.length === 0}
          className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          Ekspor daftar
        </button>
      </div>

      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">Gagal memuat pesanan baru: {error}</div>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-[#2C4A3B] p-5 flex flex-col justify-between h-32 text-white">
          <p className="text-sm font-medium text-white/80">Menunggu penerimaan</p>
          <p className="text-4xl font-bold">{isLoading ? "–" : orders.length}</p>
          <p className="text-xs text-white/70">Seluruh pesanan yang belum diterima admin</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
          <p className="text-sm font-medium text-zinc-500">Siap ditinjau</p>
          <p className="text-4xl font-bold text-zinc-900">{isLoading ? "–" : completeCount}</p>
          <p className="text-xs text-zinc-400">Foto & ukuran ruangan lengkap</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
          <p className="text-sm font-medium text-zinc-500">Belum ada ukuran</p>
          <p className="text-4xl font-bold text-zinc-900">{isLoading ? "–" : noMeasureCount}</p>
          <p className="text-xs text-zinc-400">Ukuran dilengkapi admin setelah diterima</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
          <p className="text-sm font-medium text-zinc-500">Belum ada foto</p>
          <p className="text-4xl font-bold text-zinc-900">{isLoading ? "–" : noPhotoCount}</p>
          <p className="text-xs text-zinc-400">Hubungi klien untuk mengirim foto</p>
        </div>
      </div>

      {/* Alert */}
      <div className="flex items-start gap-3 rounded-xl bg-[#E8EDEA] p-4 border border-[#2C4A3B]/10">
        <Info className="h-5 w-5 text-[#2C4A3B] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-zinc-900 mb-0.5">Terima pesanan terlebih dahulu, lalu susun nilai proyek.</p>
          <p className="text-sm text-zinc-600">
            Admin yang menerima pesanan otomatis menjadi penanggung jawab. RAB disusun di halaman detail pesanan setelah
            pesanan diterima.
          </p>
        </div>
      </div>

      {/* Orders Table Section */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Pesanan masuk</h2>
            <p className="text-sm text-zinc-500">Periksa kontak, foto, luas, dan catatan klien sebelum menerima.</p>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600">
            <Calendar className="h-4 w-4" />
            {formatTanggal(new Date().toISOString())}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex bg-zinc-100 rounded-md p-0.5 w-fit">
            <button onClick={() => setTab("all")} className={tabClass("all")}>
              Semua <span className="text-zinc-400 font-normal">{orders.length}</span>
            </button>
            <button onClick={() => setTab("complete")} className={tabClass("complete")}>
              Siap ditinjau <span className="text-zinc-400 font-normal">{completeCount}</span>
            </button>
            <button onClick={() => setTab("incomplete")} className={tabClass("incomplete")}>
              Belum lengkap <span className="text-zinc-400 font-normal">{orders.length - completeCount}</span>
            </button>
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari proyek, klien, atau nomor pesanan"
                className="h-8 w-full sm:w-64 rounded-md border border-zinc-200 pl-8 pr-3 text-xs outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B]"
              />
            </div>
            <button
              onClick={() => setNewestFirst((v) => !v)}
              className="flex h-8 items-center gap-2 rounded-md border border-zinc-200 px-3 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
            >
              {newestFirst ? "Terbaru" : "Terlama"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="border-y border-zinc-100 text-[11px] text-zinc-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-medium">Foto / proyek / luas</th>
                <th className="px-4 py-3 font-medium">Klien / telepon</th>
                <th className="px-4 py-3 font-medium">Masuk</th>
                <th className="px-4 py-3 font-medium">Catatan klien</th>
                <th className="px-4 py-3 font-medium">Peninjauan</th>
                <th className="px-4 py-3 font-medium">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-xs text-zinc-500">
                    <Loader2 className="inline h-4 w-4 animate-spin mr-2" />
                    Memuat pesanan baru…
                  </td>
                </tr>
              )}
              {!isLoading && visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-xs text-zinc-500">
                    {search
                      ? `Tidak ditemukan pesanan baru yang sesuai dengan kata kunci "${search}".`
                      : "Tidak ada pesanan baru yang menunggu penerimaan."}
                  </td>
                </tr>
              )}
              {visible.map((o) => {
                const photo = photos[o.id];
                const wa = whatsappLink(o.customer_phone);
                const complete = isComplete(o);
                return (
                  <tr key={o.id} className="hover:bg-zinc-50/50">
                    <td className="px-4 py-4">
                      <div className="flex gap-3">
                        <div className="relative h-16 w-20 rounded-md overflow-hidden bg-zinc-200 shrink-0 flex items-center justify-center">
                          {photo ? (
                            <Image src={photo} alt={o.title} fill unoptimized className="object-cover" />
                          ) : (
                            <ImageOff className="h-5 w-5 text-zinc-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-400">{o.code}</p>
                          <p className="font-bold text-zinc-900 text-sm">{o.title}</p>
                          <p className="text-xs text-zinc-500">{o.room_type ?? "-"}</p>
                          <p className="text-xs font-bold text-zinc-900 mt-1">
                            {o.total_area > 0 ? `${Number(o.total_area).toLocaleString("id-ID")} m²` : "Luas belum diisi"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="font-bold text-zinc-900 text-sm">{o.customer_name ?? "Tanpa nama"}</p>
                      <p className="text-xs text-zinc-600 mt-0.5">{o.customer_phone ?? "-"}</p>
                      {wa && (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-semibold text-zinc-500 flex items-center gap-1 hover:text-zinc-800 mt-1"
                        >
                          Hubungi klien <ArrowUpRight className="h-3 w-3" />
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <p className="font-bold text-zinc-900 text-sm">{formatTanggal(o.submitted_at)}</p>
                      <p className="text-xs text-zinc-500">{formatJam(o.submitted_at)}</p>
                    </td>
                    <td className="px-4 py-4 align-top max-w-xs">
                      <p className="text-xs text-zinc-600">{o.notes || "Tidak ada catatan."}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold border mb-2 ${
                          complete ? "bg-emerald-50 text-emerald-700 border-emerald-200/50" : "bg-orange-50 text-orange-700 border-orange-200/50"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${complete ? "bg-emerald-500" : "bg-orange-500"}`}></span>
                        {complete ? "Siap ditinjau" : "Belum lengkap"}
                      </span>
                      <p className="text-[10px] text-zinc-500">{reviewNote(o)}</p>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <button
                        onClick={() => handleAccept(o)}
                        disabled={acceptingId !== null}
                        className="flex w-full items-center justify-center gap-2 rounded-md bg-[#2C4A3B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#233A2E] mb-2 disabled:opacity-50"
                      >
                        <ArrowDown className="h-3 w-3" /> {acceptingId === o.id ? "Menerima..." : "Terima pesanan"}
                      </button>
                      <Link
                        href={`/workplace/pesanan/${o.id}`}
                        className="flex w-full items-center justify-center gap-1 text-[11px] font-bold text-zinc-900 hover:text-[#2C4A3B]"
                      >
                        Lihat detail <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
