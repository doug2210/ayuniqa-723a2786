import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import * as React from "react";
import { render } from "@react-email/render";
import { TEMPLATES } from "@/lib/email-templates/registry";

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

const FROM_ADDRESS = "Ayuniqa <notify@notify.ayuniqa.com>";
const SENDER_DOMAIN = "notify.ayuniqa.com";
const FROM_DOMAIN = "notify.ayuniqa.com";
const TO_ADDRESSES = [
  "olga@ayuniqa.com",
  "aleks.v@ayuniqa.com",
  "marketing@ayuniqa.com",
];
const INTERNAL_REPLY_TO = "marketing@ayuniqa.com";

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

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        const notification = TEMPLATES["contact-notification"];
        const confirmation = TEMPLATES["contact-confirmation"];
        if (!notification || !confirmation) {
          console.error("[contact] missing email templates in registry");
          return Response.json(
            { error: "Email service not configured" },
            { status: 500 },
          );
        }

        // Render each email once on the server, then enqueue per recipient
        // through Lovable Emails (pgmq -> process-email-queue cron).
        const notifData = { name, company, email, message };
        const notifSubject =
          typeof notification.subject === "function"
            ? notification.subject(notifData)
            : notification.subject;
        const notifElement = React.createElement(
          notification.component,
          notifData,
        );
        const notifHtml = await render(notifElement);
        const notifText = await render(notifElement, { plainText: true });

        const confirmData = { name, message };
        const confirmSubject =
          typeof confirmation.subject === "function"
            ? confirmation.subject(confirmData)
            : confirmation.subject;
        const confirmElement = React.createElement(
          confirmation.component,
          confirmData,
        );
        const confirmHtml = await render(confirmElement);
        const confirmText = await render(confirmElement, { plainText: true });

        const submittedAt = new Date().toISOString();
        const batchKey = `contact-${Date.now()}-${email.toLowerCase()}`;

        async function enqueue(params: {
          to: string;
          replyTo: string;
          subject: string;
          html: string;
          text: string;
          templateName: string;
          idempotencyKey: string;
        }) {
          const messageId = crypto.randomUUID();
          // Log 'pending' so it shows up in email_send_log regardless of
          // enqueue outcome.
          await supabaseAdmin.from("email_send_log").insert({
            message_id: messageId,
            template_name: params.templateName,
            recipient_email: params.to,
            status: "pending",
          });
          const { error } = await supabaseAdmin.rpc("enqueue_email", {
            queue_name: "transactional_emails",
            payload: {
              message_id: messageId,
              to: params.to,
              from: FROM_ADDRESS,
              reply_to: params.replyTo,
              sender_domain: SENDER_DOMAIN,
              subject: params.subject,
              html: params.html,
              text: params.text,
              purpose: "transactional",
              label: params.templateName,
              idempotency_key: params.idempotencyKey,
              queued_at: submittedAt,
            } as any,
          });
          if (error) {
            console.error("[contact] enqueue failed", {
              to: params.to,
              template: params.templateName,
              error: error.message,
            });
            await supabaseAdmin.from("email_send_log").insert({
              message_id: messageId,
              template_name: params.templateName,
              recipient_email: params.to,
              status: "failed",
              error_message: error.message,
            });
            return false;
          }
          return true;
        }

        const notifyResults = await Promise.all(
          TO_ADDRESSES.map((to) =>
            enqueue({
              to,
              replyTo: email,
              subject: notifSubject,
              html: notifHtml,
              text: notifText,
              templateName: "contact-notification",
              idempotencyKey: `${batchKey}-notify-${to}`,
            }),
          ),
        );
        if (!notifyResults.some(Boolean)) {
          return Response.json(
            { error: "Failed to enqueue email" },
            { status: 502 },
          );
        }

        await enqueue({
          to: email,
          replyTo: INTERNAL_REPLY_TO,
          subject: confirmSubject,
          html: confirmHtml,
          text: confirmText,
          templateName: "contact-confirmation",
          idempotencyKey: `${batchKey}-confirm`,
        });

        // Forward submission to n8n webhook (fire-and-forget, non-blocking on failure)
        const webhookUrl = process.env.N8N_CONTACT_WEBHOOK_URL;
        if (webhookUrl) {
          const webhookStartedAt = Date.now();
          try {
            const webhookResponse = await fetch(webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name,
                company,
                email,
                message,
                submitted_at: new Date().toISOString(),
                source: "ayuniqa.com/contact",
              }),
            });
            const webhookDurationMs = Date.now() - webhookStartedAt;
            if (!webhookResponse.ok) {
              const body = await webhookResponse.text();
              console.error("[contact] n8n webhook failed", {
                status: webhookResponse.status,
                durationMs: webhookDurationMs,
                body,
              });
            } else {
              console.log("[contact] n8n webhook delivered", {
                status: webhookResponse.status,
                durationMs: webhookDurationMs,
              });
            }
          } catch (err) {
            console.error("[contact] n8n webhook threw", err);
          }
        } else {
          console.warn("[contact] N8N_CONTACT_WEBHOOK_URL not configured; skipping webhook");
        }

        return Response.json({ ok: true });
      },
    },
  },
});