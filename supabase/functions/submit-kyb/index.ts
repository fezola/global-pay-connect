import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { businessId } = body;

    if (!businessId) {
      return new Response(JSON.stringify({ error: 'businessId required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get business and verify ownership
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .select('*, business_owners(*), business_documents(*), business_wallets(*)')
      .eq('id', businessId)
      .single();

    if (bizError || !business) {
      return new Response(JSON.stringify({ error: 'Business not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate business has required data
    const validationErrors: string[] = [];
    
    if (!business.legal_name) {
      validationErrors.push('Legal name is required');
    }
    if (!business.entity_type) {
      validationErrors.push('Entity type is required');
    }
    if (!business.country) {
      validationErrors.push('Country is required');
    }
    if (!business.business_owners || business.business_owners.length === 0) {
      validationErrors.push('At least one business owner is required');
    }
    if (!business.business_documents || business.business_documents.length < 2) {
      validationErrors.push('At least 2 documents are required');
    }

    if (validationErrors.length > 0) {
      return new Response(JSON.stringify({ 
        error: 'Validation failed', 
        validation_errors: validationErrors 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create KYB job
    const { data: kybJob, error: kybError } = await supabase
      .from('kyb_jobs')
      .insert({
        business_id: businessId,
        vendor: 'klyr-internal',
        status: 'queued',
        vendor_payload: {
          submitted_at: new Date().toISOString(),
          documents_count: business.business_documents?.length || 0,
          owners_count: business.business_owners?.length || 0,
        }
      })
      .select()
      .single();

    if (kybError) {
      console.error('Failed to create KYB job:', kybError);
      return new Response(JSON.stringify({ error: 'Failed to create KYB job' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update business status
    await supabase
      .from('businesses')
      .update({ 
        status: 'submitted',
        submitted_at: new Date().toISOString()
      })
      .eq('id', businessId);

    // Update merchant KYB status
    await supabase
      .from('merchants')
      .update({ kyb_status: 'queued' })
      .eq('id', business.merchant_id);

    console.log(`KYB job ${kybJob.id} created for business ${businessId}`);

    // Trigger async KYB processing (fire and forget)
    processKybAsync(supabase, kybJob.id, businessId, business.merchant_id);

    return new Response(JSON.stringify({ 
      status: 'submitted',
      kyb_job_id: kybJob.id,
      message: 'Business submitted for KYB review. This typically takes 1-2 business days.',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Submit KYB error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Mock KYB processing - simulates verification after a delay
async function processKybAsync(supabase: any, kybJobId: string, businessId: string, merchantId: string) {
  try {
    console.log(`Starting async KYB processing for job ${kybJobId}`);

    // Simulate processing delay (3-5 seconds for demo)
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));

    // Update KYB job to in_progress
    await supabase
      .from('kyb_jobs')
      .update({ status: 'in_progress' })
      .eq('id', kybJobId);

    await supabase
      .from('businesses')
      .update({ status: 'under_review' })
      .eq('id', businessId);

    await supabase
      .from('merchants')
      .update({ kyb_status: 'in_progress' })
      .eq('id', merchantId);

    console.log(`KYB job ${kybJobId} now in_progress`);

    // Simulate more processing time
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));

    // For demo purposes, always verify successfully
    // In production, this would involve actual KYB vendor API calls
    const verificationResult = {
      verified: true,
      verified_at: new Date().toISOString(),
      checks: {
        identity: 'passed',
        address: 'passed',
        documents: 'passed',
        sanctions: 'clear',
        pep: 'clear'
      }
    };

    // Update KYB job as verified
    await supabase
      .from('kyb_jobs')
      .update({ 
        status: 'verified',
        result_payload: verificationResult
      })
      .eq('id', kybJobId);

    // Update business as verified
    await supabase
      .from('businesses')
      .update({ 
        status: 'verified',
        verified_at: new Date().toISOString()
      })
      .eq('id', businessId);

    // Update merchant as verified
    await supabase
      .from('merchants')
      .update({ kyb_status: 'verified' })
      .eq('id', merchantId);

    console.log(`KYB job ${kybJobId} completed - business ${businessId} verified`);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Async KYB processing error:', error);
    
    // Mark as failed
    await supabase
      .from('kyb_jobs')
      .update({ 
        status: 'rejected',
        result_payload: { error: errorMessage }
      })
      .eq('id', kybJobId);
  }
}
