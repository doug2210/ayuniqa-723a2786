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

        // Confirmation email to the sender (English)
        const confirmSubject = "We've received your message — Ayuniqa";
        const confirmHtml = `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111">
            <h2 style="margin:0 0 16px">Thanks for reaching out, ${escapeHtml(name)}!</h2>
            <p style="margin:0 0 12px;line-height:1.5">
              We've received your message and a member of the Ayuniqa team will get back to you within one business day.
            </p>
            <p style="margin:0 0 12px;line-height:1.5">For your reference, here's a copy of what you sent:</p>
            <div style="white-space:pre-wrap;padding:12px;background:#f6f4f0;border-radius:8px;border:1px solid #e7e2d8">${escapeHtml(message)}</div>
            <p style="margin:24px 0 4px;line-height:1.5">Talk soon,<br/>The Ayuniqa Team</p>
          </div>
        `;
        const confirmText = `Thanks for reaching out, ${name}!

We've received your message and a member of the Ayuniqa team will get back to you within one business day.

For your reference, here's a copy of what you sent:

${message}

Talk soon,
The Ayuniqa Team
`;

        const confirmStartedAt = Date.now();
        console.log("[contact] sending confirmation email", {
          to: email,
          from: FROM_ADDRESS,
          subject: confirmSubject,
        });
        try {
          const confirmResponse = await fetch(`${GATEWAY_URL}/emails`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${lovableApiKey}`,
              "X-Connection-Api-Key": resendApiKey,
            },
            body: JSON.stringify({
              from: FROM_ADDRESS,
              to: [email],
              reply_to: TO_ADDRESSES[0],
              subject: confirmSubject,
              html: confirmHtml,
              text: confirmText,
            }),
          });
          const confirmDurationMs = Date.now() - confirmStartedAt;
          if (!confirmResponse.ok) {
            const body = await confirmResponse.text();
            console.error("[contact] confirmation send failed", {
              status: confirmResponse.status,
              durationMs: confirmDurationMs,
              to: email,
              subject: confirmSubject,
              body,
            });
          } else {
            let confirmProviderId: string | undefined;
            try {
              const data = (await confirmResponse.clone().json()) as { id?: string };
              confirmProviderId = data?.id;
            } catch {
              // ignore
            }
            console.log("[contact] confirmation email sent", {
              status: confirmResponse.status,
              durationMs: confirmDurationMs,
              to: email,
              subject: confirmSubject,
              providerId: confirmProviderId,
            });
          }
        } catch (err) {
          console.error("[contact] confirmation send threw", err);
        }

        return Response.json({ ok: true });
      },
    },
  },
});