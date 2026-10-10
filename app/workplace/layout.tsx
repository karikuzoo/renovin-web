"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

import {
  LayoutDashboard,
  Inbox,
  Package,
  ChartColumnIncreasing,
  Users,
  MailWarning,
  Briefcase,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  Search,
  Bell,
  ChevronRight,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";

interface UserProfile {
  fullName: string;
  role: string;
  initials: string;
}

export default function RuangKerjaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  // Sidebar mobile terbuka hanya di halaman tempat ia dibuka -> otomatis tertutup saat pindah halaman
  const [sidebarOpenedAt, setSidebarOpenedAt] = useState<string | null>(null);
  const sidebarOpen = sidebarOpenedAt === pathname;
  const [user, setUser] = useState<UserProfile>({
    fullName: "...",
    role: "...",
    initials: "...",
  });

  // Fetch user profile from Supabase
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Ambil nama & role dari tabel profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", session.user.id)
          .single();

        const fullName =
          profile?.full_name ||
          session.user.user_metadata?.full_name ||
          session.user.email?.split("@")[0] ||
          "User";

        const role = profile?.role || "user";
        const roleLabel =
          role === "super_admin"
            ? "Super Admin"
            : role === "admin"
              ? "Administrator"
              : "User";

        // Buat inisial dari nama
        const nameParts = fullName.split(" ");
        const initials =
          nameParts.length >= 2
            ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
            : fullName.substring(0, 2).toUpperCase();

        setUser({ fullName, role: roleLabel, initials });
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  };


  const navItems = [
    { name: "Dashboard", href: "/workplace/dashboard", icon: LayoutDashboard },
    {
      name: "Pesanan Baru",
      href: "/workplace/pesanan-baru",
      icon: MailWarning,
      badge: "4",
    },
    {
      name: "Daftar Pesanan",
      href: "/workplace/pesanan",
      icon: Inbox,
      badge: "6",
    },
    { name: "Katalog Bahan", href: "/workplace/katalog", icon: Package },
    { name: "Klien", href: "/workplace/klien", icon: Users },
    { name: "Tim pekerja", href: "/workplace/tim", icon: Briefcase },
    {
      name: "Laporan",
      href: "/workplace/laporan",
      icon: ChartColumnIncreasing,
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#F4F1ED]">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpenedAt(null)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-[#E5E0D8] bg-[#F4F1ED] flex flex-col justify-between overflow-y-auto transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo + Close button on mobile */}
          <div className="px-6 pt-8 pb-6 flex items-start justify-between">
            <div>
              <h1 className="font-serif text-3xl text-[#2C4A3B]">Renovin.</h1>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mt-1">
                STUDIO INTERIOR
              </p>
            </div>
            <button
              onClick={() => setSidebarOpenedAt(null)}
              className="lg:hidden text-zinc-400 hover:text-zinc-600 mt-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Workspace selector */}
          <div className="px-4 mb-6">
            <button className="flex w-full items-center justify-between rounded-md bg-white border border-[#E5E0D8] px-3 py-2 text-sm shadow-sm">
              <div className="flex items-center gap-2 font-medium text-zinc-800">
                <div className="h-4 w-4 bg-zinc-200 rounded-sm"></div>
                Ruang kerja studio
              </div>
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            </button>
          </div>

          {/* Navigation */}
          <div className="px-4">
            <p className="px-2 text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
              KELOLA STUDIO
            </p>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-[#2C4A3B] text-white font-medium"
                        : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon
                        className={`h-4 w-4 ${isActive ? "text-white" : "text-zinc-400"}`}
                      />
                      {item.name}
                    </div>
                    {item.badge && (
                      <span
                        className={`text-xs font-medium ${isActive ? "text-white" : "text-zinc-500"}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <p className="px-2 text-xs font-semibold text-zinc-400 mb-2 mt-6 uppercase tracking-wider">
              SISTEM
            </p>
            <nav className="space-y-1">
              <Link
                href="/workplace/pengaturan"
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  pathname.startsWith("/workplace/pengaturan")
                    ? "bg-[#2C4A3B] text-white font-medium"
                    : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900"
                }`}
              >
                <Settings
                  className={`h-4 w-4 ${pathname.startsWith("/workplace/pengaturan") ? "text-white" : "text-zinc-400"}`}
                />
                Pengaturan
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Sidebar */}
        <div className="p-4 mt-8">
          {/* Help Banner */}
          <div className="rounded-xl bg-[#E8EDEA] p-4 mb-4">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2C4A3B]/10 mb-3">
              <HelpCircle className="h-4 w-4 text-[#2C4A3B]" />
            </div>
            <h4 className="text-sm font-semibold text-[#2C4A3B] mb-1">
              Butuh bantuan?
            </h4>
            <p className="text-xs text-zinc-600 leading-relaxed mb-3">
              Panduan untuk mengelola studio dengan lebih mudah.
            </p>
            <Link
              href="#"
              className="text-xs font-semibold text-[#2C4A3B] flex items-center gap-1 hover:underline"
            >
              Buka pusat bantuan <ArrowRight className="h-3 w-3 -rotate-45" />
            </Link>
          </div>

          {/* User Profile */}
          <div className="flex items-center justify-between border-t border-[#E5E0D8] pt-4 px-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E8EDEA] text-xs font-semibold text-[#2C4A3B]">
                {user.initials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-zinc-800 truncate">
                  {user.fullName}
                </span>
                <span className="text-[10px] text-zinc-500">{user.role}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-zinc-400 hover:text-zinc-600 shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-[#F9F8F6] min-w-0">
        {/* Header */}
        <header className="flex h-14 lg:h-16 items-center justify-between border-b border-[#E5E0D8] px-4 lg:px-8 bg-[#F4F1ED] sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Hamburger button - mobile only */}
            <button
              onClick={() => setSidebarOpenedAt(pathname)}
              className="lg:hidden text-zinc-600 hover:text-zinc-900"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:flex items-center text-sm text-zinc-500 font-medium">
              <span>Ruang kerja</span>
              <ChevronRight className="mx-2 h-4 w-4 text-zinc-400" />
              <span className="text-zinc-900 capitalize">
                {pathname.split("/").pop()?.replace("-", " ") || "Dashboard"}
              </span>
            </div>
            <span className="sm:hidden text-sm font-semibold text-zinc-900 capitalize">
              {pathname.split("/").pop()?.replace("-", " ") || "Dashboard"}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari proyek, pesanan, atau klien..."
                className="h-9 w-48 lg:w-64 rounded-md border border-[#E5E0D8] bg-white pl-9 pr-4 text-sm outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B] placeholder:text-zinc-400"
              />
            </div>
            <button className="md:hidden text-zinc-500 hover:text-zinc-700">
              <Search className="h-5 w-5" />
            </button>
            <button className="relative text-zinc-500 hover:text-zinc-700">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#F4F1ED]"></span>
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2C4A3B] text-xs font-medium text-white">
              {user.initials}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
