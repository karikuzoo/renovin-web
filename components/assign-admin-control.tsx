"use client";

import { useState } from "react";
import { UserCog } from "lucide-react";
import { assignProject, fetchStaff, type StaffMember } from "@/lib/rab";

interface AssignAdminControlProps {
  projectId: string;
  currentAdminId: string | null;
  onAssigned: (adminName: string) => void;
  onError: (err: unknown) => void;
}

// Tombol "Ganti" + dropdown admin untuk memindahkan penanggung jawab pesanan.
// Kontrak: renovin-backend/docs/contract-assign-project.md
export function AssignAdminControl({ projectId, currentAdminId, onAssigned, onError }: AssignAdminControlProps) {
  const [open, setOpen] = useState(false);
  const [staff, setStaff] = useState<StaffMember[] | null>(null);
  const [selected, setSelected] = useState(currentAdminId ?? "");
  const [saving, setSaving] = useState(false);

  const handleOpen = async () => {
    setOpen(true);
    setSelected(currentAdminId ?? "");
    if (staff) return;
    try {
      setStaff(await fetchStaff());
    } catch (err) {
      setOpen(false);
      onError(err);
    }
  };

  const handleSave = async () => {
    if (!selected || selected === currentAdminId) {
      setOpen(false);
      return;
    }
    setSaving(true);
    try {
      await assignProject(projectId, selected);
      const name = staff?.find((s) => s.id === selected)?.full_name ?? "admin baru";
      setOpen(false);
      onAssigned(name);
    } catch (err) {
      onError(err);
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2C4A3B] hover:underline print:hidden"
      >
        <UserCog className="h-3 w-3" />
        Ganti
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-2 print:hidden">
      <select
        value={selected}
        disabled={!staff || saving}
        onChange={(e) => setSelected(e.target.value)}
        className="w-full h-8 rounded-md border border-zinc-200 bg-white px-2 text-xs text-zinc-800 outline-none focus:border-[#2C4A3B]"
      >
        {!staff && <option value="">Memuat daftar admin…</option>}
        {staff && !currentAdminId && <option value="">Pilih admin…</option>}
        {staff?.map((s) => (
          <option key={s.id} value={s.id}>
            {s.full_name ?? "Tanpa nama"} {s.role === "super_admin" ? "(Super Admin)" : ""}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={!staff || saving || !selected}
          className="flex-1 rounded-md bg-[#2C4A3B] px-2 py-1.5 text-[11px] font-semibold text-white hover:bg-[#233A2E] disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={saving}
          className="flex-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-zinc-600 hover:bg-zinc-50"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
