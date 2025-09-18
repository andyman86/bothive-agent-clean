// src/app/api/chat/route.ts
import OpenAI from "openai";
import { NextRequest } from "next/server";
import { agentConfig } from "../../agent.config"; // <-- note the path

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));

    const userMessages =
      Array.isArray(body?.messages) && body.messages.length
        ? body.messages
        : [{ role: "user", content: "Say hello" }];

    const messages = [
      { role: "system", content: agentConfig.system },
      ...userMessages,
    ];

    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.7,
    });

    const message = res.choices?.[0]?.message ?? { role: "assistant", content: "" };
    return Response.json({ ok: true, message }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return Response.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ ok: true, info: "POST {messages} to /api/chat" });
}
