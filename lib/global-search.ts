import { createClient } from '@/lib/supabase/client'
import { getStatusLabel } from '@/lib/orders'

// Pencarian cepat di header: pesanan, klien, dan bahan katalog sekaligus.
// Memakai view/tabel yang sudah ada (admin_orders, admin_clients, products); tidak ada RPC baru.

export interface SearchHit {
  kind: 'order' | 'client' | 'product'
  id: string
  title: string
  subtitle: string
  href: string
}

export interface SearchResults {
  orders: SearchHit[]
  clients: SearchHit[]
  products: SearchHit[]
}

const LIMIT = 5

// Karakter , ( ) " \ % * punya arti khusus di filter .or() PostgREST -> dibuang (sama dengan fetchOrders)
export function cleanKeyword(q: string) {
  return q.replace(/[,()"\\%*]/g, ' ').replace(/\s+/g, ' ').trim()
}

export async function globalSearch(query: string): Promise<SearchResults> {
  const keyword = cleanKeyword(query)
  if (keyword.length < 2) return { orders: [], clients: [], products: [] }
  const kw = `%${keyword}%`
  const supabase = createClient()

  const [ordersRes, clientsRes, productsRes] = await Promise.all([
    supabase
      .from('admin_orders')
      .select('id, code, title, customer_name, status')
      .or(`code.ilike.${kw},title.ilike.${kw},customer_name.ilike.${kw}`)
      .order('submitted_at', { ascending: false })
      .limit(LIMIT),
    supabase
      .from('admin_clients')
      .select('id, full_name, email, phone, order_count')
      .or(`full_name.ilike.${kw},email.ilike.${kw},phone.ilike.${kw}`)
      .limit(LIMIT),
    supabase
      .from('products')
      .select('id, sku, name, brand, status')
      .or(`name.ilike.${kw},sku.ilike.${kw},brand.ilike.${kw}`)
      .order('status')
      .limit(LIMIT),
  ])
  if (ordersRes.error) throw ordersRes.error
  if (clientsRes.error) throw clientsRes.error
  if (productsRes.error) throw productsRes.error

  const STATUS = { draft: 'Draft', published: 'Terbit', archived: 'Arsip' } as const

  return {
    orders: (ordersRes.data ?? []).map((o) => ({
      kind: 'order',
      id: o.id!,
      title: `${o.code} · ${o.title}`,
      subtitle: [o.customer_name, o.status ? getStatusLabel(o.status) : null].filter(Boolean).join(' · '),
      href: `/workplace/pesanan/${o.id}`,
    })),
    clients: (clientsRes.data ?? []).map((c) => ({
      kind: 'client',
      id: c.id!,
      title: c.full_name ?? c.email ?? 'Klien',
      subtitle: [c.email, c.phone, `${c.order_count ?? 0} pesanan`].filter(Boolean).join(' · '),
      href: `/workplace/klien?q=${encodeURIComponent(c.full_name ?? c.email ?? '')}`,
    })),
    products: (productsRes.data ?? []).map((p) => ({
      kind: 'product',
      id: p.id,
      title: p.name,
      subtitle: [p.sku, p.brand, STATUS[p.status]].filter(Boolean).join(' · '),
      href: `/workplace/katalog?q=${encodeURIComponent(p.sku)}${p.status === 'archived' ? '&status=archived' : ''}`,
    })),
  }
}
