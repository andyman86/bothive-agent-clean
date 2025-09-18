"use client";

import React, { useState } from "react";
import { agentConfig } from "./agent.config";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("Say hello");
  const [out, setOut] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setOut("…thinking…");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: input }] }),
      });
      const data = await res.json();
      setOut(data?.message?.content ?? JSON.stringify(data));
    } catch (err: any) {
      setOut(err?.message ?? "Request failed");
    }
  }

  return (
    <main>
      {/* Floating chat widget */}
      <div className="chat-root">
        {/* Bubble */}
        <button className="chat-bubble" onClick={() => setOpen((v) => !v)}>
          💬
        </button>

        {/* Panel */}
        {open && (
          <div className="chat-panel">
            <div className="chat-header" style={{ background: agentConfig.colors.primary }}>
              <img src={agentConfig.avatar} alt="logo" />
              <span>{agentConfig.name}</span>
            </div>

            <div className="chat-body">
              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{out}</pre>
            </div>

            <form className="chat-form" onSubmit={onSubmit}>
              <input
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything…"
              />
              <button className="chat-send" type="submit">Send</button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
