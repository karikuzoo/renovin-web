import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Link di email reset password mengarah ke sini:
//   /auth/confirm?token_hash=...&type=recovery&next=/reset-password
// Token diverifikasi di server, sesi login dibuat (cookie), lalu diarahkan ke `next`.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";
  // Hanya izinkan path internal, supaya link tidak bisa dipakai mengarahkan ke situs lain
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      if (type === "recovery") {
        redirect("/?reset_form=true");
      } else {
        redirect(safeNext);
      }
    }
  }

  redirect("/?forgot=true&error=link-tidak-valid");
}
