-- Email Notifications Migration
-- Adds database triggers to send email notifications

-- Function to send welcome email when a new merchant is created
CREATE OR REPLACE FUNCTION send_welcome_email()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  business_name TEXT;
BEGIN
  -- Get user email
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = NEW.user_id;

  -- Get business name
  business_name := COALESCE(NEW.business_name, 'Merchant');

  -- Call send-email Edge Function via pg_net (if available) or log for manual processing
  -- For now, we'll insert into a queue table that can be processed
  INSERT INTO email_queue (
    recipient_email,
    email_type,
    template_data,
    status
  ) VALUES (
    user_email,
    'welcome',
    jsonb_build_object(
      'businessName', business_name,
      'dashboardUrl', current_setting('app.frontend_url', true),
      'docsUrl', current_setting('app.docs_url', true)
    ),
    'pending'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send verification completed email
CREATE OR REPLACE FUNCTION send_verification_completed_email()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  business_name TEXT;
BEGIN
  -- Only send if status changed to 'verified'
  IF NEW.kyb_status = 'verified' AND (OLD.kyb_status IS NULL OR OLD.kyb_status != 'verified') THEN
    -- Get user email
    SELECT email INTO user_email
    FROM auth.users
    WHERE id = NEW.user_id;

    -- Get business name
    business_name := COALESCE(NEW.business_name, 'Merchant');

    -- Queue verification completed email
    INSERT INTO email_queue (
      recipient_email,
      email_type,
      template_data,
      status
    ) VALUES (
      user_email,
      'verification_completed',
      jsonb_build_object(
        'businessName', business_name,
        'dashboardUrl', current_setting('app.frontend_url', true)
      ),
      'pending'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create email queue table
CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL,
  template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  CONSTRAINT email_queue_status_check CHECK (status IN ('pending', 'sent', 'failed'))
);

-- Create index for processing queue
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status, created_at);

-- Create triggers
DROP TRIGGER IF EXISTS trigger_send_welcome_email ON merchants;
CREATE TRIGGER trigger_send_welcome_email
  AFTER INSERT ON merchants
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_email();

DROP TRIGGER IF EXISTS trigger_send_verification_completed_email ON merchants;
CREATE TRIGGER trigger_send_verification_completed_email
  AFTER UPDATE ON merchants
  FOR EACH ROW
  EXECUTE FUNCTION send_verification_completed_email();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON email_queue TO authenticated;
GRANT SELECT, INSERT, UPDATE ON email_queue TO service_role;

-- Add comment
COMMENT ON TABLE email_queue IS 'Queue for outgoing email notifications';

