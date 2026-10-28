"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Plus,
  Search,
  ChevronDown,
  LayoutGrid,
  List,
  Info,
  ArrowUpRight,
  Copy,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { useConfirm } from "@/components/confirm-dialog";
import { ProductFormModal } from "@/components/product-form-modal";
import {
  AVAILABILITY_LABEL,
  STATUS_LABEL,
  duplicateForm,
  emptyForm,
  fetchCatalog,
  formFromProduct,
  setProductStatus,
  type Availability,
  type CatalogProduct,
  type CatalogStatus,
  type Category,
  type ProductForm,
} from "@/lib/catalog";
import { formatRupiah } from "@/lib/orders";

const PAGE_SIZE = 12;

const STATUS_BADGE: Record<CatalogStatus, string> = {
  published: "bg-[#2C4A3B]",
  draft: "bg-zinc-500",
  archived: "bg-zinc-300 text-zinc-700",
};

const AVAILABILITY_COLOR: Record<Availability, { dot: string; text: string }> = {
  available: { dot: "bg-green-500", text: "text-green-700" },
  indent: { dot: "bg-orange-500", text: "text-orange-700" },
  out_of_stock: { dot: "bg-red-500", text: "text-red-700" },
};

const UNIT_LABEL: Record<string, string> = { m2: "m²" };
const unitLabel = (u: string) => UNIT_LABEL[u] ?? u;

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return (err as { message?: string })?.message ?? "Terjadi kesalahan.";
}

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return (
    new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }).format(new Date(iso)) + " WIB"
  );
}

function FilterSelect<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T | "";
  onChange: (v: T | "") => void;
  options: { value: T | ""; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T | "")}
        className="h-9 appearance-none rounded-md border border-zinc-200 bg-white pl-3 pr-8 text-sm font-medium text-zinc-700 outline-none hover:bg-zinc-50 focus:border-[#2C4A3B]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
    </div>
  );
}

function ProductThumb({ item }: { item: CatalogProduct }) {
  if (item.image_url) return <Image src={item.image_url} alt={item.name} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />;
  if (item.color_hex) return <div className="absolute inset-0" style={{ backgroundColor: item.color_hex }} />;
  return (
    <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
      <Package className="h-8 w-8" />
    </div>
  );
}

function AvailabilityText({ item }: { item: CatalogProduct }) {
  const color = AVAILABILITY_COLOR[item.availability];
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${color.dot}`} />
      <span className={`text-xs font-medium ${color.text}`}>
        {AVAILABILITY_LABEL[item.availability]}
        {item.availability_note && ` · ${item.availability_note}`}
      </span>
    </div>
  );
}

function StatusMenu({ item, onChange }: { item: CatalogProduct; onChange: (status: CatalogStatus) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const actions: { status: CatalogStatus; label: string }[] = [
    { status: "published", label: "Terbitkan" },
    { status: "draft", label: "Jadikan draft" },
    { status: "archived", label: "Arsipkan" },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Ubah status"
        className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute bottom-8 right-0 z-20 w-40 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
          {actions
            .filter((a) => a.status !== item.status)
            .map((a) => (
              <button
                key={a.status}
                onClick={() => {
                  setOpen(false);
                  onChange(a.status);
                }}
                className={`block w-full px-3 py-1.5 text-left text-xs font-medium hover:bg-zinc-50 ${
                  a.status === "archived" ? "text-red-600" : "text-zinc-700"
                }`}
              >
                {a.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

type ModalState = { mode: "create" | "edit" | "duplicate"; productId: string | null; initial: ProductForm } | null;

export default function KatalogBahan() {
  const [products, setProducts] = useState<CatalogProduct[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<CatalogStatus | "">("");
  const [availabilityFilter, setAvailabilityFilter] = useState<Availability | "">("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState<ModalState>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [confirm, confirmDialog] = useConfirm();

  useEffect(() => {
    let ignore = false;
    fetchCatalog()
      .then((d) => {
        if (ignore) return;
        setProducts(d.products);
        setCategories(d.categories);
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

  const all = useMemo(() => products ?? [], [products]);

  const stats = useMemo(
    () => ({
      total: all.length,
      published: all.filter((p) => p.status === "published").length,
      draft: all.filter((p) => p.status === "draft").length,
      archived: all.filter((p) => p.status === "archived").length,
      categories: new Set(all.map((p) => p.category_id)).size,
      lastUpdated: all.map((p) => p.updated_at).sort().at(-1) ?? null,
    }),
    [all],
  );

  // Tanpa filter status, arsip disembunyikan supaya daftar fokus ke bahan yang dipakai
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter(
      (p) =>
        (!q || [p.name, p.brand, p.sku].some((v) => v?.toLowerCase().includes(q))) &&
        (!categoryFilter || p.category_id === categoryFilter) &&
        (statusFilter ? p.status === statusFilter : p.status !== "archived") &&
        (!availabilityFilter || p.availability === availabilityFilter),
    );
  }, [all, search, categoryFilter, statusFilter, availabilityFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const withPageReset =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setter(v);
      setPage(1);
    };

  const openEdit = (item: CatalogProduct) => setModal({ mode: "edit", productId: item.id, initial: formFromProduct(item) });
  const openDuplicate = (item: CatalogProduct) => setModal({ mode: "duplicate", productId: null, initial: duplicateForm(item) });

  const changeStatus = async (item: CatalogProduct, status: CatalogStatus) => {
    if (status === "archived") {
      const ok = await confirm({
        title: "Arsipkan bahan?",
        message: `${item.name} tidak akan tampil lagi di aplikasi klien. Pesanan yang sudah memakai bahan ini tidak berubah, dan bahan bisa diterbitkan lagi kapan saja.`,
        confirmLabel: "Arsipkan",
        tone: "danger",
      });
      if (!ok) return;
    }
    try {
      await setProductStatus(item.id, status);
      setToast({ type: "success", text: `${item.name}: ${STATUS_LABEL[status]}.` });
      setReloadKey((k) => k + 1);
    } catch (err) {
      setToast({ type: "error", text: errorMessage(err) });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {confirmDialog}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 max-w-md rounded-xl border px-4 py-3 text-sm font-medium shadow-xl ${
            toast.type === "success" ? "bg-[#2C4A3B] text-white border-[#233A2E]" : "bg-red-600 text-white border-red-700"
          }`}
        >
          {toast.text}
        </div>
      )}
      {modal && (
        <ProductFormModal
          mode={modal.mode}
          productId={modal.productId}
          initial={modal.initial}
          categories={categories}
          onClose={() => setModal(null)}
          onSaved={(text) => {
            setModal(null);
            setToast({ type: "success", text });
            setReloadKey((k) => k + 1);
          }}
        />
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Katalog Bahan</h1>
          <p className="text-sm text-zinc-500">Kelola pilihan cat, furnitur, dan material Renovin untuk kebutuhan renovasi klien.</p>
        </div>
        <button
          onClick={() => setModal({ mode: "create", productId: null, initial: emptyForm(categoryFilter) })}
          disabled={!products}
          className="flex items-center gap-2 rounded-md bg-[#2C4A3B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#233A2E] disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          Tambah bahan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
          <p className="text-sm font-medium text-zinc-500">Total bahan</p>
          <p className="text-4xl font-bold text-zinc-900">{products ? stats.total : "–"}</p>
          <p className="text-xs text-zinc-400">{stats.archived ? `Termasuk ${stats.archived} arsip` : "Cat, furnitur, dan material"}</p>
        </div>
        <div className="rounded-xl bg-[#2C4A3B] p-5 flex flex-col justify-between h-32 text-white">
          <p className="text-sm font-medium text-white/80">Bahan terbit</p>
          <p className="text-4xl font-bold">{products ? stats.published : "–"}</p>
          <p className="text-xs text-white/70">Dapat dipilih klien dari katalog</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
          <p className="text-sm font-medium text-zinc-500">Draft katalog</p>
          <p className="text-4xl font-bold text-zinc-900">{products ? stats.draft : "–"}</p>
          <p className="text-xs text-zinc-400">Belum ditampilkan kepada klien</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5 flex flex-col justify-between h-32">
          <p className="text-sm font-medium text-zinc-500">Kategori bahan</p>
          <p className="text-4xl font-bold text-zinc-900">{products ? stats.categories : "–"}</p>
          <p className="text-xs text-zinc-400">Dari {categories.length} kategori tersedia</p>
        </div>
      </div>

      {/* Alert */}
      <div className="flex items-start gap-3 rounded-xl bg-[#E8EDEA] p-4 border border-[#2C4A3B]/10">
        <Info className="h-5 w-5 text-[#2C4A3B] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-zinc-900 mb-0.5">Harga bahan bukan total harga proyek</p>
          <p className="text-sm text-zinc-600">
            Klien memilih bahan beserta harga satuannya dari katalog. Total proyek (bahan, jasa, penyesuaian, dan pajak) baru
            ditetapkan admin di RAB setelah pesanan diterima.
          </p>
        </div>
      </div>

      {/* Catalog */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Semua bahan</h2>
            <p className="text-sm text-zinc-500">Spesifikasi yang jelas untuk draft bahan yang lebih tepat.</p>
          </div>
          <div className="flex items-center border border-zinc-200 rounded-md overflow-hidden">
            <button
              onClick={() => setView("grid")}
              title="Tampilan kartu"
              className={`flex h-8 w-8 items-center justify-center ${view === "grid" ? "bg-zinc-100 text-zinc-700" : "text-zinc-400 hover:text-zinc-700"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("list")}
              title="Tampilan daftar"
              className={`flex h-8 w-8 items-center justify-center ${view === "list" ? "bg-zinc-100 text-zinc-700" : "text-zinc-400 hover:text-zinc-700"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6 mt-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => withPageReset(setSearch)(e.target.value)}
              placeholder="Cari nama, merek, atau kode bahan..."
              className="h-9 w-full rounded-md border border-zinc-200 pl-9 pr-4 text-sm outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B] placeholder:text-zinc-400"
            />
          </div>
          <FilterSelect
            value={categoryFilter}
            onChange={withPageReset(setCategoryFilter)}
            options={[{ value: "", label: "Semua kategori" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
          />
          <FilterSelect<CatalogStatus>
            value={statusFilter}
            onChange={withPageReset(setStatusFilter)}
            options={[
              { value: "", label: "Terbit & draft" },
              { value: "published", label: "Terbit" },
              { value: "draft", label: "Draft" },
              { value: "archived", label: "Arsip" },
            ]}
          />
          <FilterSelect<Availability>
            value={availabilityFilter}
            onChange={withPageReset(setAvailabilityFilter)}
            options={[
              { value: "", label: "Semua ketersediaan" },
              { value: "available", label: "Tersedia" },
              { value: "indent", label: "Indent" },
              { value: "out_of_stock", label: "Habis" },
            ]}
          />
        </div>

        {loadError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Gagal memuat katalog: {loadError}{" "}
            <button onClick={() => setReloadKey((k) => k + 1)} className="font-semibold underline">
              Coba lagi
            </button>
          </div>
        ) : !products ? (
          <p className="py-12 text-center text-sm text-zinc-500">Memuat katalog…</p>
        ) : pageItems.length === 0 ? (
          <p className="py-12 text-center text-sm text-zinc-500">
            {all.length === 0 ? "Belum ada bahan. Klik \"Tambah bahan\" untuk mulai." : "Tidak ada bahan yang cocok dengan filter."}
          </p>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pageItems.map((item) => (
              <div key={item.id} className="rounded-xl border border-zinc-200 bg-white flex flex-col">
                <div className="relative h-44 bg-[#E8E4DE] overflow-hidden rounded-t-xl">
                  <ProductThumb item={item} />
                  <span className={`absolute top-3 left-3 rounded px-2 py-0.5 text-[10px] font-bold text-white ${STATUS_BADGE[item.status]}`}>
                    {STATUS_LABEL[item.status]}
                  </span>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-zinc-500">{item.category_name}</span>
                    <span className="text-[10px] font-bold text-zinc-400">{item.sku}</span>
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900">{item.name}</h3>
                  <p className="text-xs text-zinc-500 mb-3">{item.brand ?? "—"}</p>

                  <div className="mt-auto space-y-2">
                    {item.spec && <p className="text-xs font-medium text-zinc-700">{item.spec}</p>}
                    {(item.color_hex || item.description) && (
                      <div className="flex items-center gap-2">
                        {item.color_hex && (
                          <div className="h-3.5 w-3.5 shrink-0 rounded-full border border-zinc-200" style={{ backgroundColor: item.color_hex }} />
                        )}
                        <p className="text-[10px] text-zinc-500 line-clamp-1">{item.description ?? item.color_name}</p>
                      </div>
                    )}

                    <p className="pt-1 text-sm font-bold text-zinc-900">
                      {formatRupiah(item.price_customer)}
                      <span className="text-[10px] font-medium text-zinc-400"> / {unitLabel(item.unit)}</span>
                    </p>

                    <div className="flex items-center justify-between">
                      <AvailabilityText item={item} />
                      <span className="text-[10px] text-zinc-400 font-medium">Satuan: {unitLabel(item.unit)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                      <button onClick={() => openEdit(item)} className="text-xs font-bold text-zinc-900 hover:text-[#2C4A3B] flex items-center gap-1">
                        Edit bahan <ArrowUpRight className="h-3 w-3" />
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openDuplicate(item)}
                          title="Duplikat"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <StatusMenu item={item} onChange={(s) => changeStatus(item, s)} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs font-semibold text-zinc-500">
                  <th className="py-2 pr-4">Bahan</th>
                  <th className="py-2 pr-4">Kategori</th>
                  <th className="py-2 pr-4 text-right">Harga klien</th>
                  <th className="py-2 pr-4 text-right">Harga internal</th>
                  <th className="py-2 pr-4">Ketersediaan</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-100 last:border-0">
                    <td className="py-3 pr-4">
                      <div className="flex min-w-[220px] items-center gap-3">
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-[#E8E4DE]">
                          <ProductThumb item={item} />
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900">{item.name}</p>
                          <p className="text-xs text-zinc-500">
                            {item.sku}
                            {item.brand && ` · ${item.brand}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-zinc-600">{item.category_name}</td>
                    <td className="py-3 pr-4 text-right font-medium text-zinc-900 whitespace-nowrap">
                      {formatRupiah(item.price_customer)} <span className="text-xs text-zinc-400">/ {unitLabel(item.unit)}</span>
                    </td>
                    <td className="py-3 pr-4 text-right text-zinc-600 whitespace-nowrap">
                      {item.price_internal === null ? "—" : formatRupiah(item.price_internal)}
                    </td>
                    <td className="py-3 pr-4">
                      <AvailabilityText item={item} />
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold text-white ${STATUS_BADGE[item.status]}`}>
                        {STATUS_LABEL[item.status]}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(item)} className="px-2 text-xs font-bold text-zinc-900 hover:text-[#2C4A3B]">
                          Edit
                        </button>
                        <button
                          onClick={() => openDuplicate(item)}
                          title="Duplikat"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <StatusMenu item={item} onChange={(s) => changeStatus(item, s)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {products && filtered.length > 0 && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mt-6 pt-4 border-t border-zinc-100">
            <p className="text-xs text-zinc-500">
              Menampilkan {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} dari {filtered.length} bahan ·{" "}
              {stats.published} terbit, {stats.draft} draft
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 text-zinc-400 hover:bg-zinc-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold ${
                    n === currentPage ? "bg-[#2C4A3B] text-white" : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === pageCount}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 text-zinc-400 hover:bg-zinc-50 disabled:opacity-40"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-zinc-400 pt-4 border-t border-zinc-200/50">
        <p>Renovin. · Ruang kerja studio interior</p>
        <p>Terakhir diperbarui {formatDateTime(stats.lastUpdated)}</p>
      </div>
    </div>
  );
}
