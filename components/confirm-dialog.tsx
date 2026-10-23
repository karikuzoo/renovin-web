"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, HelpCircle } from "lucide-react";

// Pengganti window.confirm dengan gaya Renovin, muncul di tengah layar.
//
// Pemakaian:
//   const [confirm, confirmDialog] = useConfirm();
//   if (!(await confirm({ title: "Kirim RAB?", message: "...", confirmLabel: "Kirim" }))) return;
//   ...
//   return (<>{confirmDialog} ...</>);

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (ok: boolean) => void;
}

export function useConfirm(): [(options: ConfirmOptions) => Promise<boolean>, React.ReactNode] {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback(
    (options: ConfirmOptions) => new Promise<boolean>((resolve) => setPending({ ...options, resolve })),
    [],
  );

  const close = useCallback(
    (ok: boolean) => {
      pending?.resolve(ok);
      setPending(null);
    },
    [pending],
  );

  const dialog = pending ? <ConfirmDialog options={pending} onClose={close} /> : null;
  return [confirm, dialog];
}

function ConfirmDialog({ options, onClose }: { options: ConfirmOptions; onClose: (ok: boolean) => void }) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const danger = options.tone === "danger";

  useEffect(() => {
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px] print:hidden"
      onClick={() => onClose(false)}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={options.message ? "confirm-message" : undefined}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              danger ? "bg-red-50 text-red-600" : "bg-[#E8EDEA] text-[#2C4A3B]"
            }`}
          >
            {danger ? <AlertTriangle className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <h2 id="confirm-title" className="text-base font-bold text-zinc-900">
              {options.title}
            </h2>
            {options.message && (
              <p id="confirm-message" className="mt-1.5 text-sm leading-relaxed text-zinc-600">
                {options.message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={() => onClose(false)}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-2xs transition hover:bg-zinc-50"
          >
            {options.cancelLabel ?? "Batal"}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={() => onClose(true)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              danger
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-600"
                : "bg-[#2C4A3B] hover:bg-[#233A2E] focus:ring-[#2C4A3B]"
            }`}
          >
            {options.confirmLabel ?? "Lanjutkan"}
          </button>
        </div>
      </div>
    </div>
  );
}
