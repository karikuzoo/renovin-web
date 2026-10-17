import { createClient } from '@/lib/supabase/client'
import type { AdminOrder, OrderStatusGroup } from '@/types/admin-orders'

const DEFAULT_PAGE_SIZE = 10

// Format number as Indonesian Rupiah (full)
export function formatRupiah(value: number | null): string {
  if (value == null) return 'Belum dihitung'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

// Format number as compact Indonesian Rupiah (e.g. Rp 485 jt)
export function formatRupiahCompact(value: number | null): string {
  if (value == null || value === 0) return 'Rp 0'
  const formatted = new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
  return `Rp ${formatted}`
}

// Format date to Indonesian locale
export function formatTanggal(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

// Format date with time
export function formatTanggalWaktu(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    const dateFormatted = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d)
    const timeFormatted = new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(d)
    return `${dateFormatted}, ${timeFormatted} WIB`
  } catch {
    return dateStr
  }
}

// Get status label for display
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    sent_to_admin: 'Pesanan masuk',
    admin_processing: 'Diproses admin',
    rab_draft: 'Draft RAB',
    pending_approval: 'Menunggu persetujuan',
    approved: 'Disetujui',
    correction: 'Perlu koreksi',
    rejected: 'Ditolak',
    confirmed: 'Dikonfirmasi',
    report_generated: 'Laporan dibuat',
    completed: 'Selesai',
  }
  return labels[status] ?? status
}

// Get badge color config by status_group
export function getStatusGroupStyle(group: OrderStatusGroup | string | null | undefined) {
  const styles: Record<OrderStatusGroup, { bg: string; text: string; dot: string }> = {
    new: { bg: 'bg-orange-50 border-orange-200/50', text: 'text-orange-700', dot: 'bg-orange-500' },
    in_progress: { bg: 'bg-blue-50 border-blue-200/50', text: 'text-blue-700', dot: 'bg-blue-500' },
    done: { bg: 'bg-green-50 border-green-200/50', text: 'text-green-700', dot: 'bg-green-500' },
    rejected: { bg: 'bg-red-50 border-red-200/50', text: 'text-red-700', dot: 'bg-red-500' },
  }
  const key = (group as OrderStatusGroup) || 'new'
  return styles[key] ?? styles.new
}

// Get group label
export function getGroupLabel(group: OrderStatusGroup): string {
  const labels: Record<OrderStatusGroup, string> = {
    new: 'Baru',
    in_progress: 'Dikerjakan',
    done: 'Selesai',
    rejected: 'Ditolak',
  }
  return labels[group] ?? group
}

// Resolve cover photo to a displayable URL
export async function getCoverPhotoUrl(coverPath: string | null): Promise<string | null> {
  if (!coverPath) return null
  if (coverPath.startsWith('http://') || coverPath.startsWith('https://')) return coverPath
  try {
    const supabase = createClient()
    const { data } = await supabase.storage.from('room-photos').createSignedUrl(coverPath, 60 * 60)
    return data?.signedUrl ?? null
  } catch {
    return null
  }
}

export interface FetchOrdersParams {
  statusGroup?: OrderStatusGroup | null // null = semua
  search?: string
  page?: number // 0-based
  pageSize?: number
}

export interface FetchOrdersResult {
  orders: AdminOrder[]
  total: number
  counts: Record<OrderStatusGroup | 'all', number>
  totalValue: number
  summary: DashboardSummaryData | null
}

export async function fetchOrders({
  statusGroup = null,
  search = '',
  page = 0,
  pageSize = DEFAULT_PAGE_SIZE,
}: FetchOrdersParams = {}): Promise<FetchOrdersResult> {
  const supabase = createClient()

  // 1. Build main query for paginated rows
  let query = supabase
    .from('admin_orders')
    .select('*', { count: 'exact' })

  if (statusGroup) {
    query = query.eq('status_group', statusGroup)
  }

  // Karakter , ( ) "  % * punya arti khusus di filter .or() PostgREST -> dibuang.
  const keyword = search.replace(/[,()"\\%*]/g, ' ').trim()
  if (keyword) {
    const kw = `%${keyword}%`
    query = query.or(`code.ilike.${kw},title.ilike.${kw},customer_name.ilike.${kw}`)
  }

  query = query
    .order('submitted_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1)

  const { data, count, error } = await query
  if (error) throw error
  const orders = (data ?? []) as AdminOrder[]

  // 2. Jumlah per tab + total nilai: satu panggilan dashboard_summary
  //    (dihitung dari admin_orders, tanpa filter pencarian)
  const summary = await fetchDashboardSummary()
  const counts: Record<OrderStatusGroup, number> = {
    new: summary?.new_orders ?? 0,
    in_progress: summary?.in_progress_orders ?? 0,
    done: summary?.done_orders ?? 0,
    rejected: summary?.rejected_orders ?? 0,
  }
  const allCount = counts.new + counts.in_progress + counts.done + counts.rejected
  const totalValue = summary?.total_order_value ?? 0

  return {
    orders,
    total: count ?? 0,
    counts: { ...counts, all: allCount },
    totalValue,
    summary,
  }
}

export interface DashboardSummaryData {
  total_orders: number
  new_orders: number
  in_progress_orders: number
  done_orders: number
  rejected_orders: number
  in_progress_by_status: Record<string, number>
  total_order_value: number
  valued_orders: number
  last_completed_at: string | null
  generated_at: string
}

export async function fetchDashboardSummary(): Promise<DashboardSummaryData | null> {
  const supabase = createClient()
  try {
    const { data, error } = await supabase.rpc('dashboard_summary').single()
    if (error) {
      console.warn('dashboard_summary RPC error:', error.message)
      return null
    }
    return data as unknown as DashboardSummaryData
  } catch {
    return null
  }
}

export interface CustomerProfile {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  role: string
}

// Fetch list of profiles (customers) for order creation dropdown
export async function fetchCustomers(): Promise<CustomerProfile[]> {
  const supabase = createClient()
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, role')
      .eq('role', 'customer')
      .order('full_name', { ascending: true })

    if (error) {
      console.error('fetchCustomers error:', error)
      return []
    }
    return (data as CustomerProfile[]) ?? []
  } catch (err) {
    console.error('fetchCustomers unexpected error:', err)
    return []
  }
}

export interface CreateOrderInput {
  title: string
  room_type?: string
  notes?: string
  customer_id?: string
  total_area?: number
  photo_file?: File | null
  photo_url?: string | null
  status?: 'sent_to_admin' | 'admin_processing'
}

// Create a new order by admin
export async function createOrder(input: CreateOrderInput) {
  // TODO(tambah pesanan): fitur ini ditunda. Insert langsung ke projects ditolak
  // database (lihat review-fitur-pesanan.md P1); perlu RPC admin_create_order.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClient() as any

  // 1. Get current logged in user
  const { data: { user } } = await supabase.auth.getUser()
  const customerId = input.customer_id || user?.id

  if (!customerId) {
    throw new Error('Pelanggan wajib dipilih atau akun admin harus login terlebih dahulu.')
  }

  const initialStatus = input.status || 'sent_to_admin'
  const submittedAt = new Date().toISOString()

  // 2. Prepare payload for projects insert
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const insertPayload: Record<string, any> = {
    title: input.title.trim(),
    room_type: input.room_type?.trim() || null,
    notes: input.notes?.trim() || null,
    customer_id: customerId,
    status: initialStatus,
    submitted_at: submittedAt,
  }

  if (initialStatus === 'admin_processing' && user?.id) {
    insertPayload.assigned_admin_id = user.id
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let project: any = null

  const { data, error } = await supabase
    .from('projects')
    .insert(insertPayload)
    .select()
    .single()

  if (error) {
    // Fallback: If column grant restriction blocks customer_id/status, try standard insert
    console.warn('Initial project insert failed, trying minimal insert:', error.message)
    const fallbackPayload = {
      title: input.title.trim(),
      room_type: input.room_type?.trim() || null,
      notes: input.notes?.trim() || null,
    }
    const { data: fbData, error: fbError } = await supabase
      .from('projects')
      .insert(fallbackPayload)
      .select()
      .single()

    if (fbError) {
      throw new Error(`Gagal membuat pesanan: ${fbError.message}`)
    }
    project = fbData
  } else {
    project = data
  }

  const projectId = project?.id

  // 3. Insert room measurement if total_area is provided
  if (projectId && input.total_area && Number(input.total_area) > 0) {
    try {
      const areaVal = Number(input.total_area)
      await supabase.from('room_measurements').insert({
        project_id: projectId,
        area_type: 'wall',
        label: 'Estimasi Ruangan',
        length: areaVal,
        width: 1,
        source: 'manual',
      })
    } catch (mErr) {
      console.warn('Failed to insert room measurement:', mErr)
    }
  }

  // 4. Handle photo upload / URL if provided
  if (projectId) {
    let photoUrlToSave = input.photo_url?.trim() || null
    if (input.photo_file) {
      try {
        const { uploadFile } = await import('@/lib/storage')
        const uploadRes = await uploadFile(input.photo_file, 'room-photos', projectId)
        photoUrlToSave = uploadRes.url
      } catch (uploadErr) {
        console.warn('Photo upload failed:', uploadErr)
      }
    }

    if (photoUrlToSave) {
      try {
        await supabase.from('room_photos').insert({
          project_id: projectId,
          original_url: photoUrlToSave,
          width: 1200,
          height: 800,
        })
      } catch (pErr) {
        console.warn('Failed to insert room photo:', pErr)
      }
    }
  }

  return project
}

// Accept an order (change status from sent_to_admin to admin_processing)
export async function acceptOrder(projectId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('change_project_status', {
    p_project_id: projectId,
    p_to_status: 'admin_processing',
  })
  if (error) throw error
  return data
}
