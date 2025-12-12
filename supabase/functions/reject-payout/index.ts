import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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

    const { payout_id, reason } = await req.json();

    if (!payout_id) {
      throw new Error("payout_id is required");
    }

    if (!reason || !reason.trim()) {
      throw new Error("Rejection reason is required");
    }

    // Get the merchant for this user
    const { data: merchant, error: merchantError } = await supabaseClient
      .from("merchants")
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (merchantError || !merchant) {
      throw new Error("Merchant not found");
    }

    // Check if user has permission to reject (owner or admin)
    if (merchant.role !== "owner" && merchant.role !== "admin") {
      throw new Error("Insufficient permissions to reject payouts");
    }

    // Get the payout
    const { data: payout, error: payoutError } = await supabaseClient
      .from("payouts")
      .select("*")
      .eq("id", payout_id)
      .eq("merchant_id", merchant.id)
      .single();

    if (payoutError || !payout) {
      throw new Error("Payout not found");
    }

    // Check if payout is in pending status
    if (payout.status !== "pending") {
      throw new Error(`Cannot reject payout with status: ${payout.status}`);
    }

    // Update payout status to rejected
    const { error: updateError } = await supabaseClient
      .from("payouts")
      .update({
        status: "rejected",
        error_message: reason,
      })
      .eq("id", payout_id);

    if (updateError) {
      throw updateError;
    }

    // Create approval record
    const { error: approvalError } = await supabaseClient
      .from("payout_approvals")
      .insert({
        payout_id,
        approved_by: user.id,
        action: "rejected",
        notes: reason,
      });

    if (approvalError) {
      console.error("Error creating approval record:", approvalError);
    }

    // Create webhook event for rejection
    const { error: webhookError } = await supabaseClient
      .from("webhook_events")
      .insert({
        merchant_id: merchant.id,
        event_type: "payout.rejected",
        payload: {
          payout_id,
          amount: payout.amount,
          currency: payout.currency,
          reason,
        },
      });

    if (webhookError) {
      console.error("Error creating webhook event:", webhookError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payout rejected successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error rejecting payout:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

