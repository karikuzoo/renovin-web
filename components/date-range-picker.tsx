"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { addDays, formatRange, monthStart, sameRange, wibDateKey, type DateRange, type RangePreset } from "@/lib/date-range";

// Pemilih tanggal / rentang tanggal bergaya Renovin.
// Klik satu tanggal lalu "Terapkan" = satu hari; klik dua tanggal = rentang.
//
//   <DateRangePicker value={range} onChange={setRange} presets={[PRESETS["30d"], ...]} allowAll="Semua tanggal" />

const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const monthTitle = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" });

// Sel kalender satu bulan: null = sel kosong sebelum tanggal 1 (minggu dimulai Senin)
function monthCells(first: string): (string | null)[] {
  const offset = (new Date(first + "T00:00:00Z").getUTCDay() + 6) % 7;
  const days = Number(addDays(monthStart(first, 1), -1).slice(8));
  return [...Array<null>(offset).fill(null), ...Array.from({ length: days }, (_, i) => addDays(first, i))];
}

function Month({
  first,
  draft,
  anchor,
  hover,
  todayKey,
  onPick,
  onHover,
}: {
  first: string;
  draft: DateRange | null;
  anchor: string | null;
  hover: string | null;
  todayKey: string;
  onPick: (key: string) => void;
  onHover: (key: string | null) => void;
}) {
  // Saat memilih ujung kedua, tampilkan rentang sementara sampai tanggal yang disorot
  const shown = anchor && hover ? (hover < anchor ? { from: hover, to: anchor } : { from: anchor, to: hover }) : draft;

  return (
    <div className="w-full sm:w-64">
      <p className="mb-3 text-center text-sm font-bold text-zinc-900 capitalize">{monthTitle.format(new Date(first + "T00:00:00Z"))}</p>
      <div className="grid grid-cols-7 text-center text-[10px] font-semibold uppercase text-zinc-400 mb-1">
        {WEEKDAYS.map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7" onMouseLeave={() => onHover(null)}>
        {monthCells(first).map((key, i) => {
          if (!key) return <span key={`e${i}`} />;
          const isStart = shown?.from === key;
          const isEnd = shown?.to === key;
          const inRange = !!shown && key > shown.from && key < shown.to;
          const isEdge = isStart || isEnd;
          return (
            <div
              key={key}
              className={`relative flex h-9 items-center justify-center ${inRange ? "bg-[#E8EDEA]" : ""} ${
                isStart && shown && shown.from !== shown.to ? "bg-gradient-to-r from-transparent from-50% to-[#E8EDEA] to-50%" : ""
              } ${isEnd && shown && shown.from !== shown.to ? "bg-gradient-to-l from-transparent from-50% to-[#E8EDEA] to-50%" : ""}`}
            >
              <button
                type="button"
                onClick={() => onPick(key)}
                onMouseEnter={() => onHover(key)}
                className={`relative h-8 w-8 rounded-full text-xs font-medium transition-colors ${
                  isEdge
                    ? "bg-[#2C4A3B] text-white"
                    : inRange
                      ? "text-[#2C4A3B] hover:bg-[#D4DFD7]"
                      : "text-zinc-700 hover:bg-zinc-100"
                } ${key === todayKey && !isEdge ? "ring-1 ring-inset ring-[#2C4A3B]/50 font-bold" : ""}`}
              >
                {Number(key.slice(8))}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DateRangePicker({
  value,
  onChange,
  presets,
  allowAll,
  className = "",
}: {
  value: DateRange | null;
  onChange: (range: DateRange | null) => void;
  presets: RangePreset[];
  // Teks untuk "tanpa filter tanggal"; kosongkan kalau filter wajib diisi
  allowAll?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRange | null>(value);
  const [anchor, setAnchor] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [view, setView] = useState(() => monthStart(value?.to ?? wibDateKey(), -1));
  const ref = useRef<HTMLDivElement>(null);
  const todayKey = wibDateKey();

  const openPicker = () => {
    setDraft(value);
    setAnchor(null);
    // Tampilkan bulan akhir rentang di kolom kanan (desktop)
    setView(monthStart(value?.to ?? todayKey, -1));
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (key: string) => {
    if (!anchor) {
      setAnchor(key);
      setDraft({ from: key, to: key });
    } else {
      setDraft(key < anchor ? { from: key, to: anchor } : { from: anchor, to: key });
      setAnchor(null);
    }
  };

  const apply = (range: DateRange | null) => {
    onChange(range);
    setOpen(false);
  };

  const label = value ? formatRange(value) : (allowAll ?? "Pilih tanggal");
  const activePreset = presets.find((p) => sameRange(p.range(), value));

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPicker())}
        aria-expanded={open}
        className="flex h-9 w-full items-center gap-2 whitespace-nowrap rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 sm:w-auto"
      >
        <Calendar className="h-4 w-4 shrink-0 text-zinc-500" />
        <span className="flex-1 text-left">{activePreset ? activePreset.label : label}</span>
        {activePreset && <span className="hidden text-xs font-normal text-zinc-400 md:inline">{label}</span>}
        <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-40 mt-2 w-[min(calc(100vw-2rem),40rem)] rounded-xl border border-zinc-200 bg-white shadow-xl sm:left-auto sm:right-0 sm:w-auto">
          <div className="flex flex-col sm:flex-row">
            {/* Preset */}
            <div className="flex gap-1 overflow-x-auto border-b border-zinc-100 p-2 sm:w-40 sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r">
              {allowAll && (
                <button
                  type="button"
                  onClick={() => apply(null)}
                  className={`shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-left text-xs font-semibold ${
                    value === null ? "bg-[#2C4A3B] text-white" : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  {allowAll}
                </button>
              )}
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => apply(p.range())}
                  className={`shrink-0 whitespace-nowrap rounded-md px-3 py-1.5 text-left text-xs font-semibold ${
                    activePreset === p ? "bg-[#2C4A3B] text-white" : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Kalender */}
            <div className="p-4">
              <div className="relative flex gap-6">
                <button
                  type="button"
                  onClick={() => setView(monthStart(view, -1))}
                  aria-label="Bulan sebelumnya"
                  className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setView(monthStart(view, 1))}
                  aria-label="Bulan berikutnya"
                  className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                {/* Layar sempit: satu bulan (bulan akhir); layar lebar: dua bulan berdampingan */}
                <div className="hidden xl:block">
                  <Month first={view} draft={draft} anchor={anchor} hover={hover} todayKey={todayKey} onPick={pick} onHover={setHover} />
                </div>
                <Month first={monthStart(view, 1)} draft={draft} anchor={anchor} hover={hover} todayKey={todayKey} onPick={pick} onHover={setHover} />
              </div>

              <div className="mt-4 flex flex-col gap-2 border-t border-zinc-100 pt-3 xl:flex-row xl:items-center xl:justify-between">
                <p className="text-xs text-zinc-500 sm:max-w-64 xl:max-w-none">
                  {anchor
                    ? "Pilih tanggal akhir, atau Terapkan untuk satu hari."
                    : draft
                      ? formatRange(draft)
                      : "Klik tanggal awal dan akhir."}
                </p>
                <div className="flex items-center justify-end gap-2">
                  {draft && (
                    <button
                      type="button"
                      onClick={() => {
                        setDraft(null);
                        setAnchor(null);
                      }}
                      className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-100"
                    >
                      <X className="h-3.5 w-3.5" /> Reset
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-md border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={!draft && !allowAll}
                    onClick={() => apply(draft)}
                    className="rounded-md bg-[#2C4A3B] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#233A2E] disabled:opacity-50"
                  >
                    Terapkan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
