"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Check,
  Printer,
  Send,
  Info,
  ArrowUpRight,
  ChevronDown,
  CheckCircle2,
  FileText,
  X,
  Camera,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah } from "@/lib/orders";

export interface MaterialItem {
  id: string;
  name: string;
  spec: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

interface OrderMaterialDetailPageProps {
  orderId?: string;
  isNew?: boolean;
}

const UNIT_OPTIONS = [
  "pail",
  "lembar",
  "m²",
  "sak",
  "batang",
  "pcs",
  "kaleng",
  "roll",
  "box",
];
const PAYMENT_OPTIONS = [
  "Termin 3 Tahap (DP 50%, Progres 30%, Pelunasan 20%)",
  "Termin 2 Tahap (DP 50%, Pelunasan 50%)",
  "Lunas di Awal (Diskon 5%)",
  "Transfer Bank - Invoice 14 Hari",
];

// High quality interior placeholder photos
const PLACEHOLDER_PHOTO_BEFORE =
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80";
const PLACEHOLDER_PHOTO_AFTER =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80";

// Helper formatting with dot separator for Rupiah amounts in inputs
function formatNumberWithDots(val: number | string): string {
  if (val === "" || val === null || val === undefined) return "";
  const num = typeof val === "number" ? val : parseInt(String(val).replace(/\D/g, ""), 10);
  if (isNaN(num) || num === 0) return "";
  return new Intl.NumberFormat("id-ID").format(num);
}

function parseDotsToNumber(str: string): number {
  const clean = str.replace(/\D/g, "");
  return clean ? parseInt(clean, 10) : 0;
}

export function OrderMaterialDetailPage({
  orderId,
  isNew = false,
}: OrderMaterialDetailPageProps) {
  // Basic project states
  const [orderCode, setOrderCode] = useState(
    isNew ? "ORD-BARU" : orderId && orderId !== "baru" ? orderId : "ORD-26006",
  );
  const [projectTitle, setProjectTitle] = useState("Rumah Tebet");
  const [roomType, setRoomType] = useState("Ruang keluarga - Hunian");
  const [roomArea, setRoomArea] = useState("45");
  const [wallArea] = useState("12");
  const [targetDate] = useState("19 Okt 2026");
  const [projectAddress] = useState(
    "Jl. Tebet Barat IV No. 12, Jakarta Selatan",
  );
  const [renovationScope] = useState(
    "Penggantian lantai, plafon gypsum & pengecatan dinding.",
  );

  // Client states
  const [clientName, setClientName] = useState("Dimas Putra");
  const [clientPhone, setClientPhone] = useState("0812-3456-7890");
  const [submittedAt] = useState("3 Okt 2026, 08.35 WIB");
  const [receivedBy, setReceivedBy] = useState("Atmin Pusat");
  const [receivedAt] = useState("4 Okt 2026, 10.02 WIB");

  // Photos: using placeholder by default, replaced if client provides photos
  const [photoBefore, setPhotoBefore] = useState<string | null>(null);
  const [photoAfter, setPhotoAfter] = useState<string | null>(null);
  const [hasClientPhotoBefore, setHasClientPhotoBefore] =
    useState<boolean>(false);
  const [hasClientPhotoAfter, setHasClientPhotoAfter] =
    useState<boolean>(false);

  // Materials: Draft Klien (if client provided draft, use it; otherwise empty)
  const [clientMaterials, setClientMaterials] = useState<MaterialItem[]>(
    isNew
      ? []
      : [
          {
            id: "cm-1",
            name: "Cat interior",
            spec: "Warna warm white · 5 kg",
            quantity: 6,
            unit: "pail",
            unitPrice: 285000,
          },
          {
            id: "cm-2",
            name: "Papan gypsum",
            spec: "9 mm · 120 × 240 cm",
            quantity: 24,
            unit: "lembar",
            unitPrice: 85000,
          },
        ],
  );

  // Materials: Draft Admin
  const [adminMaterials, setAdminMaterials] = useState<MaterialItem[]>([
    {
      id: "am-1",
      name: "Keramik porcelain",
      spec: "60 × 60 cm · matte ivory",
      quantity: 50,
      unit: "m²",
      unitPrice: 185000,
    },
    {
      id: "am-2",
      name: "Perekat keramik",
      spec: "Mortar instan · 25 kg",
      quantity: 12,
      unit: "sak",
      unitPrice: 95000,
    },
    {
      id: "am-3",
      name: "Hollow galvanis",
      spec: "4 × 4 cm · panjang 4 m",
      quantity: 40,
      unit: "batang",
      unitPrice: 65000,
    },
    {
      id: "am-4",
      name: "Semen Portland",
      spec: "Tipe I · 40 kg",
      quantity: 8,
      unit: "sak",
      unitPrice: 68000,
    },
  ]);

  // Jasa & Pajak
  const [serviceFee, setServiceFee] = useState<number>(2000000);
  const [taxFee, setTaxFee] = useState<number>(2463400);

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_OPTIONS[0]);

  // Notes
  const [adminNotes, setAdminNotes] = useState(
    "Keramik 50 m² termasuk cadangan potongan untuk ruang 45 m². Warna cat dan ukuran plafon perlu dikonfirmasi saat survei.",
  );

  // UI state
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch real order data if an ID exists in the database
  useEffect(() => {
    if (!orderId || orderId === "baru") return;

    let ignore = false;
    const fetchOrder = async () => {
      try {
        const supabase = createClient();
        const isUuid =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            orderId,
          );
        const query = isUuid
          ? supabase
              .from("admin_orders")
              .select("*")
              .eq("id", orderId)
              .maybeSingle()
          : supabase
              .from("admin_orders")
              .select("*")
              .eq("code", orderId)
              .maybeSingle();

        const { data, error } = await query;
        if (error || !data) return;

        if (!ignore) {
          if (data.code) setOrderCode(data.code);
          if (data.title) setProjectTitle(data.title);
          if (data.room_type) setRoomType(data.room_type);
          if (data.total_area) setRoomArea(String(data.total_area));
          if (data.customer_name) setClientName(data.customer_name);
          if (data.customer_phone) setClientPhone(data.customer_phone);
          if (data.notes) setAdminNotes(data.notes);
          if (data.assigned_admin_name) setReceivedBy(data.assigned_admin_name);

          // Resolve photo before: if client provided cover photo
          if (data.cover_photo_path) {
            let photoUrl = data.cover_photo_path;
            if (
              !photoUrl.startsWith("http://") &&
              !photoUrl.startsWith("https://")
            ) {
              const { data: signedData } = await supabase.storage
                .from("room-photos")
                .createSignedUrl(photoUrl, 3600);
              if (signedData?.signedUrl) {
                photoUrl = signedData.signedUrl;
              }
            }
            setPhotoBefore(photoUrl);
            setHasClientPhotoBefore(true);
          }

          if (data.id) {
            // Also check room_photos for this project (original_url for before, processed_url for after)
            const { data: roomPhotos } = await supabase
              .from("room_photos")
              .select("*")
              .eq("project_id", data.id)
              .order("created_at", { ascending: false });

            if (roomPhotos && roomPhotos.length > 0) {
              const latest = roomPhotos[0];
              if (latest.original_url && !data.cover_photo_path) {
                let originalUrl = latest.original_url;
                if (
                  !originalUrl.startsWith("http://") &&
                  !originalUrl.startsWith("https://")
                ) {
                  const { data: signedData } = await supabase.storage
                    .from("room-photos")
                    .createSignedUrl(originalUrl, 3600);
                  if (signedData?.signedUrl) originalUrl = signedData.signedUrl;
                }
                setPhotoBefore(originalUrl);
                setHasClientPhotoBefore(true);
              }
              if (latest.processed_url) {
                let procUrl = latest.processed_url;
                if (
                  !procUrl.startsWith("http://") &&
                  !procUrl.startsWith("https://")
                ) {
                  const { data: signedData } = await supabase.storage
                    .from("room-photos")
                    .createSignedUrl(procUrl, 3600);
                  if (signedData?.signedUrl) procUrl = signedData.signedUrl;
                }
                setPhotoAfter(procUrl);
                setHasClientPhotoAfter(true);
              }
            }

            // Check if client provided draft materials in rab_line_items
            const { data: lineItems } = await supabase
              .from("rab_line_items")
              .select("*")
              .eq("project_id", data.id)
              .order("sort_order", { ascending: true });

            if (lineItems && lineItems.length > 0) {
              const clientRows = lineItems.filter(
                (i) => !i.is_manual || i.product_id || i.placement_id,
              );
              const adminRows = lineItems.filter(
                (i) =>
                  i.is_manual &&
                  !i.product_id &&
                  !i.placement_id &&
                  i.item_type !== "service",
              );

              if (clientRows.length > 0) {
                setClientMaterials(
                  clientRows.map((item) => ({
                    id: item.id,
                    name: item.description,
                    spec: item.unit ? `Satuan: ${item.unit}` : "Standar",
                    quantity: item.quantity,
                    unit: item.unit || "pcs",
                    unitPrice: item.unit_price_customer || 0,
                  })),
                );
              } else {
                setClientMaterials([]);
              }

              if (adminRows.length > 0) {
                setAdminMaterials(
                  adminRows.map((item) => ({
                    id: item.id,
                    name: item.description,
                    spec: item.unit ? `Satuan: ${item.unit}` : "Standar",
                    quantity: item.quantity,
                    unit: item.unit || "pcs",
                    unitPrice: item.unit_price_customer || 0,
                  })),
                );
              }
            }
          }
        }
      } catch (err) {
        console.warn("Could not load order details from database:", err);
      }
    };

    fetchOrder();
    return () => {
      ignore = true;
    };
  }, [orderId]);

  // Calculations
  const clientSubtotal = useMemo(() => {
    return clientMaterials.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0,
    );
  }, [clientMaterials]);

  const adminSubtotal = useMemo(() => {
    return adminMaterials.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0,
    );
  }, [adminMaterials]);

  const totalMaterialsCount = clientMaterials.length + adminMaterials.length;

  const grandTotal = useMemo(() => {
    return clientSubtotal + adminSubtotal + serviceFee + taxFee;
  }, [clientSubtotal, adminSubtotal, serviceFee, taxFee]);

  // Handle row updates
  const updateMaterialItem = (
    group: "client" | "admin",
    id: string,
    field: keyof MaterialItem,
    value: string | number,
  ) => {
    setHasUnsavedChanges(true);
    const updater = (prev: MaterialItem[]) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            [field]:
              field === "quantity" || field === "unitPrice"
                ? typeof value === "number"
                  ? value
                  : parseFloat(value) || 0
                : value,
          };
        }
        return item;
      });

    if (group === "client") {
      setClientMaterials(updater);
    } else {
      setAdminMaterials(updater);
    }
  };

  // Delete row
  const deleteMaterialItem = (group: "client" | "admin", id: string) => {
    setHasUnsavedChanges(true);
    if (group === "client") {
      setClientMaterials((prev) => prev.filter((item) => item.id !== id));
    } else {
      setAdminMaterials((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Add empty row
  const addEmptyRow = (group: "client" | "admin") => {
    setHasUnsavedChanges(true);
    const newItem: MaterialItem = {
      id: `item-${Date.now()}`,
      name: "",
      spec: "",
      quantity: 1,
      unit: "pcs",
      unitPrice: 0,
    };
    if (group === "client") {
      setClientMaterials((prev) => [...prev, newItem]);
    } else {
      setAdminMaterials((prev) => [...prev, newItem]);
    }
  };

  // Save draft
  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // Simulate saving to backend
      await new Promise((resolve) => setTimeout(resolve, 600));
      setHasUnsavedChanges(false);
      setToastMessage({
        type: "success",
        text: "Rincian bahan bangunan berhasil disimpan sebagai draft admin.",
      });
    } catch {
      setToastMessage({
        type: "error",
        text: "Gagal menyimpan rincian bahan.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Tetapkan nilai proyek
  const handleSetProjectValue = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      setHasUnsavedChanges(false);
      setToastMessage({
        type: "success",
        text: `Nilai proyek ${formatRupiah(grandTotal)} berhasil ditetapkan dan diperbarui di sistem.`,
      });
    } catch {
      setToastMessage({
        type: "error",
        text: "Gagal menetapkan nilai proyek.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Send for approval to supervisor
  const handleSendForApproval = () => {
    setToastMessage({
      type: "success",
      text: "Daftar rincian bahan dan anggaran berhasil dikirim untuk approval ke atasan.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 print:max-w-none print:w-full print:p-0 print:space-y-4 print:pb-0">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          body {
            background-color: #ffffff !important;
            color: #18181b !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-card-page1 {
            break-after: page !important;
            page-break-after: always !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
          .print-avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm transition-all animate-in fade-in slide-in-from-bottom-3 print:hidden ${
            toastMessage.type === "success"
              ? "bg-[#2C4A3B] text-white border-[#233A2E]"
              : "bg-red-600 text-white border-red-700"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />
          ) : (
            <Info className="h-4 w-4 shrink-0 text-red-200" />
          )}
          <span className="font-medium">{toastMessage.text}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/70 hover:text-white p-0.5 ml-2"
          >
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
          <p className="font-mono font-bold text-zinc-900">{orderCode}</p>
          <p className="text-[10px] text-zinc-500">
            Dicetak: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between text-xs font-medium text-zinc-500 print:hidden print-hidden">
        <div className="flex items-center gap-2">
          <span>Ruang kerja</span>
          <span>&rsaquo;</span>
          <Link
            href="/workplace/pesanan"
            className="hover:text-zinc-900 transition"
          >
            Pesanan
          </Link>
          <span>&rsaquo;</span>
          <span className="text-zinc-900 font-semibold">{orderCode}</span>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 print:hidden print-hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-1">
            Rincian bahan bangunan
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Lengkapi bahan dan harga untuk menentukan nilai proyek pesanan yang
            telah diterima.
          </p>
        </div>
        <Link
          href="/workplace/pesanan"
          className="flex items-center gap-2 self-start rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-2xs transition print:hidden print-hidden"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke penerimaan
        </Link>
      </div>

      {/* CARD 1: Photos & Order Overview */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs space-y-6 print:border-zinc-300 print:p-4 print:space-y-3 print:shadow-none print-card-page1">
        {/* Top: Two Photos Side by Side (Placeholder or Client-Provided) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-photos-grid print:grid-cols-2 print:gap-4">
          {/* Photo Sebelum */}
          <div className="flex flex-col">
            <div className="relative aspect-16/10 w-full rounded-xl overflow-hidden bg-[#ECE6DD] border border-zinc-200/80 group shadow-inner print-photo-box print:aspect-auto print:h-44">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoBefore || PLACEHOLDER_PHOTO_BEFORE}
                alt="Kondisi Awal"
                className="w-full h-full object-cover transition duration-300 group-hover:scale-102 print:h-44 print:w-full print:object-cover"
              />

              {/* Badge Sebelum & Status */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 print:top-2 print:left-2">
                <span className="bg-white/95 backdrop-blur-xs text-zinc-900 text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-xs print:text-[10px] print:px-2">
                  Sebelum
                </span>
                {!hasClientPhotoBefore && (
                  <span className="bg-amber-500/90 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs print:hidden print-hidden">
                    Placeholder
                  </span>
                )}
              </div>

              {/* Action: Upload / Ganti Foto Klien */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2 print:hidden print-hidden">
                {hasClientPhotoBefore && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoBefore(null);
                      setHasClientPhotoBefore(false);
                      setHasUnsavedChanges(true);
                      setToastMessage({
                        type: "success",
                        text: "Foto dikembalikan ke placeholder.",
                      });
                    }}
                    className="bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-1 rounded-md transition shadow-xs"
                  >
                    Reset placeholder
                  </button>
                )}
                <label className="cursor-pointer inline-flex items-center gap-1.5 bg-white/95 hover:bg-white text-zinc-800 text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-sm border border-zinc-200 transition">
                  <Camera className="h-3.5 w-3.5 text-zinc-600" />
                  <span>
                    {hasClientPhotoBefore
                      ? "Ganti foto klien"
                      : "Unggah foto klien"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          setPhotoBefore(reader.result as string);
                          setHasClientPhotoBefore(true);
                          setHasUnsavedChanges(true);
                          setToastMessage({
                            type: "success",
                            text: "Foto kondisi awal dari klien berhasil diterapkan!",
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
            <p className="text-center text-xs text-zinc-500 mt-2 font-medium print:text-[10px] print:mt-1">
              {hasClientPhotoBefore
                ? "Foto kondisi awal · Diunggah klien"
                : "Foto placeholder · Menunggu foto kondisi awal dari klien"}
            </p>
          </div>

          {/* Photo Sesudah */}
          <div className="flex flex-col">
            <div className="relative aspect-16/10 w-full rounded-xl overflow-hidden bg-[#E2EBE5] border border-zinc-200/80 group shadow-inner print-photo-box print:aspect-auto print:h-44">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoAfter || PLACEHOLDER_PHOTO_AFTER}
                alt="Kondisi Akhir"
                className="w-full h-full object-cover transition duration-300 group-hover:scale-102 print:h-44 print:w-full print:object-cover"
              />

              {/* Badge Sesudah & Status */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 print:top-2 print:left-2">
                <span className="bg-white/95 backdrop-blur-xs text-zinc-900 text-[11px] font-bold px-2.5 py-0.5 rounded-md shadow-xs print:text-[10px] print:px-2">
                  Sesudah
                </span>
                {!hasClientPhotoAfter && (
                  <span className="bg-amber-500/90 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs print:hidden print-hidden">
                    Placeholder
                  </span>
                )}
              </div>

              {/* Action: Upload / Ganti Foto Sesudah */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2 print:hidden print-hidden">
                {hasClientPhotoAfter && (
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoAfter(null);
                      setHasClientPhotoAfter(false);
                      setHasUnsavedChanges(true);
                      setToastMessage({
                        type: "success",
                        text: "Foto akhir dikembalikan ke placeholder.",
                      });
                    }}
                    className="bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-1 rounded-md transition shadow-xs"
                  >
                    Reset placeholder
                  </button>
                )}
                <label className="cursor-pointer inline-flex items-center gap-1.5 bg-white/95 hover:bg-white text-zinc-800 text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-sm border border-zinc-200 transition">
                  <Camera className="h-3.5 w-3.5 text-zinc-600" />
                  <span>
                    {hasClientPhotoAfter
                      ? "Ganti foto sesudah"
                      : "Unggah foto sesudah"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          setPhotoAfter(reader.result as string);
                          setHasClientPhotoAfter(true);
                          setHasUnsavedChanges(true);
                          setToastMessage({
                            type: "success",
                            text: "Foto kondisi akhir berhasil diterapkan!",
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
            <p className="text-center text-xs text-zinc-500 mt-2 font-medium print:text-[10px] print:mt-1">
              {hasClientPhotoAfter
                ? "Foto kondisi akhir · Hasil pengerjaan"
                : "Foto placeholder · Visualisasi estimasi setelah renovasi"}
            </p>
          </div>
        </div>

        {/* Bottom Section: Order Details & Client Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 border-t border-zinc-100 print:grid-cols-3 print:gap-4 print:pt-3">
          {/* Left: Project Details (2 Cols on lg) */}
          <div className="lg:col-span-2 space-y-4 print:space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold text-zinc-500">
                {orderCode}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200/60 print:py-0 print:text-[10px]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Pesanan diterima
              </span>
            </div>

            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight print:text-lg">
              {projectTitle}
            </h2>

            {/* 4-Item Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-1 print:gap-2 print:py-0.5">
              <div>
                <p className="text-[11px] text-zinc-400 font-medium print:text-[9px]">
                  Jenis ruangan
                </p>
                <p className="text-xs font-bold text-zinc-800 mt-0.5 print:text-[11px]">
                  {roomType}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-400 font-medium print:text-[9px]">
                  Luas Ruangan
                </p>
                <p className="text-xs font-bold text-zinc-800 mt-0.5 print:text-[11px]">
                  {roomArea} m²
                </p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-400 font-medium print:text-[9px]">
                  Luas Permukaan tembok
                </p>
                <p className="text-xs font-bold text-zinc-800 mt-0.5 print:text-[11px]">
                  {wallArea} m²
                </p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-400 font-medium print:text-[9px]">
                  Target mulai
                </p>
                <p className="text-xs font-bold text-zinc-800 mt-0.5 print:text-[11px]">
                  {targetDate}
                </p>
              </div>
            </div>

            {/* Project Address */}
            <div>
              <p className="text-[11px] text-zinc-400 font-medium print:text-[9px]">
                Alamat proyek
              </p>
              <p className="text-xs font-semibold text-zinc-800 mt-0.5 print:text-[11px]">
                {projectAddress}
              </p>
            </div>

            {/* Scope of Renovation */}
            <div>
              <p className="text-[11px] text-zinc-400 font-medium print:text-[9px]">
                Lingkup renovasi
              </p>
              <p className="text-xs text-zinc-700 mt-0.5 leading-relaxed print:text-[10px]">
                {renovationScope}
              </p>
            </div>
          </div>

          {/* Right: Client Card */}
          <div className="border-t lg:border-t-0 lg:border-l border-zinc-100 pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-between print:border-t-0 print:border-l print:pl-4 print:pt-0">
            <div className="space-y-2 print:space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                KLIEN:
              </p>
              <h3 className="text-base font-bold text-zinc-900 print:text-sm">
                {clientName}
              </h3>
              <p className="text-xs text-zinc-600 font-medium print:text-[11px]">{clientPhone}</p>

              <div className="pt-2 text-xs text-zinc-500 space-y-1 print:pt-1 print:text-[10px]">
                <p>Masuk {submittedAt}</p>
                <p>
                  Diterima{" "}
                  <span className="font-medium text-zinc-800">
                    {receivedBy}
                  </span>
                </p>
                <p className="text-zinc-400">{receivedAt}</p>
              </div>
            </div>

            <button
              onClick={() =>
                setToastMessage({
                  type: "success",
                  text: `Membuka percakapan chat dengan klien ${clientName}...`,
                })
              }
              className="mt-6 flex items-center gap-1.5 text-xs font-bold text-[#2C4A3B] hover:underline print:hidden print-hidden"
            >
              Hubungi klien <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* CARD 2: Daftar Bahan Bangunan (RAB Table) */}
      <div className="rounded-2xl border border-zinc-200 bg-white shadow-2xs overflow-hidden print:border-zinc-300 print:shadow-none print-avoid-break">
        {/* Table Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 border-b border-zinc-100 gap-4 print:p-4 print:border-zinc-200">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg font-bold text-zinc-900 print:text-base">
                Daftar bahan bangunan
              </h3>
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200/60 print:text-[10px]">
                • Draft admin
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1 print:text-[10px]">
              Isi spesifikasi, kuantitas, satuan, dan harga satuan. Seluruh
              harga dalam rupiah.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 shadow-2xs transition disabled:opacity-50 shrink-0 self-start sm:self-auto print:hidden print-hidden"
          >
            <Save className="h-3.5 w-3.5 text-zinc-500" />
            {isSaving ? "Menyimpan..." : "Simpan draft"}
          </button>
        </div>

        {/* Materials Table */}
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left text-xs">
            {/* Column Headers */}
            <thead className="bg-[#FAF9F7] border-b border-zinc-100 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider print:border-zinc-200 print:text-[9px]">
              <tr>
                <th className="py-3 px-6 w-1/4 print:px-3 print:py-2">Bahan</th>
                <th className="py-3 px-4 w-1/4 print:px-2 print:py-2">Spesifikasi</th>
                <th className="py-3 px-3 text-center w-20 print:px-2 print:py-2">Jumlah</th>
                <th className="py-3 px-3 text-center w-28 print:px-2 print:py-2">Satuan</th>
                <th className="py-3 px-4 text-right w-36 print:px-2 print:py-2">Harga satuan (Rp)</th>
                <th className="py-3 px-6 text-right w-36 print:px-3 print:py-2">Subtotal (Rp)</th>
                <th className="py-3 px-3 w-10 text-center print:hidden"></th>
              </tr>
            </thead>

            {/* SECTION 1: Draft Klien */}
            <tbody className="divide-y divide-zinc-100/70 border-b border-zinc-100 print:divide-zinc-200 print:border-zinc-200">
              {/* Group Header */}
              <tr className="bg-zinc-50/60 print:bg-zinc-100/50">
                <td colSpan={7} className="px-6 py-3 print:px-3 print:py-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-900 text-xs print:text-[11px]">
                        Draft klien
                      </span>
                      <span className="text-[11px] text-zinc-400 ml-2 print:text-[9px]">
                        Dipilih klien dari katalog Renovin · Harga diisi admin
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {clientMaterials.length > 0 ? (
                        <>
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200/60 print:text-[9px] print:py-0">
                            • {clientMaterials.length} bahan
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setClientMaterials([]);
                              setHasUnsavedChanges(true);
                              setToastMessage({
                                type: "success",
                                text: "Draft bahan klien berhasil dikosongkan.",
                              });
                            }}
                            className="text-[11px] text-zinc-400 hover:text-red-600 transition underline ml-1 print:hidden"
                            title="Hapus pilihan draft jika klien belum memilih"
                          >
                            Hapus draft
                          </button>
                        </>
                      ) : (
                        <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-500 border border-zinc-200 print:text-[9px] print:py-0">
                          • Belum ada draft klien
                        </span>
                      )}
                    </div>
                  </div>
                </td>
              </tr>

              {/* Rows Draft Klien (or Empty State if client hasn't given draft) */}
              {clientMaterials.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-6 bg-zinc-50/20 text-center print:py-3"
                  >
                    <div className="flex flex-col items-center justify-center py-2 text-center max-w-md mx-auto">
                      <p className="text-xs font-semibold text-zinc-700 print:text-[11px]">
                        Klien belum memberikan draft bahan
                      </p>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed print:text-[9px]">
                        Pesanan ini belum memiliki pilihan material dari klien.
                        Jika klien memberikan draft bahan (misal via chat atau
                        dokumen), Anda dapat menggunakannya di sini.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setClientMaterials([
                            {
                              id: `cm-${Date.now()}-1`,
                              name: "Cat interior",
                              spec: "Warna warm white · 5 kg",
                              quantity: 6,
                              unit: "pail",
                              unitPrice: 285000,
                            },
                            {
                              id: `cm-${Date.now()}-2`,
                              name: "Papan gypsum",
                              spec: "9 mm · 120 × 240 cm",
                              quantity: 24,
                              unit: "lembar",
                              unitPrice: 85000,
                            },
                          ]);
                          setHasUnsavedChanges(true);
                          setToastMessage({
                            type: "success",
                            text: "Draft bahan dari klien berhasil dimuat ke dalam tabel.",
                          });
                        }}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition shadow-2xs print:hidden"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Gunakan draft bahan dari klien
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                clientMaterials.map((item) => {
                  const rowSubtotal = item.quantity * item.unitPrice;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-zinc-50/40 transition-colors"
                    >
                      <td className="px-6 py-2.5 print:px-3 print:py-1.5">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            updateMaterialItem(
                              "client",
                              item.id,
                              "name",
                              e.target.value,
                            )
                          }
                          className="w-full h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-800 outline-none focus:border-[#2C4A3B] print:border-none print:bg-transparent print:p-0 print:h-auto print:text-zinc-900"
                        />
                      </td>
                      <td className="px-4 py-2.5 print:px-2 print:py-1.5">
                        <input
                          type="text"
                          value={item.spec}
                          onChange={(e) =>
                            updateMaterialItem(
                              "client",
                              item.id,
                              "spec",
                              e.target.value,
                            )
                          }
                          className="w-full h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-600 outline-none focus:border-[#2C4A3B] print:border-none print:bg-transparent print:p-0 print:h-auto print:text-zinc-600"
                        />
                      </td>
                      <td className="px-3 py-2.5 text-center print:px-2 print:py-1.5">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={item.quantity}
                          onChange={(e) =>
                            updateMaterialItem(
                              "client",
                              item.id,
                              "quantity",
                              e.target.value,
                            )
                          }
                          className="w-16 h-9 rounded-lg border border-zinc-200 bg-white px-2 text-center text-xs font-semibold text-zinc-800 outline-none focus:border-[#2C4A3B] print:border-none print:bg-transparent print:p-0 print:h-auto print:w-auto print:text-center"
                        />
                      </td>
                      <td className="px-3 py-2.5 text-center print:px-2 print:py-1.5">
                        <div className="relative">
                          <select
                            value={item.unit}
                            onChange={(e) =>
                              updateMaterialItem(
                                "client",
                                item.id,
                                "unit",
                                e.target.value,
                              )
                            }
                            className="w-full h-9 appearance-none rounded-lg border border-zinc-200 bg-white px-3 pr-7 text-xs font-medium text-zinc-700 outline-none focus:border-[#2C4A3B] print:border-none print:bg-transparent print:p-0 print:pr-0 print:h-auto print:w-auto"
                          >
                            {UNIT_OPTIONS.map((u) => (
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
                          value={formatNumberWithDots(item.unitPrice)}
                          onChange={(e) =>
                            updateMaterialItem(
                              "client",
                              item.id,
                              "unitPrice",
                              parseDotsToNumber(e.target.value),
                            )
                          }
                          className="w-full h-9 rounded-lg border border-zinc-200 bg-white px-3 text-right text-xs font-semibold text-zinc-800 outline-none focus:border-[#2C4A3B] print:border-none print:bg-transparent print:p-0 print:h-auto print:text-zinc-900"
                        />
                      </td>
                      <td className="px-6 py-2.5 text-right font-bold text-zinc-900 text-xs print:px-3 print:py-1.5">
                        {rowSubtotal.toLocaleString("id-ID")}
                      </td>
                      <td className="px-3 py-2.5 text-center print:hidden">
                        <button
                          onClick={() => deleteMaterialItem("client", item.id)}
                          className="text-zinc-300 hover:text-red-600 transition p-1"
                          title="Hapus baris"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* SECTION 2: Draft Admin */}
            <tbody className="divide-y divide-zinc-100/70 border-b border-zinc-100 print:divide-zinc-200 print:border-zinc-200">
              {/* Group Header */}
              <tr className="bg-zinc-50/60 print:bg-zinc-100/50">
                <td colSpan={7} className="px-6 py-3 print:px-3 print:py-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-900 text-xs print:text-[11px]">
                        Draft admin
                      </span>
                      <span className="text-[11px] text-zinc-400 ml-2 print:text-[9px]">
                        Tambahan admin untuk melengkapi kebutuhan proyek
                      </span>
                    </div>
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200/60 print:text-[9px] print:py-0">
                      • {adminMaterials.length} bahan
                    </span>
                  </div>
                </td>
              </tr>

              {/* Rows Draft Admin */}
              {adminMaterials.map((item) => {
                const rowSubtotal = item.quantity * item.unitPrice;
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-zinc-50/40 transition-colors"
                  >
                    <td className="px-6 py-2.5 print:px-3 print:py-1.5">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) =>
                          updateMaterialItem(
                            "admin",
                            item.id,
                            "name",
                            e.target.value,
                          )
                        }
                        className="w-full h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-800 outline-none focus:border-[#2C4A3B] print:border-none print:bg-transparent print:p-0 print:h-auto print:text-zinc-900"
                      />
                    </td>
                    <td className="px-4 py-2.5 print:px-2 print:py-1.5">
                      <input
                        type="text"
                        value={item.spec}
                        onChange={(e) =>
                          updateMaterialItem(
                            "admin",
                            item.id,
                            "spec",
                            e.target.value,
                          )
                        }
                        className="w-full h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-600 outline-none focus:border-[#2C4A3B] print:border-none print:bg-transparent print:p-0 print:h-auto print:text-zinc-600"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-center print:px-2 print:py-1.5">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.quantity}
                        onChange={(e) =>
                          updateMaterialItem(
                            "admin",
                            item.id,
                            "quantity",
                            e.target.value,
                          )
                        }
                        className="w-16 h-9 rounded-lg border border-zinc-200 bg-white px-2 text-center text-xs font-semibold text-zinc-800 outline-none focus:border-[#2C4A3B] print:border-none print:bg-transparent print:p-0 print:h-auto print:w-auto print:text-center"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-center print:px-2 print:py-1.5">
                      <div className="relative">
                        <select
                          value={item.unit}
                          onChange={(e) =>
                            updateMaterialItem(
                              "admin",
                              item.id,
                              "unit",
                              e.target.value,
                            )
                          }
                          className="w-full h-9 appearance-none rounded-lg border border-zinc-200 bg-white px-3 pr-7 text-xs font-medium text-zinc-700 outline-none focus:border-[#2C4A3B] print:border-none print:bg-transparent print:p-0 print:pr-0 print:h-auto print:w-auto"
                        >
                          {UNIT_OPTIONS.map((u) => (
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
                        value={formatNumberWithDots(item.unitPrice)}
                        onChange={(e) =>
                          updateMaterialItem(
                            "admin",
                            item.id,
                            "unitPrice",
                            parseDotsToNumber(e.target.value),
                          )
                        }
                        className="w-full h-9 rounded-lg border border-zinc-200 bg-white px-3 text-right text-xs font-semibold text-zinc-800 outline-none focus:border-[#2C4A3B] print:border-none print:bg-transparent print:p-0 print:h-auto print:text-zinc-900"
                      />
                    </td>
                    <td className="px-6 py-2.5 text-right font-bold text-zinc-900 text-xs print:px-3 print:py-1.5">
                      {rowSubtotal.toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 py-2.5 text-center print:hidden">
                      <button
                        onClick={() => deleteMaterialItem("admin", item.id)}
                        className="text-zinc-300 hover:text-red-600 transition p-1"
                        title="Hapus baris"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* SECTION 3: Jasa Pengerjaan & Pajak */}
            <tbody className="divide-y divide-zinc-100/70 border-b border-zinc-100 print:divide-zinc-200 print:border-zinc-200">
              {/* Group Header */}
              <tr className="bg-zinc-50/60 print:bg-zinc-100/50">
                <td colSpan={7} className="px-6 py-3 print:px-3 print:py-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-900 text-xs print:text-[11px]">
                        Jasa Pengerjaan
                      </span>
                      <span className="text-[11px] text-zinc-400 ml-2 print:text-[9px]">
                        Biaya tenaga kerja dan pajak resmi
                      </span>
                    </div>
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200/60 print:text-[9px] print:py-0">
                      • 2 baris
                    </span>
                  </div>
                </td>
              </tr>

              {/* Jasa Pengerjaan Row */}
              <tr className="hover:bg-zinc-50/40">
                <td colSpan={4} className="px-6 py-2.5 print:px-3 print:py-1.5">
                  <input
                    type="text"
                    disabled
                    value="Jasa Pengerjaan"
                    className="w-full h-9 rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 text-xs font-semibold text-zinc-800 print:border-none print:bg-transparent print:p-0 print:h-auto"
                  />
                </td>
                <td colSpan={2} className="px-6 py-2.5 text-right print:px-3 print:py-1.5">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={formatNumberWithDots(serviceFee)}
                    onChange={(e) => {
                      setHasUnsavedChanges(true);
                      setServiceFee(parseDotsToNumber(e.target.value));
                    }}
                    className="w-48 h-9 rounded-lg border border-zinc-200 bg-white px-3 text-right text-xs font-bold text-zinc-900 outline-none focus:border-[#2C4A3B] print:border-none print:bg-transparent print:p-0 print:h-auto print:w-auto"
                  />
                </td>
                <td className="px-3 py-2.5 text-center print:hidden">
                  <button
                    onClick={() => {
                      setHasUnsavedChanges(true);
                      setServiceFee(0);
                    }}
                    className="text-zinc-300 hover:text-red-600 transition p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>

              {/* Pajak Row */}
              <tr className="hover:bg-zinc-50/40">
                <td colSpan={4} className="px-6 py-2.5 print:px-3 print:py-1.5">
                  <input
                    type="text"
                    disabled
                    value="Pajak"
                    className="w-full h-9 rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 text-xs font-semibold text-zinc-800 print:border-none print:bg-transparent print:p-0 print:h-auto"
                  />
                </td>
                <td colSpan={2} className="px-6 py-2.5 text-right print:px-3 print:py-1.5">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={formatNumberWithDots(taxFee)}
                    onChange={(e) => {
                      setHasUnsavedChanges(true);
                      setTaxFee(parseDotsToNumber(e.target.value));
                    }}
                    className="w-48 h-9 rounded-lg border border-zinc-200 bg-white px-3 text-right text-xs font-bold text-zinc-900 outline-none focus:border-[#2C4A3B] print:border-none print:bg-transparent print:p-0 print:h-auto print:w-auto"
                  />
                </td>
                <td className="px-3 py-2.5 text-center print:hidden">
                  <button
                    onClick={() => {
                      setHasUnsavedChanges(true);
                      setTaxFee(0);
                    }}
                    className="text-zinc-300 hover:text-red-600 transition p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            </tbody>

            {/* SECTION 4: Metode Pembayaran */}
            <tbody className="bg-zinc-50/40 print:bg-transparent">
              <tr>
                <td colSpan={7} className="px-6 py-4 print:px-3 print:py-2">
                  <div className="max-w-xs space-y-1.5 print:max-w-none">
                    <label className="text-xs font-bold text-zinc-900 print:text-[11px]">
                      Metode Pembayaran
                    </label>
                    <div className="relative">
                      <select
                        value={paymentMethod}
                        onChange={(e) => {
                          setHasUnsavedChanges(true);
                          setPaymentMethod(e.target.value);
                        }}
                        className="w-full h-9 appearance-none rounded-lg border border-zinc-200 bg-white px-3 pr-8 text-xs font-medium text-zinc-700 outline-none focus:border-[#2C4A3B] print:border-none print:bg-transparent print:p-0 print:h-auto print:text-zinc-900"
                      >
                        {PAYMENT_OPTIONS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 print:hidden" />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Table Footer Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 bg-[#FAF9F7] border-t border-zinc-100 gap-3 print:px-3 print:py-2 print:border-zinc-200">
          <p className="text-xs text-zinc-500 print:text-[10px]">
            <span className="font-bold text-zinc-800">
              {totalMaterialsCount} bahan
            </span>{" "}
            · Subtotal = jumlah &times; harga satuan
          </p>
          <button
            onClick={() => addEmptyRow("admin")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold shadow-2xs transition self-start sm:self-auto print:hidden print-hidden"
          >
            <Plus className="h-3.5 w-3.5" />
            Tambah baris bahan
          </button>
        </div>
      </div>

      {/* SECTION 3: Bottom Calculation & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4 print-avoid-break">
        {/* Left (2 cols): Catatan Admin */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs flex flex-col justify-between print:border-zinc-300 print:p-4 print:shadow-none">
          <div>
            <h4 className="text-sm font-bold text-zinc-900 mb-2 print:text-xs">
              Catatan admin
            </h4>
            <textarea
              rows={4}
              value={adminNotes}
              onChange={(e) => {
                setHasUnsavedChanges(true);
                setAdminNotes(e.target.value);
              }}
              placeholder="Catatan tambahan admin untuk kebutuhan material, survei lokasi, dsb..."
              className="w-full rounded-xl border border-zinc-200 bg-[#FAF9F7] p-3.5 text-xs text-zinc-800 outline-none transition focus:border-[#2C4A3B] resize-none leading-relaxed print:border-zinc-200 print:bg-transparent print:p-2"
            />
          </div>

          <div className="flex items-start gap-2.5 mt-4 pt-4 border-t border-zinc-100 text-[11px] text-zinc-500 print:border-zinc-200 print:mt-2 print:pt-2 print:text-[9px]">
            <Info className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
            <span>
              Rincian ini masih draft admin. Simpan perubahan sebelum menetapkan
              nilai proyek; nilai belum dipublikasikan kepada klien.
            </span>
          </div>
        </div>

        {/* Right (1 col): Nilai Proyek (Dark Emerald Card) */}
        <div className="rounded-2xl bg-[#1E372A] p-6 text-white flex flex-col justify-between shadow-md min-h-60 print:p-4 print:min-h-0 print:border print:border-[#1E372A]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-white/80 print:text-[10px]">
                Nilai Proyek
              </span>
              <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white/90 print:text-[8px]">
                DRAFT ADMIN
              </span>
            </div>

            <h3 className="text-3xl font-extrabold tracking-tight mt-1 mb-4 text-white print:text-xl print:mb-2">
              {formatRupiah(grandTotal)}
            </h3>

            <div className="space-y-1.5 text-xs border-t border-white/15 pt-4 print:pt-2 print:space-y-1 print:text-[10px]">
              <div className="flex justify-between text-white/80 font-medium">
                <span>Total seluruh subtotal bahan</span>
                <span className="font-bold text-white">
                  {totalMaterialsCount} bahan
                </span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed pt-1 print:text-[9px] print:pt-0">
                Nilai berasal dari {clientMaterials.length} bahan draft klien +{" "}
                {adminMaterials.length} bahan tambahan admin. Belum ditetapkan
                sebagai nilai proyek final.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ACTION BAR 1: Finalize Project Value */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-2xs print:hidden print-hidden">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-600 shrink-0">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900">
              {hasUnsavedChanges
                ? "Perubahan belum ditetapkan"
                : "Nilai proyek siap"}
            </p>
            <p className="text-xs text-zinc-500">
              Tetapkan grand total bahan dan jasa sebagai nilai pesanan resmi
              proyek.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            onClick={handleSetProjectValue}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-white bg-[#2C4A3B] hover:bg-[#233A2E] rounded-lg shadow-sm transition disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            Tetapkan nilai proyek
          </button>
        </div>
      </div>

      {/* ACTION BAR 2: Advance Actions (Print & Send for approval) */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-2xs print:hidden print-hidden">
        <div>
          <p className="text-sm font-bold text-zinc-900">Aksi lanjutan</p>
          <p className="text-xs text-zinc-500">
            Gunakan tombol di bawah untuk mencetak daftar bahan atau mengirim
            rincian untuk approval ke atasan.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 shadow-2xs transition"
          >
            <Printer className="h-3.5 w-3.5" />
            Cetak daftar bahan & anggaran
          </button>
          <button
            onClick={handleSendForApproval}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2C4A3B] hover:bg-[#233A2E] rounded-lg shadow-sm transition"
          >
            <Send className="h-3.5 w-3.5" />
            Kirim untuk approval
          </button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="flex items-center justify-between text-xs text-zinc-400 pt-4 border-t border-zinc-200/50 print:pt-2 print:text-[10px]">
        <p>Renovin. · Ruang kerja studio interior</p>
      </div>
    </div>
  );
}
