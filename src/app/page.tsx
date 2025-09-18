"use client";

import { useState } from "react";
import agentConfig from "./agent.config"; // <- THIS is the fix (same folder)

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
          messages: [
            { role: "system", content: agentConfig.system },
            { role: "user", content: input },
          ],
        }),
      });
      const data = await res.json();
      setOut(data?.message?.content ?? JSON.stringify(data));
    } catch (err: any) {
      setOut(err?.message ?? "Request failed");
    }
  }

  return (
    <>
      {/* floating round button */}
      <div className="chat-root">
        <button className="chat-bubble" onClick={() => setOpen((v) => !v)} aria-label="Open chat">
          <img src={agentConfig.avatar} alt={agentConfig.name} />
        </button>

        {/* slide-up panel */}
        {open && (
          <div className="chat-panel" role="dialog" aria-label={agentConfig.name}>
            <div className="chat-header" style={{ background: agentConfig.colors.primary }}>
              <img src={agentConfig.avatar} alt="" />
              <span style={{ color: "#fff" }}>{agentConfig.name}</span>
              <button
                className="chat-send"
                onClick={() => setOpen(false)}
                style={{ background: agentConfig.colors.primary }}
              >
                Close
              </button>
            </div>

            <div className="chat-body">
              <form className="chat-form" onSubmit={onSubmit}>
                <input
                  className="chat-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask something…"
                />
                <button
                  className="chat-send"
                  type="submit"
                  style={{ background: agentConfig.colors.primary }}
                >
                  Send
                </button>
              </form>
              <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{out}</pre>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
