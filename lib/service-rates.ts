import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

// Kontrak: renovin-backend/docs/contract-tarif-jasa.md
// Hanya super admin yang boleh menambah/mengubah (Q17); admin membaca saja.

export type ServiceRate = Database['public']['Tables']['service_rates']['Row']
export type CalcType = Database['public']['Enums']['service_calc_type']
export type ProductType = Database['public']['Enums']['product_type']

export const CALC_LABEL: Record<CalcType, string> = { per_m2: 'Per m²', flat: 'Per paket' }
export const APPLIES_LABEL: Record<ProductType, string> = { paint: 'Cat', furniture: 'Furnitur', material: 'Material', other: 'Lainnya' }

export interface RateForm {
  code: string
  name: string
  calc_type: CalcType
  applies_to: ProductType | ''
  rate: string
}

export const emptyRateForm: RateForm = { code: '', name: '', calc_type: 'flat', applies_to: '', rate: '' }

export async function fetchServiceRates(): Promise<ServiceRate[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('service_rates')
    .select('*')
    .order('active', { ascending: false })
    .order('name')
  if (error) throw error
  return (data ?? []).map((r) => ({ ...r, rate: Number(r.rate) }))
}

// Kode otomatis dari nama kalau dikosongkan: "Jasa bongkar" -> "JASA-BONGKAR"
const codeFromName = (name: string) =>
  name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30)

function toRow(form: RateForm) {
  const rate = Number(form.rate.replace(',', '.'))
  if (!form.name.trim()) throw new Error('Nama jasa wajib diisi')
  if (!Number.isFinite(rate) || rate < 0) throw new Error('Tarif harus angka 0 atau lebih')
  if (form.calc_type === 'per_m2' && !form.applies_to) throw new Error('Pilih jenis bahan yang dihitung luasnya')
  return {
    code: form.code.trim() || codeFromName(form.name),
    name: form.name.trim(),
    calc_type: form.calc_type,
    applies_to: form.calc_type === 'per_m2' ? (form.applies_to as ProductType) : null,
    rate,
  }
}

function friendly(err: { code?: string; message: string }) {
  if (err.code === '23505') return new Error('Kode tarif sudah dipakai')
  if (err.code === '42501') return new Error('Hanya super admin yang bisa mengubah tarif jasa')
  return new Error(err.message)
}

export async function saveServiceRate(id: string | null, form: RateForm) {
  const supabase = createClient()
  const row = toRow(form)
  if (id) {
    const { data, error } = await supabase.from('service_rates').update(row).eq('id', id).select('id')
    if (error) throw friendly(error)
    if (!data?.length) throw new Error('Hanya super admin yang bisa mengubah tarif jasa')
  } else {
    const { error } = await supabase.from('service_rates').insert(row)
    if (error) throw friendly(error)
  }
}

export async function setServiceRateActive(id: string, active: boolean) {
  const supabase = createClient()
  const { data, error } = await supabase.from('service_rates').update({ active }).eq('id', id).select('id')
  if (error) throw friendly(error)
  if (!data?.length) throw new Error('Hanya super admin yang bisa mengubah tarif jasa')
}
