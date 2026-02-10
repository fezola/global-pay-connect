import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { sendEmail } from "../_shared/send-email-helper.ts";
import { welcomeEmail, verificationCompletedEmail } from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get pending emails from queue
    const { data: pendingEmails, error: fetchError } = await supabase
      .from("email_queue")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(50); // Process 50 emails at a time

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Processing ${pendingEmails?.length || 0} pending emails`);

    const results = [];

    for (const emailRecord of pendingEmails || []) {
      try {
        let emailData: { subject: string; html: string } | null = null;

        // Generate email based on type
        switch (emailRecord.email_type) {
          case "welcome":
            emailData = welcomeEmail({
              businessName: emailRecord.template_data.businessName,
              dashboardUrl: emailRecord.template_data.dashboardUrl || "http://localhost:8080",
              docsUrl: emailRecord.template_data.docsUrl || "http://localhost:8080/docs",
            });
            break;

          case "verification_completed":
            emailData = verificationCompletedEmail({
              businessName: emailRecord.template_data.businessName,
              dashboardUrl: emailRecord.template_data.dashboardUrl || "http://localhost:8080",
            });
            break;

          default:
            console.error(`Unknown email type: ${emailRecord.email_type}`);
            // Mark as failed
            await supabase
              .from("email_queue")
              .update({
                status: "failed",
                last_error: `Unknown email type: ${emailRecord.email_type}`,
                attempts: emailRecord.attempts + 1,
              })
              .eq("id", emailRecord.id);
            continue;
        }

        if (emailData) {
          // Send email
          const result = await sendEmail({
            to: emailRecord.recipient_email,
            subject: emailData.subject,
            html: emailData.html,
          });

          if (result.success) {
            // Mark as sent
            await supabase
              .from("email_queue")
              .update({
                status: "sent",
                sent_at: new Date().toISOString(),
                attempts: emailRecord.attempts + 1,
              })
              .eq("id", emailRecord.id);

            results.push({
              id: emailRecord.id,
              status: "sent",
            });
          } else {
            // Mark as failed
            await supabase
              .from("email_queue")
              .update({
                status: "failed",
                last_error: result.error || "Unknown error",
                attempts: emailRecord.attempts + 1,
              })
              .eq("id", emailRecord.id);

            results.push({
              id: emailRecord.id,
              status: "failed",
              error: result.error,
            });
          }
        }
      } catch (error) {
        console.error(`Error processing email ${emailRecord.id}:`, error);
        
        // Update attempts
        await supabase
          .from("email_queue")
          .update({
            last_error: error instanceof Error ? error.message : "Unknown error",
            attempts: emailRecord.attempts + 1,
          })
          .eq("id", emailRecord.id);

        results.push({
          id: emailRecord.id,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return new Response(
      JSON.stringify({
        processed: pendingEmails?.length || 0,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing email queue:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

