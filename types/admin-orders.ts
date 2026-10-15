import type { Database } from './database.types'

export type OrderStatusGroup = 'new' | 'in_progress' | 'done' | 'rejected'

export type ProjectStatus = Database['public']['Enums']['project_status']

// One row from the admin_orders view.
// All columns are nullable by Supabase view convention,
// but only the ones marked here are truly nullable in practice.
export interface AdminOrder {
  id: string
  code: string
  title: string
  room_type: string | null
  notes: string | null
  status: ProjectStatus
  status_group: OrderStatusGroup
  submitted_at: string
  updated_at: string
  customer_id: string
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  assigned_admin_id: string | null
  assigned_admin_name: string | null
  order_value: number | null
  rab_calculated_at: string | null
  total_area: number
  measurement_count: number
  cover_photo_path: string | null
  photo_count: number
}
