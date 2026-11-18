"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ClipboardList, Loader2, Package, Search, User, X } from "lucide-react";
import { globalSearch, type SearchHit, type SearchResults } from "@/lib/global-search";

// Pencarian global di header ruang kerja: pesanan, klien, bahan katalog.
// Pintasan: Ctrl/⌘ + K atau "/" untuk fokus, ↑ ↓ untuk memilih, Enter untuk membuka, Esc untuk menutup.

const GROUPS: { key: keyof SearchResults; label: string; icon: typeof User }[] = [
  { key: "orders", label: "Pesanan", icon: ClipboardList },
  { key: "clients", label: "Klien", icon: User },
  { key: "products", label: "Bahan katalog", icon: Package },
];

const EMPTY: SearchResults = { orders: [], clients: [], products: [] };

function SearchBox({ autoFocus, onDone }: { autoFocus?: boolean; onDone?: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const trimmed = query.trim();

  // Daftar datar untuk navigasi keyboard: hasil, lalu "lihat semua pesanan"
  const hits = useMemo(() => [...results.orders, ...results.clients, ...results.products], [results]);
  const seeAllHref = `/workplace/pesanan?q=${encodeURIComponent(trimmed)}`;
  const itemCount = hits.length + (trimmed.length >= 2 ? 1 : 0);

  useEffect(() => {
    if (trimmed.length < 2) return;
    let ignore = false;
    const t = setTimeout(() => {
      setLoading(true);
      globalSearch(trimmed)
        .then((r) => {
          if (ignore) return;
          setResults(r);
          setError(false);
          setActive(0);
        })
        .catch(() => {
          if (!ignore) setError(true);
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }, 250);
    return () => {
      ignore = true;
      clearTimeout(t);
    };
  }, [trimmed]);

  // Ctrl/⌘ + K atau "/" (di luar kolom isian) untuk fokus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName));
      if ((e.key === "k" && (e.ctrlKey || e.metaKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    setResults(EMPTY);
    inputRef.current?.blur();
    onDone?.();
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      onDone?.();
      return;
    }
    if (!itemCount) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % itemCount);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + itemCount) % itemCount);
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(active < hits.length ? hits[active].href : seeAllHref);
    }
  };

  const showPanel = open && trimmed.length >= 2;
  const offsets = { orders: 0, clients: results.orders.length, products: results.orders.length + results.clients.length };

  const renderHit = (hit: SearchHit, Icon: typeof User, i: number) => {
    return (
      <li key={`${hit.kind}-${hit.id}`}>
        <button
          type="button"
          onMouseEnter={() => setActive(i)}
          onClick={() => go(hit.href)}
          className={`flex w-full items-center gap-3 px-3 py-2 text-left ${active === i ? "bg-[#E8EDEA]" : "hover:bg-zinc-50"}`}
        >
          <Icon className="h-4 w-4 shrink-0 text-zinc-400" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-zinc-900">{hit.title}</span>
            {hit.subtitle && <span className="block truncate text-[11px] text-zinc-500">{hit.subtitle}</span>}
          </span>
        </button>
      </li>
    );
  };

  return (
    <div className="relative w-full" ref={boxRef}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        autoFocus={autoFocus}
        onChange={(e) => {
          const v = e.target.value;
          setQuery(v);
          setOpen(true);
          if (v.trim().length < 2) setResults(EMPTY);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Cari pesanan, klien, atau bahan…"
        aria-label="Cari pesanan, klien, atau bahan"
        className="h-9 w-full rounded-md border border-[#E5E0D8] bg-white pl-9 pr-14 text-sm outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B] placeholder:text-zinc-400 [&::-webkit-search-cancel-button]:hidden"
      />
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
        ) : (
          <kbd className="hidden rounded border border-zinc-200 px-1.5 text-[10px] font-semibold text-zinc-400 lg:inline">Ctrl K</kbd>
        )}
      </span>

      {showPanel && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto md:left-auto md:w-[min(26rem,calc(100vw-2rem))] rounded-xl border border-zinc-200 bg-white py-2 shadow-xl">
          {error ? (
            <p className="px-3 py-4 text-sm text-red-600">Pencarian gagal. Coba lagi.</p>
          ) : hits.length === 0 ? (
            <p className="px-3 py-4 text-sm text-zinc-500">{loading ? "Mencari…" : `Tidak ada hasil untuk “${trimmed}”.`}</p>
          ) : (
            GROUPS.map(({ key, label, icon }) =>
              results[key].length ? (
                <div key={key} className="py-1">
                  <p className="px-3 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">{label}</p>
                  <ul>{results[key].map((h, k) => renderHit(h, icon, offsets[key] + k))}</ul>
                </div>
              ) : null,
            )
          )}
          <div className="mt-1 border-t border-zinc-100 pt-1">
            <button
              type="button"
              onMouseEnter={() => setActive(hits.length)}
              onClick={() => go(seeAllHref)}
              className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold text-[#2C4A3B] ${
                active === hits.length ? "bg-[#E8EDEA]" : "hover:bg-zinc-50"
              }`}
            >
              Cari “{trimmed}” di semua pesanan <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function GlobalSearch() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="hidden w-48 md:block lg:w-64">
        <SearchBox />
      </div>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Cari"
        className="text-zinc-500 hover:text-zinc-700 md:hidden"
      >
        <Search className="h-5 w-5" />
      </button>
      {mobileOpen && (
        <div className="fixed inset-x-0 top-0 z-50 flex items-center gap-2 border-b border-[#E5E0D8] bg-[#F4F1ED] px-4 py-2.5 md:hidden">
          <SearchBox autoFocus onDone={() => setMobileOpen(false)} />
          <button type="button" onClick={() => setMobileOpen(false)} aria-label="Tutup pencarian" className="p-1 text-zinc-500">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  );
}
