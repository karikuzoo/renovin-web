// Upload file ke ImageKit lewat edge function Supabase `imagekit-auth`.
// - Wajib login: token upload hanya diberikan ke user yang sudah login.
// - Folder otomatis dari backend: auth.folders.catalog / auth.folders.reports
// - Simpan KEDUANYA ke database: fileId (kolom *_file_id) dan url (kolom *_url).
//
// Contoh:
//   const { fileId, url } = await uploadToImageKit(file, file.name, 'catalog')
//   await supabase.from('products').update({ image_file_id: fileId, image_url: url }).eq('id', productId)

import { createClient } from '@/lib/supabase/client'

type UploadKind = 'catalog' | 'reports'

const RULES: Record<UploadKind, { types: string[]; maxMb: number }> = {
  catalog: { types: ['image/jpeg', 'image/png', 'image/webp'], maxMb: 5 },
  reports: { types: ['application/pdf'], maxMb: 10 },
}

export async function uploadToImageKit(file: File | Blob, fileName: string, kind: UploadKind) {
  const rule = RULES[kind]
  if (!rule.types.includes(file.type)) throw new Error('Tipe file tidak didukung')
  if (file.size > rule.maxMb * 1024 * 1024) throw new Error('Ukuran file maksimal ' + rule.maxMb + ' MB')

  const supabase = createClient()
  const { data: auth, error } = await supabase.functions.invoke('imagekit-auth')
  if (error) throw new Error('Gagal meminta izin upload. Coba login ulang.')

  const form = new FormData()
  form.append('file', file)
  form.append('fileName', fileName.replace(/\s+/g, '-'))
  form.append('publicKey', auth.publicKey)
  form.append('signature', auth.signature)
  form.append('expire', String(auth.expire))
  form.append('token', auth.token)
  form.append('folder', auth.folders[kind])

  const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', { method: 'POST', body: form })
  const uploaded = await res.json()
  if (!res.ok || !uploaded.fileId) throw new Error(uploaded.message ?? 'Upload ke ImageKit gagal')

  return { fileId: uploaded.fileId as string, url: uploaded.url as string }
}
