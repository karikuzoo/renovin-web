@AGENTS.md

# renovin-web: web admin Renovin

Web admin untuk studio desain interior **Renovin**. Penggunanya **admin** dan **super admin** studio: menerima pesanan, menyusun RAB, persetujuan, laporan PDF, katalog, klien, tim, pembayaran, dan chat. Customer memakai aplikasi Android (`renovin-android`), bukan web ini.

Bahasa: semua teks UI, komentar kode, dan pesan commit memakai **bahasa Indonesia**.

## Tiga repo (GitHub `karikuzoo`)

| Repo | Isi |
|---|---|
| `renovin-web` (ini) | Next.js 16 (App Router) + Tailwind v4 |
| `renovin-backend` | **Supabase saja** (migration, RLS, seed, edge functions). Tidak ada server API |
| `renovin-android` | Aplikasi customer |

Web mengakses **Supabase langsung** lewat `@/lib/supabase/client` (browser) atau `@/lib/supabase/server`. Hak akses diatur **RLS** di database, jadi jangan menganggap filter di UI sebagai pengaman.

**Kontrak data:** semua bentuk data, RPC, aturan, dan error per fitur ada di `renovin-backend/docs/contract-*.md` (daftarnya di README backend). **Baca kontrak fitur terkait sebelum menulis kode.** Keputusan bisnis ada di `renovin-backend/docs/decisions.md` (Q1–Q17).

## Menjalankan

```bash
npm install
npm run dev          # http://localhost:3000
npm run lint
npx tsc --noEmit
```

`.env` (lihat `.env.example`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Nilainya untuk project **renovin-dev** ada di Bitwarden (organisasi "Renovin", koleksi "Renovin - shared"). **Jangan pernah** memakai `service_role` / secret key di web.

Akun uji ada di renovin-dev. Password di `seed.sql` backend sudah diganti di dev, jadi password yang berlaku ada di Bitwarden.

## Alur kerja Git

- Branch utama: **`development`** (bukan `develop`). Buat branch `feature/…`, `fix/…`, atau `docs/…` dari `development`, lalu PR ke `development`.
- Kalau fitur butuh perubahan database: **PR backend di-merge dan migration di-push ke dev lebih dulu**, baru PR web.
- Setelah ada migration baru, salin ulang tipe dari backend: `renovin-backend/types/database.types.ts` → `types/database.types.ts` (di backend: `npm run types`).

## Struktur

```
app/
  page.tsx                login + lupa/atur ulang kata sandi (panel via ?forgot=true, ?reset_form=true)
  auth/confirm/route.ts   tautan dari email (reset kata sandi)
  workplace/              ruang kerja staff, layout.tsx = sidebar + header (pencarian, lonceng)
    dashboard/ pesanan-baru/ pesanan/[id]/ katalog/ klien/ chat/ tim/ laporan/ pengaturan/
proxy.ts                  /workplace/* wajib login sebagai admin/super_admin
lib/                      satu file per fitur: akses data + format (orders, rab, catalog, payments,
                          chat, reports, team, settings, service-rates, notifications, storage, …)
components/               panel & komponen bersama (lihat di bawah)
types/database.types.ts   tipe hasil generate Supabase (jangan diedit manual kalau bisa di-generate)
types/admin-orders.ts     tipe AdminOrder / OrderStatusGroup
```

Pola halaman: halaman `"use client"`, data dimuat di `useEffect` lewat fungsi di `lib/*`, state loading/error/kosong selalu ditampilkan. Halaman daftar menerima kata kunci lewat `?q=` (dibaca dengan `use(searchParams)` di komponen pembungkus, lalu `key={q}`).

## Halaman → kontrak backend

| Halaman | `lib/` | Kontrak (`renovin-backend/docs/`) |
|---|---|---|
| Dashboard | `dashboard.ts` | `contract-dashboard-summary.md`, `contract-admin-orders.md` |
| Pesanan Baru, Daftar Pesanan | `orders.ts` | `contract-admin-orders.md` |
| Detail pesanan (RAB, penanggung jawab, persetujuan, pembayaran, laporan) | `rab.ts`, `payments.ts` | `contract-persetujuan-rab.md`, `contract-assign-project.md`, `contract-pembayaran.md`, `contract-laporan-pdf.md` |
| Katalog | `catalog.ts` | `contract-katalog.md` |
| Klien | `clients.ts` | `contract-admin-clients.md` |
| Chat | `chat.ts` | `contract-chat.md` |
| Tim studio | `team.ts` | `contract-tim.md` |
| Laporan | `reports.ts` | `contract-admin-orders.md`, `contract-pembayaran.md` |
| Pengaturan (profil studio, harga & pajak, tarif jasa) | `settings.ts`, `service-rates.ts` | `contract-pengaturan-studio.md`, `contract-tarif-jasa.md` |
| Lonceng notifikasi | `notifications.ts` | `contract-notifikasi.md` |
| Pencarian global (header) | `global-search.ts` | (memakai view yang sudah ada) |

## Aturan UI

- **Jangan pakai `window.confirm` / `alert`.** Pakai `useConfirm()` dari `components/confirm-dialog.tsx` (dialog bergaya Renovin, `tone: "danger"` untuk aksi berisiko). Pesan sukses/gagal memakai toast di halaman.
- Warna utama `#2C4A3B` (hijau), aksen `#E8EDEA`, latar krem `#F4F1ED`. Ikon dari `lucide-react`.
- **Responsif**: kartu ringkasan `grid-cols-2 xl:grid-cols-4` dengan `min-h` (bukan tinggi tetap); tabel di dalam `overflow-x-auto` dengan `min-w-[…]` dan `[&_th]:whitespace-nowrap`; cek di lebar 375 px tanpa scroll horizontal.
- Komponen bersama yang sudah ada, pakai ulang: `PasswordInput`, `DateRangePicker` (+ `lib/date-range.ts`, zona WIB), `useConfirm`, `PaymentPanel`, `ProductFormModal`, `GlobalSearch`.
- Tanggal & jam selalu **WIB** (`Asia/Jakarta`), format `id-ID`. Uang: `formatRupiah` / `formatRupiahCompact` dari `lib/orders.ts`.
- **Realtime** (`supabase.channel(...)`): berlangganan **setelah** `auth.getUser()` selesai. Kalau tidak, koneksi memakai kunci anonim dan RLS tidak mengirim event.
- Update yang ditolak RLS **tidak mengembalikan error** (0 baris). Tambahkan `.select()` lalu cek hasilnya kosong.

## Keputusan yang memengaruhi web

- Akun admin/super admin **dibuat tim IT** lewat Supabase Dashboard; staff tidak bisa ganti email sendiri (Q14). Tidak ada tombol "tambah anggota".
- **Pajak dan tarif jasa** hanya bisa diubah **super admin** (Q13, Q17).
- Admin hanya bisa menyerahkan pesanan yang sedang ia tangani; super admin bisa memindah semua (Q12).
- Status katalog **Draft / Terbit / Arsip**; produk tidak dihapus, diarsipkan (Q15).
- **Pembayaran hanya pencatatan, bukan transaksi** (Q16): skema Lunas/DP/Termin/Progress, pembayaran pertama ≥ 30%, maksimal 4 kali, **wajib ada sebelum konfirmasi final**, tandai "sudah dibayar" setelah dikunci.

## Belum ada / ditahan

- Admin membuat pesanan sendiri (`/workplace/pesanan/baru` menampilkan "belum tersedia").
- Unggah bukti transfer; status pesanan "Perlu info"; tahap produksi/pekerja lapangan.
- Preferensi notifikasi (tab di Pengaturan masih "menyusul"); detail klien; kelola kategori katalog; tampilan audit log.
- CI untuk repo web belum ada: jalankan `npm run lint` dan `npx tsc --noEmit` sebelum membuat PR.
