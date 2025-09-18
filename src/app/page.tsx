// src/app/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [open, setOpen] = useState(true);         // set to false if you want it closed by default
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Hi! How can I help?" },
  ]);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || busy) return;

    const next = [...msgs, { role: "user", content: text }];
    setMsgs(next);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      const content =
        data?.message?.content ||
        data?.choices?.[0]?.message?.content ||
        JSON.stringify(data);

      setMsgs((m) => [...m, { role: "assistant", content }]);
    } catch (err: any) {
      setMsgs((m) => [
        ...m,
        { role: "assistant", content: err?.message ?? "Request failed" },
      ]);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [msgs, open]);

  return (
    <>
      {/* Optional: tiny brand strip at top of the page (not necessary) */}
      <header style={{ padding: 12, display: "flex", alignItems: "center", gap: 8 }}>
        {/* If you only have PNG, change src to "/bothive.png" */}
        <img src="/bothive.svg" width={28} height={28} alt="logo" />
        <strong>Bothive Agent</strong>
      </header>

      {/* The rest of your site can go here… */}

      {/* Launcher Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open chat"
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          width: 56,
          height: 56,
          borderRadius: 999,
          border: "none",
          background: "#111",
          color: "#fff",
          boxShadow: "0 8px 24px rgba(0,0,0,.25)",
          cursor: "pointer",
          zIndex: 999999,
        }}
      >
        {open ? "×" : "💬"}
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          style={{
            position: "fixed",
            right: 20,
            bottom: 84,
            width: 360,
            maxWidth: "90vw",
            height: 520,
            maxHeight: "75vh",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 12px 32px rgba(0,0,0,.25)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 999998,
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              borderBottom: "1px solid #eee",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <img src="/bothive.svg" width={20} height={20} alt="logo" />
            <strong>Bothive Agent</strong>
          </div>

          <div
            ref={scrollRef}
            style={{
              flex: 1,
              padding: 12,
              overflow: "auto",
              background: "#fafafa",
            }}
          >
            {msgs.map((m, i) => (
              <div
                key={i}
                style={{
                  margin: "8px 0",
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "8px 10px",
                    borderRadius: 10,
                    background: m.role === "user" ? "#111" : "#fff",
                    color: m.role === "user" ? "#fff" : "#111",
                    border: "1px solid #eee",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                thinking…
              </div>
            )}
          </div>

          <form onSubmit={send} style={{ display: "flex", gap: 8, padding: 10, borderTop: "1px solid #eee" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message…"
              disabled={busy}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #ddd",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                background: "#111",
                color: "#fff",
                cursor: busy ? "not-allowed" : "pointer",
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
