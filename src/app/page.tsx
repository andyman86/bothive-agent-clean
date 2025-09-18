"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant" | "system"; content: string };

export default function Home() {
  const [input, setInput] = useState("");
  const [system, setSystem] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I’m alive. Ask me something." },
  ]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, loading]);

  async function send() {
    if (!input.trim() || loading) return;
    const next: Msg[] = [
      ...msgs,
      ...(system.trim() ? [{ role: "system", content: system }] : []),
      { role: "user", content: input.trim() },
    ];

    setMsgs((m) => [...m, { role: "user", content: input.trim() }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, model }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      setMsgs((m) => [...m, { role: "assistant", content: data?.message?.content ?? "" }]);
    } catch (err: any) {
      setMsgs((m) => [...m, { role: "assistant", content: `⚠️ ${err?.message || "Error"}` }]);
    } finally {
      setLoading(false);
    }
  }

  function onEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  return (
    <main style={{ height: "100dvh", display: "grid", gridTemplateRows: "auto 1fr auto", gap: 12, padding: 16 }}>
      <header style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>BotHive chat</h1>
        <select value={model} onChange={(e) => setModel(e.target.value)} style={{ padding: 6 }}>
          <option value="gpt-4o-mini">gpt-4o-mini</option>
          <option value="gpt-4o-mini-translate">gpt-4o-mini-translate</option>
          <option value="gpt-4o">gpt-4o</option>
        </select>
        <button onClick={() => setMsgs([{ role: "assistant", content: "New chat. What’s up?" }])}>Reset</button>
      </header>

      <div
        ref={listRef}
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          overflowY: "auto",
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
                maxWidth: 680,
                whiteSpace: "pre-wrap",
                padding: "8px 12px",
                borderRadius: 12,
                background: m.role === "user" ? "#dbeafe" : "#fff",
                border: "1px solid #e5e7eb",
              }}
            >
              <b style={{ opacity: 0.75 }}>{m.role}</b>
              <div>{m.content}</div>
            </div>
          </div>
        ))}
        {loading && <div style={{ opacity: 0.6 }}>…thinking…</div>}
      </div>

      <section style={{ display: "grid", gap: 8 }}>
        <textarea
          value={system}
          onChange={(e) => setSystem(e.target.value)}
          placeholder="(Optional) System prompt – e.g., 'Be concise.'"
          rows={2}
          style={{ padding: 8 }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onEnter}
            placeholder="Type a message and press Enter"
            style={{ flex: 1, padding: 8 }}
          />
          <button onClick={send} disabled={loading}>
            Send
          </button>
        </div>
      </section>
    </main>
  );
}

