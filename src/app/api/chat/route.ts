// src/app/api/chat/route.ts
import OpenAI from "openai";
import { NextRequest } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({} as any));
  const messages =
    Array.isArray(body?.messages) && body.messages.length
      ? body.messages
      : [{ role: "user", content: "Say hello" }];

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.7,
  });

  return Response.json({ ok: true, message: res.choices?.[0]?.message ?? null });
}
