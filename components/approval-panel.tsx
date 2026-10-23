"use client";

import { useState } from "react";
import { CheckCircle2, Gavel, History, RotateCcw, ShieldCheck, XCircle } from "lucide-react";
import { useConfirm } from "@/components/confirm-dialog";
import { formatTanggalWaktu } from "@/lib/orders";
import {
  canConfirmFinal,
  canDecide,
  confirmFinal,
  decideRab,
  type Approval,
  type ApprovalDecision,
  type ProjectStatus,
  type UserRole,
} from "@/lib/rab";

// Kontrak: renovin-backend/docs/contract-persetujuan-rab.md

const DECISION_LABEL: Record<ApprovalDecision, string> = {
  approved: "Disetujui",
  correction: "Perlu koreksi",
  rejected: "Ditolak",
};

const DECISION_STYLE: Record<ApprovalDecision, string> = {
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  correction: "bg-amber-50 text-amber-800 border-amber-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

interface ApprovalPanelProps {
  projectId: string;
  status: ProjectStatus;
  role: UserRole | null;
  approvals: Approval[];
  onDone: (message: string) => void;
  onError: (prefix: string, err: unknown) => void;
}

export function ApprovalPanel({ projectId, status, role, approvals, onDone, onError }: ApprovalPanelProps) {
  const [mode, setMode] = useState<ApprovalDecision | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirm, confirmDialog] = useConfirm();

  const showDecide = canDecide(status, role);
  const showConfirm = canConfirmFinal(status, role);
  if (!showDecide && !showConfirm && approvals.length === 0 && status !== "confirmed") return null;

  const submitDecision = async (decision: ApprovalDecision) => {
    if (
      decision === "rejected" &&
      !(await confirm({
        title: "Tolak RAB ini?",
        message: "Pesanan akan berstatus Ditolak dan tidak bisa dilanjutkan lagi.",
        confirmLabel: "Tolak RAB",
        tone: "danger",
      }))
    )
      return;
    setBusy(true);
    try {
      await decideRab(projectId, decision, note);
      setMode(null);
      setNote("");
      onDone(`RAB ${DECISION_LABEL[decision].toLowerCase()}.`);
    } catch (err) {
      onError("Gagal menyimpan keputusan", err);
    } finally {
      setBusy(false);
    }
  };

  const submitConfirm = async () => {
    if (
      !(await confirm({
        title: "Konfirmasi final RAB?",
        message: "Snapshot final dibuat sebagai dasar laporan, dan RAB tidak bisa diubah lagi.",
        confirmLabel: "Konfirmasi final",
      }))
    )
      return;
    setBusy(true);
    try {
      await confirmFinal(projectId);
      onDone("RAB dikonfirmasi final.");
    } catch (err) {
      onError("Gagal konfirmasi final", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs space-y-5 print:hidden">
      {confirmDialog}
      <div className="flex items-center gap-2.5">
        <Gavel className="h-4 w-4 text-zinc-500" />
        <h3 className="text-lg font-bold text-zinc-900">Persetujuan RAB</h3>
      </div>

      {/* Keputusan super admin */}
      {showDecide && (
        <div className="rounded-xl border border-[#2C4A3B]/20 bg-[#F4F7F5] p-4 space-y-3">
          <p className="text-sm font-semibold text-zinc-900">RAB menunggu keputusan Anda sebagai super admin.</p>
          <p className="text-xs text-zinc-600">
            Periksa rincian di atas. Anda masih bisa merapikan RAB sebelum memutuskan; simpan dulu perubahannya.
          </p>

          {mode && mode !== "approved" ? (
            <div className="space-y-2">
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={mode === "correction" ? "Apa yang perlu dikoreksi admin?" : "Alasan penolakan"}
                className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-xs text-zinc-800 outline-none focus:border-[#2C4A3B] resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => submitDecision(mode)}
                  disabled={busy || !note.trim()}
                  className={`rounded-lg px-4 py-2 text-xs font-semibold text-white disabled:opacity-50 ${
                    mode === "correction" ? "bg-amber-600 hover:bg-amber-700" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {busy ? "Menyimpan..." : mode === "correction" ? "Kirim permintaan koreksi" : "Tolak RAB"}
                </button>
                <button
                  onClick={() => {
                    setMode(null);
                    setNote("");
                  }}
                  disabled={busy}
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Catatan persetujuan (opsional)"
                className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-xs text-zinc-800 outline-none focus:border-[#2C4A3B] resize-none"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => submitDecision("approved")}
                  disabled={busy}
                  className="flex items-center gap-1.5 rounded-lg bg-[#2C4A3B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#233A2E] disabled:opacity-50"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {busy ? "Menyimpan..." : "Setujui RAB"}
                </button>
                <button
                  onClick={() => setMode("correction")}
                  disabled={busy}
                  className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-4 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Minta koreksi
                </button>
                <button
                  onClick={() => setMode("rejected")}
                  disabled={busy}
                  className="flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Tolak
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {status === "pending_approval" && !showDecide && (
        <p className="text-xs text-zinc-600">RAB sedang menunggu keputusan super admin.</p>
      )}

      {/* Konfirmasi final */}
      {showConfirm && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-emerald-900">RAB sudah disetujui super admin.</p>
            <p className="text-xs text-emerald-800">
              Konfirmasi final untuk mengunci RAB dan membuat snapshot final sebagai dasar laporan.
            </p>
          </div>
          <button
            onClick={submitConfirm}
            disabled={busy}
            className="flex items-center gap-1.5 self-start rounded-lg bg-[#2C4A3B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#233A2E] disabled:opacity-50"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {busy ? "Memproses..." : "Konfirmasi final"}
          </button>
        </div>
      )}

      {status === "confirmed" && (
        <p className="text-xs text-zinc-600">RAB sudah dikonfirmasi final. Pembuatan laporan PDF menyusul.</p>
      )}

      {/* Riwayat */}
      {approvals.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <History className="h-3.5 w-3.5 text-zinc-400" />
            <p className="text-xs font-bold text-zinc-700">Riwayat keputusan</p>
          </div>
          <ul className="space-y-2">
            {approvals.map((a) => (
              <li key={a.id} className="rounded-lg border border-zinc-100 bg-[#FAF9F7] p-3">
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                  <span className={`rounded-full border px-2 py-0.5 font-semibold ${DECISION_STYLE[a.decision]}`}>
                    {DECISION_LABEL[a.decision]}
                  </span>
                  <span>{a.decided_by_name ?? "Super admin"}</span>
                  <span>·</span>
                  <span>{formatTanggalWaktu(a.decided_at)}</span>
                </div>
                {a.note && <p className="mt-1.5 text-xs text-zinc-700 leading-relaxed">{a.note}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
