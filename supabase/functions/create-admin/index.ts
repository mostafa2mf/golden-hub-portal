import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

Deno.serve(async () => {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Create admin user
  const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: "mostafa.maleki.2314@gmail.com",
    password: "Mflove2314@",
    email_confirm: true,
  });

  if (createError) {
    return new Response(JSON.stringify({ error: createError.message }), { status: 400 });
  }

  // Assign admin role
  const { error: roleError } = await supabaseAdmin
    .from("user_roles")
    .insert({ user_id: user.user.id, role: "admin" });

  return new Response(JSON.stringify({ success: true, userId: user.user.id, roleError: roleError?.message }));
});
