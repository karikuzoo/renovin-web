"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Check, ChevronDown, Loader2, Lock, MapPin, Upload } from "lucide-react";
import { formatTanggalWaktu } from "@/lib/orders";
import {
  changePassword,
  fetchSettings,
  saveLocale,
  saveMyProfile,
  saveStudioProfile,
  saveTax,
  uploadLogo,
  type LocaleSettings,
  type SettingsData,
  type StudioProfile,
} from "@/lib/settings";

const TIMEZONES = [
  { value: "Asia/Jakarta", label: "WIB - Asia/Jakarta" },
  { value: "Asia/Makassar", label: "WITA - Asia/Makassar" },
  { value: "Asia/Jayapura", label: "WIT - Asia/Jayapura" },
];
const CURRENCIES = [{ value: "IDR", label: "Rupiah (IDR)" }];
const LANGUAGES = [{ value: "id", label: "Bahasa Indonesia" }];

const ROLE_LABEL: Record<string, string> = { super_admin: "Super Admin", admin: "Administrator", customer: "Customer" };

const inputClass =
  "w-full rounded-md border border-zinc-200 px-3 py-2.5 text-sm text-zinc-900 outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B] disabled:bg-zinc-50 disabled:text-zinc-500";

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return (err as { message?: string })?.message ?? "Terjadi kesalahan.";
}

function initials(name: string | null) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return ((parts[0][0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const opts = options.some((o) => o.value === value) ? options : [{ value, label: value }, ...options];
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-zinc-700">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} appearance-none pr-10 bg-white`}
        >
          {opts.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 pointer-events-none" />
      </div>
    </div>
  );
}

export default function Pengaturan() {
  const [loaded, setLoaded] = useState<SettingsData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Isian form
  const [studio, setStudio] = useState<StudioProfile | null>(null);
  const [locale, setLocale] = useState<LocaleSettings | null>(null);
  const [tax, setTax] = useState("");
  const [myName, setMyName] = useState("");
  const [myPhone, setMyPhone] = useState("");

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Ubah kata sandi
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    let ignore = false;
    fetchSettings()
      .then((d) => {
        if (ignore) return;
        setLoaded(d);
        setStudio(d.studio);
        setLocale(d.locale);
        setTax(String(d.taxPercent));
        setMyName(d.me.full_name ?? "");
        setMyPhone(d.me.phone ?? "");
        setLoadError(null);
      })
      .catch((err: unknown) => {
        if (!ignore) setLoadError(errorMessage(err));
      });
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const isSuperAdmin = loaded?.me.role === "super_admin";

  const dirty = useMemo(() => {
    if (!loaded || !studio || !locale) return { studio: false, locale: false, tax: false, me: false, any: false };
    const d = {
      studio: JSON.stringify(studio) !== JSON.stringify(loaded.studio),
      locale: JSON.stringify(locale) !== JSON.stringify(loaded.locale),
      tax: isSuperAdmin && Number(tax) !== loaded.taxPercent,
      me: myName !== (loaded.me.full_name ?? "") || myPhone !== (loaded.me.phone ?? ""),
    };
    return { ...d, any: d.studio || d.locale || d.tax || d.me };
  }, [loaded, studio, locale, tax, myName, myPhone, isSuperAdmin]);

  if (loadError) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-3">
        <h1 className="text-2xl font-bold text-zinc-900">Gagal memuat pengaturan</h1>
        <p className="text-sm text-zinc-500">{loadError}</p>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          Coba lagi
        </button>
      </div>
    );
  }
  if (!loaded || !studio || !locale) {
    return (
      <div className="max-w-7xl mx-auto py-24 text-center text-sm text-zinc-500">
        <Loader2 className="inline h-5 w-5 animate-spin mr-2" />
        Memuat pengaturan…
      </div>
    );
  }

  const setStudioField = (field: keyof StudioProfile, value: string) =>
    setStudio((prev) => (prev ? { ...prev, [field]: value } : prev));

  const handleReset = () => {
    setStudio(loaded.studio);
    setLocale(loaded.locale);
    setTax(String(loaded.taxPercent));
    setMyName(loaded.me.full_name ?? "");
    setMyPhone(loaded.me.phone ?? "");
  };

  const handleSave = async () => {
    const taxNumber = Number(tax.replace(",", "."));
    if (dirty.tax && (!Number.isFinite(taxNumber) || taxNumber < 0 || taxNumber > 100)) {
      setToast({ type: "error", text: "Pajak harus angka 0–100." });
      return;
    }
    setSaving(true);
    try {
      if (dirty.studio) await saveStudioProfile(studio);
      if (dirty.locale) await saveLocale(locale);
      if (dirty.tax) await saveTax(taxNumber);
      if (dirty.me) await saveMyProfile(loaded.me.id, myName, myPhone);
      setToast({ type: "success", text: "Pengaturan berhasil disimpan." });
      setReloadKey((k) => k + 1);
    } catch (err) {
      setToast({ type: "error", text: `Gagal menyimpan: ${errorMessage(err)}` });
    } finally {
      setSaving(false);
    }
  };

  // Logo langsung diunggah & disimpan ke profil studio
  const handleLogoChange = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadLogo(file);
      await saveStudioProfile({ ...loaded.studio, logo_url: url });
      setStudio((prev) => (prev ? { ...prev, logo_url: url } : prev));
      setLoaded((prev) => (prev ? { ...prev, studio: { ...prev.studio, logo_url: url } } : prev));
      setToast({ type: "success", text: "Logo studio berhasil diperbarui." });
    } catch (err) {
      setToast({ type: "error", text: `Gagal mengunggah logo: ${errorMessage(err)}` });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleChangePassword = async () => {
    if (pw.length < 8) {
      setToast({ type: "error", text: "Kata sandi minimal 8 karakter." });
      return;
    }
    if (pw !== pwConfirm) {
      setToast({ type: "error", text: "Konfirmasi kata sandi tidak sama." });
      return;
    }
    setPwSaving(true);
    try {
      await changePassword(pw);
      setPw("");
      setPwConfirm("");
      setPwOpen(false);
      setToast({ type: "success", text: "Kata sandi berhasil diubah." });
    } catch (err) {
      setToast({ type: "error", text: `Gagal mengubah kata sandi: ${errorMessage(err)}` });
    } finally {
      setPwSaving(false);
    }
  };

  const saveButton = (
    <button
      onClick={handleSave}
      disabled={!dirty.any || saving}
      className="flex items-center gap-2 rounded-md bg-[#2C4A3B] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#233A2E] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      {saving ? "Menyimpan..." : "Simpan perubahan"}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 max-w-md rounded-xl border px-4 py-3 text-sm font-medium shadow-xl ${
            toast.type === "success" ? "bg-[#2C4A3B] text-white border-[#233A2E]" : "bg-red-600 text-white border-red-700"
          }`}
        >
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Pengaturan</h1>
          <p className="text-sm text-zinc-500">Sesuaikan identitas studio, akun admin, dan preferensi ruang kerja.</p>
        </div>
        {saveButton}
      </div>

      {/* Tabs (lompat ke bagian) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 overflow-x-auto">
        <div className="flex gap-6">
          <a href="#profil-studio" className="border-b-2 border-[#2C4A3B] pb-3 text-sm font-bold text-zinc-900">
            Profil studio
          </a>
          <a href="#admin-keamanan" className="pb-3 text-sm font-medium text-zinc-500 hover:text-zinc-700">
            Admin & keamanan
          </a>
          <a href="#notifikasi" className="pb-3 text-sm font-medium text-zinc-500 hover:text-zinc-700">
            Notifikasi
          </a>
        </div>
        <div className="pb-3">
          <p className="text-xs text-zinc-400">Pengaturan ruang kerja studio</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profil studio */}
        <div id="profil-studio" className="lg:col-span-8 scroll-mt-24">
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <div className="mb-8">
              <h2 className="text-lg font-bold text-zinc-900 mb-1">Profil studio</h2>
              <p className="text-xs text-zinc-500">Identitas yang tampil pada dokumen pesanan dan informasi klien.</p>
            </div>

            {/* Logo */}
            <div className="flex items-center gap-6 mb-8">
              <div className="h-24 w-40 rounded-lg bg-[#F4F1ED] flex flex-col items-center justify-center p-3 border border-zinc-100 overflow-hidden">
                {studio.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={studio.logo_url} alt="Logo studio" className="max-h-full max-w-full object-contain" />
                ) : (
                  <>
                    <span className="font-serif text-2xl text-[#2C4A3B] leading-none mb-1">Renovin.</span>
                    <span className="text-[8px] font-semibold tracking-widest text-[#2C4A3B]/60 uppercase">Studio Interior</span>
                  </>
                )}
              </div>
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => handleLogoChange(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 mb-2 disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  {uploading ? "Mengunggah..." : "Ubah logo"}
                </button>
                <p className="text-[10px] text-zinc-400">PNG, JPG, WebP, atau SVG · Ukuran maksimal 2 MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700">Nama studio</label>
                <input type="text" value={studio.name} onChange={(e) => setStudioField("name", e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700">Email studio</label>
                <input type="email" value={studio.email ?? ""} placeholder="halo@studio.id" onChange={(e) => setStudioField("email", e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700">Telepon studio</label>
                <input type="text" value={studio.phone ?? ""} placeholder="021 …" onChange={(e) => setStudioField("phone", e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700">Situs web</label>
                <input type="text" value={studio.website ?? ""} placeholder="www.studio.id" onChange={(e) => setStudioField("website", e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <label className="text-xs font-bold text-zinc-700">Alamat studio</label>
              <div className="relative">
                <input type="text" value={studio.address ?? ""} placeholder="Alamat lengkap studio" onChange={(e) => setStudioField("address", e.target.value)} className={`${inputClass} pr-10`} />
                <MapPin className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <SelectField label="Zona waktu" value={locale.timezone} options={TIMEZONES} onChange={(v) => setLocale({ ...locale, timezone: v })} />
              <SelectField label="Mata uang" value={locale.currency} options={CURRENCIES} onChange={(v) => setLocale({ ...locale, currency: v })} />
              <SelectField label="Bahasa antarmuka" value={locale.language} options={LANGUAGES} onChange={(v) => setLocale({ ...locale, language: v })} />
            </div>

            <div className="pt-6 border-t border-zinc-100 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700">Pajak RAB (%)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={tax}
                  disabled={!isSuperAdmin}
                  onChange={(e) => setTax(e.target.value)}
                  className={inputClass}
                />
              </div>
              <p className="text-[11px] text-zinc-500 pb-2.5">
                {isSuperAdmin
                  ? "Dipakai untuk RAB yang dihitung setelah perubahan. RAB yang sudah ada tidak berubah sampai dihitung ulang."
                  : "Hanya super admin yang bisa mengubah pajak."}
              </p>
            </div>
          </div>
        </div>

        {/* Profil admin */}
        <div id="admin-keamanan" className="lg:col-span-4 scroll-mt-24">
          <div className="rounded-xl border border-zinc-200 bg-white p-6 h-full flex flex-col">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-zinc-900 mb-1">Profil admin</h2>
              <p className="text-xs text-zinc-500">Akun Anda yang sedang masuk ke ruang kerja studio.</p>
            </div>

            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8EDEA] text-sm font-bold text-[#2C4A3B]">
                {initials(myName || loaded.me.full_name)}
              </div>
              <div>
                <p className="font-bold text-zinc-900">{loaded.me.full_name ?? "Tanpa nama"}</p>
                <span className="inline-block mt-0.5 rounded bg-[#E8EDEA] px-2 py-0.5 text-[10px] font-semibold text-[#2C4A3B]">
                  • {ROLE_LABEL[loaded.me.role] ?? loaded.me.role}
                </span>
              </div>
            </div>

            <div className="space-y-5 mb-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700">Nama lengkap</label>
                <input type="text" value={myName} onChange={(e) => setMyName(e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700">Nomor HP</label>
                <input type="text" value={myPhone} placeholder="08…" onChange={(e) => setMyPhone(e.target.value)} className={inputClass} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700">Email admin</label>
                <input type="email" value={loaded.me.email ?? ""} disabled className={inputClass} />
                <p className="text-[10px] text-zinc-400">
                  Email dipakai untuk masuk dan dikelola tim IT. Hubungi tim IT bila perlu mengganti email.
                </p>
              </div>
            </div>

            <div className="mb-auto">
              <label className="text-xs font-bold text-zinc-700 block mb-2">Kata sandi</label>
              {!pwOpen ? (
                <button
                  onClick={() => setPwOpen(true)}
                  className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-sm hover:bg-zinc-50 w-fit"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Ubah kata sandi
                </button>
              ) : (
                <div className="space-y-2">
                  <input type="password" value={pw} placeholder="Kata sandi baru (min. 8 karakter)" onChange={(e) => setPw(e.target.value)} className={inputClass} />
                  <input type="password" value={pwConfirm} placeholder="Ulangi kata sandi baru" onChange={(e) => setPwConfirm(e.target.value)} className={inputClass} />
                  <div className="flex gap-2">
                    <button
                      onClick={handleChangePassword}
                      disabled={pwSaving}
                      className="flex-1 rounded-md bg-[#2C4A3B] px-3 py-2 text-xs font-semibold text-white hover:bg-[#233A2E] disabled:opacity-50"
                    >
                      {pwSaving ? "Menyimpan..." : "Simpan kata sandi"}
                    </button>
                    <button
                      onClick={() => {
                        setPwOpen(false);
                        setPw("");
                        setPwConfirm("");
                      }}
                      className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notifikasi (menyusul) */}
      <div id="notifikasi" className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 scroll-mt-24">
        <div className="flex items-start gap-3">
          <Bell className="h-5 w-5 text-zinc-400 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-bold text-zinc-900 mb-1">Preferensi notifikasi</h2>
            <p className="text-xs text-zinc-500">
              Pengaturan jenis notifikasi per admin (pesanan baru, pembaruan proyek, dan lainnya) sedang disiapkan. Saat ini
              notifikasi dalam aplikasi dikirim otomatis untuk pesanan baru, permintaan persetujuan, dan keputusan super admin.
            </p>
          </div>
        </div>
      </div>

      {/* Save Action Bottom Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-zinc-200 bg-white p-5">
        <div>
          <p className="text-sm font-bold text-zinc-900 mb-0.5">
            {dirty.any ? "Ada perubahan yang belum disimpan." : "Pengaturan berlaku untuk ruang kerja studio ini."}
          </p>
          <p className="text-xs text-zinc-500">Logo langsung tersimpan saat diunggah. Isian lain disimpan dengan tombol di samping.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            disabled={!dirty.any || saving}
            className="rounded-md border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 shadow-sm disabled:opacity-50"
          >
            Batalkan
          </button>
          {saveButton}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 pb-4">
        <p>Renovin. · Ruang kerja studio interior</p>
        {loaded.lastUpdatedAt && <p>Terakhir diperbarui {formatTanggalWaktu(loaded.lastUpdatedAt)}</p>}
      </div>
    </div>
  );
}
