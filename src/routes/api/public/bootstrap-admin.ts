import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

// Protected admin-bootstrap endpoint.
// - Requires header `x-bootstrap-secret` matching ADMIN_BOOTSTRAP_SECRET.
// - Creates the auth user with email_confirm=true (fires the DB trigger
//   `grant_admin_for_ayuniqa_emails`, which grants the admin role for
//   whitelisted addresses like marketing@ayuniqa.com).
// - If the user already exists, no-ops on creation.
// - Sends a password recovery email so the recipient sets their own password
//   via `/reset-password` — we never email plaintext passwords.

const bodySchema = z.object({
  email: z.string().trim().email().max(254),
  redirectTo: z.string().url().optional(),
});

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Bootstrap-Secret",
} as const;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

export const Route = createFileRoute("/api/public/bootstrap-admin")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const secret = process.env.ADMIN_BOOTSTRAP_SECRET;
        if (!secret) return json({ error: "Server not configured" }, 500);
        const header = request.headers.get("x-bootstrap-secret") ?? "";
        if (header !== secret) return json({ error: "Unauthorized" }, 401);

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return json({ error: "Invalid JSON" }, 400);
        }
        const parsed = bodySchema.safeParse(raw);
        if (!parsed.success) {
          return json(
            { error: parsed.error.issues[0]?.message ?? "Invalid input" },
            400,
          );
        }
        const { email, redirectTo } = parsed.data;
        const origin =
          new URL(request.url).origin.replace(
            /^https?:\/\/id-preview--/,
            "https://",
          );
        const resetRedirect = redirectTo ?? `${origin}/reset-password`;

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        // 1. Create the user pre-confirmed so the DB trigger grants admin.
        //    Password is a throwaway random string — the user will set their
        //    own via the recovery email below.
        const throwaway =
          crypto.randomUUID() + "-" + crypto.randomUUID().slice(0, 8) + "!Aa1";
        const createRes = await supabaseAdmin.auth.admin.createUser({
          email,
          password: throwaway,
          email_confirm: true,
        });

        let createdOrExisting: "created" | "existing" = "created";
        if (createRes.error) {
          const msg = createRes.error.message.toLowerCase();
          // Treat "already registered" as non-fatal — proceed to send recovery.
          if (
            msg.includes("already registered") ||
            msg.includes("already exists") ||
            msg.includes("duplicate") ||
            createRes.error.status === 422
          ) {
            createdOrExisting = "existing";
          } else {
            console.error("[bootstrap-admin] createUser failed", createRes.error);
            return json({ error: createRes.error.message }, 500);
          }
        }

        // 2. Generate a recovery link and enqueue it via the auth email queue,
        //    so the recipient sees the branded Ayuniqa reset email.
        const linkRes = await supabaseAdmin.auth.admin.generateLink({
          type: "recovery",
          email,
          options: { redirectTo: resetRedirect },
        });
        if (linkRes.error || !linkRes.data?.properties?.action_link) {
          console.error("[bootstrap-admin] generateLink failed", linkRes.error);
          return json(
            { error: linkRes.error?.message ?? "Failed to generate reset link" },
            500,
          );
        }
        const actionLink = linkRes.data.properties.action_link;

        // 3. Send using the existing auth email pipeline — enqueue a `recovery`
        //    template so it matches the branded Ayuniqa reset email.
        const messageId = crypto.randomUUID();
        await supabaseAdmin.from("email_send_log").insert({
          message_id: messageId,
          template_name: "recovery",
          recipient_email: email,
          status: "pending",
        });
        const { error: enqErr } = await supabaseAdmin.rpc("enqueue_email", {
          queue_name: "auth_emails",
          payload: {
            message_id: messageId,
            to: email,
            email_action_type: "recovery",
            action_link: actionLink,
            redirect_to: resetRedirect,
            token_hash: linkRes.data.properties.hashed_token,
            token: linkRes.data.properties.email_otp,
            site_url: origin,
            queued_at: new Date().toISOString(),
          } as any,
        });
        if (enqErr) {
          console.error("[bootstrap-admin] enqueue failed", enqErr);
          // Fallback: return the action link so we can deliver manually.
          return json(
            {
              ok: false,
              status: createdOrExisting,
              error: enqErr.message,
              action_link: actionLink,
            },
            502,
          );
        }

        return json({ ok: true, status: createdOrExisting });
      },
    },
  },
});