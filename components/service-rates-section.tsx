"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useConfirm } from "@/components/confirm-dialog";
import { formatRupiah } from "@/lib/orders";
import {
  APPLIES_LABEL,
  CALC_LABEL,
  emptyRateForm,
  fetchServiceRates,
  saveServiceRate,
  setServiceRateActive,
  type CalcType,
  type ProductType,
  type RateForm,
  type ServiceRate,
} from "@/lib/service-rates";

// Tabel tarif jasa di Pengaturan → Harga & pajak (contract-tarif-jasa.md).
// Super admin: tambah, ubah, nonaktifkan. Admin: baca saja.

const inputClass =
  "w-full rounded-md border border-zinc-200 px-2.5 py-2 text-xs text-zinc-900 outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B]";

function RateEditor({
  initial,
  saving,
  onCancel,
  onSave,
}: {
  initial: RateForm;
  saving: boolean;
  onCancel: () => void;
  onSave: (form: RateForm) => void;
}) {
  const [form, setForm] = useState(initial);
  const set = <K extends keyof RateForm>(k: K, v: RateForm[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-[#2C4A3B]/20 bg-[#F4F7F5] p-4 sm:grid-cols-12 sm:items-end">
      <div className="space-y-1 sm:col-span-4">
        <label className="text-[11px] font-bold text-zinc-700">Nama jasa</label>
        <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Jasa bongkar" maxLength={80} className={inputClass} />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <label className="text-[11px] font-bold text-zinc-700">Hitungan</label>
        <select value={form.calc_type} onChange={(e) => set("calc_type", e.target.value as CalcType)} className={`${inputClass} bg-white`}>
          <option value="flat">Per paket</option>
          <option value="per_m2">Per m²</option>
        </select>
      </div>
      <div className="space-y-1 sm:col-span-2">
        <label className="text-[11px] font-bold text-zinc-700">Luas dari</label>
        <select
          value={form.applies_to}
          disabled={form.calc_type !== "per_m2"}
          onChange={(e) => set("applies_to", e.target.value as ProductType | "")}
          className={`${inputClass} bg-white disabled:bg-zinc-50 disabled:text-zinc-400`}
        >
          <option value="">{form.calc_type === "per_m2" ? "Pilih bahan" : "—"}</option>
          {(Object.keys(APPLIES_LABEL) as ProductType[]).map((t) => (
            <option key={t} value={t}>
              {APPLIES_LABEL[t]}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1 sm:col-span-2">
        <label className="text-[11px] font-bold text-zinc-700">Tarif (Rp)</label>
        <input type="number" min="0" step="1" value={form.rate} onChange={(e) => set("rate", e.target.value)} className={inputClass} />
      </div>
      <div className="flex gap-2 sm:col-span-2 sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={() => onSave(form)}
          disabled={saving}
          className="rounded-md bg-[#2C4A3B] px-3 py-2 text-xs font-semibold text-white hover:bg-[#233A2E] disabled:opacity-50"
        >
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
      </div>
    </div>
  );
}

export function ServiceRatesSection({
  isSuperAdmin,
  onMessage,
}: {
  isSuperAdmin: boolean;
  onMessage: (type: "success" | "error", text: string) => void;
}) {
  const [rates, setRates] = useState<ServiceRate[] | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirm, confirmDialog] = useConfirm();

  useEffect(() => {
    let ignore = false;
    fetchServiceRates()
      .then((r) => {
        if (!ignore) setRates(r);
      })
      .catch((err: unknown) => {
        if (!ignore) onMessage("error", "Gagal memuat tarif jasa: " + (err instanceof Error ? err.message : ""));
      });
    return () => {
      ignore = true;
    };
    // onMessage dari induk berubah tiap render; cukup muat ulang saat reloadKey berubah
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  const save = async (id: string | null, form: RateForm) => {
    setSaving(true);
    try {
      await saveServiceRate(id, form);
      setEditing(null);
      setReloadKey((k) => k + 1);
      onMessage("success", id ? "Tarif jasa diperbarui." : "Tarif jasa ditambahkan.");
    } catch (err) {
      onMessage("error", err instanceof Error ? err.message : "Gagal menyimpan tarif.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (r: ServiceRate) => {
    if (
      r.active &&
      !(await confirm({
        title: `Nonaktifkan ${r.name}?`,
        message: "Jasa ini tidak lagi ditambahkan ke RAB yang dihitung setelahnya. RAB yang sudah ada tidak berubah, dan tarif bisa diaktifkan lagi.",
        confirmLabel: "Nonaktifkan",
        tone: "danger",
      }))
    )
      return;
    try {
      await setServiceRateActive(r.id, !r.active);
      setReloadKey((k) => k + 1);
      onMessage("success", `${r.name} ${r.active ? "dinonaktifkan" : "diaktifkan lagi"}.`);
    } catch (err) {
      onMessage("error", err instanceof Error ? err.message : "Gagal mengubah status tarif.");
    }
  };

  const toForm = (r: ServiceRate): RateForm => ({
    code: r.code,
    name: r.name,
    calc_type: r.calc_type,
    applies_to: r.applies_to ?? "",
    rate: String(r.rate),
  });

  return (
    <div className="space-y-4">
      {confirmDialog}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-900">Tarif jasa</h3>
          <p className="text-xs text-zinc-500">
            Ditambahkan otomatis ke RAB saat dihitung. Perubahan berlaku untuk RAB yang dihitung setelahnya.
          </p>
        </div>
        {isSuperAdmin && editing === null && (
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            <Plus className="h-3.5 w-3.5" /> Tambah tarif
          </button>
        )}
      </div>

      {editing === "new" && <RateEditor initial={emptyRateForm} saving={saving} onCancel={() => setEditing(null)} onSave={(f) => save(null, f)} />}

      {!rates ? (
        <p className="text-sm text-zinc-500">Memuat tarif…</p>
      ) : rates.length === 0 ? (
        <p className="text-sm text-zinc-500">Belum ada tarif jasa.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-xs [&_th]:whitespace-nowrap">
            <thead className="border-b border-zinc-100 text-[11px] uppercase tracking-wider text-zinc-400">
              <tr>
                <th className="py-2 pr-3 font-semibold">Jasa</th>
                <th className="py-2 pr-3 font-semibold">Hitungan</th>
                <th className="py-2 pr-3 text-right font-semibold">Tarif</th>
                <th className="py-2 pr-3 font-semibold">Status</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rates.map((r) =>
                editing === r.id ? (
                  <tr key={r.id}>
                    <td colSpan={5} className="py-2">
                      <RateEditor initial={toForm(r)} saving={saving} onCancel={() => setEditing(null)} onSave={(f) => save(r.id, f)} />
                    </td>
                  </tr>
                ) : (
                  <tr key={r.id} className={r.active ? "" : "text-zinc-400"}>
                    <td className="py-2.5 pr-3">
                      <p className={`font-semibold ${r.active ? "text-zinc-900" : ""}`}>{r.name}</p>
                      <p className="text-[10px] text-zinc-400">{r.code}</p>
                    </td>
                    <td className="py-2.5 pr-3">
                      {CALC_LABEL[r.calc_type]}
                      {r.calc_type === "per_m2" && r.applies_to && <span className="text-zinc-400"> · luas {APPLIES_LABEL[r.applies_to].toLowerCase()}</span>}
                    </td>
                    <td className={`py-2.5 pr-3 text-right font-semibold whitespace-nowrap ${r.active ? "text-zinc-900" : ""}`}>
                      {formatRupiah(r.rate)}
                      <span className="font-normal text-zinc-400"> / {r.calc_type === "per_m2" ? "m²" : "paket"}</span>
                    </td>
                    <td className="py-2.5 pr-3">
                      <span className={`font-semibold ${r.active ? "text-green-700" : "text-zinc-400"}`}>{r.active ? "Aktif" : "Nonaktif"}</span>
                    </td>
                    <td className="py-2.5 text-right whitespace-nowrap">
                      {isSuperAdmin && editing === null && (
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setEditing(r.id)}
                            className="rounded-md px-2 py-1 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-100"
                          >
                            Ubah
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleActive(r)}
                            className={`rounded-md px-2 py-1 text-[11px] font-semibold hover:bg-zinc-100 ${r.active ? "text-red-600" : "text-[#2C4A3B]"}`}
                          >
                            {r.active ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}
      {!isSuperAdmin && <p className="text-[11px] text-zinc-500">Hanya super admin yang bisa mengubah tarif jasa.</p>}
    </div>
  );
}
