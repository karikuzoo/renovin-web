import { createClient } from '@/lib/supabase/client'
import { uploadFile } from '@/lib/storage'
import type { Database } from '@/types/database.types'

// Kontrak: renovin-backend/docs/contract-katalog.md

export type CatalogStatus = Database['public']['Enums']['catalog_status']
export type Availability = Database['public']['Enums']['product_availability']
export type ProductType = Database['public']['Enums']['product_type']

export const STATUS_LABEL: Record<CatalogStatus, string> = { draft: 'Draft', published: 'Terbit', archived: 'Arsip' }
export const AVAILABILITY_LABEL: Record<Availability, string> = { available: 'Tersedia', indent: 'Indent', out_of_stock: 'Habis' }
export const TYPE_LABEL: Record<ProductType, string> = { paint: 'Cat', furniture: 'Furnitur', material: 'Material', other: 'Lainnya' }

export interface Category {
  id: string
  name: string
  type: ProductType
}

export interface CatalogProduct {
  id: string
  sku: string
  name: string
  category_id: string
  category_name: string | null
  type: ProductType
  brand: string | null
  spec: string | null
  description: string | null
  unit: string
  price_customer: number
  price_internal: number | null
  color_name: string | null
  color_hex: string | null
  width_cm: number | null
  depth_cm: number | null
  height_cm: number | null
  image_url: string | null
  image_file_id: string | null
  status: CatalogStatus
  availability: Availability
  availability_note: string | null
  updated_at: string
}

// Isi form tambah/edit. Angka disimpan sebagai teks supaya isian boleh kosong.
export interface ProductForm {
  sku: string
  name: string
  category_id: string
  brand: string
  spec: string
  description: string
  unit: string
  price_customer: string
  price_internal: string
  color_name: string
  color_hex: string
  width_cm: string
  depth_cm: string
  height_cm: string
  status: CatalogStatus
  availability: Availability
  availability_note: string
  image_url: string | null
  image_file_id: string | null
}

export async function fetchCatalog(): Promise<{ products: CatalogProduct[]; categories: Category[] }> {
  const supabase = createClient()
  const [productsRes, categoriesRes] = await Promise.all([
    supabase
      .from('products')
      .select('*, product_categories(name), product_internal_prices(price_internal)')
      .order('updated_at', { ascending: false }),
    supabase.from('product_categories').select('id, name, type').order('sort_order'),
  ])
  if (productsRes.error) throw productsRes.error
  if (categoriesRes.error) throw categoriesRes.error

  const products = (productsRes.data ?? []).map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    category_id: p.category_id,
    category_name: p.product_categories?.name ?? null,
    type: p.type,
    brand: p.brand,
    spec: p.spec,
    description: p.description,
    unit: p.unit,
    price_customer: Number(p.price_customer),
    price_internal: p.product_internal_prices ? Number(p.product_internal_prices.price_internal) : null,
    color_name: p.color_name,
    color_hex: p.color_hex,
    width_cm: p.width_cm,
    depth_cm: p.depth_cm,
    height_cm: p.height_cm,
    image_url: p.image_url,
    image_file_id: p.image_file_id,
    status: p.status,
    availability: p.availability,
    availability_note: p.availability_note,
    updated_at: p.updated_at,
  }))
  return { products, categories: categoriesRes.data ?? [] }
}

const str = (v: string | number | null | undefined) => (v === null || v === undefined ? '' : String(v))

export function emptyForm(categoryId = ''): ProductForm {
  return {
    sku: '', name: '', category_id: categoryId, brand: '', spec: '', description: '', unit: '',
    price_customer: '', price_internal: '', color_name: '', color_hex: '', width_cm: '', depth_cm: '', height_cm: '',
    status: 'draft', availability: 'available', availability_note: '', image_url: null, image_file_id: null,
  }
}

export function formFromProduct(p: CatalogProduct): ProductForm {
  return {
    sku: p.sku, name: p.name, category_id: p.category_id, brand: str(p.brand), spec: str(p.spec),
    description: str(p.description), unit: p.unit, price_customer: str(p.price_customer), price_internal: str(p.price_internal),
    color_name: str(p.color_name), color_hex: str(p.color_hex), width_cm: str(p.width_cm), depth_cm: str(p.depth_cm),
    height_cm: str(p.height_cm), status: p.status, availability: p.availability, availability_note: str(p.availability_note),
    image_url: p.image_url, image_file_id: p.image_file_id,
  }
}

// Duplikat: semua isi disalin kecuali SKU (harus baru) dan status (kembali draft)
export function duplicateForm(p: CatalogProduct): ProductForm {
  return { ...formFromProduct(p), sku: '', name: p.name + ' (salinan)', status: 'draft' }
}

const textOrNull = (v: string) => (v.trim() ? v.trim() : null)

function numberOrNull(v: string, label: string): number | null {
  if (!v.trim()) return null
  const n = Number(v.replace(',', '.'))
  if (!Number.isFinite(n) || n < 0) throw new Error(label + ' harus angka 0 atau lebih')
  return n
}

function friendlyError(err: { code?: string; message: string }): Error {
  if (err.code === '23505') return new Error('Kode bahan sudah dipakai bahan lain')
  if (err.message.includes('products_paint_has_color')) return new Error('Cat wajib punya kode warna')
  return new Error(err.message)
}

// Simpan bahan baru (id = null) atau ubah yang ada. Mengembalikan id bahan.
export async function saveProduct(
  id: string | null,
  form: ProductForm,
  categories: Category[],
  imageFile: File | null,
): Promise<string> {
  const category = categories.find((c) => c.id === form.category_id)
  if (!category) throw new Error('Pilih kategori')
  if (!form.sku.trim()) throw new Error('Kode bahan wajib diisi')
  if (!form.name.trim()) throw new Error('Nama bahan wajib diisi')
  if (!form.unit.trim()) throw new Error('Satuan wajib diisi')
  const price = numberOrNull(form.price_customer, 'Harga')
  if (price === null) throw new Error('Harga wajib diisi')
  const internal = numberOrNull(form.price_internal, 'Harga internal')
  const colorHex = textOrNull(form.color_hex)
  if (colorHex && !/^#[0-9A-Fa-f]{6}$/.test(colorHex)) throw new Error('Kode warna harus format #RRGGBB')
  if (category.type === 'paint' && !colorHex) throw new Error('Cat wajib punya kode warna')
  const dims = [numberOrNull(form.width_cm, 'Lebar'), numberOrNull(form.depth_cm, 'Kedalaman'), numberOrNull(form.height_cm, 'Tinggi')]
  if (dims.some((d) => d === 0)) throw new Error('Ukuran harus lebih dari 0')

  const supabase = createClient()
  const productId = id ?? crypto.randomUUID()

  let image = { image_url: form.image_url, image_file_id: form.image_file_id }
  if (imageFile) {
    const compressed = await compressImage(imageFile)
    const { path, url } = await uploadFile(compressed, 'catalog', `products/${productId}`, imageFile.name.replace(/\.\w+$/, '.jpg'))
    image = { image_url: url, image_file_id: path }
  }

  const row = {
    sku: form.sku,
    name: form.name,
    category_id: category.id,
    type: category.type,
    brand: textOrNull(form.brand),
    spec: textOrNull(form.spec),
    description: textOrNull(form.description),
    unit: form.unit.trim(),
    price_customer: price,
    color_name: textOrNull(form.color_name),
    color_hex: colorHex,
    width_cm: dims[0],
    depth_cm: dims[1],
    height_cm: dims[2],
    status: form.status,
    availability: form.availability,
    availability_note: textOrNull(form.availability_note),
    ...image,
  }

  try {
    if (id) {
      const { data, error } = await supabase.from('products').update(row).eq('id', id).select('id')
      if (error) throw friendlyError(error)
      if (!data?.length) throw new Error('Bahan tidak bisa diubah. Hanya admin yang boleh mengelola katalog.')
    } else {
      const { error } = await supabase.from('products').insert({ id: productId, ...row })
      if (error) throw friendlyError(error)
    }
  } catch (err) {
    // Simpan gagal (mis. SKU dobel): buang gambar yang baru diupload supaya tidak jadi file yatim
    if (imageFile && image.image_file_id) await supabase.storage.from('catalog').remove([image.image_file_id])
    throw err
  }
  // File gambar lama sengaja tidak dihapus: hasil duplikat bisa memakai file yang sama

  if (internal !== null) {
    const { error } = await supabase
      .from('product_internal_prices')
      .upsert({ product_id: productId, price_internal: internal }, { onConflict: 'product_id' })
    if (error) throw new Error('Bahan tersimpan, tetapi harga internal gagal disimpan: ' + error.message)
  }

  return productId
}

export async function setProductStatus(id: string, status: CatalogStatus) {
  const supabase = createClient()
  const { data, error } = await supabase.from('products').update({ status }).eq('id', id).select('id')
  if (error) throw friendlyError(error)
  if (!data?.length) throw new Error('Status bahan tidak bisa diubah.')
}

// Perkecil gambar ke sisi terpanjang 1600 px (JPEG) sebelum upload, supaya kuota storage hemat
async function compressImage(file: File, maxSide = 1600): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85))
  return blob ?? file
}
