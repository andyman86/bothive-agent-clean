"use client";

import { useState } from "react";
import agentConfig from "../agent.config";

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
    <>
      {/* Page can otherwise be empty; the widget floats in the corner */}
      <div className="chat-root">
        {/* Floating round bubble */}
        <button
          className="chat-bubble"
          aria-label="Open chat"
          onClick={() => setOpen(true)}
          style={{ background: agentConfig.colors.primary }}
        >
          <img src={agentConfig.avatar} alt="Bot" />
        </button>

        {/* Sliding chat panel */}
        {open && (
          <div className="chat-panel" role="dialog" aria-label={`${agentConfig.name} chat`}>
            <div className="chat-header" style={{ background: agentConfig.colors.primary }}>
              <img src={agentConfig.avatar} alt="" />
              <div style={{ marginLeft: 8, color: "#fff" }}>{agentConfig.name}</div>
              <button
                onClick={() => setOpen(false)}
                style={{ marginLeft: "auto", background: "transparent", color: "#fff", border: 0, cursor: "pointer" }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="chat-body">
              <form className="chat-form" onSubmit={onSubmit}>
                <input
                  className="chat-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message…"
                />
                <button className="chat-send" type="submit">Send</button>
              </form>
              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{out}</pre>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
