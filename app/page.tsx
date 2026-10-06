"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "admin@renovin.id" && password === "admin123") {
      router.push("/workplace/dashboard");
    } else {
      setError(
        "Email atau kata sandi salah. Gunakan admin@renovin.id / admin123",
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F1ED]">
      {/* Left side - Image & Branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-zinc-900 p-12 text-white lg:flex relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1000"
            alt="Interior design"
            fill
            className="object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80" />
        </div>

        <div className="relative z-10">
          <h1 className="font-serif text-4xl tracking-tight">Renovin.</h1>
          <p className="mt-1 text-xs font-medium uppercase tracking-widest text-zinc-300">
            Studio Interior
          </p>
        </div>

        <div className="relative z-10 max-w-md">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-zinc-300">
            Ruang Studio / Renovin
          </p>
          <h2 className="mb-4 text-5xl font-bold leading-tight tracking-tight">
            Ruang yang bermakna,
            <br />
            proses yang tertata.
          </h2>
          <p className="text-sm font-medium leading-relaxed text-zinc-300">
            Dari ide pertama hingga serah terima. Satu ruang kerja untuk
            menghubungkan desain, tim, dan setiap perkembangan di lapangan.
          </p>

          <div className="mt-12 flex items-center justify-between border-t border-white/20 pt-6">
            <p className="text-xs text-zinc-300">Dirancang dengan perhatian.</p>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex w-full flex-col lg:w-1/2">
        <div className="flex items-center justify-between p-8 text-sm font-medium text-zinc-500">
          <span>Portal administrator</span>
          <Link
            href="#"
            className="flex items-center gap-1 hover:text-zinc-800"
          >
            Bantuan masuk <ArrowRight className="h-3 w-3 -rotate-45" />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center p-8">
          <div className="w-full max-w-md">
            <h2 className="mb-3 text-4xl font-bold tracking-tight text-[#1A1A1A]">
              Selamat datang .
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-zinc-500">
              Masuk untuk mengelola pesanan, memantau proyek, dan menjaga setiap
              detail tetap terhubung.
            </p>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">
                  Email admin
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@renovin.id"
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B]"
                    required
                  />
                  <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700">
                  Kata sandi
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B]"
                    required
                  />
                  <EyeOff className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-zinc-300 text-[#2C4A3B] focus:ring-[#2C4A3B] accent-[#2C4A3B]"
                    defaultChecked
                  />
                  <span className="text-xs font-medium text-zinc-700">
                    Ingat perangkat ini
                  </span>
                </label>
                <Link
                  href="#"
                  className="text-xs font-medium text-[#2C4A3B] hover:underline"
                >
                  Lupa kata sandi?
                </Link>
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-between rounded-md bg-[#2C4A3B] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#233A2E]"
              >
                Masuk ke ruang kerja
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 flex items-start gap-3 rounded-md bg-zinc-100/50 p-4 border border-zinc-200/50">
              <ShieldCheck className="h-5 w-5 text-zinc-500 shrink-0" />
              <p className="text-xs text-zinc-500 leading-relaxed">
                Akses khusus tim admin. Hubungi administrator studio untuk
                mendapatkan akun.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-8 text-xs font-medium text-zinc-400">
          <span>© 2026 Renovin. Studio Interior</span>
          <Link href="#" className="hover:text-zinc-600">
            Kebijakan privasi
          </Link>
        </div>
      </div>
    </div>
  );
}
