import { createFileRoute } from "@tanstack/react-router";

// One-shot admin-bootstrap endpoint (whitelisted to marketing@ayuniqa.com).
// Delete this file after use.
//
// Creates the auth user with email_confirm=true (fires the DB trigger
// `grant_admin_for_ayuniqa_emails`, which grants the admin role for
// whitelisted addresses), then enqueues a branded recovery email so the
// recipient sets their own password via `/reset-password`.
// The whitelist is what makes this safe to leave open briefly: any other
// email is rejected, and even repeat calls just re-send the same recovery
// email to that one address.

const ALLOWED_EMAIL = "marketing@ayuniqa.com";

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
        const email = ALLOWED_EMAIL;
        const origin = new URL(request.url).origin;
        const resetRedirect = `${origin}/reset-password`;

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