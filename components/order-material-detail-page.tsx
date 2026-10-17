"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  FileText,
  ImageOff,
  Info,
  Loader2,
  Lock,
  Plus,
  Printer,
  Save,
  Send,
  Trash2,
  X,
} from "lucide-react";
import {
  formatRupiah,
  formatTanggalWaktu,
  getStatusGroupStyle,
  getStatusLabel,
} from "@/lib/orders";
import { AssignAdminControl } from "@/components/assign-admin-control";
import {
  calculateRab,
  canAssign,
  canEditRab,
  changeStatus,
  computeTotals,
  fetchOrderDetail,
  saveRab,
  splitDescription,
  submitForApproval,
  toManualRow,
  type ManualRow,
  type OrderDetail,
  type RabItemType,
} from "@/lib/rab";

interface OrderMaterialDetailPageProps {
  orderId?: string;
  isNew?: boolean;
}

const UNIT_OPTIONS = ["m2", "pcs", "unit", "paket", "lembar", "sak", "batang", "pail", "kaleng", "roll", "box", "titik", "hari"];

// Angka rupiah dengan titik ribuan untuk input
function formatNumberWithDots(val: number): string {
  if (!val) return "";
  return new Intl.NumberFormat("id-ID").format(val);
}
function parseDotsToNumber(str: string): number {
  const clean = str.replace(/\D/g, "");
  return clean ? parseInt(clean, 10) : 0;
}
// Penyesuaian boleh negatif (diskon)
function parseSignedDots(str: string): number {
  const negative = str.trim().startsWith("-");
  const n = parseDotsToNumber(str);
  return negative ? -n : n;
}
function formatSignedDots(val: number): string {
  if (!val) return "";
  return (val < 0 ? "-" : "") + formatNumberWithDots(Math.abs(val));
}

function formatQty(n: number) {
  return new Intl.NumberFormat("id-ID", { maximumFractionDigits: 3 }).format(n);
}

function newRow(itemType: RabItemType): ManualRow {
  return {
    key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    id: null,
    itemType,
    name: "",
    spec: "",
    quantity: 1,
    unit: itemType === "service" ? "paket" : "pcs",
    unitPrice: 0,
  };
}

function whatsappLink(phone: string | null): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits.startsWith("0") ? "62" + digits.slice(1) : digits}`;
}

export function OrderMaterialDetailPage({ orderId, isNew = false }: OrderMaterialDetailPageProps) {
  if (isNew || !orderId || orderId === "baru") {
    return <NewOrderNotAvailable />;
  }
  return <OrderDetailView orderId={orderId} />;
}

// Pembuatan pesanan oleh admin belum tersedia di backend (ditunda keputusan tim)
function NewOrderNotAvailable() {
  return (
    <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
      <h1 className="text-2xl font-bold text-zinc-900">Tambah pesanan belum tersedia</h1>
      <p className="text-sm text-zinc-500">
        Pesanan dibuat oleh klien dari aplikasi Renovin. Pembuatan pesanan oleh admin
        masih menunggu keputusan tim.
      </p>
      <Link
        href="/workplace/pesanan"
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Kembali ke daftar pesanan
      </Link>
    </div>
  );
}

function OrderDetailView({ orderId }: { orderId: string }) {
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "not_found" | "error">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Isian yang bisa diubah admin
  const [rows, setRows] = useState<ManualRow[]>([]);
  const [adjustment, setAdjustment] = useState(0);
  const [adjustmentNote, setAdjustmentNote] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [busy, setBusy] = useState<null | "save" | "calc" | "draft" | "submit">(null);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let ignore = false;
    fetchOrderDetail(orderId)
      .then((d) => {
        if (ignore) return;
        if (!d) {
          setLoadState("not_found");
          return;
        }
        setDetail(d);
        setRows(d.manualItems.map(toManualRow));
        setAdjustment(Number(d.rab?.adjustment ?? 0));
        setAdjustmentNote(d.rab?.adjustment_note ?? "");
        setAdminNotes(d.rab?.notes ?? "");
        setHasUnsavedChanges(false);
        setLoadState("ready");
      })
      .catch((err: unknown) => {
        if (ignore) return;
        console.error("Gagal memuat detail pesanan:", err);
        setLoadError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat pesanan.");
        setLoadState("error");
      });
    return () => {
      ignore = true;
    };
  }, [orderId, reloadKey]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const totals = useMemo(
    () =>
      computeTotals({
        autoItems: detail?.autoItems ?? [],
        rows,
        adjustment,
        taxPercent: Number(detail?.rab?.tax_percent ?? 0),
      }),
    [detail, rows, adjustment],
  );

  if (loadState === "loading") {
    return (
      <div className="max-w-6xl mx-auto py-24 text-center text-sm text-zinc-500">
        <Loader2 className="inline h-5 w-5 animate-spin mr-2" />
        Memuat detail pesanan…
      </div>
    );
  }
  if (loadState !== "ready" || !detail) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <h1 className="text-2xl font-bold text-zinc-900">
          {loadState === "not_found" ? "Pesanan tidak ditemukan" : "Gagal memuat pesanan"}
        </h1>
        <p className="text-sm text-zinc-500">
          {loadState === "not_found"
            ? "Pesanan ini tidak ada, masih berupa draft klien, atau Anda tidak memiliki akses."
            : loadError}
        </p>
        <Link
          href="/workplace/pesanan"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke daftar pesanan
        </Link>
      </div>
    );
  }

  const { order, rab, autoItems } = detail;
  const editable = canEditRab(order.status, detail.myRole);
  const assignable = canAssign(order.status, detail.myRole, order.assigned_admin_id, detail.myId);
  const groupStyle = getStatusGroupStyle(order.status_group);
  const materialRows = rows.filter((r) => r.itemType !== "service");
  const serviceRows = rows.filter((r) => r.itemType === "service");
  const autoMaterial = autoItems.filter((i) => i.item_type !== "service");
  const autoService = autoItems.filter((i) => i.item_type === "service");
  const totalLines = autoItems.length + rows.length;
  const canSubmit = editable && ["admin_processing", "rab_draft", "correction"].includes(order.status);
  const waLink = whatsappLink(order.customer_phone);

  const showError = (prefix: string, err: unknown) => {
    console.error(prefix, err);
    const msg = err instanceof Error ? err.message : (err as { message?: string })?.message ?? "Terjadi kesalahan.";
    setToastMessage({ type: "error", text: `${prefix}: ${msg}` });
  };
  const reload = () => setReloadKey((k) => k + 1);

  const updateRow = (key: string, patch: Partial<ManualRow>) => {
    setHasUnsavedChanges(true);
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };
  const deleteRow = (key: string) => {
    setHasUnsavedChanges(true);
    setRows((prev) => prev.filter((r) => r.key !== key));
  };
  const addRow = (itemType: RabItemType) => {
    setHasUnsavedChanges(true);
    setRows((prev) => [...prev, newRow(itemType)]);
  };

  const persist = () =>
    saveRab({
      projectId: order.id,
      rabId: rab?.id ?? null,
      rows,
      originalItems: detail.manualItems,
      adjustment,
      adjustmentNote,
      notes: adminNotes,
    });

  const handleSaveDraft = async () => {
    setBusy("save");
    try {
      await persist();
      setToastMessage({ type: "success", text: "Rincian RAB berhasil disimpan." });
      reload();
    } catch (err) {
      showError("Gagal menyimpan RAB", err);
    } finally {
      setBusy(null);
    }
  };

  const handleRecalculate = async () => {
    if (hasUnsavedChanges && !window.confirm("Ada perubahan yang belum disimpan dan akan hilang. Lanjutkan hitung ulang?")) return;
    setBusy("calc");
    try {
      await calculateRab(order.id);
      setToastMessage({ type: "success", text: "Baris otomatis dihitung ulang dari desain klien." });
      reload();
    } catch (err) {
      showError("Gagal menghitung RAB", err);
    } finally {
      setBusy(null);
    }
  };

  // admin_processing -> rab_draft: RAB sudah disusun, siap dicek sebelum diajukan
  const handleMarkDraft = async () => {
    setBusy("draft");
    try {
      await persist();
      await changeStatus(order.id, "rab_draft");
      setToastMessage({ type: "success", text: "RAB disimpan dan status menjadi Draft RAB." });
      reload();
    } catch (err) {
      showError("Gagal menetapkan Draft RAB", err);
      reload();
    } finally {
      setBusy(null);
    }
  };

  const handleSendForApproval = async () => {
    if (!window.confirm("Kirim RAB ini ke super admin untuk disetujui? Setelah dikirim, RAB tidak bisa diubah admin.")) return;
    setBusy("submit");
    try {
      await persist();
      await submitForApproval(order.id, order.status);
      setToastMessage({ type: "success", text: "RAB berhasil dikirim untuk persetujuan super admin." });
      reload();
    } catch (err) {
      showError("Gagal mengirim untuk persetujuan", err);
      reload();
    } finally {
      setBusy(null);
    }
  };

  const inputClass =
    "w-full h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs outline-none focus:border-[#2C4A3B] disabled:bg-zinc-50 disabled:text-zinc-500 print:border-none print:bg-transparent print:p-0 print:h-auto";

  const renderManualRow = (row: ManualRow) => (
    <tr key={row.key} className="hover:bg-zinc-50/40 transition-colors">
      <td className="px-6 py-2.5 print:px-3 print:py-1.5">
        <input
          type="text"
          value={row.name}
          disabled={!editable}
          placeholder={row.itemType === "service" ? "Nama jasa" : "Nama bahan"}
          onChange={(e) => updateRow(row.key, { name: e.target.value })}
          className={`${inputClass} font-medium text-zinc-800`}
        />
      </td>
      <td className="px-4 py-2.5 print:px-2 print:py-1.5">
        <input
          type="text"
          value={row.spec}
          disabled={!editable}
          placeholder="Spesifikasi (opsional)"
          onChange={(e) => updateRow(row.key, { spec: e.target.value })}
          className={`${inputClass} text-zinc-600`}
        />
      </td>
      <td className="px-3 py-2.5 text-center print:px-2 print:py-1.5">
        <input
          type="number"
          min="0"
          step="any"
          value={row.quantity}
          disabled={!editable}
          onChange={(e) => updateRow(row.key, { quantity: Math.max(0, parseFloat(e.target.value) || 0) })}
          className={`${inputClass} w-16 px-2 text-center font-semibold text-zinc-800 print:w-auto`}
        />
      </td>
      <td className="px-3 py-2.5 text-center print:px-2 print:py-1.5">
        <div className="relative">
          <select
            value={row.unit}
            disabled={!editable}
            onChange={(e) => updateRow(row.key, { unit: e.target.value })}
            className={`${inputClass} appearance-none pr-7 font-medium text-zinc-700 print:pr-0 print:w-auto`}
          >
            {(UNIT_OPTIONS.includes(row.unit) ? UNIT_OPTIONS : [row.unit, ...UNIT_OPTIONS]).map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 print:hidden" />
        </div>
      </td>
      <td className="px-4 py-2.5 text-right print:px-2 print:py-1.5">
        <input
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={formatNumberWithDots(row.unitPrice)}
          disabled={!editable}
          onChange={(e) => updateRow(row.key, { unitPrice: parseDotsToNumber(e.target.value) })}
          className={`${inputClass} text-right font-semibold text-zinc-800`}
        />
      </td>
      <td className="px-6 py-2.5 text-right font-bold text-zinc-900 text-xs print:px-3 print:py-1.5">
        {Math.round(row.quantity * row.unitPrice).toLocaleString("id-ID")}
      </td>
      <td className="px-3 py-2.5 text-center print:hidden">
        {editable && (
          <button onClick={() => deleteRow(row.key)} className="text-zinc-300 hover:text-red-600 transition p-1" title="Hapus baris">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </td>
    </tr>
  );

  const renderAutoRow = (item: OrderDetail["autoItems"][number]) => {
    const { name, spec } = splitDescription(item.description);
    return (
      <tr key={item.id} className="text-zinc-700">
        <td className="px-6 py-3 font-medium text-zinc-800 print:px-3 print:py-1.5">{name}</td>
        <td className="px-4 py-3 text-zinc-500 print:px-2 print:py-1.5">{spec || "-"}</td>
        <td className="px-3 py-3 text-center font-semibold print:px-2 print:py-1.5">{formatQty(Number(item.quantity))}</td>
        <td className="px-3 py-3 text-center print:px-2 print:py-1.5">{item.unit}</td>
        <td className="px-4 py-3 text-right print:px-2 print:py-1.5">{Number(item.unit_price_customer).toLocaleString("id-ID")}</td>
        <td className="px-6 py-3 text-right font-bold text-zinc-900 print:px-3 print:py-1.5">
          {Number(item.subtotal_customer ?? 0).toLocaleString("id-ID")}
        </td>
        <td className="px-3 py-3 print:hidden"></td>
      </tr>
    );
  };

  const groupHeader = (title: string, subtitle: string, badge: string, extra?: React.ReactNode) => (
    <tr className="bg-zinc-50/60 print:bg-zinc-100/50">
      <td colSpan={7} className="px-6 py-3 print:px-3 print:py-1.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="font-bold text-zinc-900 text-xs print:text-[11px]">{title}</span>
            <span className="text-[11px] text-zinc-400 ml-2 print:text-[9px]">{subtitle}</span>
          </div>
          <div className="flex items-center gap-2">
            {extra}
            <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-600 border border-zinc-200 print:text-[9px] print:py-0">
              • {badge}
            </span>
          </div>
        </div>
      </td>
    </tr>
  );

  const emptyRow = (text: string) => (
    <tr>
      <td colSpan={7} className="px-6 py-5 text-center text-[11px] text-zinc-400 print:py-2">
        {text}
      </td>
    </tr>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 print:max-w-none print:w-full print:p-0 print:space-y-4 print:pb-0">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm max-w-md print:hidden ${
            toastMessage.type === "success" ? "bg-[#2C4A3B] text-white border-[#233A2E]" : "bg-red-600 text-white border-red-700"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
          ) : (
            <Info className="h-4 w-4 shrink-0 text-red-200" />
          )}
          <span className="font-medium">{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="text-white/70 hover:text-white p-0.5 ml-2">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Print Document Header */}
      <div className="hidden print:flex items-center justify-between pb-3 border-b-2 border-[#2C4A3B] mb-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#2C4A3B]">Renovin.</h1>
          <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
            STUDIO INTERIOR · RINCIAN BAHAN BANGUNAN & ANGGARAN (RAB)
          </p>
        </div>
        <div className="text-right text-xs text-zinc-600">
          <p className="font-mono font-bold text-zinc-900">{order.code}</p>
          <p className="text-[10px] text-zinc-500">
            Dicetak: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 print:hidden">
        <span>Ruang kerja</span>
        <span>&rsaquo;</span>
        <Link href="/workplace/pesanan" className="hover:text-zinc-900 transition">
          Pesanan
        </Link>
        <span>&rsaquo;</span>
        <span className="text-zinc-900 font-semibold">{order.code}</span>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-1">Rincian bahan bangunan</h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Lengkapi bahan, jasa, dan harga untuk menyusun RAB pesanan ini.
          </p>
        </div>
        <Link
          href="/workplace/pesanan"
          className="flex items-center gap-2 self-start rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-2xs transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke daftar pesanan
        </Link>
      </div>

      {!editable && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 print:hidden">
          <Lock className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            RAB tidak bisa diubah pada status <b>{getStatusLabel(order.status)}</b>.
            {order.status === "sent_to_admin" && " Terima pesanan dulu dari daftar pesanan untuk mulai menyusun RAB."}
            {order.status === "pending_approval" && " RAB sedang menunggu keputusan super admin."}
          </span>
        </div>
      )}

      {/* CARD 1: Photos & Order Overview */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs space-y-6 print:border-zinc-300 print:p-4 print:space-y-3 print:shadow-none print-card-page1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
          {[
            { label: "Sebelum", url: detail.photoBeforeUrl, caption: "Foto kondisi awal · Diunggah klien", empty: "Klien belum mengunggah foto ruangan", bg: "bg-[#ECE6DD]" },
            { label: "Sesudah", url: detail.photoAfterUrl, caption: "Hasil desain dari aplikasi", empty: "Belum ada hasil desain", bg: "bg-[#E2EBE5]" },
          ].map((p) => (
            <div key={p.label} className="flex flex-col">
              <div className={`relative aspect-16/10 w-full rounded-xl overflow-hidden ${p.bg} border border-zinc-200/80 shadow-inner print:aspect-auto print:h-44`}>
                {p.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.url} alt={`Foto ${p.label.toLowerCase()}`} className="w-full h-full object-cover print:h-44" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-zinc-400">
                    <ImageOff className="h-6 w-6" />
                    <span className="text-xs">{p.empty}</span>
                  </div>
                )}
                <span className="absolute top-3 left-3 bg-white/95 text-zinc-900 text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-xs print:text-[10px]">
                  {p.label}
                </span>
              </div>
              {p.url && (
                <p className="text-center text-xs text-zinc-500 mt-2 font-medium print:text-[10px] print:mt-1">{p.caption}</p>
              )}
            </div>
          ))}
        </div>

        {/* Order Details & Client Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 border-t border-zinc-100 print:grid-cols-3 print:gap-4 print:pt-3">
          <div className="lg:col-span-2 space-y-4 print:space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-zinc-500">{order.code}</span>
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${groupStyle.bg} ${groupStyle.text} print:py-0 print:text-[10px]`}>
                <span className={`h-1.5 w-1.5 rounded-full ${groupStyle.dot}`}></span>
                {getStatusLabel(order.status)}
              </span>
            </div>

            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight print:text-lg">{order.title}</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-1 print:gap-2 print:py-0.5">
              {[
                { label: "Jenis ruangan", value: order.room_type ?? "-" },
                { label: "Luas terukur", value: `${formatQty(Number(order.total_area))} m²` },
                { label: "Jumlah ukuran", value: `${order.measurement_count} bidang` },
                { label: "Foto ruangan", value: `${order.photo_count} foto` },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-[11px] text-zinc-400 font-medium print:text-[9px]">{f.label}</p>
                  <p className="text-xs font-bold text-zinc-800 mt-0.5 print:text-[11px]">{f.value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-[11px] text-zinc-400 font-medium print:text-[9px]">Catatan dari klien</p>
              <p className="text-xs text-zinc-700 mt-0.5 leading-relaxed print:text-[10px]">
                {order.notes || "Tidak ada catatan dari klien."}
              </p>
            </div>
          </div>

          <div className="border-t lg:border-t-0 lg:border-l border-zinc-100 pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-between print:border-t-0 print:border-l print:pl-4 print:pt-0">
            <div className="space-y-2 print:space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">KLIEN:</p>
              <h3 className="text-base font-bold text-zinc-900 print:text-sm">{order.customer_name ?? "Tanpa nama"}</h3>
              <p className="text-xs text-zinc-600 font-medium print:text-[11px]">{order.customer_phone ?? "-"}</p>
              <p className="text-xs text-zinc-500 print:text-[10px]">{order.customer_email ?? ""}</p>

              <div className="pt-2 text-xs text-zinc-500 space-y-1 print:pt-1 print:text-[10px]">
                <p>Masuk {formatTanggalWaktu(order.submitted_at)}</p>
                {detail.receivedAt && <p>Diterima {formatTanggalWaktu(detail.receivedAt)}</p>}
                <div className="flex flex-wrap items-center gap-x-2">
                  <span>
                    Penanggung jawab{" "}
                    <span className="font-medium text-zinc-800">{order.assigned_admin_name ?? "belum ada admin"}</span>
                  </span>
                  {assignable && (
                    <AssignAdminControl
                      key={order.assigned_admin_id ?? "none"}
                      projectId={order.id}
                      currentAdminId={order.assigned_admin_id}
                      onAssigned={(name) => {
                        setToastMessage({ type: "success", text: `Penanggung jawab pesanan dipindahkan ke ${name}.` });
                        reload();
                      }}
                      onError={(err) => showError("Gagal memindahkan penanggung jawab", err)}
                    />
                  )}
                </div>
              </div>
            </div>

            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex items-center gap-1.5 text-xs font-bold text-[#2C4A3B] hover:underline print:hidden"
              >
                Hubungi klien via WhatsApp <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* CARD 2: RAB Table */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-2xs overflow-hidden print:border-zinc-300 print:shadow-none print-avoid-break">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 border-b border-zinc-100 gap-4 print:p-4 print:border-zinc-200">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-bold text-zinc-900 print:text-base">Daftar bahan & jasa (RAB)</h3>
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/60 print:text-[10px]">
                • {getStatusLabel(order.status)}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1 print:text-[10px]">
              {rab?.calculated_at
                ? `Dihitung dari desain ${formatTanggalWaktu(rab.calculated_at)}. Seluruh harga dalam rupiah.`
                : "RAB belum dihitung. Klik \"Hitung dari desain\" untuk membuat baris otomatis."}
            </p>
          </div>

          {editable && (
            <div className="flex items-center gap-2 print:hidden">
              <button
                type="button"
                onClick={handleRecalculate}
                disabled={busy !== null}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 shadow-2xs transition disabled:opacity-50"
              >
                <Calculator className="h-3.5 w-3.5 text-zinc-500" />
                {busy === "calc" ? "Menghitung..." : rab ? "Hitung ulang dari desain" : "Hitung dari desain"}
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={busy !== null}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 shadow-2xs transition disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5 text-zinc-500" />
                {busy === "save" ? "Menyimpan..." : "Simpan draft"}
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F7] border-b border-zinc-100 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider print:border-zinc-200 print:text-[9px]">
              <tr>
                <th className="py-3 px-6 w-1/4 print:px-3 print:py-2">Bahan / jasa</th>
                <th className="py-3 px-4 w-1/4 print:px-2 print:py-2">Spesifikasi</th>
                <th className="py-3 px-3 text-center w-20 print:px-2 print:py-2">Jumlah</th>
                <th className="py-3 px-3 text-center w-28 print:px-2 print:py-2">Satuan</th>
                <th className="py-3 px-4 text-right w-36 print:px-2 print:py-2">Harga satuan (Rp)</th>
                <th className="py-3 px-6 text-right w-36 print:px-3 print:py-2">Subtotal (Rp)</th>
                <th className="py-3 px-3 w-10 print:hidden"></th>
              </tr>
            </thead>

            {/* SECTION 1: Otomatis dari desain klien */}
            <tbody className="divide-y divide-zinc-100/70 border-b border-zinc-100 print:divide-zinc-200">
              {groupHeader("Dari desain klien", "Otomatis dari cat, furnitur & ukuran yang dipilih klien", `${autoMaterial.length} baris`)}
              {autoMaterial.length === 0
                ? emptyRow(rab ? "Desain klien tidak menghasilkan bahan otomatis." : "RAB belum dihitung dari desain klien.")
                : autoMaterial.map(renderAutoRow)}
            </tbody>

            {/* SECTION 2: Tambahan admin */}
            <tbody className="divide-y divide-zinc-100/70 border-b border-zinc-100 print:divide-zinc-200">
              {groupHeader("Tambahan admin", "Bahan yang ditambahkan admin secara manual", `${materialRows.length} baris`)}
              {materialRows.length === 0 ? emptyRow("Belum ada bahan tambahan.") : materialRows.map(renderManualRow)}
              {editable && (
                <tr className="print:hidden">
                  <td colSpan={7} className="px-6 py-2.5">
                    <button
                      onClick={() => addRow("material")}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold shadow-2xs transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Tambah baris bahan
                    </button>
                  </td>
                </tr>
              )}
            </tbody>

            {/* SECTION 3: Jasa */}
            <tbody className="divide-y divide-zinc-100/70 border-b border-zinc-100 print:divide-zinc-200">
              {groupHeader("Jasa pengerjaan", "Jasa otomatis dari tarif studio + jasa tambahan admin", `${autoService.length + serviceRows.length} baris`)}
              {autoService.map(renderAutoRow)}
              {serviceRows.map(renderManualRow)}
              {autoService.length + serviceRows.length === 0 && emptyRow("Belum ada jasa.")}
              {editable && (
                <tr className="print:hidden">
                  <td colSpan={7} className="px-6 py-2.5">
                    <button
                      onClick={() => addRow("service")}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold shadow-2xs transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Tambah jasa
                    </button>
                  </td>
                </tr>
              )}
            </tbody>

            {/* SECTION 4: Penyesuaian & pajak */}
            <tbody className="divide-y divide-zinc-100/70 print:divide-zinc-200">
              {groupHeader("Penyesuaian & pajak", "Penyesuaian manual (+ biaya / − diskon), pajak dari pengaturan studio", "2 baris")}
              <tr>
                <td colSpan={2} className="px-6 py-2.5 print:px-3 print:py-1.5">
                  <p className="font-semibold text-zinc-800">Penyesuaian</p>
                </td>
                <td colSpan={3} className="px-4 py-2.5 print:px-2 print:py-1.5">
                  <input
                    type="text"
                    value={adjustmentNote}
                    disabled={!editable}
                    placeholder="Alasan penyesuaian (misal: diskon pelanggan lama)"
                    onChange={(e) => {
                      setHasUnsavedChanges(true);
                      setAdjustmentNote(e.target.value);
                    }}
                    className={`${inputClass} text-zinc-600`}
                  />
                </td>
                <td className="px-6 py-2.5 text-right print:px-3 print:py-1.5">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={formatSignedDots(adjustment)}
                    disabled={!editable}
                    onChange={(e) => {
                      setHasUnsavedChanges(true);
                      setAdjustment(parseSignedDots(e.target.value));
                    }}
                    className={`${inputClass} text-right font-bold text-zinc-900`}
                  />
                </td>
                <td className="print:hidden"></td>
              </tr>
              <tr>
                <td colSpan={5} className="px-6 py-3 print:px-3 print:py-1.5">
                  <p className="font-semibold text-zinc-800">
                    Pajak {Number(rab?.tax_percent ?? 0).toLocaleString("id-ID")}%
                    <span className="ml-2 font-normal text-[11px] text-zinc-400">dari bahan + jasa + penyesuaian</span>
                  </p>
                </td>
                <td className="px-6 py-3 text-right font-bold text-zinc-900 print:px-3 print:py-1.5">
                  {Math.round(totals.tax).toLocaleString("id-ID")}
                </td>
                <td className="print:hidden"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 bg-[#FAF9F7] border-t border-zinc-100 print:px-3 print:py-2">
          <p className="text-xs text-zinc-500 print:text-[10px]">
            <span className="font-bold text-zinc-800">{totalLines} baris</span> · Subtotal = jumlah × harga satuan
          </p>
          {hasUnsavedChanges && <p className="text-xs font-semibold text-amber-700 print:hidden">Ada perubahan yang belum disimpan</p>}
        </div>
      </div>

      {/* Notes & Total */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4 print-avoid-break">
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs flex flex-col justify-between print:border-zinc-300 print:p-4 print:shadow-none">
          <div>
            <h4 className="text-sm font-bold text-zinc-900 mb-2 print:text-xs">Catatan admin</h4>
            <textarea
              rows={4}
              value={adminNotes}
              disabled={!editable}
              onChange={(e) => {
                setHasUnsavedChanges(true);
                setAdminNotes(e.target.value);
              }}
              placeholder="Catatan internal untuk RAB ini: kebutuhan material, survei lokasi, dsb."
              className="w-full rounded-xl border border-zinc-200 bg-[#FAF9F7] p-3.5 text-xs text-zinc-800 outline-none transition focus:border-[#2C4A3B] resize-none leading-relaxed disabled:text-zinc-500 print:border-zinc-200 print:bg-transparent print:p-2"
            />
          </div>
          <div className="flex items-start gap-2.5 mt-4 pt-4 border-t border-zinc-100 text-[11px] text-zinc-500 print:border-zinc-200 print:mt-2 print:pt-2 print:text-[9px]">
            <Info className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
            <span>
              Catatan dan RAB hanya terlihat oleh tim admin. Klien menerima hasil akhir lewat laporan PDF setelah RAB
              disetujui dan dikonfirmasi.
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-[#1E372A] p-6 text-white flex flex-col justify-between shadow-md min-h-60 print:p-4 print:min-h-0">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-white/80 print:text-[10px]">Nilai proyek</span>
              <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90 print:text-[8px]">
                {hasUnsavedChanges ? "Belum disimpan" : rab ? "Tersimpan" : "Belum dihitung"}
              </span>
            </div>
            <h3 className="text-3xl font-extrabold tracking-tight mt-1 mb-4 text-white print:text-xl print:mb-2">
              {formatRupiah(Math.round(totals.grandTotal))}
            </h3>
            <div className="space-y-1.5 text-xs border-t border-white/15 pt-4 print:pt-2 print:space-y-1 print:text-[10px]">
              {[
                ["Bahan", totals.material],
                ["Jasa", totals.service],
                ["Penyesuaian", adjustment],
                ["Pajak", totals.tax],
              ].map(([label, value]) => (
                <div key={label as string} className="flex justify-between text-white/80">
                  <span>{label}</span>
                  <span className="font-bold text-white">{formatRupiah(Math.round(value as number))}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shadow-2xs print:hidden">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600 shrink-0">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900">
              {canSubmit ? "Siap diajukan?" : `Status: ${getStatusLabel(order.status)}`}
            </p>
            <p className="text-xs text-zinc-500">
              {canSubmit
                ? "Perubahan disimpan otomatis sebelum status diubah. Setelah dikirim, RAB menunggu persetujuan super admin."
                : "Cetak rincian RAB atau kembali ke daftar pesanan."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 shadow-2xs transition"
          >
            <Printer className="h-3.5 w-3.5" />
            Cetak RAB
          </button>
          {editable && order.status === "admin_processing" && (
            <button
              onClick={handleMarkDraft}
              disabled={busy !== null}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#2C4A3B] bg-white border border-[#2C4A3B]/40 rounded-lg hover:bg-[#E8EDEA] transition disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              {busy === "draft" ? "Memproses..." : "Simpan sebagai Draft RAB"}
            </button>
          )}
          {canSubmit && (
            <button
              onClick={handleSendForApproval}
              disabled={busy !== null}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2C4A3B] hover:bg-[#233A2E] rounded-lg shadow-sm transition disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              {busy === "submit" ? "Mengirim..." : "Kirim untuk persetujuan"}
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-400 pt-4 border-t border-zinc-200/50 print:pt-2 print:text-[10px]">
        <p>Renovin. · Ruang kerja studio interior</p>
        {rab?.updated_at && <p>RAB terakhir diubah {formatTanggalWaktu(rab.updated_at)}</p>}
      </div>
    </div>
  );
}
