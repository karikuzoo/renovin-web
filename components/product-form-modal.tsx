"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown, ImagePlus, X } from "lucide-react";
import {
  AVAILABILITY_LABEL,
  STATUS_LABEL,
  saveProduct,
  type Availability,
  type CatalogStatus,
  type Category,
  type ProductForm,
} from "@/lib/catalog";

const inputClass =
  "w-full rounded-md border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B] disabled:bg-zinc-50 disabled:text-zinc-500";

const UNITS = ["m2", "pcs", "lembar", "sak", "batang", "liter", "pail", "kg", "set", "meter"];

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-zinc-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-zinc-400">{hint}</p>}
    </div>
  );
}

function Select({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${inputClass} appearance-none pr-10 bg-white`}>
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
    </div>
  );
}

export function ProductFormModal({
  mode,
  productId,
  initial,
  categories,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit" | "duplicate";
  productId: string | null;
  initial: ProductForm;
  categories: Category[];
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [form, setForm] = useState<ProductForm>(initial);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const category = categories.find((c) => c.id === form.category_id);
  const isPaint = category?.type === "paint";
  const isFurniture = category?.type === "furniture";

  const preview = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : form.image_url), [imageFile, form.image_url]);
  useEffect(() => {
    if (!imageFile || !preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [imageFile, preview]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, saving]);

  const set = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) => setForm((f) => ({ ...f, [key]: value }));

  const title = mode === "edit" ? "Edit bahan" : mode === "duplicate" ? "Duplikat bahan" : "Tambah bahan";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await saveProduct(mode === "edit" ? productId : null, form, categories, imageFile);
      onSaved(mode === "edit" ? "Bahan diperbarui." : "Bahan ditambahkan.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan bahan.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={!saving ? onClose : undefined} />

      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden z-10 my-8 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 bg-[#FAF9F7]">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">{title}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Hanya bahan berstatus Terbit yang tampil di aplikasi klien.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-zinc-400 hover:text-zinc-700 rounded-lg p-1.5 hover:bg-zinc-100 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3.5 text-xs text-red-700 flex items-start gap-2">
                <span className="font-bold shrink-0">Gagal:</span>
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-5">
              {/* Gambar */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700">Gambar</label>
                <label className="relative flex h-44 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-zinc-300 bg-[#F4F2EE] hover:border-[#2C4A3B]">
                  {preview ? (
                    <Image src={preview} alt="Pratinjau" fill className="object-cover" unoptimized={!!imageFile} />
                  ) : isPaint && form.color_hex ? (
                    <div className="absolute inset-0" style={{ backgroundColor: form.color_hex }} />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-zinc-400">
                      <ImagePlus className="h-6 w-6" />
                      <span className="text-[11px]">Pilih gambar</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                <p className="text-[11px] text-zinc-400">JPG/PNG/WebP, maks. 5 MB. Diperkecil otomatis.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nama bahan" required>
                  <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass} placeholder="Papan gypsum 9 mm" />
                </Field>
                <Field label="Kode bahan (SKU)" required hint="Unik, disimpan huruf besar">
                  <input value={form.sku} onChange={(e) => set("sku", e.target.value)} className={`${inputClass} uppercase`} placeholder="MAT-010" />
                </Field>
                <Field label="Kategori" required>
                  <Select value={form.category_id} onChange={(v) => set("category_id", v)}>
                    <option value="" disabled>
                      Pilih kategori
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Merek">
                  <input value={form.brand} onChange={(e) => set("brand", e.target.value)} className={inputClass} placeholder="Jayaboard" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Spesifikasi singkat" hint="Satu baris, tampil di kartu katalog">
                    <input value={form.spec} onChange={(e) => set("spec", e.target.value)} className={inputClass} placeholder="9 mm · 120 × 240 cm" maxLength={120} />
                  </Field>
                </div>
              </div>
            </div>

            <Field label="Keterangan">
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={2}
                className={inputClass}
                placeholder="Tepi tapered, untuk plafon interior"
              />
            </Field>

            {isPaint && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nama warna">
                  <input value={form.color_name} onChange={(e) => set("color_name", e.target.value)} className={inputClass} placeholder="Putih Gading" />
                </Field>
                <Field label="Kode warna" required>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={/^#[0-9A-Fa-f]{6}$/.test(form.color_hex) ? form.color_hex : "#ffffff"}
                      onChange={(e) => set("color_hex", e.target.value.toUpperCase())}
                      className="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-zinc-200 bg-white p-1"
                    />
                    <input value={form.color_hex} onChange={(e) => set("color_hex", e.target.value)} className={inputClass} placeholder="#F3EBDD" />
                  </div>
                </Field>
              </div>
            )}

            {(isFurniture || form.width_cm || form.depth_cm || form.height_cm) && (
              <div className="grid grid-cols-3 gap-4">
                <Field label="Lebar (cm)">
                  <input type="number" min="0" step="any" value={form.width_cm} onChange={(e) => set("width_cm", e.target.value)} className={inputClass} />
                </Field>
                <Field label="Kedalaman (cm)">
                  <input type="number" min="0" step="any" value={form.depth_cm} onChange={(e) => set("depth_cm", e.target.value)} className={inputClass} />
                </Field>
                <Field label="Tinggi (cm)">
                  <input type="number" min="0" step="any" value={form.height_cm} onChange={(e) => set("height_cm", e.target.value)} className={inputClass} />
                </Field>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Satuan" required>
                <input list="product-units" value={form.unit} onChange={(e) => set("unit", e.target.value)} className={inputClass} placeholder="lembar" />
                <datalist id="product-units">
                  {UNITS.map((u) => (
                    <option key={u} value={u} />
                  ))}
                </datalist>
              </Field>
              <Field label="Harga klien (Rp)" required hint="Per satuan, dipakai di RAB klien">
                <input type="number" min="0" step="1" value={form.price_customer} onChange={(e) => set("price_customer", e.target.value)} className={inputClass} />
              </Field>
              <Field label="Harga internal (Rp)" hint="Rahasia, tidak terlihat klien">
                <input type="number" min="0" step="1" value={form.price_internal} onChange={(e) => set("price_internal", e.target.value)} className={inputClass} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Status">
                <Select value={form.status} onChange={(v) => set("status", v as CatalogStatus)}>
                  {(Object.keys(STATUS_LABEL) as CatalogStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Ketersediaan">
                <Select value={form.availability} onChange={(v) => set("availability", v as Availability)}>
                  {(Object.keys(AVAILABILITY_LABEL) as Availability[]).map((a) => (
                    <option key={a} value={a}>
                      {AVAILABILITY_LABEL[a]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Catatan ketersediaan">
                <input
                  value={form.availability === "available" ? "" : form.availability_note}
                  onChange={(e) => set("availability_note", e.target.value)}
                  disabled={form.availability === "available"}
                  className={inputClass}
                  placeholder={form.availability === "available" ? "—" : "3–5 hari"}
                  maxLength={80}
                />
              </Field>
            </div>
          </div>

          <div className="sticky bottom-0 flex justify-end gap-3 border-t border-zinc-100 bg-white px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-md border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-[#2C4A3B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#233A2E] disabled:opacity-60"
            >
              {saving ? "Menyimpan…" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
