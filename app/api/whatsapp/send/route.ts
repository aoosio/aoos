export const runtime = 'nodejs'
// app/api/whatsapp/send/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { sendWhatsAppText } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  to: z.string().min(5, "Invalid recipient"),
  body: z.string().min(1, "Message is required").max(4096, "Message too long"),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => ({}));
    const parsed = BodySchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { to, body } = parsed.data;
    const result = await sendWhatsAppText(to, body);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error, status: result.status },
        { status: result.status || 500 }
      );
    }

    return NextResponse.json({ ok: true, messageId: result.messageId });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unexpected error" },
      { status: 500 }
    );
  }
}
