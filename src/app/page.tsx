"use client";

import { useState } from "react";
import { agentConfig } from "./agent.config";

export default function Home() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("Say hello");
  const [out, setOut] = useState<string>("I run on OpenAI's GPT-4 architecture. How can I assist you today?");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setOut("…thinking…");
    setInput("");            // <-- clears the field right away

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: text }] }),
      });
      const data = await res.json();
      setOut(data?.message?.content ?? JSON.stringify(data));
    } catch (err: any) {
      setOut(err?.message ?? "Request failed");
    }
  }

  return (
    <main>
      <div className="chat-root">
        <button
          className="chat-bubble"
          aria-label={`${agentConfig.name} chat`}
          onClick={() => setOpen((v) => !v)}
          title={open ? "Close chat" : "Open chat"}
        >
          <img src={agentConfig.avatar} alt="" />
        </button>

        {open && (
          <div className="chat-panel">
            <div className="chat-header">
              <img src={agentConfig.avatar} alt="" />
              <div>{agentConfig.name}</div>
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
              <button className="chat-send" type="submit">Send</button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
