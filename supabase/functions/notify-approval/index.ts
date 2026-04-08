import { createClient } from "https://esm.sh/@supabase/supabase-js@2.102.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.102.1/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    // Check admin role
    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { entity_id, entity_type, action, reject_reason } = body;

    if (!entity_id || !entity_type || !action) {
      return new Response(JSON.stringify({ error: "Missing required fields: entity_id, entity_type, action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["approve", "reject"].includes(action)) {
      return new Response(JSON.stringify({ error: "action must be 'approve' or 'reject'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const newStatus = action === "approve" ? "active" : "rejected";
    const approvalStatus = action === "approve" ? "approved" : "rejected";
    const table = entity_type === "influencer" ? "influencers" : "businesses";

    // Update entity status
    const { error: updateError } = await supabaseAdmin
      .from(table)
      .update({
        status: newStatus,
        verified: action === "approve",
      })
      .eq("id", entity_id);

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update or create approval record
    const { data: existingApproval } = await supabaseAdmin
      .from("approvals")
      .select("id")
      .eq("entity_id", entity_id)
      .eq("entity_type", entity_type)
      .maybeSingle();

    if (existingApproval) {
      await supabaseAdmin
        .from("approvals")
        .update({
          status: approvalStatus,
          reviewed_by: userId,
          reviewed_at: new Date().toISOString(),
          reject_reason: reject_reason || null,
        })
        .eq("id", existingApproval.id);
    } else {
      await supabaseAdmin.from("approvals").insert({
        entity_id,
        entity_type,
        status: approvalStatus,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        reject_reason: reject_reason || null,
      });
    }

    // Get entity name for activity log
    const { data: entity } = await supabaseAdmin
      .from(table)
      .select("name")
      .eq("id", entity_id)
      .single();

    const entityName = entity?.name || "Unknown";
    const actionFa = action === "approve" ? "تأیید" : "رد";
    const typeFa = entity_type === "influencer" ? "اینفلوئنسر" : "کسب‌وکار";

    // Log activity
    await supabaseAdmin.from("activity_log").insert({
      type: "approval",
      message: `${entityName} ${action === "approve" ? "approved" : "rejected"}`,
      message_fa: `${typeFa} ${entityName} ${actionFa} شد`,
      icon: action === "approve" ? "check" : "x",
      entity_type,
      entity_id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `${entity_type} ${action}d successfully`,
        entity_name: entityName,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
