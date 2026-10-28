import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

// Kontrak: renovin-backend/docs/contract-tim.md
// Akun staff dikelola tim IT (Q14); halaman Tim hanya membaca.

type ProjectStatus = Database['public']['Enums']['project_status']
export type StaffRole = 'admin' | 'super_admin'

export const ROLE_LABEL: Record<StaffRole, string> = { super_admin: 'Super Admin', admin: 'Admin' }

// Status aktif yang menunggu super admin; sisanya menunggu tindakan admin penanggung jawab
const WAITING_SUPER_ADMIN: ProjectStatus[] = ['pending_approval']

export interface TeamOrder {
  id: string
  code: string
  title: string
  status: ProjectStatus
  customer_name: string | null
  order_value: number | null
  updated_at: string
}

export interface TeamMember {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  role: StaffRole
  active: TeamOrder[]
  needsAction: number
  waitingSuperAdmin: number
  completed: number
  lastActivityAt: string | null
}

export interface TeamData {
  members: TeamMember[]
  newOrders: number
  activeUnassigned: TeamOrder[]
}

export async function fetchTeam(): Promise<TeamData> {
  const supabase = createClient()
  const [staffRes, ordersRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, email, phone, role')
      .in('role', ['admin', 'super_admin'])
      .order('full_name'),
    supabase
      .from('admin_orders')
      .select('id, code, title, status, status_group, assigned_admin_id, customer_name, order_value, updated_at'),
  ])
  if (staffRes.error) throw staffRes.error
  if (ordersRes.error) throw ordersRes.error

  const orders = (ordersRes.data ?? []).filter((o) => o.id && o.status)
  const toTeamOrder = (o: (typeof orders)[number]): TeamOrder => ({
    id: o.id!,
    code: o.code ?? '',
    title: o.title ?? '',
    status: o.status!,
    customer_name: o.customer_name,
    order_value: o.order_value === null ? null : Number(o.order_value),
    updated_at: o.updated_at ?? '',
  })

  const members = (staffRes.data ?? []).map((s) => {
    const mine = orders.filter((o) => o.assigned_admin_id === s.id)
    const active = mine
      .filter((o) => o.status_group === 'in_progress')
      .map(toTeamOrder)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    const waitingSuperAdmin = active.filter((o) => WAITING_SUPER_ADMIN.includes(o.status)).length
    return {
      id: s.id,
      full_name: s.full_name,
      email: s.email,
      phone: s.phone,
      role: s.role as StaffRole,
      active,
      needsAction: active.length - waitingSuperAdmin,
      waitingSuperAdmin,
      completed: mine.filter((o) => o.status_group === 'done').length,
      lastActivityAt: mine.map((o) => o.updated_at ?? '').sort().at(-1) || null,
    }
  })

  return {
    members,
    newOrders: orders.filter((o) => o.status_group === 'new').length,
    activeUnassigned: orders.filter((o) => o.status_group === 'in_progress' && !o.assigned_admin_id).map(toTeamOrder),
  }
}

export function initials(name: string | null) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return ((parts[0][0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}
