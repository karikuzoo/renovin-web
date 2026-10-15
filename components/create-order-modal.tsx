"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload, Image as ImageIcon, Loader2, User, Home, Maximize2, FileText, CheckCircle2 } from "lucide-react";
import { fetchCustomers, createOrder, type CustomerProfile } from "@/lib/orders";

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const COMMON_ROOM_TYPES = [
  "Ruang Tamu",
  "Ruang Keluarga",
  "Kamar Tidur",
  "Dapur",
  "Ruang Kerja",
  "Kamar Mandi",
  "Komersial / Kantor",
  "Apartemen",
  "Lainnya",
];

export function CreateOrderModal({ isOpen, onClose, onSuccess }: CreateOrderModalProps) {
  const [title, setTitle] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [roomType, setRoomType] = useState("Ruang Tamu");
  const [customRoomType, setCustomRoomType] = useState("");
  const [totalArea, setTotalArea] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [initialStatus, setInitialStatus] = useState<"sent_to_admin" | "admin_processing">("sent_to_admin");

  // Photo upload
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Customers data
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch customers on open
  useEffect(() => {
    if (!isOpen) return;

    let ignore = false;
    fetchCustomers().then((data) => {
      if (!ignore) {
        setCustomers(data);
        if (data.length > 0) {
          setCustomerId((prev) => {
            if (prev) return prev;
            const customerOnly = data.find((c) => c.role === "customer") || data[0];
            return customerOnly.id;
          });
        }
      }
    });

    return () => {
      ignore = true;
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Format foto harus JPG, PNG, atau WebP.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran foto maksimal 10 MB.");
      return;
    }

    setError(null);
    setPhotoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
  };

  const handleRemovePhoto = () => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setTitle("");
    setRoomType("Ruang Tamu");
    setCustomRoomType("");
    setTotalArea("");
    setNotes("");
    setInitialStatus("sent_to_admin");
    handleRemovePhoto();
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Nama pesanan / proyek wajib diisi.");
      return;
    }

    const finalRoomType = roomType === "Lainnya" ? customRoomType.trim() : roomType;

    setIsSubmitting(true);
    setError(null);

    try {
      await createOrder({
        title: title.trim(),
        room_type: finalRoomType || undefined,
        notes: notes.trim() || undefined,
        customer_id: customerId || undefined,
        total_area: totalArea ? parseFloat(totalArea) : undefined,
        photo_file: photoFile,
        status: initialStatus,
      });

      resetForm();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error("Create order failed:", err);
      const message = err instanceof Error ? err.message : "Terjadi kesalahan saat membuat pesanan.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={!isSubmitting ? onClose : undefined}
      />

      {/* Dialog Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden z-10 my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 bg-[#FAF9F7]">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Buat Pesanan Baru</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Input data proyek renovasi baru untuk klien studio Renovin.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-zinc-400 hover:text-zinc-700 rounded-lg p-1.5 hover:bg-zinc-100 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3.5 text-xs text-red-700 flex items-start gap-2">
              <span className="font-bold shrink-0">Gagal:</span>
              <span>{error}</span>
            </div>
          )}

          {/* Project Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
              <Home className="h-3.5 w-3.5 text-zinc-500" />
              Nama / Judul Pesanan Proyek <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Renovasi Ruang Tamu Tebet, Kamar Tidur Utama"
              className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3.5 text-sm outline-none transition focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B] placeholder:text-zinc-400"
            />
          </div>

          {/* Customer Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-zinc-500" />
                Klien / Pelanggan <span className="text-red-500">*</span>
              </span>
              {customers.length === 0 && <span className="text-[11px] text-zinc-400 font-normal">Memuat data klien...</span>}
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B] text-zinc-800"
            >
              {customers.length === 0 ? (
                <option value="">(Belum ada klien terdaftar)</option>
              ) : (
                customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name || "Tanpa Nama"} — {c.email || c.phone || "No kontak"} ({c.role})
                  </option>
                ))
              )}
            </select>
            <p className="text-[11px] text-zinc-400">
              Pilih klien yang memesan proyek. Nama & kontak klien akan otomatis tertaut.
            </p>
          </div>

          {/* Room Type & Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Room Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800">Jenis Ruangan</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none transition focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B] text-zinc-800"
              >
                {COMMON_ROOM_TYPES.map((rt) => (
                  <option key={rt} value={rt}>
                    {rt}
                  </option>
                ))}
              </select>
              {roomType === "Lainnya" && (
                <input
                  type="text"
                  value={customRoomType}
                  onChange={(e) => setCustomRoomType(e.target.value)}
                  placeholder="Ketik jenis ruangan..."
                  className="mt-2 w-full h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs outline-none focus:border-[#2C4A3B]"
                />
              )}
            </div>

            {/* Total Area */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
                <Maximize2 className="h-3.5 w-3.5 text-zinc-500" />
                Estimasi Luas Ruangan (m²)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={totalArea}
                  onChange={(e) => setTotalArea(e.target.value)}
                  placeholder="Contoh: 24"
                  className="w-full h-10 rounded-lg border border-zinc-200 bg-white px-3.5 pr-10 text-sm outline-none transition focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B] placeholder:text-zinc-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400">
                  m²
                </span>
              </div>
            </div>
          </div>

          {/* Notes / Brief */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-zinc-500" />
              Catatan & Kebutuhan Klien
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan renovasi, preferensi gaya (Scandinavian, Japandi, Industrial), palet warna, atau permintaan khusus klien..."
              className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm outline-none transition focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B] placeholder:text-zinc-400 resize-none"
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
              <ImageIcon className="h-3.5 w-3.5 text-zinc-500" />
              Foto Ruangan Saat Ini (Opsional)
            </label>

            {photoPreview ? (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreview} alt="Preview Ruangan" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-red-700 shadow-md transition"
                  >
                    <X className="h-3.5 w-3.5" /> Hapus foto
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-zinc-200 hover:border-[#2C4A3B] rounded-xl p-6 text-center cursor-pointer transition-colors bg-zinc-50/50 hover:bg-zinc-50"
              >
                <div className="flex flex-col items-center justify-center gap-1.5">
                  <div className="h-9 w-9 rounded-full bg-[#E8EDEA] flex items-center justify-center text-[#2C4A3B] mb-1">
                    <Upload className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-semibold text-zinc-800">
                    Klik untuk unggah foto ruangan
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    PNG, JPG, atau WebP (maks. 10 MB)
                  </p>
                </div>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
          </div>

          {/* Initial Status */}
          <div className="space-y-2 pt-2 border-t border-zinc-100">
            <label className="text-xs font-semibold text-zinc-800">Status Awal Pesanan</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  initialStatus === "sent_to_admin"
                    ? "border-[#2C4A3B] bg-[#E8EDEA]/30 ring-1 ring-[#2C4A3B]"
                    : "border-zinc-200 bg-white hover:bg-zinc-50"
                }`}
              >
                <input
                  type="radio"
                  name="initialStatus"
                  value="sent_to_admin"
                  checked={initialStatus === "sent_to_admin"}
                  onChange={() => setInitialStatus("sent_to_admin")}
                  className="mt-1 accent-[#2C4A3B]"
                />
                <div>
                  <p className="text-xs font-bold text-zinc-900 flex items-center gap-1">
                    Pesanan Baru
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Masuk ke antrean tab &quot;Baru&quot; untuk ditinjau dan diterima admin.
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                  initialStatus === "admin_processing"
                    ? "border-[#2C4A3B] bg-[#E8EDEA]/30 ring-1 ring-[#2C4A3B]"
                    : "border-zinc-200 bg-white hover:bg-zinc-50"
                }`}
              >
                <input
                  type="radio"
                  name="initialStatus"
                  value="admin_processing"
                  checked={initialStatus === "admin_processing"}
                  onChange={() => setInitialStatus("admin_processing")}
                  className="mt-1 accent-[#2C4A3B]"
                />
                <div>
                  <p className="text-xs font-bold text-zinc-900 flex items-center gap-1">
                    Langsung Diproses
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    Langsung masuk ke tab &quot;Dikerjakan&quot; dan otomatis ditangani admin.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-100 bg-[#FAF9F7]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#2C4A3B] rounded-lg hover:bg-[#233A2E] shadow-sm transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Buat Pesanan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
