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

    const { business_id } = await req.json();

    if (!business_id) {
      throw new Error("business_id is required");
    }

    // Get the merchant
    const { data: merchant, error: merchantError } = await supabaseClient
      .from("merchants")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (merchantError || !merchant) {
      throw new Error("Merchant not found");
    }

    // Get the business
    const { data: business, error: businessError } = await supabaseClient
      .from("businesses")
      .select("*")
      .eq("id", business_id)
      .eq("merchant_id", merchant.id)
      .single();

    if (businessError || !business) {
      throw new Error("Business not found");
    }

    // Check if already has a Persona inquiry
    if (business.persona_inquiry_id) {
      return new Response(
        JSON.stringify({
          inquiry_id: business.persona_inquiry_id,
          session_token: business.persona_session_token,
          message: "Persona inquiry already exists",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Get Persona configuration
    const PERSONA_API_KEY = Deno.env.get("PERSONA_API_KEY");
    const PERSONA_TEMPLATE_ID = Deno.env.get("PERSONA_TEMPLATE_ID");
    const PERSONA_ENVIRONMENT = Deno.env.get("PERSONA_ENVIRONMENT") || "sandbox";
    const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "http://localhost:8080";

    if (!PERSONA_API_KEY) {
      throw new Error("Persona API key not configured");
    }

    if (!PERSONA_TEMPLATE_ID) {
      throw new Error("Persona template ID not configured");
    }

    // Create Persona inquiry
    const personaResponse = await fetch("https://withpersona.com/api/v1/inquiries", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${PERSONA_API_KEY}`,
        "Content-Type": "application/json",
        "Persona-Version": "2023-01-05",
      },
      body: JSON.stringify({
        data: {
          type: "inquiry",
          attributes: {
            "inquiry-template-id": PERSONA_TEMPLATE_ID,
            "reference-id": business_id,
            "redirect-uri": `${FRONTEND_URL}/compliance?status=complete`,
            "fields": {
              "name-first": business.legal_name?.split(" ")[0] || "",
              "name-last": business.legal_name?.split(" ").slice(1).join(" ") || "",
              "business-name": business.legal_name,
              "business-tax-id-number": business.tax_id,
              "address-street-1": business.address_line1,
              "address-street-2": business.address_line2,
              "address-city": business.city,
              "address-subdivision": business.state,
              "address-postal-code": business.postal_code,
              "address-country-code": business.country,
            },
          },
        },
      }),
    });

    if (!personaResponse.ok) {
      const errorData = await personaResponse.json();
      console.error("Persona API error:", errorData);
      throw new Error(`Persona API error: ${errorData.errors?.[0]?.title || "Unknown error"}`);
    }

    const personaData = await personaResponse.json();
    const inquiryId = personaData.data.id;
    const sessionToken = personaData.data.attributes["session-token"];

    // Update business with Persona inquiry details
    const { error: updateError } = await supabaseClient
      .from("businesses")
      .update({
        persona_inquiry_id: inquiryId,
        persona_session_token: sessionToken,
        persona_status: "created",
        persona_started_at: new Date().toISOString(),
      })
      .eq("id", business_id);

    if (updateError) {
      console.error("Failed to update business:", updateError);
    }

    return new Response(
      JSON.stringify({
        inquiry_id: inquiryId,
        session_token: sessionToken,
        environment: PERSONA_ENVIRONMENT,
        message: "Persona inquiry created successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating Persona inquiry:", error);
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

