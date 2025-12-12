-- Persona KYB Integration
-- Add Persona-specific fields to track verification inquiries

-- Add Persona fields to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS persona_inquiry_id TEXT,
ADD COLUMN IF NOT EXISTS persona_report_id TEXT,
ADD COLUMN IF NOT EXISTS persona_session_token TEXT,
ADD COLUMN IF NOT EXISTS persona_status TEXT,
ADD COLUMN IF NOT EXISTS persona_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS persona_completed_at TIMESTAMPTZ;

-- Add Persona fields to kyb_jobs table
ALTER TABLE kyb_jobs
ADD COLUMN IF NOT EXISTS persona_inquiry_id TEXT,
ADD COLUMN IF NOT EXISTS persona_report_id TEXT,
ADD COLUMN IF NOT EXISTS persona_verification_data JSONB;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_businesses_persona_inquiry 
ON businesses(persona_inquiry_id) 
WHERE persona_inquiry_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_kyb_jobs_persona_inquiry 
ON kyb_jobs(persona_inquiry_id) 
WHERE persona_inquiry_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN businesses.persona_inquiry_id IS 'Persona inquiry ID for KYB verification';
COMMENT ON COLUMN businesses.persona_report_id IS 'Persona report ID containing verification results';
COMMENT ON COLUMN businesses.persona_status IS 'Persona inquiry status: created, pending, completed, failed, expired';

