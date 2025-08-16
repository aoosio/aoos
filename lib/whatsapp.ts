// lib/whatsapp.ts
import { z } from "zod";

const envSchema = z.object({
  WHATSAPP_TOKEN: z.string().min(1),
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1),
});

function getEnv() {
  const parsed = envSchema.safeParse({
    WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
  });
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Missing WhatsApp env: ${issues}`);
  }
  return parsed.data;
}

export type WhatsAppSendResponse =
  | { ok: true; messageId: string; raw: any }
  | { ok: false; status: number; error: any; raw?: any };

export async function sendWhatsAppText(
  to: string,
  body: string
): Promise<WhatsAppSendResponse> {
  const { WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID } = getEnv();

  const text = body.length > 4096 ? body.slice(0, 4096) : body;

  const url = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { preview_url: false, body: text },
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      error: data?.error ?? "Unknown error",
      raw: data,
    };
  }

  const messageId: string = data?.messages?.[0]?.id ?? "";
  return { ok: true, messageId, raw: data };
}
