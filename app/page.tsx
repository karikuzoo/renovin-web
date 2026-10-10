"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Mail, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [activePanel, setActivePanel] = useState<"login" | "forgot" | "reset">("login");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirm, setResetConfirm] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setActivePanel("reset");
      }
    });

    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      
      if (searchParams.has("reset") && searchParams.get("reset") === "berhasil") {
        setResetSuccess(true);
      }
      
      if (searchParams.has("forgot") && searchParams.get("forgot") === "true") {
        setActivePanel("forgot");
      }
      
      if (searchParams.has("reset_form") && searchParams.get("reset_form") === "true") {
        setActivePanel("reset");
      }

      if (searchParams.has("error") && searchParams.get("error") === "link-tidak-valid") {
        setForgotError("Link tidak valid atau sudah kedaluwarsa.");
        setActivePanel("forgot");
      }

      // Supabase default implicit flow (tanpa PKCE) melempar hash
      const hash = window.location.hash;
      if (hash && hash.includes("type=recovery")) {
        setActivePanel("reset");
        // Bersihkan hash setelah ditangkap
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
      } else if (searchParams.toString()) {
        // Hapus query params
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      if (!data.session) {
        setError("Login gagal. Sesi tidak ditemukan.");
        return;
      }

      // Cek role user di tabel profiles
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.session.user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setError("Gagal memuat data profil. Silakan coba lagi.");
        return;
      }

      const allowedRoles = ["admin", "super_admin"];

      if (!allowedRoles.includes(profile.role)) {
        await supabase.auth.signOut();
        setError(
          "Akses ditolak. Hanya akun dengan role Admin atau Super Admin yang dapat mengakses halaman ini.",
        );
        return;
      }

      // Role valid, redirect ke dashboard
      router.replace("/workplace/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan sistem saat mencoba login.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage("");
    setForgotError("");

    const { data, error } = await supabase.functions.invoke("request-password-reset", {
      body: { email: forgotEmail },
    });

    if (error) {
      setForgotError("Permintaan gagal. Periksa format email lalu coba lagi.");
    } else {
      setForgotMessage(data.message);
    }
    setForgotLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    if (resetPassword.length < 8) return setResetError("Kata sandi minimal 8 karakter.");
    if (resetPassword !== resetConfirm) return setResetError("Konfirmasi kata sandi tidak sama.");

    setResetLoading(true);
    const { error } = await supabase.auth.updateUser({ password: resetPassword });
    if (error) {
      setResetError("Gagal menyimpan kata sandi: " + error.message);
      setResetLoading(false);
      return;
    }

    await supabase.auth.signOut();
    setActivePanel("login");
    setResetSuccess(true);
    setResetLoading(false);
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

        <div className="flex flex-1 items-center justify-center p-8 overflow-hidden">
          <div
            className="flex w-full transition-transform duration-500 ease-in-out"
            style={{ 
              transform: activePanel === "login" ? "translateX(0)" : 
                         activePanel === "forgot" ? "translateX(-100%)" : 
                         "translateX(-200%)" 
            }}
          >
            {/* Form Login */}
            <div className="w-full shrink-0 flex flex-col items-center justify-center">
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
                  {resetSuccess && (
                    <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                      Kata sandi berhasil diubah, silakan masuk.
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
                    <button
                      type="button"
                      onClick={() => setActivePanel("forgot")}
                      className="text-xs font-medium text-[#2C4A3B] hover:underline"
                    >
                      Lupa kata sandi?
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-between rounded-md bg-[#2C4A3B] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#233A2E] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? "Memproses..." : "Masuk ke ruang kerja"}
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

            {/* Form Lupa Password */}
            <div className="w-full shrink-0 flex flex-col items-center justify-center">
              <div className="w-full max-w-md">
                <h2 className="mb-3 text-4xl font-bold tracking-tight text-[#1A1A1A]">
                  Lupa kata sandi
                </h2>
                <p className="mb-8 text-sm leading-relaxed text-zinc-500">
                  Masukkan email admin Anda, dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
                </p>

                <form onSubmit={handleForgotPassword} className="space-y-5">
                  {forgotMessage && (
                    <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
                      {forgotMessage}
                    </div>
                  )}
                  {forgotError && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                      {forgotError}
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700">
                      Email admin
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="admin@renovin.id"
                        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B]"
                        required
                      />
                      <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex w-full items-center justify-between rounded-md bg-[#2C4A3B] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#233A2E] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {forgotLoading ? "Memproses..." : "Kirim link atur ulang"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setActivePanel("login")}
                    className="text-xs font-medium text-zinc-500 hover:text-zinc-800 hover:underline"
                  >
                    Kembali ke halaman masuk
                  </button>
                </div>
              </div>
            </div>
            {/* Form Atur Ulang Kata Sandi (Reset Password) */}
            <div className="w-full shrink-0 flex flex-col items-center justify-center">
              <div className="w-full max-w-md">
                <h2 className="mb-3 text-4xl font-bold tracking-tight text-[#1A1A1A]">
                  Atur kata sandi baru
                </h2>
                <p className="mb-8 text-sm leading-relaxed text-zinc-500">
                  Silakan masukkan kata sandi baru Anda di bawah ini.
                </p>

                <form onSubmit={handleResetPassword} className="space-y-5">
                  {resetError && (
                    <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                      {resetError}
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700">
                      Kata sandi baru
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={resetPassword}
                        onChange={(e) => setResetPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B]"
                        required
                      />
                      <EyeOff className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-700">
                      Ulangi kata sandi baru
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={resetConfirm}
                        onChange={(e) => setResetConfirm(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none transition-all placeholder:text-zinc-400 focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B]"
                        required
                      />
                      <EyeOff className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex w-full items-center justify-between rounded-md bg-[#2C4A3B] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#233A2E] disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {resetLoading ? "Menyimpan..." : "Simpan kata sandi"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setActivePanel("login")}
                    className="text-xs font-medium text-zinc-500 hover:text-zinc-800 hover:underline"
                  >
                    Kembali ke halaman masuk
                  </button>
                </div>
              </div>
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
