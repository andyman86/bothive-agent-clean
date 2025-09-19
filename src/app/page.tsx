"use client";

import { useState } from "react";
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
        body: JSON.stringify({
          messages: [{ role: "user", content: input }],
        }),
      });
      const data = await res.json();
      setOut(data?.message?.content ?? JSON.stringify(data));
    } catch (err: any) {
      setOut(err?.message ?? "Request failed");
    }
  }

  return (
    <main>
      {/* corner launcher */}
      <div className="chat-root">
        <button
          className="chat-bubble"
          aria-label={`${agentConfig.name} chat`}
          onClick={() => setOpen((v) => !v)}
        >
          <img src={agentConfig.avatar} alt="" />
        </button>

        {open && (
          <div className="chat-panel">
            <div className="chat-header">
              <img src={agentConfig.avatar} alt="" />
              <div style={{ marginLeft: 8 }}>{agentConfig.name}</div>
            </div>

            <div className="chat-body">
              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{out}</pre>
            </div>

            <form onSubmit={onSubmit} className="chat-form">
              <input
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask something…"
              />
              <button className="chat-send" type="submit">
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
