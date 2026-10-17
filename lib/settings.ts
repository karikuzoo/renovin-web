import { createClient } from '@/lib/supabase/client'
import { uploadFile } from '@/lib/storage'
import type { Database, Json } from '@/types/database.types'

// Kontrak: renovin-backend/docs/contract-pengaturan-studio.md

export type UserRole = Database['public']['Enums']['user_role']

export interface StudioProfile {
  name: string
  email: string | null
  phone: string | null
  website: string | null
  address: string | null
  logo_url: string | null
}

export interface LocaleSettings {
  timezone: string
  currency: string
  language: string
}

export interface MyProfile {
  id: string
  full_name: string | null
  phone: string | null
  email: string | null
  role: UserRole
}

export interface SettingsData {
  studio: StudioProfile
  locale: LocaleSettings
  taxPercent: number
  me: MyProfile
  lastUpdatedAt: string | null
}

const DEFAULT_STUDIO: StudioProfile = { name: 'Renovin. Studio Interior', email: null, phone: null, website: null, address: null, logo_url: null }
const DEFAULT_LOCALE: LocaleSettings = { timezone: 'Asia/Jakarta', currency: 'IDR', language: 'id' }

export async function fetchSettings(): Promise<SettingsData> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sesi login tidak ditemukan. Silakan masuk ulang.')

  const [settingsRes, profileRes] = await Promise.all([
    supabase.from('app_settings').select('key, value, updated_at'),
    supabase.from('profiles').select('id, full_name, phone, email, role').eq('id', user.id).single(),
  ])
  if (settingsRes.error) throw settingsRes.error
  if (profileRes.error) throw profileRes.error

  const byKey = Object.fromEntries((settingsRes.data ?? []).map((r) => [r.key, r.value])) as Record<string, Json>
  const tax = byKey.tax as { tax_percent?: number } | undefined
  const lastUpdatedAt = (settingsRes.data ?? []).map((r) => r.updated_at).sort().at(-1) ?? null

  return {
    studio: { ...DEFAULT_STUDIO, ...(byKey.studio_profile as Partial<StudioProfile> | undefined) },
    locale: { ...DEFAULT_LOCALE, ...(byKey.locale as Partial<LocaleSettings> | undefined) },
    taxPercent: Number(tax?.tax_percent ?? 0),
    me: { ...profileRes.data, email: profileRes.data.email ?? user.email ?? null },
    lastUpdatedAt,
  }
}

// value diganti utuh; .select() dipakai untuk mendeteksi update yang ditolak RLS (0 baris)
async function updateSetting(key: string, value: Json, deniedMessage: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from('app_settings').update({ value }).eq('key', key).select('key')
  if (error) throw error
  if (!data?.length) throw new Error(deniedMessage)
}

const emptyToNull = (v: string | null) => (v && v.trim() ? v.trim() : null)

export function saveStudioProfile(p: StudioProfile) {
  const value = {
    name: p.name.trim(),
    email: emptyToNull(p.email),
    phone: emptyToNull(p.phone),
    website: emptyToNull(p.website),
    address: emptyToNull(p.address),
    logo_url: p.logo_url,
  }
  return updateSetting('studio_profile', value, 'Anda tidak memiliki akses untuk mengubah profil studio.')
}

export function saveLocale(l: LocaleSettings) {
  return updateSetting('locale', { ...l }, 'Anda tidak memiliki akses untuk mengubah pengaturan lokal.')
}

export function saveTax(taxPercent: number) {
  return updateSetting('tax', { tax_percent: taxPercent }, 'Hanya super admin yang bisa mengubah pajak.')
}

export async function saveMyProfile(id: string, fullName: string, phone: string | null) {
  const supabase = createClient()
  if (!fullName.trim()) throw new Error('Nama lengkap wajib diisi.')
  const { error } = await supabase.from('profiles').update({ full_name: fullName.trim(), phone: emptyToNull(phone) }).eq('id', id)
  if (error) throw error
}

// Upload logo ke bucket publik branding (folder studio/), mengembalikan URL publik
export async function uploadLogo(file: File): Promise<string> {
  const { url } = await uploadFile(file, 'branding', 'studio')
  return url
}

export async function changePassword(newPassword: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}
