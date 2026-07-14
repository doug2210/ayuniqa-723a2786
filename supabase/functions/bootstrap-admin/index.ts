// One-shot admin bootstrap. Whitelisted to marketing@ayuniqa.com.
// Creates the user pre-confirmed (fires DB trigger that grants admin role),
// then enqueues a branded recovery email so the recipient sets their own password.
// Delete this function after use.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const ALLOWED_EMAIL = "marketing@ayuniqa.com";
const RESET_REDIRECT = "https://ayuniqa.com/reset-password";

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
  await admin.from("email_send_log").insert({
    message_id: messageId,
    template_name: "recovery",
    recipient_email: email,
    status: "pending",
  });
  const { error: enqErr } = await admin.rpc("enqueue_email", {
    queue_name: "auth_emails",
    payload: {
      message_id: messageId,
      to: email,
      email_action_type: "recovery",
      action_link: props.action_link,
      redirect_to: RESET_REDIRECT,
      token_hash: props.hashed_token,
      token: props.email_otp,
      site_url: new URL(RESET_REDIRECT).origin,
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