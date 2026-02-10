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

    // Get merchant for this user
    const { data: merchant, error: merchantError } = await supabaseClient
      .from("merchants")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (merchantError || !merchant) {
      throw new Error("Merchant not found");
    }

    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "overview";
    const days = parseInt(url.searchParams.get("days") || "30");
    const currency = url.searchParams.get("currency");

    const merchantId = merchant.id;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let data: any = {};

    switch (type) {
      case "overview": {
        // Get merchant stats
        const { data: stats } = await supabaseClient
          .from("merchant_stats")
          .select("*")
          .eq("merchant_id", merchantId)
          .single();

        data = stats || {};
        break;
      }

      case "daily_revenue": {
        const query = supabaseClient
          .from("daily_revenue")
          .select("*")
          .eq("merchant_id", merchantId)
          .gte("date", startDate.toISOString().split("T")[0])
          .order("date", { ascending: true });

        if (currency) {
          query.eq("currency", currency);
        }

        const { data: revenue } = await query;
        data = revenue || [];
        break;
      }

      case "monthly_revenue": {
        const query = supabaseClient
          .from("monthly_revenue")
          .select("*")
          .eq("merchant_id", merchantId)
          .order("month", { ascending: true });

        if (currency) {
          query.eq("currency", currency);
        }

        const { data: revenue } = await query;
        data = revenue || [];
        break;
      }

      case "success_rate": {
        const { data: successRate } = await supabaseClient
          .from("payment_success_rate")
          .select("*")
          .eq("merchant_id", merchantId)
          .gte("date", startDate.toISOString().split("T")[0])
          .order("date", { ascending: true });

        data = successRate || [];
        break;
      }

      case "top_customers": {
        const query = supabaseClient
          .from("top_customers")
          .select("*")
          .eq("merchant_id", merchantId)
          .order("total_spent", { ascending: false })
          .limit(10);

        if (currency) {
          query.eq("currency", currency);
        }

        const { data: customers } = await query;
        data = customers || [];
        break;
      }

      case "chain_usage": {
        const { data: chains } = await supabaseClient
          .from("chain_usage")
          .select("*")
          .eq("merchant_id", merchantId)
          .order("total_volume", { ascending: false });

        data = chains || [];
        break;
      }

      case "currency_breakdown": {
        const { data: currencies } = await supabaseClient
          .from("currency_breakdown")
          .select("*")
          .eq("merchant_id", merchantId)
          .order("total_volume", { ascending: false });

        data = currencies || [];
        break;
      }

      case "recent_transactions": {
        const { data: transactions } = await supabaseClient
          .from("recent_transactions")
          .select("*")
          .eq("merchant_id", merchantId)
          .lte("row_num", 100)
          .order("created_at", { ascending: false });

        data = transactions || [];
        break;
      }

      default:
        throw new Error(`Unknown analytics type: ${type}`);
    }

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
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

