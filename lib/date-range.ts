// Rentang tanggal kalender WIB untuk filter (Laporan, Daftar Pesanan).
// Tanggal disimpan sebagai 'YYYY-MM-DD' (hari kalender di Jakarta), keduanya inklusif.

export interface DateRange {
  from: string
  to: string
}

const WIB_OFFSET = 7 * 60 * 60 * 1000

// 'YYYY-MM-DD' untuk sebuah waktu, dilihat dari Jakarta
export function wibDateKey(d = new Date()): string {
  return new Date(d.getTime() + WIB_OFFSET).toISOString().slice(0, 10)
}

// Geser tanggal kalender (hari/bulan), tetap dalam format 'YYYY-MM-DD'
export function addDays(key: string, days: number): string {
  const d = new Date(key + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function monthStart(key: string, addMonths = 0): string {
  const [y, m] = key.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1 + addMonths, 1)).toISOString().slice(0, 10)
}

// Batas waktu untuk query: [awal hari `from` WIB, awal hari setelah `to` WIB)
export function rangeBounds(range: DateRange): { fromIso: string; toIso: string } {
  return { fromIso: `${range.from}T00:00:00+07:00`, toIso: `${addDays(range.to, 1)}T00:00:00+07:00` }
}

const fullFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const dayMonthFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const asDate = (key: string) => new Date(key + 'T00:00:00Z')

// "29 Okt 2026", "1 – 15 Okt 2026", "28 Sep – 3 Okt 2026", "20 Des 2025 – 5 Jan 2026"
export function formatRange(range: DateRange): string {
  if (range.from === range.to) return fullFmt.format(asDate(range.from))
  const sameYear = range.from.slice(0, 4) === range.to.slice(0, 4)
  const sameMonth = sameYear && range.from.slice(5, 7) === range.to.slice(5, 7)
  const start = sameMonth ? String(Number(range.from.slice(8))) : sameYear ? dayMonthFmt.format(asDate(range.from)) : fullFmt.format(asDate(range.from))
  return `${start} – ${fullFmt.format(asDate(range.to))}`
}

export interface RangePreset {
  label: string
  range: () => DateRange
}

const today = () => wibDateKey()

export const PRESETS: Record<'today' | '7d' | '30d' | 'this_month' | 'last_month' | '3m' | 'this_year', RangePreset> = {
  today: { label: 'Hari ini', range: () => ({ from: today(), to: today() }) },
  '7d': { label: '7 hari terakhir', range: () => ({ from: addDays(today(), -6), to: today() }) },
  '30d': { label: '30 hari terakhir', range: () => ({ from: addDays(today(), -29), to: today() }) },
  this_month: { label: 'Bulan ini', range: () => ({ from: monthStart(today()), to: addDays(monthStart(today(), 1), -1) }) },
  last_month: { label: 'Bulan lalu', range: () => ({ from: monthStart(today(), -1), to: addDays(monthStart(today()), -1) }) },
  '3m': { label: '3 bulan terakhir', range: () => ({ from: monthStart(today(), -2), to: addDays(monthStart(today(), 1), -1) }) },
  this_year: { label: 'Tahun ini', range: () => ({ from: `${today().slice(0, 4)}-01-01`, to: `${today().slice(0, 4)}-12-31` }) },
}

export const sameRange = (a: DateRange | null, b: DateRange | null) => a?.from === b?.from && a?.to === b?.to
