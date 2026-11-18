"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Lock, Plus, Trash2, Wallet } from "lucide-react";
import { useConfirm } from "@/components/confirm-dialog";
import { formatRupiah, formatTanggal } from "@/lib/orders";
import {
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUS_STYLE,
  SCHEME_HINT,
  SCHEME_LABEL,
  canEditPlan,
  defaultInstallments,
  defaultLabel,
  fetchPayment,
  previewAmounts,
  savePaymentPlan,
  setInstallmentPaid,
  type DraftInstallment,
  type Installment,
  type PaymentPlan,
  type PaymentScheme,
  type PaymentStatus,
} from "@/lib/payments";

// Kontrak: renovin-backend/docs/contract-pembayaran.md
// Skema pembayaran per pesanan: admin menetapkan sebelum konfirmasi final, lalu mencatat pembayaran yang diterima.

const SCHEMES: PaymentScheme[] = ["full", "dp", "termin", "progress"];

const inputClass =
  "w-full rounded-md border border-zinc-200 px-2.5 py-2 text-xs text-zinc-900 outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B]";

const todayWib = () => new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10);

interface PaymentPanelProps {
  projectId: string;
  status: string;
  isStaff: boolean;
  // Total RAB terbaru (untuk pratinjau nominal sebelum dikunci); null kalau RAB belum dihitung
  rabTotal: number | null;
  onDone: (message: string) => void;
  onError: (prefix: string, err: unknown) => void;
}

function toDraft(rows: Installment[]): DraftInstallment[] {
  return rows.map((r) => ({ label: r.label, percent: String(Number(r.percent)), due_date: r.due_date ?? "", milestone: r.milestone ?? "" }));
}

export function PaymentPanel({ projectId, status, isStaff, rabTotal, onDone, onError }: PaymentPanelProps) {
  const [plan, setPlan] = useState<PaymentPlan | null>(null);
  const [rows, setRows] = useState<Installment[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [editing, setEditing] = useState(false);
  const [scheme, setScheme] = useState<PaymentScheme>("dp");
  const [draft, setDraft] = useState<DraftInstallment[]>(defaultInstallments("dp"));
  const [saving, setSaving] = useState(false);

  const [payingId, setPayingId] = useState<string | null>(null);
  const [paidAt, setPaidAt] = useState(todayWib());
  const [paidNote, setPaidNote] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirm, confirmDialog] = useConfirm();

  useEffect(() => {
    let ignore = false;
    fetchPayment(projectId)
      .then((d) => {
        if (ignore) return;
        setPlan(d.plan);
        setRows(d.installments);
        setLoaded(true);
      })
      .catch((err: unknown) => {
        if (!ignore) onError("Gagal memuat skema pembayaran", err);
      });
    return () => {
      ignore = true;
    };
    // onError dari induk berubah tiap render; cukup muat ulang saat pesanan/kunci berubah
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, reloadKey]);

  if (!isStaff || status === "rejected" || status === "draft" || status === "ready_to_submit") return null;

  const locked = !!plan?.locked_at;
  const editable = canEditPlan(status, plan) && status !== "sent_to_admin";
  const legacy = !locked && ["confirmed", "report_generated", "completed"].includes(status);
  const total = locked ? Number(plan?.total_amount) : rabTotal;

  const startEdit = () => {
    const s = plan?.scheme ?? plan?.requested_scheme ?? "dp";
    setScheme(s);
    setDraft(plan?.scheme && rows.length ? toDraft(rows) : defaultInstallments(s));
    setEditing(true);
  };

  const pickScheme = (s: PaymentScheme) => {
    setScheme(s);
    setDraft(plan?.scheme === s && rows.length ? toDraft(rows) : defaultInstallments(s));
  };

  const setRow = (i: number, patch: Partial<DraftInstallment>) => setDraft((d) => d.map((r, k) => (k === i ? { ...r, ...patch } : r)));

  const percents = draft.map((r) => Number(r.percent.replace(",", ".")) || 0);
  const sum = Math.round(percents.reduce((a, b) => a + b, 0) * 100) / 100;
  const preview = previewAmounts(percents, rabTotal);
  const canAddRow = (scheme === "termin" || scheme === "progress") && draft.length < 4;
  const canRemoveRow = (scheme === "termin" || scheme === "progress") && draft.length > 2;

  // Pesan bantu di form; aturan sebenarnya dicek database
  const hint =
    sum !== 100
      ? `Total ${sum}% — harus 100%.`
      : scheme !== "full" && percents[0] < 30
        ? "Pembayaran pertama minimal 30%."
        : null;

  const handleSave = async () => {
    if (
      legacy &&
      !(await confirm({
        title: "Simpan dan kunci skema?",
        message: "Pesanan ini sudah dikonfirmasi final, jadi skema langsung dikunci dan nominalnya dihitung dari total RAB. Setelah itu skema tidak bisa diubah.",
        confirmLabel: "Simpan & kunci",
      }))
    )
      return;
    setSaving(true);
    try {
      await savePaymentPlan(projectId, scheme, draft);
      setEditing(false);
      setReloadKey((k) => k + 1);
      onDone(legacy ? "Skema pembayaran disimpan dan dikunci." : "Skema pembayaran disimpan.");
    } catch (err) {
      onError("Gagal menyimpan skema", err);
    } finally {
      setSaving(false);
    }
  };

  const handlePaid = async (row: Installment) => {
    setBusyId(row.id);
    try {
      await setInstallmentPaid(row.id, true, paidAt, paidNote);
      setPayingId(null);
      setReloadKey((k) => k + 1);
      onDone(`Pembayaran ${row.label} dicatat. Klien mendapat notifikasi.`);
    } catch (err) {
      onError("Gagal mencatat pembayaran", err);
    } finally {
      setBusyId(null);
    }
  };

  const handleUnpaid = async (row: Installment) => {
    if (
      !(await confirm({
        title: `Batalkan tanda dibayar ${row.label}?`,
        message: "Pakai ini kalau pembayaran tercatat karena salah klik. Tanggal dan catatan pembayaran akan dihapus.",
        confirmLabel: "Batalkan tanda",
        tone: "danger",
      }))
    )
      return;
    setBusyId(row.id);
    try {
      await setInstallmentPaid(row.id, false);
      setReloadKey((k) => k + 1);
      onDone(`Tanda dibayar ${row.label} dibatalkan.`);
    } catch (err) {
      onError("Gagal membatalkan", err);
    } finally {
      setBusyId(null);
    }
  };

  const paidRows = rows.filter((r) => r.paid_at);
  const paidAmount = paidRows.reduce((a, r) => a + Number(r.amount ?? 0), 0);
  const payStatus: PaymentStatus = !plan?.scheme
    ? "no_plan"
    : !locked
      ? "planned"
      : paidRows.length === 0
        ? "unpaid"
        : paidRows.length < rows.length
          ? "partial"
          : "paid";

  const btn = "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-50";

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs space-y-4 print:hidden">
      {confirmDialog}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Wallet className="h-4 w-4 text-zinc-500" />
          <h3 className="text-lg font-bold text-zinc-900">Skema pembayaran</h3>
          {locked && <Lock className="h-3.5 w-3.5 text-zinc-400" aria-label="Dikunci" />}
        </div>
        {loaded && (
          <span className={`text-xs font-bold ${PAYMENT_STATUS_STYLE[payStatus]}`}>
            {PAYMENT_STATUS_LABEL[payStatus]}
            {plan?.scheme ? ` · ${SCHEME_LABEL[plan.scheme]}` : ""}
          </span>
        )}
      </div>

      {!loaded ? (
        <p className="text-sm text-zinc-500">Memuat…</p>
      ) : (
        <>
          {plan?.requested_scheme && !locked && (
            <div className="rounded-xl bg-[#F4F1ED] p-3 text-xs text-zinc-700">
              <span className="font-semibold">Permintaan klien:</span> {SCHEME_LABEL[plan.requested_scheme]}
              {plan.requested_note && <span className="text-zinc-500"> — “{plan.requested_note}”</span>}
            </div>
          )}

          {status === "sent_to_admin" && (
            <p className="text-sm text-zinc-500">Terima pesanan dulu, lalu tetapkan skema pembayaran bersama RAB.</p>
          )}

          {/* Belum ada skema / mode edit */}
          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {SCHEMES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => pickScheme(s)}
                    className={`rounded-lg border px-3 py-2 text-left text-xs font-semibold ${
                      scheme === s ? "border-[#2C4A3B] bg-[#E8EDEA] text-[#2C4A3B]" : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                    }`}
                  >
                    {SCHEME_LABEL[s]}
                    {plan?.requested_scheme === s && <span className="block text-[10px] font-normal text-zinc-500">Diminta klien</span>}
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-500">{SCHEME_HINT[scheme]}</p>

              <div className="space-y-2">
                {draft.map((r, i) => (
                  <div key={i} className="grid grid-cols-12 items-center gap-2">
                    <input
                      value={r.label}
                      onChange={(e) => setRow(i, { label: e.target.value })}
                      placeholder={defaultLabel(scheme, i)}
                      maxLength={60}
                      className={`${inputClass} col-span-6 sm:col-span-3`}
                    />
                    <div className="relative col-span-6 sm:col-span-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={r.percent}
                        disabled={scheme === "full"}
                        onChange={(e) => setRow(i, { percent: e.target.value })}
                        className={`${inputClass} pr-6 disabled:bg-zinc-50`}
                      />
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400">%</span>
                    </div>
                    {scheme === "termin" ? (
                      <input
                        type="date"
                        value={r.due_date}
                        onChange={(e) => setRow(i, { due_date: e.target.value })}
                        className={`${inputClass} col-span-8 sm:col-span-4`}
                      />
                    ) : scheme === "progress" ? (
                      <input
                        value={r.milestone}
                        onChange={(e) => setRow(i, { milestone: e.target.value })}
                        placeholder="Tahap pekerjaan, mis. setelah bongkar selesai"
                        maxLength={120}
                        className={`${inputClass} col-span-8 sm:col-span-4`}
                      />
                    ) : (
                      <span className="col-span-8 sm:col-span-4 text-xs text-zinc-400">{i === 0 && scheme === "dp" ? "Saat konfirmasi" : "Saat selesai"}</span>
                    )}
                    <span className="col-span-3 sm:col-span-2 text-right text-xs font-semibold text-zinc-700 whitespace-nowrap">
                      {preview[i] === null ? "—" : formatRupiah(preview[i])}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDraft((d) => d.filter((_, k) => k !== i))}
                      disabled={!canRemoveRow}
                      title="Hapus baris"
                      className="col-span-1 flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-red-600 disabled:invisible"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {canAddRow && (
                    <button
                      type="button"
                      onClick={() =>
                        setDraft((d) => [...d, { label: "", percent: "", due_date: "", milestone: "" }])
                      }
                      className={`${btn} border border-zinc-200 text-zinc-700 hover:bg-zinc-50`}
                    >
                      <Plus className="h-3.5 w-3.5" /> Tambah pembayaran
                    </button>
                  )}
                  <span className={`text-xs font-semibold ${hint ? "text-red-600" : "text-green-700"}`}>
                    {hint ?? `Total 100%${rabTotal !== null ? ` · ${formatRupiah(rabTotal)}` : ""}`}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    disabled={saving}
                    className={`${btn} border border-zinc-200 text-zinc-700 hover:bg-zinc-50`}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !!hint}
                    className={`${btn} bg-[#2C4A3B] text-white hover:bg-[#233A2E]`}
                  >
                    {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {legacy ? "Simpan & kunci" : "Simpan skema"}
                  </button>
                </div>
              </div>
              {rabTotal === null && <p className="text-[11px] text-zinc-400">Nominal muncul setelah RAB dihitung.</p>}
            </div>
          ) : !plan?.scheme ? (
            editable && (
              <div className="flex flex-col gap-3 rounded-xl border border-dashed border-zinc-300 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-zinc-600">
                  Belum ada skema pembayaran. {legacy ? "Pesanan ini dikonfirmasi sebelum fitur skema ada." : "Wajib diisi sebelum konfirmasi final."}
                </p>
                <button type="button" onClick={startEdit} className={`${btn} self-start bg-[#2C4A3B] text-white hover:bg-[#233A2E]`}>
                  Tetapkan skema
                </button>
              </div>
            )
          ) : (
            /* Skema ada: tabel baris */
            <div className="space-y-3">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-xs [&_th]:whitespace-nowrap">
                  <thead className="border-b border-zinc-100 text-[11px] uppercase tracking-wider text-zinc-400">
                    <tr>
                      <th className="py-2 pr-3 font-semibold">Pembayaran</th>
                      <th className="py-2 pr-3 font-semibold">Patokan</th>
                      <th className="py-2 pr-3 text-right font-semibold">Persen</th>
                      <th className="py-2 pr-3 text-right font-semibold">Nominal</th>
                      <th className="py-2 text-right font-semibold">{locked ? "Status" : ""}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {rows.map((r, i) => {
                      const amount = locked ? Number(r.amount) : previewAmounts(rows.map((x) => Number(x.percent)), rabTotal)[i];
                      return (
                        <tr key={r.id} className="align-top">
                          <td className="py-2.5 pr-3 font-semibold text-zinc-900">{r.label}</td>
                          <td className="py-2.5 pr-3 text-zinc-600">
                            {r.due_date ? `Jatuh tempo ${formatTanggal(r.due_date)}` : r.milestone ?? "—"}
                          </td>
                          <td className="py-2.5 pr-3 text-right text-zinc-700">{Number(r.percent)}%</td>
                          <td className="py-2.5 pr-3 text-right font-semibold text-zinc-900 whitespace-nowrap">
                            {amount === null ? "—" : formatRupiah(amount)}
                          </td>
                          <td className="py-2.5 text-right">
                            {!locked ? null : r.paid_at ? (
                              <div className="flex flex-col items-end gap-0.5">
                                <span className="inline-flex items-center gap-1 font-semibold text-green-700 whitespace-nowrap">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Dibayar {formatTanggal(r.paid_at)}
                                </span>
                                {r.paid_note && <span className="text-[10px] text-zinc-500">{r.paid_note}</span>}
                                <button
                                  type="button"
                                  onClick={() => handleUnpaid(r)}
                                  disabled={busyId !== null}
                                  className="text-[10px] font-semibold text-zinc-400 hover:text-red-600"
                                >
                                  Batalkan tanda
                                </button>
                              </div>
                            ) : payingId === r.id ? (
                              <div className="flex flex-col items-end gap-1.5">
                                <input
                                  type="date"
                                  value={paidAt}
                                  max={todayWib()}
                                  onChange={(e) => setPaidAt(e.target.value)}
                                  className={`${inputClass} w-36`}
                                />
                                <input
                                  value={paidNote}
                                  onChange={(e) => setPaidNote(e.target.value)}
                                  placeholder="Catatan, mis. transfer BCA"
                                  maxLength={300}
                                  className={`${inputClass} w-36`}
                                />
                                <div className="flex gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setPayingId(null)}
                                    className="rounded-md px-2 py-1 text-[11px] font-semibold text-zinc-500 hover:bg-zinc-100"
                                  >
                                    Batal
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handlePaid(r)}
                                    disabled={busyId !== null}
                                    className="rounded-md bg-[#2C4A3B] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#233A2E] disabled:opacity-50"
                                  >
                                    {busyId === r.id ? "Menyimpan…" : "Simpan"}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              isStaff && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPayingId(r.id);
                                    setPaidAt(todayWib());
                                    setPaidNote("");
                                  }}
                                  className="rounded-md border border-zinc-200 px-2.5 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50 whitespace-nowrap"
                                >
                                  Tandai dibayar
                                </button>
                              )
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-3 text-xs">
                {locked ? (
                  <p className="text-zinc-600">
                    Diterima <span className="font-bold text-zinc-900">{formatRupiah(paidAmount)}</span> dari {formatRupiah(total)} · sisa{" "}
                    <span className="font-bold text-zinc-900">{formatRupiah((total ?? 0) - paidAmount)}</span>
                  </p>
                ) : (
                  <p className="text-zinc-500">
                    Nominal mengikuti total RAB terbaru dan dikunci saat konfirmasi final.
                  </p>
                )}
                {editable && (
                  <button type="button" onClick={startEdit} className={`${btn} border border-zinc-200 text-zinc-700 hover:bg-zinc-50`}>
                    Ubah skema
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
