import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

export type ClientStatus = Database['public']['Enums']['client_status']

// Satu baris dari view admin_clients (kontrak: renovin-backend/docs/contract-admin-clients.md).
// Semua kolom view bertipe nullable di database.types.ts; yang benar-benar bisa null ditandai di sini.
export interface AdminClient {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  registered_at: string
  client_since: string
  client_status: ClientStatus
  order_count: number
  active_order_count: number
  new_order_count: number
  done_order_count: number
  rejected_order_count: number
  total_order_value: number
  last_order_at: string
  related_order_id: string
  related_order_code: string
  related_order_title: string
  related_order_status: Database['public']['Enums']['project_status']
  related_order_status_group: Database['public']['Enums']['order_status_group']
  related_order_value: number | null
  related_order_admin_name: string | null
}

// Data klien masih sedikit, jadi semua diambil sekali; tab, pencarian & pagination di FE.
export async function fetchClients(): Promise<AdminClient[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_clients')
    .select('*')
    .order('last_order_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as AdminClient[]
}

export function getClientStatusLabel(status: ClientStatus): string {
  const labels: Record<ClientStatus, string> = {
    active: 'Proyek aktif',
    new: 'Klien baru',
    done: 'Selesai',
    inactive: 'Tidak aktif',
  }
  return labels[status] ?? status
}

export function getClientStatusStyle(status: ClientStatus) {
  const styles: Record<ClientStatus, { badge: string; dot: string }> = {
    active: { badge: 'bg-[#E8EDEA] text-[#2C4A3B]', dot: 'bg-[#2C4A3B]' },
    new: { badge: 'bg-orange-50 text-orange-700', dot: 'bg-orange-500' },
    done: { badge: 'bg-zinc-100 text-zinc-700', dot: 'bg-zinc-500' },
    inactive: { badge: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
  }
  return styles[status] ?? styles.done
}

export function getInitials(name: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

// Ekspor daftar klien (yang sedang tampil) ke CSV
export function downloadClientsCsv(clients: AdminClient[]) {
  const header = ['Nama', 'Email', 'Telepon', 'Status', 'Klien sejak', 'Jumlah pesanan', 'Total nilai', 'Proyek terkait']
  const rows = clients.map((c) => [
    c.full_name ?? '',
    c.email ?? '',
    c.phone ?? '',
    getClientStatusLabel(c.client_status),
    c.client_since?.slice(0, 10) ?? '',
    String(c.order_count),
    String(c.total_order_value),
    `${c.related_order_code} - ${c.related_order_title}`,
  ])
  const csv = [header, ...rows]
    .map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `klien-renovin-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
