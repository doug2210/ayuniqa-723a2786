import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  company: z
    .string()
    .trim()
    .max(160)
    .optional()
    .nullable()
    .transform((v) => (v && v.length > 0 ? v : null)),
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(1).max(5000),
});

const FROM_ADDRESS = "Ayuniqa Contact <noreply@ayuniqa.com>";
const TO_ADDRESSES = ["olga@ayuniqa.com", "aleks.v@ayuniqa.com"];
const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const Route = createFileRoute("/api/public/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let json: unknown;
        try {
          json = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const parsed = contactSchema.safeParse(json);
        if (!parsed.success) {
          return Response.json(
            { error: parsed.error.issues[0]?.message ?? "Invalid input" },
            { status: 400 },
          );
        }
        const { name, company, email, message } = parsed.data;

        const lovableApiKey = process.env.LOVABLE_API_KEY;
        const resendApiKey = process.env.RESEND_API_KEY;
        if (!lovableApiKey || !resendApiKey) {
          console.error("Missing LOVABLE_API_KEY or RESEND_API_KEY");
          return Response.json({ error: "Email service not configured" }, { status: 500 });
        }

        const html = `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
            <h2 style="margin:0 0 16px">New contact message</h2>
            <p style="margin:4px 0"><strong>Name:</strong> ${escapeHtml(name)}</p>
            ${company ? `<p style="margin:4px 0"><strong>Company:</strong> ${escapeHtml(company)}</p>` : ""}
            <p style="margin:4px 0"><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p style="margin:16px 0 4px"><strong>Message:</strong></p>
            <div style="white-space:pre-wrap;padding:12px;background:#f6f4f0;border-radius:8px;border:1px solid #e7e2d8">${escapeHtml(message)}</div>
          </div>
        `;

        const text = `New contact message

Name: ${name}
${company ? `Company: ${company}\n` : ""}Email: ${email}

Message:
${message}
`;

        const subject = `New contact — ${name}${company ? ` (${company})` : ""}`;
        const startedAt = Date.now();
        console.log("[contact] sending email", {
          to: TO_ADDRESSES,
          from: FROM_ADDRESS,
          reply_to: email,
          subject,
        });
        const response = await fetch(`${GATEWAY_URL}/emails`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${lovableApiKey}`,
            "X-Connection-Api-Key": resendApiKey,
          },
          body: JSON.stringify({
            from: FROM_ADDRESS,
            to: TO_ADDRESSES,
            reply_to: email,
            subject,
            html,
            text,
          }),
        });

        const durationMs = Date.now() - startedAt;
        if (!response.ok) {
          const body = await response.text();
          console.error("[contact] resend send failed", {
            status: response.status,
            durationMs,
            to: TO_ADDRESSES,
            subject,
            body,
          });
          return Response.json({ error: "Failed to send email" }, { status: 502 });
        }

        let providerId: string | undefined;
        try {
          const data = (await response.clone().json()) as { id?: string };
          providerId = data?.id;
        } catch {
          // ignore
        }
        console.log("[contact] email sent", {
          status: response.status,
          durationMs,
          to: TO_ADDRESSES,
          subject,
          providerId,
        });
        return Response.json({ ok: true });
      },
    },
  },
});