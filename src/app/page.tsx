"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Msg = { role: "user" | "assistant" | "system"; content: string };

type AgentConfig = {
  id: string;
  name: string;            // "Bothive Agent"
  system?: string;         // system prompt
  primary?: string;        // header/button color
  accent?: string;         // online-dot color
  avatar?: string;         // "/avatars/bothive.png"
};

// ---- defaults (used if config not found) ----
const DEFAULT_AGENT: AgentConfig = {
  id: "default",
  name: "Bothive Agent",
  system: "You are a helpful, concise AI assistant.",
  primary: "#111827", // slate-900
  accent: "#34d399",  // green-400
  avatar: "/avatars/bothive.png",
};

export default function CornerChat() {
  // load agent id from ?agent=<id>
  const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const agentId = search?.get("agent") || "default";

  const [cfg, setCfg] = useState<AgentConfig>(DEFAULT_AGENT);
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // fetch config json from /agents/<id>.json (in /public/agents)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/agents/${agentId}.json`, { cache: "no-store" });
        if (!res.ok) throw new Error("Agent config not found");
        const j = (await res.json()) as AgentConfig;
        if (!cancelled) setCfg({ ...DEFAULT_AGENT, ...j, id: agentId });
      } catch {
        if (!cancelled) setCfg({ ...DEFAULT_AGENT, id: agentId });
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId]);

  // initial greeting depends on current config
  useEffect(() => {
    setMsgs([{ role: "assistant", content: `Hi! I’m ${cfg.name}. How can I help?` }]);
  }, [cfg.id, cfg.name]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [msgs, loading, open]);

  const headerStyle = useMemo(
    () => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 12px",
      background: cfg.primary,
      color: "#fff",
    }),
    [cfg.primary]
  );

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
          messages: [
            { role: "system", content: cfg.system ?? DEFAULT_AGENT.system! },
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
            background: cfg.primary,
            color: "#fff",
            boxShadow: "0 6px 20px rgba(0,0,0,.25)",
            cursor: "pointer",
            fontSize: 18,
            zIndex: 99999,
          }}
          title={cfg.name}
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
          <header style={headerStyle as any}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {cfg.avatar ? (
                <img
                  src={cfg.avatar}
                  alt={`${cfg.name} logo`}
                  width={22}
                  height={22}
                  style={{ borderRadius: 4, objectFit: "cover" }}
                />
              ) : null}
              <strong>{cfg.name}</strong>
              <div
                title="online"
                style={{
                  marginLeft: 6,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: cfg.accent || DEFAULT_AGENT.accent,
                }}
              />
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
                    gap: 8,
                  }}
                >
                  {/* avatar bubble for assistant */}
                  {!isUser && cfg.avatar ? (
                    <img
                      src={cfg.avatar}
                      alt={cfg.name}
                      width={26}
                      height={26}
                      style={{ borderRadius: 6, objectFit: "cover", marginTop: 4 }}
                    />
                  ) : (
                    !isUser && <div style={{ width: 26 }} />
                  )}

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
                      <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 4 }}>{cfg.name}</div>
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
                background: cfg.primary,
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

