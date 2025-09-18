import OpenAI from "openai";
import { NextRequest } from "next/server";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as any;

    const model = typeof body?.model === "string" && body.model.trim()
      ? body.model.trim()
      : "gpt-4o-mini";

    const messages = Array.isArray(body?.messages) && body.messages.length
      ? body.messages
      : [{ role: "user", content: "Say hello" }];

    const res = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
    });

    const message = res.choices?.[0]?.message ?? { role: "assistant", content: "" };
    return Response.json({ ok: true, message }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return Response.json({ ok: false, error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ ok: true, info: "POST to this endpoint with {messages, model}" });
}
