"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCheck, Lock, MessageSquare, Search, Send, Unlock } from "lucide-react";
import { useConfirm } from "@/components/confirm-dialog";
import { createClient } from "@/lib/supabase/client";
import {
  fetchConversations,
  fetchMessages,
  fetchStaffNames,
  markConversationRead,
  sendMessage,
  setConversationStatus,
  type Conversation,
  type Message,
} from "@/lib/chat";
import { getStatusLabel } from "@/lib/orders";
import { initials } from "@/lib/team";

// Kotak masuk chat customer ↔ admin (contract-chat.md).
// ?c=<id percakapan> atau ?project=<id pesanan> (dari notifikasi) memilih percakapan.

type Filter = "all" | "unread" | "closed";

const timeFmt = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
const dayFmt = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
const shortFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" });
const dayKey = (iso: string) => new Date(new Date(iso).getTime() + 7 * 3600 * 1000).toISOString().slice(0, 10);

function listTime(iso: string | null) {
  if (!iso) return "";
  return dayKey(iso) === dayKey(new Date().toISOString()) ? timeFmt.format(new Date(iso)) : shortFmt.format(new Date(iso));
}

function ChatInbox({ initialConversation, initialProject }: { initialConversation: string; initialProject: string }) {
  const router = useRouter();
  const [me, setMe] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(initialConversation || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [staffNames, setStaffNames] = useState<Map<string, string>>(new Map());
  // true sampai pesan percakapan terpilih selesai dimuat (diset ulang di select())
  const [loadingThread, setLoadingThread] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [confirm, confirmDialog] = useConfirm();
  const bottomRef = useRef<HTMLDivElement>(null);

  const reloadList = useCallback(() => {
    fetchConversations()
      .then((list) => {
        setConversations(list);
        setLoadError(null);
      })
      .catch((err: unknown) => setLoadError(err instanceof Error ? err.message : "Gagal memuat percakapan."));
  }, []);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setMe(data.user?.id ?? null));
    reloadList();
  }, [reloadList]);

  // Dari notifikasi: pilih percakapan terbuka untuk pesanan itu
  const effectiveSelected = useMemo(() => {
    if (selectedId) return selectedId;
    if (initialProject && conversations) {
      const match = conversations.find((c) => c.project_id === initialProject && c.status === "open") ?? conversations.find((c) => c.project_id === initialProject);
      return match?.id ?? null;
    }
    return null;
  }, [selectedId, initialProject, conversations]);

  const selected = conversations?.find((c) => c.id === effectiveSelected) ?? null;

  // Muat isi percakapan + tandai dibaca
  useEffect(() => {
    if (!effectiveSelected || !me) return;
    let ignore = false;
    fetchMessages(effectiveSelected)
      .then(async (msgs) => {
        if (ignore) return;
        setMessages(msgs);
        const conv = conversations?.find((c) => c.id === effectiveSelected);
        const staffIds = [...new Set(msgs.map((m) => m.sender_id).filter((id) => id !== conv?.customer_id))];
        setStaffNames(await fetchStaffNames(staffIds));
        if (msgs.some((m) => !m.read_at && m.sender_id !== me)) {
          await markConversationRead(effectiveSelected, me);
          setConversations((list) => list?.map((c) => (c.id === effectiveSelected ? { ...c, unread_count: 0 } : c)) ?? list);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) setToast({ type: "error", text: "Gagal memuat pesan: " + (err instanceof Error ? err.message : "") });
      })
      .finally(() => {
        if (!ignore) setLoadingThread(false);
      });
    return () => {
      ignore = true;
    };
    // conversations hanya dipakai untuk customer_id; tidak perlu memicu muat ulang pesan
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveSelected, me]);

  // Realtime: pesan baru & perubahan status percakapan
  useEffect(() => {
    if (!me) return;
    const supabase = createClient();
    const channel = supabase
      .channel("admin-chat")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as Message;
        if (msg.conversation_id === effectiveSelected) {
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
          if (msg.sender_id !== me) markConversationRead(msg.conversation_id, me).catch(() => {});
          if (msg.sender_id !== me && msg.sender_id !== selected?.customer_id && !staffNames.has(msg.sender_id)) {
            fetchStaffNames([msg.sender_id]).then((m) => setStaffNames((prev) => new Map([...prev, ...m])));
          }
        }
        reloadList();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "conversations" }, () => reloadList())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "conversations" }, () => reloadList())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [me, effectiveSelected, selected?.customer_id, staffNames, reloadList]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages, effectiveSelected]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const select = (id: string | null) => {
    setSelectedId(id);
    setMessages([]);
    setLoadingThread(true);
    setDraft("");
    router.replace(id ? `/workplace/chat?c=${id}` : "/workplace/chat", { scroll: false });
  };

  const handleSend = async () => {
    if (!effectiveSelected || !draft.trim()) return;
    setSending(true);
    try {
      await sendMessage(effectiveSelected, draft);
      setDraft("");
    } catch (err) {
      setToast({ type: "error", text: err instanceof Error ? err.message : "Gagal mengirim pesan." });
    } finally {
      setSending(false);
    }
  };

  const toggleStatus = async () => {
    if (!selected) return;
    const closing = selected.status === "open";
    if (
      closing &&
      !(await confirm({
        title: "Tutup percakapan?",
        message: "Klien dan admin tidak bisa mengirim pesan lagi di percakapan ini sampai dibuka kembali. Riwayat pesan tetap tersimpan.",
        confirmLabel: "Tutup",
      }))
    )
      return;
    try {
      await setConversationStatus(selected.id, closing ? "closed" : "open");
      setToast({ type: "success", text: closing ? "Percakapan ditutup." : "Percakapan dibuka lagi." });
      reloadList();
    } catch (err) {
      setToast({ type: "error", text: err instanceof Error ? err.message : "Gagal mengubah status." });
    }
  };

  const counts = useMemo(
    () => ({
      all: conversations?.filter((c) => c.status === "open").length ?? 0,
      unread: conversations?.filter((c) => c.unread_count > 0).length ?? 0,
      closed: conversations?.filter((c) => c.status === "closed").length ?? 0,
    }),
    [conversations],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (conversations ?? []).filter(
      (c) =>
        (filter === "all" ? c.status === "open" : filter === "unread" ? c.unread_count > 0 : c.status === "closed") &&
        (!q || [c.customer_name, c.order_code, c.project_title].some((v) => v?.toLowerCase().includes(q))),
    );
  }, [conversations, filter, search]);

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "Terbuka", count: counts.all },
    { key: "unread", label: "Belum dibaca", count: counts.unread },
    { key: "closed", label: "Ditutup", count: counts.closed },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {confirmDialog}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 max-w-md rounded-xl border px-4 py-3 text-sm font-medium shadow-xl ${
            toast.type === "success" ? "bg-[#2C4A3B] text-white border-[#233A2E]" : "bg-red-600 text-white border-red-700"
          }`}
        >
          {toast.text}
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Chat</h1>
        <p className="text-sm text-zinc-500">Pertanyaan klien dari aplikasi. Semua admin bisa membaca dan membalas.</p>
      </div>

      <div className="grid h-[calc(100vh-14rem)] min-h-[480px] grid-cols-1 overflow-hidden rounded-xl border border-zinc-200 bg-white lg:grid-cols-[22rem_1fr]">
        {/* Daftar percakapan */}
        <div className={`flex min-h-0 flex-col border-zinc-200 lg:border-r ${effectiveSelected ? "hidden lg:flex" : "flex"}`}>
          <div className="space-y-3 border-b border-zinc-100 p-4">
            <div className="flex rounded-md bg-zinc-100 p-0.5">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setFilter(t.key)}
                  className={`flex flex-1 items-center justify-center gap-1 whitespace-nowrap rounded px-2 py-1.5 text-xs font-semibold ${
                    filter === t.key ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  {t.label} <span className="font-normal text-zinc-400">{t.count}</span>
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari klien atau nomor pesanan"
                className="h-9 w-full rounded-md border border-zinc-200 pl-9 pr-3 text-xs outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B]"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loadError ? (
              <p className="p-4 text-sm text-red-600">{loadError}</p>
            ) : !conversations ? (
              <p className="p-4 text-sm text-zinc-500">Memuat percakapan…</p>
            ) : visible.length === 0 ? (
              <p className="p-6 text-center text-sm text-zinc-500">
                {filter === "unread" ? "Semua pesan sudah dibaca." : filter === "closed" ? "Belum ada percakapan yang ditutup." : "Belum ada percakapan."}
              </p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {visible.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => select(c.id)}
                      className={`flex w-full gap-3 px-4 py-3 text-left ${c.id === effectiveSelected ? "bg-[#E8EDEA]" : "hover:bg-zinc-50"}`}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8EDEA] text-[11px] font-bold text-[#2C4A3B]">
                        {initials(c.customer_name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className={`truncate text-sm ${c.unread_count ? "font-bold text-zinc-900" : "font-semibold text-zinc-800"}`}>
                            {c.customer_name ?? "Klien"}
                          </p>
                          <span className="shrink-0 text-[10px] text-zinc-400">{listTime(c.last_message_at)}</span>
                        </div>
                        <p className="truncate text-[11px] text-zinc-500">{c.order_code ? `${c.order_code} · ${c.project_title ?? ""}` : "Tanpa nomor pesanan"}</p>
                        <div className="mt-0.5 flex items-center justify-between gap-2">
                          <p className={`truncate text-xs ${c.unread_count ? "font-semibold text-zinc-800" : "text-zinc-500"}`}>
                            {c.last_message_body
                              ? (c.last_message_from_customer ? "" : c.last_message_sender_id === me ? "Anda: " : "Admin: ") + c.last_message_body
                              : "Belum ada pesan"}
                          </p>
                          {c.unread_count > 0 && (
                            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#2C4A3B] px-1.5 text-[10px] font-bold text-white">
                              {c.unread_count}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Isi percakapan */}
        <div className={`min-h-0 flex-col ${effectiveSelected ? "flex" : "hidden lg:flex"}`}>
          {!selected ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center text-zinc-400">
              <MessageSquare className="h-8 w-8" />
              <p className="text-sm">{effectiveSelected && conversations ? "Percakapan tidak ditemukan." : "Pilih percakapan untuk mulai membalas."}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3">
                <button type="button" onClick={() => select(null)} aria-label="Kembali" className="text-zinc-500 hover:text-zinc-800 lg:hidden">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-zinc-900">{selected.customer_name ?? "Klien"}</p>
                  <p className="truncate text-[11px] text-zinc-500">
                    {[selected.customer_phone, selected.customer_email].filter(Boolean).join(" · ")}
                  </p>
                </div>
                {selected.project_id && (
                  <Link
                    href={`/workplace/pesanan/${selected.project_id}`}
                    className="hidden shrink-0 items-center gap-1 rounded-md border border-zinc-200 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50 sm:flex"
                  >
                    {selected.order_code} <ArrowUpRight className="h-3 w-3" />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={toggleStatus}
                  className="flex shrink-0 items-center gap-1 rounded-md border border-zinc-200 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  {selected.status === "open" ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                  {selected.status === "open" ? "Tutup" : "Buka lagi"}
                </button>
              </div>
              {selected.project_id && (
                <div className="border-b border-zinc-100 bg-[#FAF9F7] px-4 py-2 text-[11px] text-zinc-600">
                  {selected.order_code} · {selected.project_title} · {selected.project_status ? getStatusLabel(selected.project_status) : ""}
                  {selected.assigned_admin_name && <> · Penanggung jawab {selected.assigned_admin_name}</>}
                </div>
              )}

              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-[#FAF9F7]/60 px-4 py-4">
                {loadingThread && messages.length === 0 ? (
                  <p className="text-center text-sm text-zinc-500">Memuat pesan…</p>
                ) : (
                  messages.map((m, i) => {
                    const fromCustomer = m.sender_id === selected.customer_id;
                    const showDay = i === 0 || dayKey(messages[i - 1].created_at) !== dayKey(m.created_at);
                    const showName = !fromCustomer && (i === 0 || messages[i - 1].sender_id !== m.sender_id);
                    return (
                      <div key={m.id}>
                        {showDay && (
                          <p className="my-3 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                            {dayFmt.format(new Date(m.created_at))}
                          </p>
                        )}
                        <div className={`flex ${fromCustomer ? "justify-start" : "justify-end"}`}>
                          <div className={`max-w-[80%] ${fromCustomer ? "" : "text-right"}`}>
                            {showName && (
                              <p className="mb-0.5 text-[10px] text-zinc-400">{m.sender_id === me ? "Anda" : staffNames.get(m.sender_id) ?? "Admin"}</p>
                            )}
                            <div
                              className={`inline-block whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-left text-sm ${
                                fromCustomer ? "rounded-bl-sm border border-zinc-200 bg-white text-zinc-800" : "rounded-br-sm bg-[#2C4A3B] text-white"
                              }`}
                            >
                              {m.body}
                            </div>
                            <p className="mt-0.5 flex items-center gap-1 text-[10px] text-zinc-400 justify-end">
                              {timeFmt.format(new Date(m.created_at))}
                              {!fromCustomer && m.read_at && <CheckCheck className="h-3 w-3 text-[#2C4A3B]" aria-label="Dibaca klien" />}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {selected.status === "closed" ? (
                <div className="flex items-center justify-between gap-3 border-t border-zinc-100 px-4 py-3 text-xs text-zinc-500">
                  Percakapan ditutup. Buka lagi untuk membalas.
                  <button type="button" onClick={toggleStatus} className="font-semibold text-[#2C4A3B] hover:underline">
                    Buka lagi
                  </button>
                </div>
              ) : (
                <div className="flex items-end gap-2 border-t border-zinc-100 p-3">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    rows={1}
                    maxLength={4000}
                    placeholder="Tulis balasan… (Enter untuk kirim, Shift+Enter baris baru)"
                    className="max-h-32 min-h-10 flex-1 resize-y rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-[#2C4A3B] focus:ring-1 focus:ring-[#2C4A3B]"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={sending || !draft.trim()}
                    aria-label="Kirim"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2C4A3B] text-white hover:bg-[#233A2E] disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = use(searchParams);
  const c = typeof params.c === "string" ? params.c : "";
  const project = typeof params.project === "string" ? params.project : "";
  // Dibuka dari notifikasi (project berganti) -> pilih ulang; navigasi di dalam halaman memakai router.replace
  return <ChatInbox key={project} initialConversation={c} initialProject={project} />;
}
