import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as OTPAuth from "https://esm.sh/otpauth@9.2.2";

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

    const { code } = await req.json();

    if (!code) {
      throw new Error("Verification code is required to disable 2FA");
    }

    // Get merchant
    const { data: merchant, error: merchantError } = await supabaseClient
      .from("merchants")
      .select("id, two_factor_secret, two_factor_backup_codes, two_factor_enabled")
      .eq("user_id", user.id)
      .single();

    if (merchantError || !merchant) {
      throw new Error("Merchant not found");
    }

    if (!merchant.two_factor_enabled) {
      throw new Error("Two-factor authentication is not enabled");
    }

    // Verify the code before disabling
    let isValid = false;

    // Try TOTP verification
    const totp = new OTPAuth.TOTP({
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(merchant.two_factor_secret),
    });

    const delta = totp.validate({ token: code, window: 1 });
    if (delta !== null) {
      isValid = true;
    } else {
      // Try backup codes
      if (merchant.two_factor_backup_codes && merchant.two_factor_backup_codes.includes(code)) {
        isValid = true;
      }
    }

    if (!isValid) {
      // Log failed attempt
      await supabaseClient.rpc("log_2fa_event", {
        p_user_id: user.id,
        p_action: "failed_attempt",
        p_success: false,
      });

      throw new Error("Invalid verification code");
    }

    // Disable 2FA
    await supabaseClient
      .from("merchants")
      .update({
        two_factor_enabled: false,
        two_factor_secret: null,
        two_factor_backup_codes: null,
        two_factor_verified_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", merchant.id);

    // Log successful disable
    await supabaseClient.rpc("log_2fa_event", {
      p_user_id: user.id,
      p_action: "disable",
      p_success: true,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Two-factor authentication has been disabled",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error disabling 2FA:", error);
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

