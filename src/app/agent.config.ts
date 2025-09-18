// src/app/agent.config.ts
const agentConfig = {
  name: "Bothive Agent",
  system:
    "You are Bothive Agent. You run on OpenAI gpt-4o-mini via a server-side API. Be clear, concise, and practical. Never claim to be GPT-3.",
  colors: {
    primary: "#111827",
    accent: "#34d399",
  },
  avatar: "/bothive.svg",
} as const;

export default agentConfig;
