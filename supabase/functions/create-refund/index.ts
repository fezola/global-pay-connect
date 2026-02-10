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

    const { payment_intent_id, amount, reason, notes } = await req.json();

    if (!payment_intent_id || !amount) {
      throw new Error("payment_intent_id and amount are required");
    }

    // Get merchant for this user
    const { data: merchant, error: merchantError } = await supabaseClient
      .from("merchants")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (merchantError || !merchant) {
      throw new Error("Merchant not found");
    }

    // Get payment intent
    const { data: paymentIntent, error: paymentError } = await supabaseClient
      .from("payment_intents")
      .select("*")
      .eq("id", payment_intent_id)
      .eq("merchant_id", merchant.id)
      .single();

    if (paymentError || !paymentIntent) {
      throw new Error("Payment intent not found");
    }

    // Validate payment is succeeded
    if (paymentIntent.status !== "succeeded") {
      throw new Error("Can only refund succeeded payments");
    }

    // Validate amount
    const paymentAmount = parseFloat(paymentIntent.amount);
    const refundAmount = parseFloat(amount);
    const alreadyRefunded = parseFloat(paymentIntent.refunded_amount || "0");
    const maxRefundable = paymentAmount - alreadyRefunded;

    if (refundAmount > maxRefundable) {
      throw new Error(
        `Refund amount ($${refundAmount}) exceeds maximum refundable amount ($${maxRefundable})`
      );
    }

    if (refundAmount <= 0) {
      throw new Error("Refund amount must be greater than 0");
    }

    // Create refund
    const { data: refund, error: refundError } = await supabaseClient
      .from("refunds")
      .insert({
        merchant_id: merchant.id,
        payment_intent_id,
        amount: refundAmount,
        currency: paymentIntent.currency,
        reason,
        notes,
        status: "pending",
        requested_by: user.id,
        destination_address: paymentIntent.payer_address,
        chain: paymentIntent.chain,
      })
      .select()
      .single();

    if (refundError) {
      throw refundError;
    }

    // Queue webhook event
    await supabaseClient
      .from("webhook_events")
      .insert({
        merchant_id: merchant.id,
        event_type: "refund.created",
        resource_type: "refund",
        resource_id: refund.id,
        payload: {
          id: refund.id,
          payment_intent_id,
          amount: refundAmount,
          currency: paymentIntent.currency,
          status: "pending",
          reason,
        },
        status: "pending",
        attempts: 0,
        next_retry_at: new Date().toISOString(),
      });

    return new Response(
      JSON.stringify({
        success: true,
        refund,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating refund:", error);
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

