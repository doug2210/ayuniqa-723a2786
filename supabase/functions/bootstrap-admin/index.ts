// One-shot admin bootstrap. Whitelisted to marketing@ayuniqa.com.
// Creates the user pre-confirmed (fires DB trigger that grants admin role),
// then enqueues a branded recovery email so the recipient sets their own password.
// Delete this function after use.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const ALLOWED_EMAIL = "marketing@ayuniqa.com";
const RESET_REDIRECT = "https://ayuniqa.com/reset-password";
const FROM_ADDRESS = "Ayuniqa <notify@notify.ayuniqa.com>";
const SENDER_DOMAIN = "notify.ayuniqa.com";
const REPLY_TO = "marketing@ayuniqa.com";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return json({ error: "Server not configured" }, 500);
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const email = ALLOWED_EMAIL;

  // 1. Create the user pre-confirmed (throwaway password). Trigger grants admin.
  const throwaway = crypto.randomUUID() + "-" + crypto.randomUUID().slice(0, 8) + "!Aa1";
  let status: "created" | "existing" = "created";
  const create = await admin.auth.admin.createUser({
    email,
    password: throwaway,
    email_confirm: true,
  });
  if (create.error) {
    const msg = create.error.message.toLowerCase();
    if (
      msg.includes("already registered") ||
      msg.includes("already exists") ||
      msg.includes("duplicate") ||
      create.error.status === 422
    ) {
      status = "existing";
    } else {
      console.error("[bootstrap-admin] createUser failed", create.error);
      return json({ error: create.error.message }, 500);
    }
  }

  // 2. Generate a recovery link.
  const link = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: RESET_REDIRECT },
  });
  if (link.error || !link.data?.properties?.action_link) {
    console.error("[bootstrap-admin] generateLink failed", link.error);
    return json({ error: link.error?.message ?? "generateLink failed" }, 500);
  }
  const props = link.data.properties;

  // 3. Enqueue a branded recovery email via the auth_emails pgmq queue.
  const messageId = crypto.randomUUID();
  const subject = "Set your Ayuniqa admin password";
  const html = renderHtml(props.action_link);
  const text = renderText(props.action_link);
  const idempotencyKey = `bootstrap-admin-${email}-${Date.now()}`;

  await admin.from("email_send_log").insert({
    message_id: messageId,
    template_name: "admin-bootstrap",
    recipient_email: email,
    status: "pending",
  });
  const { error: enqErr } = await admin.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to: email,
      from: FROM_ADDRESS,
      reply_to: REPLY_TO,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: "transactional",
      label: "admin-bootstrap",
      idempotency_key: idempotencyKey,
      queued_at: new Date().toISOString(),
    },
  });
  if (enqErr) {
    console.error("[bootstrap-admin] enqueue failed", enqErr);
    return json(
      { ok: false, status, error: enqErr.message, action_link: props.action_link },
      502,
    );
  }

  // Confirm the admin role was granted.
  const { data: userRow } = await admin
    .from("user_roles")
    .select("role")
    .eq("role", "admin");
  return json({ ok: true, status, email, admin_rows: userRow?.length ?? 0 });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

function renderHtml(link: string): string {
  const safe = link.replace(/"/g, "&quot;");
  return `<!doctype html><html><body style="margin:0;background:#ffffff;font-family:Arial,sans-serif;color:#111;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <h1 style="font-size:22px;margin:0 0 12px;">Welcome to Ayuniqa Admin</h1>
    <p style="font-size:15px;line-height:1.5;margin:0 0 16px;">
      An admin account was created for <strong>${ALLOWED_EMAIL}</strong>.
      Click the button below to set your password and sign in.
    </p>
    <p style="margin:24px 0;">
      <a href="${safe}" style="display:inline-block;padding:12px 20px;background:#111;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">
        Set your password
      </a>
    </p>
    <p style="font-size:13px;color:#555;line-height:1.5;margin:0 0 8px;">
      Or copy this link into your browser:
    </p>
    <p style="font-size:12px;color:#555;word-break:break-all;margin:0 0 24px;">
      ${safe}
    </p>
    <p style="font-size:12px;color:#888;margin:0;">
      This link expires within a short time for security. If you did not expect this email, you can ignore it.
    </p>
  </div></body></html>`;
}

function renderText(link: string): string {
  return [
    "Welcome to Ayuniqa Admin",
    "",
    `An admin account was created for ${ALLOWED_EMAIL}.`,
    "Open the link below to set your password and sign in:",
    "",
    link,
    "",
    "This link expires within a short time for security.",
    "If you did not expect this email, you can ignore it.",
  ].join("\n");
}