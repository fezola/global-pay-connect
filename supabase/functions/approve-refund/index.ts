import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { refund_id } = await req.json();

    if (!refund_id) {
      throw new Error("refund_id is required");
    }

    // Get merchant for this user
    const { data: merchant, error: merchantError } = await supabaseClient
      .from("merchants")
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (merchantError || !merchant) {
      throw new Error("Merchant not found");
    }

    // Check if user has permission to approve (owner or admin)
    if (merchant.role !== "owner" && merchant.role !== "admin") {
      throw new Error("Insufficient permissions to approve refunds");
    }

    // Get refund
    const { data: refund, error: refundError } = await supabaseClient
      .from("refunds")
      .select("*")
      .eq("id", refund_id)
      .eq("merchant_id", merchant.id)
      .single();

    if (refundError || !refund) {
      throw new Error("Refund not found");
    }

    // Check if refund is in pending status
    if (refund.status !== "pending") {
      throw new Error(`Cannot approve refund with status: ${refund.status}`);
    }

    // Update refund status to approved
    const { error: updateError } = await supabaseClient
      .from("refunds")
      .update({
        status: "approved",
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", refund_id);

    if (updateError) {
      throw updateError;
    }

    // Queue webhook event
    await supabaseClient
      .from("webhook_events")
      .insert({
        merchant_id: merchant.id,
        event_type: "refund.approved",
        resource_type: "refund",
        resource_id: refund.id,
        payload: {
          id: refund.id,
          payment_intent_id: refund.payment_intent_id,
          amount: refund.amount,
          currency: refund.currency,
          status: "approved",
        },
        status: "pending",
        attempts: 0,
        next_retry_at: new Date().toISOString(),
      });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Refund approved successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error approving refund:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

