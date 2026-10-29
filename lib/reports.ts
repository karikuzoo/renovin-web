import { createClient } from '@/lib/supabase/client'
import { getStatusLabel } from '@/lib/orders'
import { rangeBounds, type DateRange } from '@/lib/date-range'
import type { AdminOrder, OrderStatusGroup } from '@/types/admin-orders'

// Data halaman Laporan: admin_orders + tanggal selesai dari project_status_history.
// Pembayaran belum ada di database (menunggu keputusan tim: DP / termin / progress).

export interface ReportOrder extends AdminOrder {
  completed_at: string | null
}

const DAY = 24 * 60 * 60 * 1000
const WIB_OFFSET = 7 * 60 * 60 * 1000

// Awal bulan di WIB, dikembalikan sebagai Date (UTC)
function wibParts(d: Date) {
  const w = new Date(d.getTime() + WIB_OFFSET)
  return { y: w.getUTCFullYear(), m: w.getUTCMonth() }
}
const wibDate = (y: number, m: number, day = 1) => new Date(Date.UTC(y, m, day) - WIB_OFFSET)

// Rentang tanggal -> [from, to) sebagai Date; null = tanpa batas
function rangeDates(range: DateRange | null): { from: Date | null; to: Date | null } {
  if (!range) return { from: null, to: null }
  const { fromIso, toIso } = rangeBounds(range)
  return { from: new Date(fromIso), to: new Date(toIso) }
}

export async function fetchReportOrders(): Promise<ReportOrder[]> {
  const supabase = createClient()
  const [ordersRes, historyRes] = await Promise.all([
    supabase.from('admin_orders').select('*').order('submitted_at', { ascending: false }),
    supabase
      .from('project_status_history')
      .select('project_id, changed_at')
      .eq('to_status', 'completed')
      .order('changed_at', { ascending: false }),
  ])
  if (ordersRes.error) throw ordersRes.error
  if (historyRes.error) throw historyRes.error

  // Riwayat diurutkan terbaru dulu: ambil tanggal selesai terakhir per pesanan
  const completedAt = new Map<string, string>()
  for (const h of historyRes.data ?? []) {
    if (!completedAt.has(h.project_id)) completedAt.set(h.project_id, h.changed_at)
  }

  return ((ordersRes.data ?? []) as AdminOrder[]).map((o) => ({
    ...o,
    order_value: o.order_value === null ? null : Number(o.order_value),
    completed_at: o.status_group === 'done' ? (completedAt.get(o.id) ?? o.updated_at) : null,
  }))
}

export function inPeriod(orders: ReportOrder[], range: DateRange | null) {
  const { from, to } = rangeDates(range)
  return orders.filter((o) => {
    const t = new Date(o.submitted_at).getTime()
    return (!from || t >= from.getTime()) && (!to || t < to.getTime())
  })
}

export interface ChartBucket {
  label: string
  value: number
  count: number
}

const monthFmt = new Intl.DateTimeFormat('id-ID', { month: 'short', year: '2-digit', timeZone: 'Asia/Jakarta' })
const dayFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' })

// Nilai pesanan per minggu (periode ≤ ~2 bulan) atau per bulan. Pesanan ditolak tidak dihitung.
export function chartBuckets(orders: ReportOrder[], range: DateRange | null): { unit: 'minggu' | 'bulan'; buckets: ChartBucket[] } {
  const valid = orders.filter((o) => o.status_group !== 'rejected')
  let { from, to } = rangeDates(range)
  if (!from) {
    const first = valid.map((o) => o.submitted_at).sort()[0]
    if (!first) return { unit: 'bulan', buckets: [] }
    const p = wibParts(new Date(first))
    from = wibDate(p.y, p.m)
  }
  // Periode yang belum lewat (mis. "Tahun ini"): grafik berhenti di hari ini
  const now = new Date()
  to = !to || to > now ? new Date(Math.max(now.getTime(), from.getTime() + DAY)) : to
  const weekly = to.getTime() - from.getTime() <= 62 * DAY

  const buckets: (ChartBucket & { start: number; end: number })[] = []
  if (weekly) {
    for (let s = from.getTime(); s < to.getTime(); s += 7 * DAY) {
      buckets.push({ label: dayFmt.format(new Date(s)), value: 0, count: 0, start: s, end: Math.min(s + 7 * DAY, to.getTime()) })
    }
  } else {
    const p = wibParts(from)
    for (let i = 0; ; i++) {
      const s = wibDate(p.y, p.m + i)
      if (s.getTime() >= to.getTime()) break
      buckets.push({ label: monthFmt.format(s), value: 0, count: 0, start: s.getTime(), end: wibDate(p.y, p.m + i + 1).getTime() })
    }
  }
  for (const o of valid) {
    const t = new Date(o.submitted_at).getTime()
    const b = buckets.find((x) => t >= x.start && t < x.end)
    if (b) {
      b.value += o.order_value ?? 0
      b.count += 1
    }
  }
  return { unit: weekly ? 'minggu' : 'bulan', buckets: buckets.map(({ label, value, count }) => ({ label, value, count })) }
}

export const GROUP_ORDER: OrderStatusGroup[] = ['new', 'in_progress', 'done', 'rejected']

export function downloadReportCsv(orders: ReportOrder[], periodLabel: string) {
  const header = ['No. pesanan', 'Proyek', 'Klien', 'Penanggung jawab', 'Tanggal masuk', 'Status', 'Nilai RAB', 'Tanggal selesai']
  const rows = orders.map((o) => [
    o.code,
    o.title,
    o.customer_name ?? '',
    o.assigned_admin_name ?? '',
    o.submitted_at.slice(0, 10),
    getStatusLabel(o.status),
    o.order_value === null ? '' : String(o.order_value),
    o.completed_at?.slice(0, 10) ?? '',
  ])
  const csv = [header, ...rows].map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `laporan-renovin-${periodLabel.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
