export async function uploadFoto(file: File, folderPath: string = "/projects") {
  // 1. Minta token autentikasi ke Server Backend baru
  const backendUrl = process.env.NEXT_PUBLIC_API_BACKEND_URL;
  const authRes = await fetch(`${backendUrl}/api/imagekit-auth`);

  if (!authRes.ok) {
    throw new Error("Gagal mengambil token autentikasi dari backend");
  }

  const authData = await authRes.json();

  // 2. Kirim/Upload file langsung dari browser ke ImageKit API
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "fileName",
    `${Date.now()}-${file.name.replace(/\s+/g, "-")}`,
  );
  formData.append("folder", folderPath);
  formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!);
  formData.append("signature", authData.signature);
  formData.append("expire", authData.expire);
  formData.append("token", authData.token);

  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: formData,
  });

  const uploadResult = await res.json();

  if (!res.ok) {
    throw new Error(
      uploadResult.message || "Gagal mengunggah foto ke ImageKit",
    );
  }

  // Mengembalikan URL foto
  return uploadResult.url;
}
