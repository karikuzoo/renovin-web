"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, Info, Search } from "lucide-react";
import { ROLE_LABEL, fetchTeam, initials, type StaffRole, type TeamData, type TeamMember } from "@/lib/team";
import { formatRupiahCompact, formatTanggalWaktu, getStatusLabel } from "@/lib/orders";

type Tab = "all" | "busy" | "free";

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return (err as { message?: string })?.message ?? "Terjadi kesalahan.";
}

function Avatar({ name, size = "md" }: { name: string | null; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "h-7 w-7 text-[9px] border-2 border-white" : "h-9 w-9 text-[11px]";
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full bg-[#E8EDEA] font-bold text-[#2C4A3B] ${cls}`}>
      {initials(name)}
    </div>
  );
}

export default function TimStudio() {
  const [data, setData] = useState<TeamData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<StaffRole | "">("");

  useEffect(() => {
    let ignore = false;
    fetchTeam()
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

  const members = useMemo(() => data?.members ?? [], [data]);

  const stats = useMemo(() => {
    const busy = members.filter((m) => m.active.length > 0);
    const activeTotal = members.reduce((n, m) => n + m.active.length, 0);
    return {
      total: members.length,
      superAdmins: members.filter((m) => m.role === "super_admin").length,
      busy: busy.length,
      activeTotal,
      waitingSuperAdmin: members.reduce((n, m) => n + m.waitingSuperAdmin, 0),
      maxActive: Math.max(1, ...members.map((m) => m.active.length)),
      lastActivity: members.map((m) => m.lastActivityAt ?? "").sort().at(-1) || null,
    };
  }, [members]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return members
      .filter(
        (m) =>
          (tab === "all" || (tab === "busy" ? m.active.length > 0 : m.active.length === 0)) &&
          (!roleFilter || m.role === roleFilter) &&
          (!q || [m.full_name, m.email].some((v) => v?.toLowerCase().includes(q))),
      )
      .sort((a, b) => b.active.length - a.active.length || (a.full_name ?? "").localeCompare(b.full_name ?? ""));
  }, [members, tab, roleFilter, search]);

  // Pesanan aktif dikelompokkan per penanggung jawab, yang paling sibuk lebih dulu
  const busyMembers = useMemo(
    () => members.filter((m) => m.active.length > 0).sort((a, b) => b.active.length - a.active.length),
    [members],
  );

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: "Semua", count: members.length },
    { key: "busy", label: "Menangani pesanan", count: stats.busy },
    { key: "free", label: "Tanpa pesanan aktif", count: members.length - stats.busy },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Tim studio</h1>
        <p className="text-sm text-zinc-500">Admin dan super admin Renovin, beserta pesanan yang sedang mereka tangani.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 flex flex-col justify-between gap-2 min-h-28 sm:min-h-32">
          <p className="text-sm font-medium text-zinc-500">Anggota tim</p>
          <p className="text-2xl sm:text-4xl font-bold leading-tight whitespace-nowrap text-zinc-900">{data ? stats.total : "–"}</p>
          <p className="text-xs text-zinc-400">
            {stats.superAdmins} super admin · {stats.total - stats.superAdmins} admin
          </p>
        </div>
        <div className="rounded-xl bg-[#2C4A3B] p-4 sm:p-5 flex flex-col justify-between gap-2 min-h-28 sm:min-h-32 text-white">
          <p className="text-sm font-medium text-white/80">Pesanan dikerjakan</p>
          <p className="text-2xl sm:text-4xl font-bold leading-tight whitespace-nowrap">{data ? stats.activeTotal : "–"}</p>
          <p className="text-xs text-white/70">Ditangani {stats.busy} anggota</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 flex flex-col justify-between gap-2 min-h-28 sm:min-h-32">
          <p className="text-sm font-medium text-zinc-500">Menunggu super admin</p>
          <p className="text-2xl sm:text-4xl font-bold leading-tight whitespace-nowrap text-zinc-900">{data ? stats.waitingSuperAdmin : "–"}</p>
          <p className="text-xs text-zinc-400">RAB menunggu persetujuan</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 sm:p-5 flex flex-col justify-between gap-2 min-h-28 sm:min-h-32">
          <p className="text-sm font-medium text-zinc-500">Pesanan baru</p>
          <p className="text-2xl sm:text-4xl font-bold leading-tight whitespace-nowrap text-zinc-900">{data ? data.newOrders : "–"}</p>
          <p className="text-xs text-zinc-400">Belum diterima admin mana pun</p>
        </div>
      </div>

      {/* Info */}
      <div className="flex items-start gap-3 rounded-xl bg-[#E8EDEA] p-4 border border-[#2C4A3B]/10">
        <Info className="h-5 w-5 text-[#2C4A3B] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-zinc-900 mb-0.5">Akun tim dikelola tim IT</p>
          <p className="text-sm text-zinc-600">
            Untuk menambah anggota, mengganti email, atau menonaktifkan akun, hubungi tim IT. Penanggung jawab pesanan
            dipindah dari halaman detail pesanan (tombol <span className="font-semibold">Ganti</span>).
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-zinc-900">Anggota & beban kerja</h2>
          <p className="text-sm text-zinc-500">Jumlah pesanan yang sedang dikerjakan setiap penanggung jawab.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex flex-wrap bg-zinc-100 rounded-md p-0.5 w-fit">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 ${
                  tab === t.key ? "bg-white shadow-sm text-zinc-900" : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                {t.label} <span className="text-zinc-400 font-normal">{t.count}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama atau email"
                className="h-9 w-full sm:w-64 rounded-md border border-zinc-200 pl-9 pr-3 text-xs outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B] placeholder:text-zinc-400"
              />
            </div>
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as StaffRole | "")}
                className="h-9 appearance-none rounded-md border border-zinc-200 bg-white pl-3 pr-8 text-xs font-semibold text-zinc-700 outline-none hover:bg-zinc-50 focus:border-[#2C4A3B]"
              >
                <option value="">Semua peran</option>
                <option value="super_admin">Super Admin</option>
                <option value="admin">Admin</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            </div>
          </div>
        </div>

        {loadError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Gagal memuat tim: {loadError}{" "}
            <button onClick={() => setReloadKey((k) => k + 1)} className="font-semibold underline">
              Coba lagi
            </button>
          </div>
        ) : !data ? (
          <p className="py-12 text-center text-sm text-zinc-500">Memuat tim…</p>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-zinc-500">Tidak ada anggota yang cocok dengan filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] [&_th]:whitespace-nowrap text-left text-sm text-zinc-600">
              <thead className="border-y border-zinc-100 text-[11px] bg-zinc-50/50 text-zinc-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-medium">Anggota</th>
                  <th className="px-4 py-3 font-medium">Peran</th>
                  <th className="px-4 py-3 font-medium">Pesanan dikerjakan</th>
                  <th className="px-4 py-3 font-medium">Beban</th>
                  <th className="px-4 py-3 font-medium">Selesai</th>
                  <th className="px-4 py-3 font-medium">Terakhir aktif</th>
                  <th className="px-4 py-3 font-medium">Kontak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map((m) => (
                  <MemberRow key={m.id} member={m} maxActive={stats.maxActive} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && (
          <div className="mt-2 p-4 border-t border-zinc-100">
            <p className="text-[11px] text-zinc-500">
              Menampilkan {filtered.length} dari {members.length} anggota · {members.length - stats.busy} tanpa pesanan aktif
            </p>
          </div>
        )}
      </div>

      {/* Per penanggung jawab */}
      {data && (busyMembers.length > 0 || data.activeUnassigned.length > 0) && (
        <div>
          <h2 className="text-lg font-bold text-zinc-900 mb-4">Pesanan aktif per penanggung jawab</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {busyMembers.map((m) => (
              <div key={m.id} className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar name={m.full_name} />
                  <div className="min-w-0">
                    <h3 className="font-bold text-zinc-900 text-sm truncate">{m.full_name ?? m.email}</h3>
                    <p className="text-[11px] text-zinc-500">
                      {m.active.length} pesanan · {ROLE_LABEL[m.role]}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {m.active.slice(0, 4).map((o) => (
                    <li key={o.id}>
                      <Link
                        href={`/workplace/pesanan/${o.id}`}
                        className="group flex items-start justify-between gap-2 rounded-md px-2 py-1.5 -mx-2 hover:bg-zinc-50"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-900 truncate group-hover:text-[#2C4A3B]">{o.title}</p>
                          <p className="text-[10px] text-zinc-500">
                            {o.code} · {getStatusLabel(o.status)}
                          </p>
                        </div>
                        <span className="shrink-0 text-[10px] font-semibold text-zinc-500">
                          {o.order_value === null ? "RAB belum" : formatRupiahCompact(o.order_value)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                {m.active.length > 4 && <p className="mt-2 text-[10px] text-zinc-400">+{m.active.length - 4} pesanan lainnya</p>}
              </div>
            ))}

            {data.activeUnassigned.length > 0 && (
              <div className="rounded-xl border border-dashed border-orange-300 bg-orange-50/40 p-5 flex flex-col">
                <h3 className="font-bold text-zinc-900 text-sm mb-1">Tanpa penanggung jawab</h3>
                <p className="text-[11px] text-zinc-500 mb-4">Pesanan dikerjakan yang belum punya admin. Tetapkan dari detail pesanan.</p>
                <ul className="space-y-2">
                  {data.activeUnassigned.map((o) => (
                    <li key={o.id}>
                      <Link href={`/workplace/pesanan/${o.id}`} className="text-xs font-semibold text-zinc-900 hover:text-[#2C4A3B] flex items-center gap-1">
                        {o.code} · {o.title} <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-zinc-400 pt-4 border-t border-zinc-200/50">
        <p>Renovin. · Ruang kerja studio interior</p>
        <p>Aktivitas terakhir {stats.lastActivity ? formatTanggalWaktu(stats.lastActivity) : "—"}</p>
      </div>
    </div>
  );
}

function MemberRow({ member: m, maxActive }: { member: TeamMember; maxActive: number }) {
  const busy = m.active.length > 0;
  return (
    <tr className="hover:bg-zinc-50/50">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3 min-w-[200px]">
          <Avatar name={m.full_name} />
          <div className="min-w-0">
            <p className="font-semibold text-zinc-900 text-xs">{m.full_name ?? "—"}</p>
            <p className="text-[10px] text-zinc-400 truncate">{m.email ?? "—"}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <span
          className={`rounded-md px-2 py-1 text-[10px] font-bold ${
            m.role === "super_admin" ? "bg-[#2C4A3B] text-white" : "bg-[#F4F1ED] text-zinc-700"
          }`}
        >
          {ROLE_LABEL[m.role]}
        </span>
      </td>
      <td className="px-4 py-4 min-w-[200px]">
        {busy ? (
          <>
            <Link href={`/workplace/pesanan/${m.active[0].id}`} className="font-semibold text-zinc-900 text-xs mb-0.5 hover:text-[#2C4A3B] block truncate">
              {m.active[0].title}
            </Link>
            <p className="text-[10px] text-zinc-500">
              {m.active.length > 1 ? `+${m.active.length - 1} pesanan lain · ` : ""}
              {m.needsAction} perlu tindakan{m.waitingSuperAdmin ? ` · ${m.waitingSuperAdmin} menunggu super admin` : ""}
            </p>
          </>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-green-100/50 px-2 py-1 text-[10px] font-bold text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Siap menerima pesanan
          </span>
        )}
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-col gap-1 w-24">
          <span className="text-[10px] font-semibold text-zinc-600">{m.active.length} aktif</span>
          <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-[#2C4A3B]" style={{ width: `${(m.active.length / maxActive) * 100}%` }} />
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-xs font-medium text-zinc-700">{m.completed}</td>
      <td className="px-4 py-4 text-[11px] text-zinc-500 whitespace-nowrap">{m.lastActivityAt ? formatTanggalWaktu(m.lastActivityAt) : "—"}</td>
      <td className="px-4 py-4 text-xs font-medium text-zinc-700 whitespace-nowrap">{m.phone ?? "—"}</td>
    </tr>
  );
}
