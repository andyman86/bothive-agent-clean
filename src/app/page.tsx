// src/app/page.tsx
"use client";

import { useState } from "react";
import { agentConfig } from "./agent.config"; // ← NOTE the path

export default function Home() {
  const [input, setInput] = useState("Say hello");
  const [out, setOut] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOut("…thinking…");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: input }],
          model: "gpt-4o-mini"
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      setOut(data?.message?.content ?? JSON.stringify(data));
    } catch (err: any) {
      setOut(err?.message ?? "Request failed");
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        {agentConfig.avatar ? (
          <img
            src={agentConfig.avatar}
            alt={agentConfig.name}
            width={28}
            height={28}
            style={{ borderRadius: 6, objectFit: "cover" }}
          />
        ) : null}
        <h1 style={{ margin: 0 }}>{agentConfig.name}</h1>
      </div>

      <form onSubmit={onSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something…"
          style={{ flex: 1, padding: 8, border: "1px solid #e5e7eb", borderRadius: 8 }}
        />
        <button
          type="submit"
          style={{
            padding: "8px 12px",
            border: "none",
            borderRadius: 8,
            background: agentConfig.colors.primary,
            color: "#fff",
            cursor: "pointer"
          }}
        >
          Send
        </button>
      </form>

      <pre style={{ marginTop: 16, whiteSpace: "pre-wrap" }}>{out}</pre>
    </main>
  );
}

