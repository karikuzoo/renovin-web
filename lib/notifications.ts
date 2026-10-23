import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

// Kontrak: renovin-backend/docs/contract-notifikasi.md

export type AppNotification = Pick<
  Database['public']['Tables']['notifications']['Row'],
  'id' | 'project_id' | 'type' | 'title' | 'body' | 'read_at' | 'created_at'
>

const COLUMNS = 'id, project_id, type, title, body, read_at, created_at'

export async function fetchNotifications(limit = 20): Promise<{ items: AppNotification[]; unread: number }> {
  const supabase = createClient()
  const [listRes, countRes] = await Promise.all([
    supabase.from('notifications').select(COLUMNS).order('created_at', { ascending: false }).limit(limit),
    supabase.from('notifications').select('id', { count: 'exact', head: true }).is('read_at', null),
  ])
  if (listRes.error) throw listRes.error
  if (countRes.error) throw countRes.error
  return { items: listRes.data ?? [], unread: countRes.count ?? 0 }
}

export async function markNotificationRead(id: number) {
  const supabase = createClient()
  const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id)
  if (error) throw error
}

export async function markAllNotificationsRead() {
  const supabase = createClient()
  const { error } = await supabase.from('notifications').update({ read_at: new Date().toISOString() }).is('read_at', null)
  if (error) throw error
}

// Notifikasi baru langsung masuk lewat Supabase Realtime. Mengembalikan fungsi untuk berhenti.
export function subscribeNotifications(userId: string, onInsert: (n: AppNotification) => void): () => void {
  const supabase = createClient()
  const channel = supabase
    .channel(`notifikasi-${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      (payload) => onInsert(payload.new as AppNotification),
    )
    .subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}

// "5 menit lalu", "2 jam lalu", "3 hari lalu"
export function timeAgo(dateStr: string): string {
  const diff = Math.max(0, Date.now() - Date.parse(dateStr)) / 1000
  if (diff < 60) return 'baru saja'
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`
  if (diff < 7 * 86400) return `${Math.floor(diff / 86400)} hari lalu`
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr))
}
