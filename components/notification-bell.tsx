"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, CheckCircle2, Inbox, MessageSquare, RotateCcw, Send, UserCog, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeNotifications,
  timeAgo,
  type AppNotification,
} from "@/lib/notifications";

// Ikon per jenis notifikasi; jenis yang belum dikenal memakai ikon lonceng
function iconFor(type: string) {
  switch (type) {
    case "project_submitted":
      return { Icon: Inbox, cls: "bg-orange-50 text-orange-600" };
    case "approval_requested":
      return { Icon: Send, cls: "bg-blue-50 text-blue-600" };
    case "approval_approved":
      return { Icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-600" };
    case "approval_correction":
      return { Icon: RotateCcw, cls: "bg-amber-50 text-amber-600" };
    case "approval_rejected":
      return { Icon: XCircle, cls: "bg-red-50 text-red-600" };
    case "project_assigned":
      return { Icon: UserCog, cls: "bg-[#E8EDEA] text-[#2C4A3B]" };
    case "chat_opened":
    case "chat_reply":
      return { Icon: MessageSquare, cls: "bg-violet-50 text-violet-600" };
    default:
      return { Icon: Bell, cls: "bg-zinc-100 text-zinc-500" };
  }
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Muat awal + langganan realtime
  useEffect(() => {
    let ignore = false;
    let unsubscribe: (() => void) | null = null;

    (async () => {
      try {
        const res = await fetchNotifications();
        if (ignore) return;
        setItems(res.items);
        setUnread(res.unread);
        setError(false);
      } catch (err) {
        console.error("Gagal memuat notifikasi:", err);
        if (!ignore) setError(true);
      } finally {
        if (!ignore) setLoading(false);
      }

      const { data } = await createClient().auth.getUser();
      if (ignore || !data.user) return;
      unsubscribe = subscribeNotifications(data.user.id, (n) => {
        setItems((prev) => [n, ...prev.filter((p) => p.id !== n.id)].slice(0, 20));
        if (!n.read_at) setUnread((u) => u + 1);
      });
    })();

    return () => {
      ignore = true;
      unsubscribe?.();
    };
  }, []);

  // Tutup saat klik di luar / tekan Esc
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const markLocalRead = (id: number) => {
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => (n.id === id && !n.read_at ? { ...n, read_at: now } : n)));
  };

  const handleClick = async (n: AppNotification) => {
    if (!n.read_at) {
      markLocalRead(n.id);
      setUnread((u) => Math.max(0, u - 1));
      markNotificationRead(n.id).catch((err) => console.error("Gagal menandai notifikasi:", err));
    }
    setOpen(false);
    if (n.project_id) router.push(`/workplace/pesanan/${n.project_id}`);
  };

  const handleMarkAll = async () => {
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: now })));
    setUnread(0);
    try {
      await markAllNotificationsRead();
    } catch (err) {
      console.error("Gagal menandai semua notifikasi:", err);
    }
  };

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unread ? `Notifikasi, ${unread} belum dibaca` : "Notifikasi"}
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 hover:bg-white/60 hover:text-zinc-700"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white ring-2 ring-[#F4F1ED]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-zinc-900">Notifikasi</p>
              <p className="text-[11px] text-zinc-500">{unread ? `${unread} belum dibaca` : "Semua sudah dibaca"}</p>
            </div>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#2C4A3B] hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Tandai semua dibaca
              </button>
            )}
          </div>

          <div className="max-h-[26rem] overflow-y-auto">
            {loading && <p className="px-4 py-8 text-center text-xs text-zinc-500">Memuat notifikasi…</p>}
            {!loading && error && (
              <p className="px-4 py-8 text-center text-xs text-red-600">Gagal memuat notifikasi.</p>
            )}
            {!loading && !error && items.length === 0 && (
              <div className="px-4 py-10 text-center">
                <Bell className="mx-auto mb-2 h-6 w-6 text-zinc-300" />
                <p className="text-xs text-zinc-500">Belum ada notifikasi.</p>
              </div>
            )}
            {items.map((n) => {
              const { Icon, cls } = iconFor(n.type);
              return (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`flex w-full gap-3 border-b border-zinc-50 px-4 py-3 text-left transition hover:bg-zinc-50 ${
                    n.read_at ? "" : "bg-[#F4F7F5]"
                  }`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cls}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className={`text-xs ${n.read_at ? "font-medium text-zinc-700" : "font-bold text-zinc-900"}`}>
                        {n.title}
                      </span>
                      {!n.read_at && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#2C4A3B]" />}
                    </span>
                    {n.body && <span className="mt-0.5 block text-[11px] leading-relaxed text-zinc-500 line-clamp-2">{n.body}</span>}
                    <span className="mt-1 block text-[10px] text-zinc-400">{timeAgo(n.created_at)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
