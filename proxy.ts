import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database.types'

// Proxy (Next.js 16, dulu bernama middleware) berjalan SEBELUM halaman dirender.
// Tugasnya:
//  1. Memperbarui sesi login Supabase (cookie) di setiap request.
//  2. /workplace/*  -> wajib login sebagai admin / super_admin, selain itu ke halaman login.
//  3. /             -> admin yang sudah login langsung diarahkan ke dashboard.
//
// Catatan: ini pengaman tampilan. Keamanan data tetap dijaga RLS di database.

const STAFF_ROLES = ['admin', 'super_admin']

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  // Jangan taruh kode lain di antara createServerClient dan getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isWorkplace = pathname.startsWith('/workplace')
  const isLoginPage = pathname === '/'

  if (!user) {
    return isWorkplace ? redirectTo(request, '/', response) : response
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const isStaff = !!profile && STAFF_ROLES.includes(profile.role)

  if (isWorkplace && !isStaff) return redirectTo(request, '/', response)
  if (isLoginPage && isStaff) return redirectTo(request, '/workplace/dashboard', response)

  return response
}

// Redirect sambil membawa cookie sesi yang baru diperbarui.
function redirectTo(request: NextRequest, pathname: string, response: NextResponse) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  url.search = ''
  const redirect = NextResponse.redirect(url)
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie))
  return redirect
}

export const config = {
  matcher: ['/', '/workplace/:path*'],
}
