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

    const { code, enable } = await req.json();

    if (!code) {
      throw new Error("Verification code is required");
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

    if (!merchant.two_factor_secret) {
      throw new Error("Two-factor authentication is not set up");
    }

    let isValid = false;
    let usedBackupCode = false;

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
        usedBackupCode = true;

        // Remove used backup code
        const updatedBackupCodes = merchant.two_factor_backup_codes.filter((c: string) => c !== code);
        await supabaseClient
          .from("merchants")
          .update({
            two_factor_backup_codes: updatedBackupCodes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", merchant.id);

        // Log backup code usage
        await supabaseClient.rpc("log_2fa_event", {
          p_user_id: user.id,
          p_action: "backup_code_used",
          p_success: true,
        });
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

    // If enabling 2FA for the first time
    if (enable && !merchant.two_factor_enabled) {
      await supabaseClient
        .from("merchants")
        .update({
          two_factor_enabled: true,
          two_factor_verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", merchant.id);

      // Log successful verification
      await supabaseClient.rpc("log_2fa_event", {
        p_user_id: user.id,
        p_action: "verify",
        p_success: true,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        verified: true,
        used_backup_code: usedBackupCode,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error verifying 2FA:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        verified: false,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});

