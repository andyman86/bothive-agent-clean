// src/app/agent.config.ts
export const agentConfig = {
  name: "Bothive Agent",
  system:
    "You are Bothive Agent. You run on OpenAI gpt-4o-mini via a server-side API. Be clear, concise, and practical. Never claim to be GPT-3.",
  colors: {
    primary: "#111827",   // header/button
    accent: "#34d399",    // status dot
  },
  avatar: "/bothive.svg", // put the file below into /public
} as const;
