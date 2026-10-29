"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Calendar, CheckCircle2, ImageIcon, Search } from "lucide-react";
import { ORDER_STEPS, fetchDashboard, greeting, orderStep, type DashboardData, type OngoingProject } from "@/lib/dashboard";
import {
  fetchOrders,
  formatRupiah,
  formatRupiahCompact,
  formatTanggal,
  formatTanggalWaktu,
  getStatusGroupStyle,
  getStatusLabel,
} from "@/lib/orders";
import { initials } from "@/lib/team";
import type { AdminOrder, OrderStatusGroup } from "@/types/admin-orders";

const TABLE_SIZE = 6;

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return (err as { message?: string })?.message ?? "Terjadi kesalahan.";
}

function todayLabel() {
  return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" }).format(new Date());
}

function StatusBadge({ order }: { order: AdminOrder }) {
  const style = getStatusGroupStyle(order.status_group);
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style.bg} ${style.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {getStatusLabel(order.status)}
    </span>
  );
}

function ProjectCard({ project: p }: { project: OngoingProject }) {
  const step = orderStep(p.status);
  return (
    <Link
      href={`/workplace/pesanan/${p.id}`}
      className="group rounded-xl border border-zinc-200 bg-white overflow-hidden flex flex-col hover:border-[#2C4A3B]/40"
    >
      <div className="relative h-32 bg-[#E8E4DE]">
        {p.cover_url ? (
          <Image src={p.cover_url} alt={p.title} fill sizes="(max-width: 640px) 100vw, 25vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
            <ImageIcon className="h-6 w-6" />
          </div>
        )}
        <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 text-[10px] font-semibold rounded text-zinc-700">
          <span className="capitalize">{p.room_type ?? "ruangan"}</span> · {Number(p.total_area).toLocaleString("id-ID")} m²
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <span className="text-[10px] font-bold text-zinc-400 mb-1">{p.code}</span>
        <h3 className="font-bold text-zinc-900 mb-4 line-clamp-2 group-hover:text-[#2C4A3B]">{p.title}</h3>
        <div className="mt-auto">
          <div className="flex justify-between text-xs mb-2">
            <span className="font-semibold text-zinc-700">{getStatusLabel(p.status)}</span>
            <span className="font-bold text-zinc-900">{step.percent}%</span>
          </div>
          <div className="relative mb-4 flex justify-between text-[9px] font-medium text-zinc-400">
            <div className="absolute top-2.5 left-2 right-2 h-0.5 bg-zinc-100" />
            <div
              className="absolute top-2.5 left-2 h-0.5 bg-[#2C4A3B]"
              style={{ width: `calc((100% - 1rem) * ${step.current / (ORDER_STEPS.length - 1)})` }}
            />
            {ORDER_STEPS.map((label, i) => (
              <div key={label} className="relative z-10 flex flex-col items-center gap-1">
                {i < step.current ? (
                  <div className="h-5 w-5 rounded-full bg-[#E8EDEA] border border-white flex items-center justify-center">
                    <CheckCircle2 className="h-3 w-3 text-[#2C4A3B]" />
                  </div>
                ) : i === step.current ? (
                  <div className="h-5 w-5 rounded-full bg-white border-2 border-[#2C4A3B] flex items-center justify-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#2C4A3B]" />
                  </div>
                ) : (
                  <div className="h-5 w-5 rounded-full bg-zinc-100 border border-white flex items-center justify-center">
                    <div className="h-1 w-1 rounded-full bg-zinc-300" />
                  </div>
                )}
                <span className={i === step.current ? "font-bold text-zinc-700" : ""}>{label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-zinc-100 pt-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E8EDEA] text-[8px] font-bold text-[#2C4A3B]">
                {initials(p.assigned_admin_name)}
              </div>
              <span className="truncate text-xs font-medium text-zinc-600">{p.assigned_admin_name ?? "Belum ada"}</span>
            </div>
            <span className="shrink-0 text-[10px] text-zinc-400 font-medium">Diperbarui {formatTanggal(p.updated_at)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ActionCard({ data }: { data: DashboardData }) {
  const isSuperAdmin = data.me.role === "super_admin";
  return (
    <div className="rounded-xl bg-[#2C4A3B] p-6 text-white flex flex-col">
      <p className="text-[10px] uppercase tracking-widest text-white/60 mb-2">Perlu tindakan Anda</p>
      <p className="flex items-baseline gap-2 mb-1">
        <span className="text-4xl font-bold">{data.actionTotal}</span>
        <span className="text-sm text-white/70 font-medium">pesanan</span>
      </p>
      <p className="text-xs text-white/60 mb-5">
        {isSuperAdmin ? "RAB menunggu persetujuan Anda" : "Pesanan Anda yang perlu dikerjakan dan pesanan baru"}
      </p>
      {data.actionItems.length > 0 ? (
        <ul className="space-y-2.5">
          {data.actionItems.map((o) => (
            <li key={o.id}>
              <Link href={`/workplace/pesanan/${o.id}`} className="flex items-start gap-2 text-xs text-white/85 hover:text-white">
                <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${o.status === "sent_to_admin" ? "bg-orange-400" : "bg-white/60"}`} />
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{o.title}</span>
                  <span className="text-white/55">
                    {o.code} · {getStatusLabel(o.status)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-white/80">Tidak ada yang menunggu. Semua beres 🎉</p>
      )}
      <Link
        href={isSuperAdmin ? "/workplace/pesanan" : "/workplace/pesanan-baru"}
        className="mt-auto flex items-center justify-between w-full pt-5 text-sm font-semibold hover:text-white/80"
      >
        {isSuperAdmin ? "Lihat semua pesanan" : "Lihat pesanan baru"} <ArrowUpRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function RecentOrders() {
  const [tab, setTab] = useState<OrderStatusGroup | null>(null);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [result, setResult] = useState<Awaited<ReturnType<typeof fetchOrders>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let ignore = false;
    fetchOrders({ statusGroup: tab, search: debounced, pageSize: TABLE_SIZE })
      .then((r) => {
        if (ignore) return;
        setResult(r);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!ignore) setError(errorMessage(err));
      });
    return () => {
      ignore = true;
    };
  }, [tab, debounced]);

  const tabs: { key: OrderStatusGroup | null; label: string; count: number | undefined }[] = [
    { key: null, label: "Semua", count: result?.counts.all },
    { key: "new", label: "Baru", count: result?.counts.new },
    { key: "in_progress", label: "Dikerjakan", count: result?.counts.in_progress },
    { key: "done", label: "Selesai", count: result?.counts.done },
  ];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Pesanan terbaru</h2>
          <p className="text-sm text-zinc-500">Pesanan yang paling baru masuk, dari permintaan awal hingga serah terima.</p>
        </div>
        <Link
          href="/workplace/pesanan"
          className="flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-semibold text-[#2C4A3B] hover:underline"
        >
          Lihat semua <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex bg-zinc-100 rounded-md p-0.5 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.label}
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap px-3 py-1 text-xs font-semibold rounded flex items-center gap-1.5 ${
                tab === t.key ? "bg-white shadow-sm text-zinc-900" : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {t.label} <span className="text-zinc-400 font-normal">{t.count ?? "–"}</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau nomor pesanan"
            className="h-8 w-full sm:w-64 rounded-md border border-zinc-200 pl-8 pr-3 text-xs outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B] placeholder:text-zinc-400"
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Gagal memuat pesanan: {error}</p>
      ) : !result ? (
        <p className="py-10 text-center text-sm text-zinc-500">Memuat pesanan…</p>
      ) : result.orders.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-500">Tidak ada pesanan yang cocok.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] [&_th]:whitespace-nowrap text-left text-sm text-zinc-600">
            <thead className="border-y border-zinc-100 text-xs text-zinc-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3 font-medium">No. pesanan</th>
                <th className="px-4 py-3 font-medium">Proyek</th>
                <th className="px-4 py-3 font-medium">Klien</th>
                <th className="px-4 py-3 font-medium">Tanggal masuk</th>
                <th className="px-4 py-3 font-medium">Nilai pesanan</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {result.orders.map((o) => (
                <tr key={o.id} className="hover:bg-zinc-50/50">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-medium text-zinc-900">{o.code}</td>
                  <td className="min-w-[200px] px-4 py-3">
                    <p className="font-semibold text-zinc-900">{o.title}</p>
                    <p className="text-xs text-zinc-500">
                      <span className="capitalize">{o.room_type ?? "ruangan"}</span> · {Number(o.total_area).toLocaleString("id-ID")} m²
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-zinc-900">{o.customer_name ?? "—"}</p>
                    <p className="text-xs text-zinc-500">{o.customer_phone ?? ""}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-zinc-600">{formatTanggal(o.submitted_at)}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-zinc-900">
                    {o.order_value === null ? <span className="font-normal text-zinc-400">Belum dihitung</span> : formatRupiah(o.order_value)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge order={o} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/workplace/pesanan/${o.id}`} title="Buka detail" className="inline-flex text-zinc-400 hover:text-zinc-700">
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    fetchDashboard()
      .then((d) => {
        if (ignore) return;
        setData(d);
        setLoadError(null);
      })
      .catch((err: unknown) => {
        if (!ignore) setLoadError(errorMessage(err));
      });
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const s = data?.summary;
  const firstName = data?.me.fullName.trim().split(/\s+/)[0];

  // "1 Draft RAB · 2 Disetujui"
  const progressDetail = useMemo(
    () =>
      Object.entries(s?.in_progress_by_status ?? {})
        .map(([status, n]) => `${n} ${getStatusLabel(status)}`)
        .join(" · "),
    [s],
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-3xl font-medium text-zinc-900">
          {greeting()}
          {firstName && (
            <>
              , <span className="italic">{firstName}.</span>
            </>
          )}
        </h1>
        <div className="flex w-fit shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-600">
          <Calendar className="h-4 w-4" />
          {todayLabel()}
        </div>
      </div>

      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Gagal memuat dashboard: {loadError}{" "}
          <button onClick={() => setReloadKey((k) => k + 1)} className="font-semibold underline">
            Coba lagi
          </button>
        </div>
      )}

      {/* Summary Section */}
      <div>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">RINGKASAN STUDIO</h2>
          <span className="text-xs text-zinc-400 text-right">
            {s ? `Diperbarui ${formatTanggalWaktu(s.generated_at)}` : ""}
          </span>
        </div>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 flex flex-col justify-between gap-2 min-h-28 sm:min-h-32">
            <p className="text-sm font-medium text-zinc-500">Total pesanan</p>
            <p className="text-2xl sm:text-4xl font-bold leading-tight whitespace-nowrap text-zinc-900">{s ? s.total_orders : "–"}</p>
            <p className="text-xs text-zinc-400">{s ? `${s.new_orders} pesanan baru menunggu diterima` : ""}</p>
          </div>
          <div className="rounded-xl bg-[#2C4A3B] p-4 sm:p-5 flex flex-col justify-between gap-2 min-h-28 sm:min-h-32 text-white">
            <p className="text-sm font-medium text-white/80">Proyek dikerjakan</p>
            <p className="text-2xl sm:text-4xl font-bold leading-tight whitespace-nowrap">{s ? s.in_progress_orders : "–"}</p>
            <p className="text-xs text-white/70">{progressDetail || (s ? "Belum ada yang dikerjakan" : "")}</p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 flex flex-col justify-between gap-2 min-h-28 sm:min-h-32">
            <p className="text-sm font-medium text-zinc-500">Proyek selesai</p>
            <p className="text-2xl sm:text-4xl font-bold leading-tight whitespace-nowrap text-zinc-900">{s ? s.done_orders : "–"}</p>
            <p className="text-xs text-zinc-400">
              {s ? (s.last_completed_at ? `Serah terima terakhir ${formatTanggal(s.last_completed_at)}` : "Belum ada serah terima") : ""}
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 flex flex-col justify-between gap-2 min-h-28 sm:min-h-32">
            <p className="text-sm font-medium text-zinc-500">Nilai pesanan</p>
            <p className="text-2xl sm:text-4xl font-bold leading-tight whitespace-nowrap tracking-tight text-zinc-900">
              {s ? formatRupiahCompact(s.total_order_value) : "–"}
            </p>
            <p className="text-xs text-zinc-400">{s ? `Total RAB dari ${s.valued_orders} pesanan` : ""}</p>
          </div>
        </div>
      </div>

      {/* Ongoing Projects Section */}
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <div className="flex items-center gap-3">
            <h2 className="whitespace-nowrap text-lg font-bold text-zinc-900">Proyek yang sedang berjalan</h2>
            <span className="shrink-0 whitespace-nowrap rounded-full bg-[#E8EDEA] px-2 py-0.5 text-xs font-semibold text-[#2C4A3B]">
              {data ? `${data.ongoingTotal} aktif` : "–"}
            </span>
          </div>
          <Link
            href="/workplace/pesanan"
            className="shrink-0 whitespace-nowrap text-xs font-semibold text-[#2C4A3B] flex items-center gap-1 hover:underline"
          >
            Lihat semua proyek <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {!data ? (
            <p className="col-span-full py-10 text-center text-sm text-zinc-500">{loadError ? "" : "Memuat proyek…"}</p>
          ) : (
            <>
              {data.ongoing.length === 0 && (
                <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500 sm:col-span-1 xl:col-span-3 flex items-center justify-center">
                  Belum ada proyek yang sedang dikerjakan.
                </div>
              )}
              {data.ongoing.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
              <ActionCard data={data} />
            </>
          )}
        </div>
      </div>

      <RecentOrders />
    </div>
  );
}
