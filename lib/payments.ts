import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

// Kontrak: renovin-backend/docs/contract-pembayaran.md
// Pencatatan saja (bukan transaksi). Semua tulis lewat RPC; aturan dicek ulang di database.

export type PaymentScheme = Database['public']['Enums']['payment_scheme']
export type PaymentPlan = Database['public']['Tables']['payment_plans']['Row']
export type Installment = Database['public']['Tables']['payment_installments']['Row']
export type PaymentSummary = Database['public']['Views']['order_payment_summary']['Row']
export type PaymentStatus = 'no_plan' | 'planned' | 'unpaid' | 'partial' | 'paid'

export const SCHEME_LABEL: Record<PaymentScheme, string> = {
  full: 'Lunas',
  dp: 'DP + pelunasan',
  termin: 'Termin',
  progress: 'Sesuai progres',
}

export const SCHEME_HINT: Record<PaymentScheme, string> = {
  full: 'Dibayar sekali, 100%.',
  dp: 'DP minimal 30%, sisanya pelunasan.',
  termin: '2–4 kali dengan tanggal jatuh tempo. Pembayaran pertama minimal 30%.',
  progress: '2–4 kali sesuai tahap pekerjaan. Pembayaran pertama minimal 30%.',
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  no_plan: 'Belum ada skema',
  planned: 'Skema disiapkan',
  unpaid: 'Belum bayar',
  partial: 'Sebagian',
  paid: 'Lunas',
}

export const PAYMENT_STATUS_STYLE: Record<PaymentStatus, string> = {
  no_plan: 'text-zinc-400',
  planned: 'text-zinc-600',
  unpaid: 'text-red-600',
  partial: 'text-orange-600',
  paid: 'text-green-700',
}

// Status pesanan saat admin boleh menetapkan skema (sebelum dikunci saat konfirmasi final)
const EDITABLE_STATUSES = ['admin_processing', 'rab_draft', 'correction', 'pending_approval', 'approved']

export function canEditPlan(status: string, plan: PaymentPlan | null) {
  if (plan?.locked_at) return false
  // Pesanan lama yang sudah lewat konfirmasi tanpa skema: boleh diisi sekali, langsung dikunci
  return EDITABLE_STATUSES.includes(status) || ['confirmed', 'report_generated', 'completed'].includes(status)
}

// Baris yang sedang diedit di form (persen sebagai teks supaya boleh kosong)
export interface DraftInstallment {
  label: string
  percent: string
  due_date: string
  milestone: string
}

const addDays = (days: number) => {
  const d = new Date(Date.now() + 7 * 60 * 60 * 1000)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

// Isi awal saat admin memilih skema
export function defaultInstallments(scheme: PaymentScheme): DraftInstallment[] {
  const row = (percent: number, extra: Partial<DraftInstallment> = {}): DraftInstallment => ({
    label: '', percent: String(percent), due_date: '', milestone: '', ...extra,
  })
  switch (scheme) {
    case 'full':
      return [row(100)]
    case 'dp':
      return [row(30), row(70)]
    case 'termin':
      return [row(40, { due_date: addDays(7) }), row(30, { due_date: addDays(37) }), row(30, { due_date: addDays(67) })]
    case 'progress':
      return [row(30, { milestone: 'Saat konfirmasi pesanan' }), row(40), row(30, { milestone: 'Setelah serah terima' })]
  }
}

export function defaultLabel(scheme: PaymentScheme, index: number) {
  if (scheme === 'full') return 'Pelunasan'
  if (scheme === 'dp') return index === 0 ? 'DP' : 'Pelunasan'
  if (scheme === 'termin') return `Termin ${index + 1}`
  return `Tahap ${index + 1}`
}

// Nominal sebelum dikunci: dibulatkan, baris terakhir menampung sisa (sama dengan cara database mengunci)
export function previewAmounts(percents: number[], total: number | null): (number | null)[] {
  if (total === null) return percents.map(() => null)
  const amounts = percents.map((p) => Math.round((total * p) / 100))
  if (amounts.length) amounts[amounts.length - 1] = total - amounts.slice(0, -1).reduce((a, b) => a + b, 0)
  return amounts
}

export async function fetchPayment(projectId: string): Promise<{ plan: PaymentPlan | null; installments: Installment[] }> {
  const supabase = createClient()
  const [planRes, rowsRes] = await Promise.all([
    supabase.from('payment_plans').select('*').eq('project_id', projectId).maybeSingle(),
    supabase.from('payment_installments').select('*').eq('project_id', projectId).order('seq'),
  ])
  if (planRes.error) throw planRes.error
  if (rowsRes.error) throw rowsRes.error
  return { plan: planRes.data, installments: rowsRes.data ?? [] }
}

export async function savePaymentPlan(projectId: string, scheme: PaymentScheme, rows: DraftInstallment[]) {
  const supabase = createClient()
  const { error } = await supabase.rpc('save_payment_plan', {
    p_project_id: projectId,
    p_scheme: scheme,
    p_installments: rows.map((r) => ({
      label: r.label.trim() || null,
      percent: Number(r.percent.replace(',', '.')),
      due_date: scheme === 'termin' || r.due_date ? r.due_date || null : null,
      milestone: r.milestone.trim() || null,
    })),
  })
  if (error) throw new Error(error.message)
}

export async function setInstallmentPaid(installmentId: string, paid: boolean, paidAt?: string, note?: string) {
  const supabase = createClient()
  const { error } = await supabase.rpc('set_installment_paid', {
    p_installment_id: installmentId,
    p_paid: paid,
    p_paid_at: paid ? paidAt || undefined : undefined,
    p_note: paid ? note || undefined : undefined,
  })
  if (error) throw new Error(error.message)
}

export async function fetchPaymentSummaries(projectIds: string[]): Promise<Map<string, PaymentSummary>> {
  if (!projectIds.length) return new Map()
  const supabase = createClient()
  const { data, error } = await supabase.from('order_payment_summary').select('*').in('project_id', projectIds)
  if (error) throw error
  return new Map((data ?? []).map((s) => [s.project_id as string, { ...s, total_amount: s.total_amount === null ? null : Number(s.total_amount), paid_amount: Number(s.paid_amount ?? 0) }]))
}
