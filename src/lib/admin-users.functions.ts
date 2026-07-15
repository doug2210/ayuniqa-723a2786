import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type ChangePasswordInput = {
  email: string;
  newPassword: string;
};

function validate(input: unknown): ChangePasswordInput {
  if (!input || typeof input !== "object") throw new Error("Invalid input");
  const { email, newPassword } = input as Record<string, unknown>;
  if (typeof email !== "string" || !email.includes("@")) {
    throw new Error("Informe um e-mail válido.");
  }
  if (typeof newPassword !== "string" || newPassword.length < 10) {
    throw new Error("A nova senha precisa ter pelo menos 10 caracteres.");
  }
  return { email: email.trim().toLowerCase(), newPassword };
}

export const adminChangeUserPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validate)
  .handler(async ({ data, context }) => {
    // Verify caller is admin using the caller-scoped RPC (RLS applies).
    const { data: isAdmin, error: roleError } = await context.supabase.rpc(
      "current_user_has_role",
      { _role: "admin" },
    );
    if (roleError) throw new Error("Falha ao verificar permissões.");
    if (!isAdmin) throw new Error("Forbidden: admin only");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Find target user by email via admin API (paginate lightly).
    let userId: string | null = null;
    for (let page = 1; page <= 20 && !userId; page++) {
      const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage: 200,
      });
      if (error) throw new Error(error.message);
      const found = list.users.find(
        (u) => (u.email ?? "").toLowerCase() === data.email,
      );
      if (found) userId = found.id;
      if (list.users.length < 200) break;
    }
    if (!userId) throw new Error("Usuário não encontrado com esse e-mail.");

    const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: data.newPassword,
      email_confirm: true,
    });
    if (updErr) throw new Error(updErr.message);

    return { ok: true as const, email: data.email };
  });