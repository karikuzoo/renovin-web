"use client";

import { useState } from "react";
import { CheckCircle2, Download, FileText, Loader2, RefreshCw } from "lucide-react";
import { useConfirm } from "@/components/confirm-dialog";
import { formatTanggalWaktu } from "@/lib/orders";
import {
  canManageReport,
  generateReport,
  getReportUrl,
  markCompleted,
  type ProjectStatus,
  type ReportInfo,
  type UserRole,
} from "@/lib/rab";

// Kontrak: renovin-backend/docs/contract-laporan-pdf.md

interface ReportPanelProps {
  projectId: string;
  orderCode: string;
  status: ProjectStatus;
  role: UserRole | null;
  report: ReportInfo | null;
  onDone: (message: string) => void;
  onError: (prefix: string, err: unknown) => void;
}

export function ReportPanel({ projectId, orderCode, status, role, report, onDone, onError }: ReportPanelProps) {
  const [busy, setBusy] = useState<null | "generate" | "download" | "complete">(null);
  const [confirm, confirmDialog] = useConfirm();

  if (!canManageReport(status, role)) return null;

  const handleGenerate = async (regenerate: boolean) => {
    if (
      regenerate &&
      !(await confirm({
        title: "Buat ulang laporan PDF?",
        message:
          "PDF lama diganti dengan versi baru. Angka RAB tetap sama (diambil dari snapshot final); yang bisa berubah hanya kop studio seperti logo dan alamat.",
        confirmLabel: "Buat ulang",
      }))
    )
      return;
    setBusy("generate");
    try {
      await generateReport(projectId);
      onDone(regenerate ? "Laporan PDF berhasil dibuat ulang." : "Laporan PDF berhasil dibuat. Status pesanan menjadi Laporan dibuat.");
    } catch (err) {
      onError("Gagal membuat laporan", err);
    } finally {
      setBusy(null);
    }
  };

  const handleDownload = async () => {
    if (!report) return;
    // Tab dibuka langsung saat klik (supaya tidak diblokir sebagai pop-up), lalu diarahkan ke file
    const tab = window.open("about:blank", "_blank");
    setBusy("download");
    try {
      const url = await getReportUrl(report.pdf_url, `RAB-${orderCode}.pdf`);
      if (tab) tab.location.href = url;
      else window.location.assign(url);
    } catch (err) {
      tab?.close();
      onError("Gagal mengunduh laporan", err);
    } finally {
      setBusy(null);
    }
  };

  const handleComplete = async () => {
    if (
      !(await confirm({
        title: "Tandai pesanan selesai?",
        message: "Pesanan akan dipindah ke tab Selesai. Pastikan laporan sudah diterima klien dan pekerjaan sudah tuntas.",
        confirmLabel: "Tandai selesai",
      }))
    )
      return;
    setBusy("complete");
    try {
      await markCompleted(projectId);
      onDone("Pesanan ditandai selesai.");
    } catch (err) {
      onError("Gagal menandai selesai", err);
    } finally {
      setBusy(null);
    }
  };

  const btn =
    "flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition disabled:opacity-50";

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs space-y-4 print:hidden">
      {confirmDialog}
      <div className="flex items-center gap-2.5">
        <FileText className="h-4 w-4 text-zinc-500" />
        <h3 className="text-lg font-bold text-zinc-900">Laporan PDF</h3>
      </div>

      {status === "confirmed" && (
        <div className="rounded-xl border border-[#2C4A3B]/20 bg-[#F4F7F5] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-900">RAB sudah dikonfirmasi final.</p>
            <p className="text-xs text-zinc-600">
              Buat laporan PDF dari snapshot final. Laporan ini juga yang diterima klien di aplikasi.
            </p>
          </div>
          <button
            onClick={() => handleGenerate(false)}
            disabled={busy !== null}
            className={`${btn} self-start bg-[#2C4A3B] text-white hover:bg-[#233A2E]`}
          >
            {busy === "generate" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
            {busy === "generate" ? "Membuat PDF..." : "Buat laporan PDF"}
          </button>
        </div>
      )}

      {(status === "report_generated" || status === "completed") && (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-zinc-900">
              {status === "completed" ? "Pesanan sudah selesai." : "Laporan PDF sudah dibuat."}
            </p>
            <p className="text-xs text-zinc-500">
              {report ? `Dibuat ${formatTanggalWaktu(report.generated_at)}` : "File laporan tidak ditemukan."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {report && (
              <button
                onClick={handleDownload}
                disabled={busy !== null}
                className={`${btn} border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50`}
              >
                <Download className="h-3.5 w-3.5" />
                {busy === "download" ? "Membuka..." : "Unduh PDF"}
              </button>
            )}
            {status === "report_generated" && (
              <>
                <button
                  onClick={() => handleGenerate(true)}
                  disabled={busy !== null}
                  className={`${btn} border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50`}
                >
                  {busy === "generate" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  {busy === "generate" ? "Membuat ulang..." : "Buat ulang PDF"}
                </button>
                <button
                  onClick={handleComplete}
                  disabled={busy !== null}
                  className={`${btn} bg-[#2C4A3B] text-white hover:bg-[#233A2E]`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {busy === "complete" ? "Memproses..." : "Tandai selesai"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
