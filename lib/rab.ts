import { createClient } from '@/lib/supabase/client'
import { getFileUrl } from '@/lib/storage'
import type { Database } from '@/types/database.types'
import type { AdminOrder } from '@/types/admin-orders'

type Tables = Database['public']['Tables']
export type Rab = Tables['rabs']['Row']
export type RabLineItem = Tables['rab_line_items']['Row']
export type RabItemType = Database['public']['Enums']['rab_item_type']
export type ProjectStatus = Database['public']['Enums']['project_status']
export type UserRole = Database['public']['Enums']['user_role']

// Baris yang bisa diedit admin (is_manual = true). id null = baris baru, belum tersimpan.
export interface ManualRow {
  key: string
  id: string | null
  itemType: RabItemType
  name: string
  spec: string
  quantity: number
  unit: string
  unitPrice: number
}

export interface OrderDetail {
  order: AdminOrder
  photoBeforeUrl: string | null
  photoAfterUrl: string | null
  receivedAt: string | null
  rab: Rab | null
  autoItems: RabLineItem[]
  manualItems: RabLineItem[]
  myRole: UserRole | null
  myId: string | null
  approvals: Approval[]
  report: ReportInfo | null
}

// Laporan PDF terbaru (kontrak: renovin-backend/docs/contract-laporan-pdf.md)
export interface ReportInfo {
  id: string
  pdf_url: string
  generated_at: string
}

export type ApprovalDecision = Database['public']['Enums']['approval_decision']

// Riwayat keputusan super admin (kontrak: renovin-backend/docs/contract-persetujuan-rab.md)
export interface Approval {
  id: string
  decision: ApprovalDecision
  note: string | null
  decided_at: string
  decided_by_name: string | null
}

export interface StaffMember {
  id: string
  full_name: string | null
  role: UserRole
}

// Status yang mengizinkan RAB diubah (sama dengan public.can_edit_rab di backend)
export function canEditRab(status: ProjectStatus, role: UserRole | null): boolean {
  if (role === 'admin' || role === 'super_admin') {
    if (['admin_processing', 'rab_draft', 'correction'].includes(status)) return true
  }
  return role === 'super_admin' && status === 'pending_approval'
}

// "Nama — spesifikasi" disimpan di kolom description
const SPEC_SEPARATOR = ' — '
export function splitDescription(description: string): { name: string; spec: string } {
  const i = description.indexOf(SPEC_SEPARATOR)
  if (i < 0) return { name: description, spec: '' }
  return { name: description.slice(0, i), spec: description.slice(i + SPEC_SEPARATOR.length) }
}
function joinDescription(name: string, spec: string): string {
  return spec.trim() ? `${name.trim()}${SPEC_SEPARATOR}${spec.trim()}` : name.trim()
}

export function toManualRow(item: RabLineItem): ManualRow {
  const { name, spec } = splitDescription(item.description)
  return {
    key: item.id,
    id: item.id,
    itemType: item.item_type,
    name,
    spec,
    quantity: Number(item.quantity),
    unit: item.unit,
    unitPrice: Number(item.unit_price_customer),
  }
}

export async function fetchOrderDetail(idOrCode: string): Promise<OrderDetail | null> {
  const supabase = createClient()
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrCode)

  const { data: order, error } = await supabase
    .from('admin_orders')
    .select('*')
    .eq(isUuid ? 'id' : 'code', idOrCode)
    .maybeSingle()
  if (error) throw error
  if (!order?.id) return null
  const projectId = order.id

  const [photosRes, rabRes, itemsRes, historyRes, roleRes, userRes, approvalsRes, reportRes] = await Promise.all([
    supabase.from('room_photos').select('original_url, processed_url').eq('project_id', projectId)
      .order('created_at', { ascending: true }).limit(1),
    supabase.from('rabs').select('*').eq('project_id', projectId).maybeSingle(),
    supabase.from('rab_line_items').select('*').eq('project_id', projectId)
      .order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
    supabase.from('project_status_history').select('changed_at').eq('project_id', projectId)
      .eq('to_status', 'admin_processing').order('changed_at', { ascending: false }).limit(1),
    supabase.rpc('my_role'),
    supabase.auth.getUser(),
    supabase.from('approvals')
      .select('id, decision, note, decided_at, decided_by_profile:profiles!approvals_decided_by_fkey(full_name)')
      .eq('project_id', projectId)
      .order('decided_at', { ascending: false }),
    supabase.from('reports').select('id, pdf_url, generated_at').eq('project_id', projectId)
      .order('generated_at', { ascending: false }).limit(1).maybeSingle(),
  ])
  for (const r of [photosRes, rabRes, itemsRes, historyRes, approvalsRes, reportRes]) if (r.error) throw r.error

  const photo = photosRes.data?.[0]
  const toUrl = async (path: string | null | undefined) =>
    path ? getFileUrl('room-photos', path).catch(() => null) : null

  const items = itemsRes.data ?? []
  return {
    order: order as AdminOrder,
    photoBeforeUrl: await toUrl(photo?.original_url ?? order.cover_photo_path),
    photoAfterUrl: await toUrl(photo?.processed_url),
    receivedAt: historyRes.data?.[0]?.changed_at ?? null,
    rab: rabRes.data ?? null,
    autoItems: items.filter((i) => !i.is_manual),
    manualItems: items.filter((i) => i.is_manual),
    myRole: roleRes.data ?? null,
    myId: userRes.data.user?.id ?? null,
    report: reportRes.data ?? null,
    approvals: (approvalsRes.data ?? []).map((a) => ({
      id: a.id,
      decision: a.decision,
      note: a.note,
      decided_at: a.decided_at,
      decided_by_name: a.decided_by_profile?.full_name ?? null,
    })),
  }
}

// Hitung ulang baris otomatis dari desain (cat, furnitur, jasa). Baris manual tidak berubah.
export async function calculateRab(projectId: string): Promise<Rab> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('calculate_rab', { p_project_id: projectId })
  if (error) throw error
  return data as Rab
}

export interface SaveRabInput {
  projectId: string
  rabId: string | null
  rows: ManualRow[]
  originalItems: RabLineItem[]
  adjustment: number
  adjustmentNote: string
  notes: string
}

// Simpan baris manual (insert/update/delete) + penyesuaian & catatan RAB.
// Kalau RAB belum ada, dibuat dulu lewat calculate_rab.
export async function saveRab(input: SaveRabInput): Promise<void> {
  const supabase = createClient()
  const rabId = input.rabId ?? (await calculateRab(input.projectId)).id

  for (const [i, row] of input.rows.entries()) {
    if (!row.name.trim()) throw new Error(`Baris ${i + 1}: nama bahan/jasa wajib diisi.`)
    if (!(row.quantity >= 0) || !(row.unitPrice >= 0)) throw new Error(`Baris ${i + 1}: jumlah dan harga tidak boleh negatif.`)
    if (!row.unit.trim()) throw new Error(`Baris ${i + 1}: satuan wajib diisi.`)
  }

  const keepIds = new Set(input.rows.filter((r) => r.id).map((r) => r.id as string))
  const removed = input.originalItems.filter((o) => !keepIds.has(o.id)).map((o) => o.id)
  if (removed.length) {
    const { error } = await supabase.from('rab_line_items').delete().in('id', removed)
    if (error) throw error
  }

  for (const [i, row] of input.rows.entries()) {
    const values = {
      item_type: row.itemType,
      description: joinDescription(row.name, row.spec),
      quantity: row.quantity,
      unit: row.unit.trim(),
      unit_price_customer: row.unitPrice,
      sort_order: (row.itemType === 'service' ? 50 : 40) + i,
    }
    if (row.id) {
      const before = input.originalItems.find((o) => o.id === row.id)
      const changed = !before || before.item_type !== values.item_type || before.description !== values.description
        || Number(before.quantity) !== values.quantity || before.unit !== values.unit
        || Number(before.unit_price_customer) !== values.unit_price_customer
      if (!changed) continue
      const { error } = await supabase.from('rab_line_items').update(values).eq('id', row.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('rab_line_items').insert({
        ...values,
        rab_id: rabId,
        project_id: input.projectId,
        is_manual: true,
      })
      if (error) throw error
    }
  }

  const { error } = await supabase.from('rabs').update({
    adjustment: input.adjustment,
    adjustment_note: input.adjustmentNote.trim() || null,
    notes: input.notes.trim() || null,
  }).eq('id', rabId)
  if (error) throw error
}

export async function changeStatus(projectId: string, to: ProjectStatus, note?: string) {
  const supabase = createClient()
  const { error } = await supabase.rpc('change_project_status', {
    p_project_id: projectId,
    p_to_status: to,
    ...(note ? { p_note: note } : {}),
  })
  if (error) throw error
}

// Kirim ke super admin: admin_processing/correction -> rab_draft -> pending_approval
export async function submitForApproval(projectId: string, status: ProjectStatus) {
  if (status === 'admin_processing' || status === 'correction') {
    await changeStatus(projectId, 'rab_draft')
  }
  await changeStatus(projectId, 'pending_approval')
}

// Pratinjau total dengan rumus yang sama seperti backend (private.rabs_compute_totals)
export function computeTotals(params: {
  autoItems: RabLineItem[]
  rows: ManualRow[]
  adjustment: number
  taxPercent: number
}) {
  const round2 = (n: number) => Math.round(n * 100) / 100
  let material = 0
  let service = 0
  for (const i of params.autoItems) {
    const sub = round2(Number(i.quantity) * Number(i.unit_price_customer))
    if (i.item_type === 'service') service += sub
    else material += sub
  }
  for (const r of params.rows) {
    const sub = round2(r.quantity * r.unitPrice)
    if (r.itemType === 'service') service += sub
    else material += sub
  }
  const tax = round2(((material + service + params.adjustment) * params.taxPercent) / 100)
  return { material, service, tax, grandTotal: material + service + params.adjustment + tax }
}

// -----------------------------------------------------------------------------
// Penanggung jawab pesanan (kontrak: renovin-backend/docs/contract-assign-project.md)
// -----------------------------------------------------------------------------

// Sama dengan aturan public.assign_project di backend (hanya untuk tampilan;
// keputusan akhir tetap di backend).
export function canAssign(
  status: ProjectStatus,
  role: UserRole | null,
  assignedAdminId: string | null,
  myId: string | null,
): boolean {
  if (['draft', 'ready_to_submit', 'completed', 'rejected'].includes(status)) return false
  if (role === 'super_admin') return true
  return role === 'admin' && !!myId && assignedAdminId === myId
}

export async function fetchStaff(): Promise<StaffMember[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .in('role', ['admin', 'super_admin'])
    .order('full_name')
  if (error) throw error
  return data ?? []
}

export async function assignProject(projectId: string, adminId: string) {
  const supabase = createClient()
  const { error } = await supabase.rpc('assign_project', { p_project_id: projectId, p_admin_id: adminId })
  if (error) throw error
}

// -----------------------------------------------------------------------------
// Persetujuan RAB oleh super admin & konfirmasi final
// -----------------------------------------------------------------------------

export function canDecide(status: ProjectStatus, role: UserRole | null): boolean {
  return role === 'super_admin' && status === 'pending_approval'
}

export function canConfirmFinal(status: ProjectStatus, role: UserRole | null): boolean {
  return (role === 'admin' || role === 'super_admin') && status === 'approved'
}

// Catatan wajib untuk correction & rejected (dicek juga di backend)
export async function decideRab(projectId: string, decision: ApprovalDecision, note: string) {
  const trimmed = note.trim()
  if (decision !== 'approved' && !trimmed) {
    throw new Error(decision === 'correction' ? 'Tuliskan apa yang perlu dikoreksi.' : 'Tuliskan alasan penolakan.')
  }
  await changeStatus(projectId, decision, trimmed || undefined)
}

export function confirmFinal(projectId: string) {
  return changeStatus(projectId, 'confirmed')
}

// -----------------------------------------------------------------------------
// Laporan PDF & selesaikan pesanan
// -----------------------------------------------------------------------------

export function canManageReport(status: ProjectStatus, role: UserRole | null): boolean {
  return (role === 'admin' || role === 'super_admin') && ['confirmed', 'report_generated', 'completed'].includes(status)
}

// Edge function generate-report: buat / buat ulang PDF dari snapshot final
export async function generateReport(projectId: string): Promise<{ signed_url: string | null }> {
  const supabase = createClient()
  const { data, error } = await supabase.functions.invoke('generate-report', { body: { project_id: projectId } })
  if (error) {
    // Pesan dari function ada di body respons
    const ctx = (error as { context?: Response }).context
    const body = ctx && typeof ctx.json === 'function' ? await ctx.json().catch(() => null) : null
    throw new Error(body?.error ?? error.message)
  }
  return data as { signed_url: string | null }
}

export async function getReportUrl(path: string, downloadName?: string): Promise<string> {
  if (path.startsWith('http://') || path.startsWith('https://')) return path // data seed lama memakai URL placeholder
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from('reports')
    .createSignedUrl(path, 60 * 60, downloadName ? { download: downloadName } : undefined)
  if (error || !data) throw new Error('Gagal membuka laporan: ' + (error?.message ?? 'tidak ditemukan'))
  return data.signedUrl
}

export function markCompleted(projectId: string) {
  return changeStatus(projectId, 'completed')
}
