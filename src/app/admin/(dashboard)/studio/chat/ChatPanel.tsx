"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";

type ChatMessage = {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  body: string;
  createdAt: string;
};

export default function ChatPanel({
  sessionId,
  currentUserId,
}: {
  sessionId: string;
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const [draft, setDraft] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/studio-chat?sessionId=${sessionId}`);
    wsRef.current = ws;

    ws.addEventListener("open", () => setConnected(true));
    ws.addEventListener("close", () => setConnected(false));
    ws.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "history") {
          setMessages(data.messages);
        } else if (data.type === "message") {
          setMessages((prev) => [...prev, data.message]);
        }
      } catch {
        // ignore malformed frames
      }
    });

    return () => ws.close();
  }, [sessionId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function send() {
    const body = draft.trim();
    if (!body || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ body }));
    setDraft("");
  }

  return (
    <div className="flex h-[32rem] flex-col border border-line bg-ink-2">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <p className="font-condensed text-xs font-bold uppercase tracking-[0.14em] text-grey-400">
          Studio Chat — Broadcaster Only
        </p>
        <span
          className={`size-2 rounded-full ${connected ? "bg-emerald-400" : "bg-grey-600"}`}
          title={connected ? "Connected" : "Disconnected"}
        />
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-grey-500">No messages yet. Say hello to the team on air.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={m.userId === currentUserId ? "text-right" : ""}>
            <p className="font-condensed text-[11px] font-semibold uppercase tracking-[0.08em] text-grey-500">
              {m.userName}
            </p>
            <p
              className={`mt-0.5 inline-block max-w-[85%] px-3 py-2 text-sm ${
                m.userId === currentUserId ? "bg-gold text-ink" : "bg-ink-3 text-white"
              }`}
            >
              {m.body}
            </p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-line p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Message the team..."
          className="flex-1 border border-line-strong bg-ink px-4 py-2.5 text-sm text-white placeholder:text-grey-500 focus:border-gold"
        />
        <button
          onClick={send}
          className="flex size-10 shrink-0 items-center justify-center bg-gold text-ink hover:bg-gold-soft"
          aria-label="Send"
        >
          <Send className="size-4" />
        </button>
      </div>
    </div>
  );
}
