import { createClient } from '@/lib/supabase/client'
import { getStatusLabel } from '@/lib/orders'
import type { AdminOrder, OrderStatusGroup } from '@/types/admin-orders'

// Data halaman Laporan: admin_orders + tanggal selesai dari project_status_history.
// Pembayaran belum ada di database (menunggu keputusan tim: DP / termin / progress).

export type PeriodKey = '30d' | 'this_month' | 'last_month' | '3m' | 'this_year' | 'all'

export const PERIOD_LABEL: Record<PeriodKey, string> = {
  '30d': '30 hari terakhir',
  this_month: 'Bulan ini',
  last_month: 'Bulan lalu',
  '3m': '3 bulan terakhir',
  this_year: 'Tahun ini',
  all: 'Semua waktu',
}

export interface ReportOrder extends AdminOrder {
  completed_at: string | null
}

const DAY = 24 * 60 * 60 * 1000
const WIB_OFFSET = 7 * 60 * 60 * 1000

// Awal hari/bulan/tahun di WIB, dikembalikan sebagai Date (UTC)
function wibParts(d: Date) {
  const w = new Date(d.getTime() + WIB_OFFSET)
  return { y: w.getUTCFullYear(), m: w.getUTCMonth(), day: w.getUTCDate() }
}
const wibDate = (y: number, m: number, day = 1) => new Date(Date.UTC(y, m, day) - WIB_OFFSET)

// Rentang [from, to) untuk periode; null = tanpa batas
export function periodRange(key: PeriodKey, now = new Date()): { from: Date | null; to: Date | null } {
  const { y, m, day } = wibParts(now)
  const tomorrow = wibDate(y, m, day + 1)
  switch (key) {
    case '30d':
      return { from: new Date(tomorrow.getTime() - 30 * DAY), to: tomorrow }
    case 'this_month':
      return { from: wibDate(y, m), to: wibDate(y, m + 1) }
    case 'last_month':
      return { from: wibDate(y, m - 1), to: wibDate(y, m) }
    case '3m':
      return { from: wibDate(y, m - 2), to: wibDate(y, m + 1) }
    case 'this_year':
      return { from: wibDate(y, 0), to: wibDate(y + 1, 0) }
    case 'all':
      return { from: null, to: null }
  }
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

export function inPeriod(orders: ReportOrder[], key: PeriodKey) {
  const { from, to } = periodRange(key)
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
export function chartBuckets(orders: ReportOrder[], key: PeriodKey): { unit: 'minggu' | 'bulan'; buckets: ChartBucket[] } {
  const valid = orders.filter((o) => o.status_group !== 'rejected')
  let { from, to } = periodRange(key)
  if (!from) {
    const first = valid.map((o) => o.submitted_at).sort()[0]
    if (!first) return { unit: 'bulan', buckets: [] }
    const p = wibParts(new Date(first))
    from = wibDate(p.y, p.m)
  }
  to = to ?? new Date()
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
