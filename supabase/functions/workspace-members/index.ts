import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { PLAN_FEATURES, canonicalPlan } from "../_shared/plan-features.ts";

const MAX_FREE_MEMBERS = 1;
const LEVELS = ["viewer", "editor", "manager"];


function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Missing authorization header" }, 401);
    }
    const token = authHeader.replace("Bearer ", "");

    const userClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser(token);
    if (userError || !user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "");

    // Owners only — a team member cannot manage other members
    const { data: ownMembership } = await admin
      .from("workspace_members")
      .select("id")
      .eq("member_user_id", user.id)
      .maybeSingle();
    if (ownMembership) return json({ error: "Apenas o titular da conta pode gerenciar usuários" }, 403);

    // Plan gate — Gestão de Usuários is exclusive to the Executivo plan.
    const { data: ownerProfile } = await admin
      .from("profiles")
      .select("plan, feature_blocks")
      .eq("user_id", user.id)
      .maybeSingle();

    const plan = canonicalPlan(String(ownerProfile?.plan ?? ""));
    const planAllows = (PLAN_FEATURES[plan] ?? []).includes("usuarios");
    const fb = (ownerProfile?.feature_blocks ?? {}) as Record<string, boolean>;
    const manuallyReleased = fb.usuarios === false;

    if (!planAllows && !manuallyReleased) {
      return json(
        {
          error: "plan_required",
          message: "Gestão de Usuários está disponível exclusivamente no plano Executivo.",
        },
        403,
      );
    }


    if (action === "create") {
      const email = String(body.email ?? "").trim().toLowerCase();
      const password = String(body.password ?? "");
      const roleLabel = String(body.role_label ?? "").trim().slice(0, 60);
      const level = LEVELS.includes(body.permission_level) ? body.permission_level : "viewer";
      const features: string[] = Array.isArray(body.allowed_features)
        ? body.allowed_features.filter((f: unknown) => typeof f === "string").slice(0, 60)
        : [];

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "E-mail inválido" }, 400);
      if (password.length < 6) return json({ error: "A senha deve ter ao menos 6 caracteres" }, 400);

      const { count } = await admin
        .from("workspace_members")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", user.id);

      if ((count ?? 0) >= MAX_FREE_MEMBERS) {
        return json({ error: "limit_reached", message: "Você já usou seu usuário gratuito. Usuários extras em breve." }, 403);
      }

      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: roleLabel || email.split("@")[0], is_team_member: true },
      });
      if (createError || !created?.user) {
        return json({ error: createError?.message ?? "Falha ao criar usuário" }, 400);
      }

      const { data: member, error: insertError } = await admin
        .from("workspace_members")
        .insert({
          owner_id: user.id,
          member_user_id: created.user.id,
          email,
          role_label: roleLabel || null,
          permission_level: level,
          allowed_features: features,
        })
        .select()
        .single();

      if (insertError) {
        await admin.auth.admin.deleteUser(created.user.id);
        return json({ error: insertError.message }, 400);
      }

      return json({ success: true, member });
    }

    if (action === "update") {
      const id = String(body.id ?? "");
      if (!id) return json({ error: "Missing id" }, 400);

      const { data: member } = await admin
        .from("workspace_members")
        .select("*")
        .eq("id", id)
        .eq("owner_id", user.id)
        .maybeSingle();
      if (!member) return json({ error: "Usuário não encontrado" }, 404);

      const patch: Record<string, unknown> = {};
      if (typeof body.role_label === "string") patch.role_label = body.role_label.trim().slice(0, 60) || null;
      if (LEVELS.includes(body.permission_level)) patch.permission_level = body.permission_level;
      if (Array.isArray(body.allowed_features)) {
        patch.allowed_features = body.allowed_features.filter((f: unknown) => typeof f === "string").slice(0, 60);
      }
      if (typeof body.is_active === "boolean") patch.is_active = body.is_active;

      if (Object.keys(patch).length > 0) {
        const { error } = await admin.from("workspace_members").update(patch).eq("id", id);
        if (error) return json({ error: error.message }, 400);
      }

      if (typeof body.password === "string" && body.password.length > 0) {
        if (body.password.length < 6) return json({ error: "A senha deve ter ao menos 6 caracteres" }, 400);
        const { error } = await admin.auth.admin.updateUserById(member.member_user_id, {
          password: body.password,
        });
        if (error) return json({ error: error.message }, 400);
      }

      return json({ success: true });
    }

    if (action === "delete") {
      const id = String(body.id ?? "");
      if (!id) return json({ error: "Missing id" }, 400);

      const { data: member } = await admin
        .from("workspace_members")
        .select("member_user_id")
        .eq("id", id)
        .eq("owner_id", user.id)
        .maybeSingle();
      if (!member) return json({ error: "Usuário não encontrado" }, 404);

      await admin.from("workspace_members").delete().eq("id", id);
      await admin.auth.admin.deleteUser(member.member_user_id);

      return json({ success: true });
    }

    return json({ error: "Ação inválida" }, 400);
  } catch (error) {
    console.error("workspace-members error:", error);
    return json({ error: "Internal server error" }, 500);
  }
});
