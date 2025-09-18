"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant" | "system"; content: string };

// 👇 Change this to whatever you want your bot to be called.
const AGENT_NAME = "Bothive Agent";

export default function CornerChat() {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: `Hi! I’m ${AGENT_NAME}. How can I help?` },
  ]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [msgs, loading, open]);

  async function send() {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");
    setMsgs((m) => [...m, { role: "user", content: userText }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // pass running history with a system nudge for the agent name
          messages: [
            { role: "system", content: `You are ${AGENT_NAME}. Be helpful and concise.` },
            ...msgs,
            { role: "user", content: userText },
          ],
          model: "gpt-4o-mini",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      const text = data?.message?.content ?? "";
      setMsgs((m) => [...m, { role: "assistant", content: text }]);
    } catch (err: any) {
      setMsgs((m) => [
        ...m,
        { role: "assistant", content: `⚠️ ${err?.message || "Something went wrong"}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      void send();
    }
  }

  return (
    <>
      {/* Floating toggle button */}
      {!open && (
        <button
          aria-label="Open chat"
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            right: 20,
            bottom: 20,
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "none",
            background: "#111827",
            color: "#fff",
            boxShadow: "0 6px 20px rgba(0,0,0,.25)",
            cursor: "pointer",
            fontSize: 18,
          }}
          title={AGENT_NAME}
        >
          💬
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div
          style={{
            position: "fixed",
            right: 20,
            bottom: 20,
            width: 360,
            height: 520,
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            boxShadow: "0 10px 30px rgba(0,0,0,.15)",
            display: "grid",
            gridTemplateRows: "auto 1fr auto",
            overflow: "hidden",
            zIndex: 99999,
          }}
        >
          {/* Header */}
          <header
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              background: "#111827",
              color: "#fff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#34d399", // green dot
                }}
              />
              <strong>{AGENT_NAME}</strong>
            </div>
            <button
              onClick={() => setOpen(false)}
              title="Minimize"
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </header>

          {/* Messages */}
          <div
            ref={listRef}
            style={{
              padding: 12,
              overflowY: "auto",
              background: "#f9fafb",
            }}
          >
            {msgs.map((m, i) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: isUser ? "flex-end" : "flex-start",
                    margin: "6px 0",
                  }}
                >
                  <div
                    style={{
                      maxWidth: 260,
                      whiteSpace: "pre-wrap",
                      padding: "8px 10px",
                      borderRadius: 10,
                      border: "1px solid #e5e7eb",
                      background: isUser ? "#dbeafe" : "#fff",
                      color: "#111827",
                    }}
                  >
                    {!isUser && (
                      <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>
                        {AGENT_NAME}
                      </div>
                    )}
                    {m.content}
                  </div>
                </div>
              );
            })}
            {loading && <div style={{ fontSize: 12, opacity: 0.6 }}>…thinking…</div>}
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            style={{
              display: "flex",
              gap: 8,
              padding: 10,
              borderTop: "1px solid #e5e7eb",
              background: "#fff",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Type a message…"
              style={{
                flex: 1,
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                padding: "10px 14px",
                border: "none",
                borderRadius: 8,
                background: "#111827",
                color: "#fff",
                cursor: loading ? "default" : "pointer",
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}


