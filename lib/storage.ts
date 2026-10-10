// Upload & tampilkan file lewat Supabase Storage (menggantikan ImageKit).
//
// Bucket (lihat renovin-backend/docs/erd.md):
//   catalog      publik   folder: products/<product_id>   gambar & aset produk
//   room-photos  privat   folder: <project_id>            foto ruangan, hasil desain
//   reports      privat   folder: <project_id>            PDF laporan final
//
// Simpan KEDUANYA ke database: path (kolom *_file_id) dan url (kolom *_url).
// Untuk bucket privat, url = path; tampilkan dengan getFileUrl().
//
// Contoh:
//   const { path, url } = await uploadFile(file, 'catalog', `products/${productId}`)
//   await supabase.from('products').update({ image_file_id: path, image_url: url }).eq('id', productId)

import { createClient } from '@/lib/supabase/client'

export type Bucket = 'catalog' | 'room-photos' | 'reports'

const RULES: Record<Bucket, { types: string[]; maxMb: number }> = {
  catalog: { types: ['image/jpeg', 'image/png', 'image/webp'], maxMb: 5 },
  'room-photos': { types: ['image/jpeg', 'image/png', 'image/webp'], maxMb: 10 },
  reports: { types: ['application/pdf'], maxMb: 10 },
}

export async function uploadFile(
  file: File | Blob,
  bucket: Bucket,
  folder: string,
  fileName = file instanceof File ? file.name : 'file',
): Promise<{ path: string; url: string }> {
  // 1. Validasi sebelum upload, supaya user dapat pesan yang jelas
  const rule = RULES[bucket]
  if (!rule.types.includes(file.type)) {
    throw new Error('Tipe file tidak didukung (' + (file.type || 'tidak diketahui') + ')')
  }
  if (file.size > rule.maxMb * 1024 * 1024) {
    throw new Error('Ukuran file maksimal ' + rule.maxMb + ' MB')
  }

  // 2. Nama unik supaya tidak menimpa file lain
  const safeName = fileName.toLowerCase().replace(/[^a-z0-9.\-_]+/g, '-')
  const path = folder.replace(/\/+$/, '') + '/' + Date.now() + '-' + safeName

  // 3. Upload (hak akses dicek RLS di Supabase)
  const supabase = createClient()
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  })
  if (error) throw new Error('Upload gagal: ' + error.message)

  // 4. Bucket publik -> URL publik; bucket privat -> path (pakai getFileUrl saat ditampilkan)
  const url = bucket === 'catalog' ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : path

  return { path, url }
}

// URL untuk ditampilkan. Bucket privat memakai signed URL yang kedaluwarsa.
export async function getFileUrl(bucket: Bucket, pathOrUrl: string, expiresInSeconds = 3600): Promise<string> {
  if (bucket === 'catalog' || pathOrUrl.startsWith('http')) return pathOrUrl

  const supabase = createClient()
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(pathOrUrl, expiresInSeconds)
  if (error || !data) throw new Error('Gagal membuka file: ' + (error?.message ?? 'tidak ditemukan'))
  return data.signedUrl
}
