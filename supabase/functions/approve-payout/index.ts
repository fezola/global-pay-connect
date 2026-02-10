import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendEmail } from "../_shared/send-email-helper.ts";
import { payoutApprovedEmail } from "../_shared/email-templates.ts";

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

    const { payout_id, notes } = await req.json();

    if (!payout_id) {
      throw new Error("payout_id is required");
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

    // Check if user has permission to approve (owner or admin)
    if (merchant.role !== "owner" && merchant.role !== "admin") {
      throw new Error("Insufficient permissions to approve payouts");
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
      throw new Error(`Cannot approve payout with status: ${payout.status}`);
    }

    // Update payout status to approved
    const { error: updateError } = await supabaseClient
      .from("payouts")
      .update({
        status: "approved",
        approved_by: user.id,
        approved_at: new Date().toISOString(),
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
        approver_id: user.id,
        status: "approved",
        notes,
      });

    if (approvalError) {
      console.error("Error creating approval record:", approvalError);
    }

    // Generate unsigned transaction for merchant to sign
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseService = createClient(supabaseUrl, serviceRoleKey);

    const { data: txData, error: txError } = await supabaseService.functions.invoke(
      'generate-payout-transaction',
      { body: { payout_id } }
    );

    if (txError) {
      console.error("Error generating transaction:", txError);
      // Don't throw - payout is approved, merchant can regenerate transaction
    }

    // Send email notification
    try {
      const { data: userData } = await supabaseService
        .from('users')
        .select('email')
        .eq('id', user.id)
        .single();

      const { data: destinationData } = await supabaseService
        .from('payout_destinations')
        .select('address')
        .eq('id', payout.destination_id)
        .single();

      if (userData?.email && destinationData?.address) {
        const emailData = payoutApprovedEmail({
          amount: payout.amount,
          currency: payout.currency,
          payoutId: payout.id,
          destinationAddress: destinationData.address,
          dashboardUrl: `${Deno.env.get('FRONTEND_URL') || 'http://localhost:8080'}/payouts`,
        });

        await sendEmail({
          to: userData.email,
          subject: emailData.subject,
          html: emailData.html,
        });
      }
    } catch (emailError) {
      console.error('Failed to send payout approval email:', emailError);
      // Don't fail the approval if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payout approved successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error approving payout:", error);
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

