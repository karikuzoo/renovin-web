import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

// Kontrak: renovin-backend/docs/contract-chat.md
// Customer membuka percakapan dari aplikasi; semua staff bisa membaca & membalas.

export type ConversationRow = Database['public']['Views']['admin_conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']

export interface Conversation extends Omit<ConversationRow, 'id' | 'customer_id' | 'status' | 'unread_count' | 'message_count'> {
  id: string
  customer_id: string
  status: 'open' | 'closed'
  unread_count: number
  message_count: number
}

export async function fetchConversations(): Promise<Conversation[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('admin_conversations')
    .select('*')
    .order('last_message_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((c) => ({
    ...c,
    id: c.id!,
    customer_id: c.customer_id!,
    status: (c.status ?? 'open') as 'open' | 'closed',
    unread_count: Number(c.unread_count ?? 0),
    message_count: Number(c.message_count ?? 0),
  }))
}

export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at')
    .order('id')
  if (error) throw error
  return data ?? []
}

// Nama pengirim staff (customer diambil dari percakapan)
export async function fetchStaffNames(ids: string[]): Promise<Map<string, string>> {
  if (!ids.length) return new Map()
  const supabase = createClient()
  const { data, error } = await supabase.from('profiles').select('id, full_name').in('id', ids)
  if (error) throw error
  return new Map((data ?? []).map((p) => [p.id, p.full_name ?? 'Admin']))
}

export async function sendMessage(conversationId: string, body: string) {
  const text = body.trim()
  if (!text) return
  if (text.length > 4000) throw new Error('Pesan terlalu panjang (maksimal 4000 karakter)')
  const supabase = createClient()
  const { error } = await supabase.from('messages').insert({ conversation_id: conversationId, body: text })
  if (error) {
    // RLS menolak kalau percakapan sudah ditutup
    throw new Error(error.code === '42501' ? 'Percakapan sudah ditutup. Buka lagi untuk membalas.' : error.message)
  }
}

// Tandai pesan dari pihak lain (customer) sudah dibaca
export async function markConversationRead(conversationId: string, myId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .is('read_at', null)
    .neq('sender_id', myId)
  if (error) throw error
  // Sidebar menghitung ulang badge chat
  window.dispatchEvent(new Event('chat-unread-changed'))
}

export async function setConversationStatus(conversationId: string, status: 'open' | 'closed') {
  const supabase = createClient()
  const { data, error } = await supabase.from('conversations').update({ status }).eq('id', conversationId).select('id')
  if (error) throw error
  if (!data?.length) throw new Error('Status percakapan tidak bisa diubah.')
}

// Jumlah percakapan yang punya pesan customer belum dibaca (badge sidebar)
export async function fetchUnreadConversationCount(): Promise<number> {
  const supabase = createClient()
  const { count, error } = await supabase
    .from('admin_conversations')
    .select('id', { count: 'exact', head: true })
    .gt('unread_count', 0)
  if (error) return 0
  return count ?? 0
}
