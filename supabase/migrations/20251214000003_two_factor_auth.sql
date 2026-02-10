-- Two-Factor Authentication Migration
-- Adds 2FA support to the platform

-- Add 2FA columns to merchants table
ALTER TABLE merchants
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
ADD COLUMN IF NOT EXISTS two_factor_backup_codes TEXT[],
ADD COLUMN IF NOT EXISTS two_factor_verified_at TIMESTAMPTZ;

-- Create 2FA sessions table for temporary verification
CREATE TABLE IF NOT EXISTS two_factor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT two_factor_sessions_code_length CHECK (length(code) = 6)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_two_factor_sessions_user_id ON two_factor_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_sessions_expires_at ON two_factor_sessions(expires_at);

-- Create 2FA audit log table
CREATE TABLE IF NOT EXISTS two_factor_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT two_factor_audit_action_check CHECK (action IN ('setup', 'verify', 'disable', 'backup_code_used', 'failed_attempt'))
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_two_factor_audit_user_id ON two_factor_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_two_factor_audit_created_at ON two_factor_audit_log(created_at DESC);

-- Function to clean up expired 2FA sessions
CREATE OR REPLACE FUNCTION cleanup_expired_2fa_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM two_factor_sessions
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log 2FA events
CREATE OR REPLACE FUNCTION log_2fa_event(
  p_user_id UUID,
  p_action TEXT,
  p_success BOOLEAN,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO two_factor_audit_log (user_id, action, success, ip_address, user_agent)
  VALUES (p_user_id, p_action, p_success, p_ip_address, p_user_agent);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE two_factor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for two_factor_sessions
CREATE POLICY "Users can view their own 2FA sessions"
  ON two_factor_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own 2FA sessions"
  ON two_factor_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own 2FA sessions"
  ON two_factor_sessions FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own 2FA sessions"
  ON two_factor_sessions FOR DELETE
  USING (user_id = auth.uid());

-- RLS Policies for two_factor_audit_log
CREATE POLICY "Users can view their own 2FA audit log"
  ON two_factor_audit_log FOR SELECT
  USING (user_id = auth.uid());

-- Service role can manage everything
CREATE POLICY "Service role can manage 2FA sessions"
  ON two_factor_sessions FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage 2FA audit log"
  ON two_factor_audit_log FOR ALL
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON two_factor_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON two_factor_sessions TO service_role;
GRANT SELECT ON two_factor_audit_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON two_factor_audit_log TO service_role;

-- Add IP whitelisting for API keys
CREATE TABLE IF NOT EXISTS api_key_ip_whitelist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  ip_address TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT api_key_ip_whitelist_unique UNIQUE (api_key_id, ip_address)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_api_key_ip_whitelist_api_key_id ON api_key_ip_whitelist(api_key_id);

-- Enable RLS
ALTER TABLE api_key_ip_whitelist ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Merchants can view their own IP whitelist"
  ON api_key_ip_whitelist FOR SELECT
  USING (
    api_key_id IN (
      SELECT ak.id FROM api_keys ak
      JOIN merchants m ON m.id = ak.merchant_id
      WHERE m.user_id = auth.uid()
    )
  );

CREATE POLICY "Merchants can manage their own IP whitelist"
  ON api_key_ip_whitelist FOR ALL
  USING (
    api_key_id IN (
      SELECT ak.id FROM api_keys ak
      JOIN merchants m ON m.id = ak.merchant_id
      WHERE m.user_id = auth.uid()
    )
  );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON api_key_ip_whitelist TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON api_key_ip_whitelist TO service_role;

-- Add comments
COMMENT ON TABLE two_factor_sessions IS 'Temporary 2FA verification sessions';
COMMENT ON TABLE two_factor_audit_log IS 'Audit log for 2FA events';
COMMENT ON TABLE api_key_ip_whitelist IS 'IP whitelist for API keys';

