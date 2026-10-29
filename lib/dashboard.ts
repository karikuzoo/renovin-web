import { createClient } from '@/lib/supabase/client'
import { fetchDashboardSummary, getCoverPhotoUrl, type DashboardSummaryData } from '@/lib/orders'
import type { AdminOrder, ProjectStatus } from '@/types/admin-orders'

// Kontrak: renovin-backend/docs/contract-dashboard-summary.md + contract-admin-orders.md

// Tahap alur pesanan yang benar-benar ada di sistem (bukan desain/produksi/instalasi, belum ada datanya)
export const ORDER_STEPS = ['Diterima', 'RAB', 'Persetujuan', 'Konfirmasi', 'Laporan', 'Selesai'] as const

// Indeks tahap yang sedang berjalan untuk setiap status "dikerjakan"
const CURRENT_STEP: Partial<Record<ProjectStatus, number>> = {
  admin_processing: 1,
  rab_draft: 1,
  correction: 1,
  pending_approval: 2,
  approved: 3,
  confirmed: 4,
  report_generated: 5,
}

export function orderStep(status: ProjectStatus) {
  const current = CURRENT_STEP[status] ?? 0
  return { current, percent: Math.round((current / ORDER_STEPS.length) * 100) }
}

export interface OngoingProject extends AdminOrder {
  cover_url: string | null
}

export interface DashboardData {
  me: { id: string; fullName: string; role: string }
  summary: DashboardSummaryData | null
  ongoing: OngoingProject[]
  ongoingTotal: number
  // Pesanan yang menunggu tindakan pengguna yang login
  actionItems: AdminOrder[]
  actionTotal: number
}

export async function fetchDashboard(): Promise<DashboardData> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sesi login tidak ditemukan. Silakan masuk ulang.')

  const [profileRes, summary, ongoingRes] = await Promise.all([
    supabase.from('profiles').select('full_name, role').eq('id', user.id).single(),
    fetchDashboardSummary(),
    supabase
      .from('admin_orders')
      .select('*', { count: 'exact' })
      .eq('status_group', 'in_progress')
      .order('updated_at', { ascending: false })
      .limit(3),
  ])
  if (profileRes.error) throw profileRes.error
  if (ongoingRes.error) throw ongoingRes.error

  const role = profileRes.data.role
  // Super admin: RAB yang menunggu persetujuan. Admin: pesanannya sendiri yang perlu dikerjakan + pesanan baru.
  const actionQuery =
    role === 'super_admin'
      ? supabase.from('admin_orders').select('*', { count: 'exact' }).eq('status', 'pending_approval')
      : supabase
          .from('admin_orders')
          .select('*', { count: 'exact' })
          .or(`status.eq.sent_to_admin,and(assigned_admin_id.eq.${user.id},status_group.eq.in_progress,status.neq.pending_approval)`)
  const actionRes = await actionQuery.order('updated_at', { ascending: false }).limit(4)
  if (actionRes.error) throw actionRes.error

  const ongoing = await Promise.all(
    ((ongoingRes.data ?? []) as AdminOrder[]).map(async (o) => ({ ...o, cover_url: await getCoverPhotoUrl(o.cover_photo_path) })),
  )

  return {
    me: { id: user.id, fullName: profileRes.data.full_name ?? user.email ?? 'Admin', role },
    summary,
    ongoing,
    ongoingTotal: ongoingRes.count ?? ongoing.length,
    actionItems: (actionRes.data ?? []) as AdminOrder[],
    actionTotal: actionRes.count ?? 0,
  }
}

// Sapaan sesuai jam di Jakarta
export function greeting(now = new Date()) {
  const hour = Number(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Asia/Jakarta' }).format(now))
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}
