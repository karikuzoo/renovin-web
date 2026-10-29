"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// Kolom kata sandi dengan tombol mata untuk menampilkan/menyembunyikan isinya.
// Semua props diteruskan ke <input>, kecuali type yang diatur oleh tombol.
export function PasswordInput({ className = "", ...props }: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} className={`${className} pr-10`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
        aria-pressed={visible}
        title={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
        className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-zinc-400 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#2C4A3B]"
      >
        <Icon className="h-4 w-4" />
      </button>
    </div>
  );
}
