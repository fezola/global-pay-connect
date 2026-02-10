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

    // Get merchant
    const { data: merchant, error: merchantError } = await supabaseClient
      .from("merchants")
      .select("id, business_name, two_factor_enabled")
      .eq("user_id", user.id)
      .single();

    if (merchantError || !merchant) {
      throw new Error("Merchant not found");
    }

    // Check if 2FA is already enabled
    if (merchant.two_factor_enabled) {
      throw new Error("Two-factor authentication is already enabled");
    }

    // Generate secret
    const secret = new OTPAuth.Secret({ size: 20 });
    const totp = new OTPAuth.TOTP({
      issuer: "Global Pay Connect",
      label: user.email || merchant.business_name,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: secret,
    });

    // Generate backup codes (10 codes)
    const backupCodes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      backupCodes.push(code);
    }

    // Store secret and backup codes (not yet enabled)
    const { error: updateError } = await supabaseClient
      .from("merchants")
      .update({
        two_factor_secret: secret.base32,
        two_factor_backup_codes: backupCodes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", merchant.id);

    if (updateError) {
      throw updateError;
    }

    // Generate QR code URL
    const qrCodeUrl = totp.toString();

    // Log event
    await supabaseClient.rpc("log_2fa_event", {
      p_user_id: user.id,
      p_action: "setup",
      p_success: true,
    });

    return new Response(
      JSON.stringify({
        success: true,
        secret: secret.base32,
        qr_code_url: qrCodeUrl,
        backup_codes: backupCodes,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error setting up 2FA:", error);
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

