import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT_WINDOW_SECONDS = 60;
const MAX_ATTEMPTS = 5;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: "Username and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const trimmedUsername = username.trim();

    // Rate limiting check
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_SECONDS * 1000).toISOString();
    const { count } = await supabase
      .from("login_attempts")
      .select("*", { count: "exact", head: true })
      .eq("username", trimmedUsername)
      .eq("success", false)
      .gte("attempted_at", windowStart);

    if ((count ?? 0) >= MAX_ATTEMPTS) {
      return new Response(
        JSON.stringify({ error: "RATE_LIMITED", retry_after: RATE_LIMIT_WINDOW_SECONDS }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Look up credentials
    const { data: cred, error } = await supabase
      .from("user_credentials")
      .select("*")
      .eq("username", trimmedUsername)
      .maybeSingle();

    if (error || !cred) {
      // Log failed attempt
      await supabase.from("login_attempts").insert({ username: trimmedUsername, success: false });
      return new Response(
        JSON.stringify({ error: "INVALID_CREDENTIALS" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify password using pgcrypto crypt()
    const { data: matchResult } = await supabase.rpc("verify_password", {
      _stored_hash: cred.password,
      _input_password: password,
    });

    if (!matchResult) {
      await supabase.from("login_attempts").insert({ username: trimmedUsername, success: false });
      return new Response(
        JSON.stringify({ error: "INVALID_CREDENTIALS" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log successful attempt
    await supabase.from("login_attempts").insert({ username: trimmedUsername, success: true });

    // Fetch entity details
    let entity: { name: string; avatar_url?: string | null } | null = null;

    if (cred.entity_type === "blogger") {
      const { data } = await supabase
        .from("influencers")
        .select("id, name, handle, avatar_url, status")
        .eq("id", cred.entity_id)
        .maybeSingle();
      entity = data;
    } else {
      const { data } = await supabase
        .from("businesses")
        .select("id, name, logo_url, status")
        .eq("id", cred.entity_id)
        .maybeSingle();
      entity = data ? { name: data.name, avatar_url: data.logo_url } : null;
    }

    if (!entity) {
      return new Response(
        JSON.stringify({ error: "ENTITY_NOT_FOUND" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sessionToken = btoa(
      JSON.stringify({
        entity_id: cred.entity_id,
        entity_type: cred.entity_type,
        username: cred.username,
        ts: Date.now(),
      })
    );

    return new Response(
      JSON.stringify({
        token: sessionToken,
        entity_id: cred.entity_id,
        entity_type: cred.entity_type,
        name: entity.name,
        avatar_url: entity.avatar_url ?? null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
