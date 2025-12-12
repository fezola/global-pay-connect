import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, persona-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const PERSONA_WEBHOOK_SECRET = Deno.env.get("PERSONA_WEBHOOK_SECRET");
    const signature = req.headers.get("persona-signature");
    const body = await req.text();

    // Verify webhook signature if secret is configured
    if (PERSONA_WEBHOOK_SECRET && signature) {
      const isValid = await verifyWebhookSignature(body, signature, PERSONA_WEBHOOK_SECRET);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return new Response("Invalid signature", { status: 401 });
      }
    }

    const event = JSON.parse(body);
    console.log("Persona webhook event:", event.data.type);

    const eventType = event.data.type;
    const inquiryId = event.data.id;
    const attributes = event.data.attributes;

    // Get business by inquiry ID
    const { data: business, error: businessError } = await supabase
      .from("businesses")
      .select("id, merchant_id")
      .eq("persona_inquiry_id", inquiryId)
      .single();

    if (businessError || !business) {
      console.error("Business not found for inquiry:", inquiryId);
      return new Response("Business not found", { status: 404 });
    }

    // Handle different event types
    switch (eventType) {
      case "inquiry/started":
        await handleInquiryStarted(supabase, business, inquiryId, attributes);
        break;

      case "inquiry/completed":
        await handleInquiryCompleted(supabase, business, inquiryId, attributes);
        break;

      case "inquiry/failed":
        await handleInquiryFailed(supabase, business, inquiryId, attributes);
        break;

      case "inquiry/expired":
        await handleInquiryExpired(supabase, business, inquiryId);
        break;

      default:
        console.log("Unhandled event type:", eventType);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Persona webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureBytes = hexToBytes(signature);
    const bodyBytes = encoder.encode(body);

    return await crypto.subtle.verify("HMAC", key, signatureBytes, bodyBytes);
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

async function handleInquiryStarted(supabase: any, business: any, inquiryId: string, attributes: any) {
  console.log("Inquiry started:", inquiryId);

  await supabase
    .from("businesses")
    .update({
      persona_status: "pending",
      status: "under_review",
    })
    .eq("id", business.id);

  await supabase
    .from("merchants")
    .update({ kyb_status: "in_progress" })
    .eq("id", business.merchant_id);
}

async function handleInquiryCompleted(supabase: any, business: any, inquiryId: string, attributes: any) {
  console.log("Inquiry completed:", inquiryId);

  const status = attributes.status; // "completed", "approved", "declined"
  const reportId = attributes["report-id"];

  // Fetch full verification report
  const PERSONA_API_KEY = Deno.env.get("PERSONA_API_KEY");
  const reportResponse = await fetch(`https://withpersona.com/api/v1/reports/${reportId}`, {
    headers: {
      "Authorization": `Bearer ${PERSONA_API_KEY}`,
      "Persona-Version": "2023-01-05",
    },
  });

  const reportData = await reportResponse.json();
  const verificationResult = reportData.data.attributes;

  // Determine if verified
  const isVerified = status === "approved" || status === "completed";

  // Update business
  await supabase
    .from("businesses")
    .update({
      persona_status: "completed",
      persona_report_id: reportId,
      persona_completed_at: new Date().toISOString(),
      status: isVerified ? "verified" : "rejected",
      verified_at: isVerified ? new Date().toISOString() : null,
    })
    .eq("id", business.id);

  // Update merchant
  await supabase
    .from("merchants")
    .update({ kyb_status: isVerified ? "verified" : "rejected" })
    .eq("id", business.merchant_id);

  // Update or create KYB job
  await supabase
    .from("kyb_jobs")
    .upsert({
      business_id: business.id,
      vendor: "persona",
      status: isVerified ? "verified" : "rejected",
      persona_inquiry_id: inquiryId,
      persona_report_id: reportId,
      persona_verification_data: verificationResult,
      result_payload: verificationResult,
    });

  console.log(`Business ${business.id} verification ${isVerified ? "approved" : "rejected"}`);
}

async function handleInquiryFailed(supabase: any, business: any, inquiryId: string, attributes: any) {
  console.log("Inquiry failed:", inquiryId);

  await supabase
    .from("businesses")
    .update({
      persona_status: "failed",
      status: "rejected",
    })
    .eq("id", business.id);

  await supabase
    .from("merchants")
    .update({ kyb_status: "rejected" })
    .eq("id", business.merchant_id);
}

async function handleInquiryExpired(supabase: any, business: any, inquiryId: string) {
  console.log("Inquiry expired:", inquiryId);

  await supabase
    .from("businesses")
    .update({
      persona_status: "expired",
    })
    .eq("id", business.id);
}

