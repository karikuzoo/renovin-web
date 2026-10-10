import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      // File di Supabase Storage project renovin-dev: gambar katalog (URL publik)
      // dan foto ruangan / PDF (signed URL, butuh query ?token=...).
      {
        protocol: "https",
        hostname: "yblaopjkopdrrnwrxgqt.supabase.co",
        pathname: "/storage/v1/object/**",
      },
      // Gambar contoh di data seed.
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default nextConfig;
