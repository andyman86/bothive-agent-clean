import OpenAI from "openai";
import { NextRequest } from "next/server";

// ✅ One clear system prompt so the bot never claims it's GPT-3
const SYSTEM_PROMPT =
  "You are Bothive Agent. You run on OpenAI gpt-4o-mini via a server-side API. " +
  "Be clear, concise, and practical. If asked what model you are, say 'gpt-4o-mini'. " +
  "Never claim to be GPT-3.";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));

    // Accept body.messages or default to a simple hello
    const userMessages =
      Array.isArray(body?.messages) && body.messages.length
        ? body.messages
        : [{ role: "user", content: "Say hello" }];

    // Prepend system message
    const messages = [{ role: "system", content: SYSTEM_PROMPT }, ...userMessages];

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
  return Response.json({ ok: true, info: "POST to this endpoint with {messages}" });
}

