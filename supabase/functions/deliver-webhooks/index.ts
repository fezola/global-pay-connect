import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Generate HMAC signature for webhook payload
 */
async function generateWebhookSignature(
  payload: string,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

/**
 * Deliver webhook to endpoint
 */
async function deliverWebhook(
  url: string,
  payload: any,
  secret: string,
  eventId: string
): Promise<{ success: boolean; statusCode?: number; responseBody?: string; error?: string }> {
  try {
    const payloadString = JSON.stringify(payload);
    const signature = await generateWebhookSignature(payloadString, secret);
    const timestamp = Math.floor(Date.now() / 1000);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Klyr-Signature': signature,
        'X-Klyr-Timestamp': timestamp.toString(),
        'X-Klyr-Event-Id': eventId,
      },
      body: payloadString,
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    const responseBody = await response.text();

    return {
      success: response.ok,
      statusCode: response.status,
      responseBody: responseBody.substring(0, 1000), // Limit response body size
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Calculate next retry time with exponential backoff
 */
function calculateNextRetry(attempts: number): Date {
  // Exponential backoff: 1min, 5min, 15min, 1hr, 6hr
  const delays = [60, 300, 900, 3600, 21600]; // in seconds
  const delaySeconds = delays[Math.min(attempts, delays.length - 1)];
  return new Date(Date.now() + delaySeconds * 1000);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get pending webhook events that are ready to be sent
    const now = new Date().toISOString();
    const { data: pendingEvents, error: fetchError } = await supabase
      .from('webhook_events')
      .select('*')
      .in('status', ['pending', 'retrying'])
      .lte('next_retry_at', now)
      .lt('attempts', 5) // Max 5 attempts
      .limit(50); // Process in batches

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Delivering ${pendingEvents?.length || 0} webhook events`);

    const results = [];

    for (const event of pendingEvents || []) {
      try {
        // Get merchant's webhook configuration
        const { data: merchant } = await supabase
          .from('merchants')
          .select('webhook_url, webhook_secret')
          .eq('id', event.merchant_id)
          .single();

        if (!merchant?.webhook_url) {
          console.log(`No webhook URL configured for merchant ${event.merchant_id}`);
          
          // Mark as failed
          await supabase
            .from('webhook_events')
            .update({
              status: 'failed',
              error_message: 'No webhook URL configured',
              last_attempt_at: new Date().toISOString(),
            })
            .eq('id', event.id);

          results.push({
            event_id: event.id,
            status: 'failed',
            reason: 'no_webhook_url',
          });
          continue;
        }

        // Deliver webhook
        const result = await deliverWebhook(
          merchant.webhook_url,
          event.payload,
          merchant.webhook_secret || '',
          event.id
        );

        const newAttempts = event.attempts + 1;

        if (result.success) {
          // Mark as delivered
          await supabase
            .from('webhook_events')
            .update({
              status: 'delivered',
              attempts: newAttempts,
              last_attempt_at: new Date().toISOString(),
              delivered_at: new Date().toISOString(),
              response_status_code: result.statusCode,
              response_body: result.responseBody,
            })
            .eq('id', event.id);

          // Update webhook endpoint last triggered
          if (event.endpoint_id) {
            await supabase
              .from('webhook_endpoints')
              .update({
                last_triggered_at: new Date().toISOString(),
                last_status_code: result.statusCode,
              })
              .eq('id', event.endpoint_id);
          }

          results.push({
            event_id: event.id,
            status: 'delivered',
            attempts: newAttempts,
          });
        } else {
          // Retry or mark as failed
          const shouldRetry = newAttempts < event.max_attempts;

          await supabase
            .from('webhook_events')
            .update({
              status: shouldRetry ? 'retrying' : 'failed',
              attempts: newAttempts,
              last_attempt_at: new Date().toISOString(),
              next_retry_at: shouldRetry ? calculateNextRetry(newAttempts).toISOString() : null,
              response_status_code: result.statusCode,
              response_body: result.responseBody,
              error_message: result.error,
            })
            .eq('id', event.id);

          results.push({
            event_id: event.id,
            status: shouldRetry ? 'retrying' : 'failed',
            attempts: newAttempts,
            next_retry: shouldRetry ? calculateNextRetry(newAttempts) : null,
          });
        }
      } catch (error) {
        console.error(`Error delivering webhook ${event.id}:`, error);
        results.push({
          event_id: event.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return new Response(JSON.stringify({
      processed: pendingEvents?.length || 0,
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Deliver webhooks error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

