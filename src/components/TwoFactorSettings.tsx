import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Shield, Copy, Check, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode';

interface TwoFactorSettingsProps {
  merchantId: string;
  twoFactorEnabled: boolean;
  onUpdate?: () => void;
}

export function TwoFactorSettings({ merchantId, twoFactorEnabled, onUpdate }: TwoFactorSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const { toast } = useToast();

  const handleSetup = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/setup-2fa`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to setup 2FA');
      }

      const data = await response.json();
      setSecret(data.secret);
      setBackupCodes(data.backup_codes);

      // Generate QR code image
      const qrImage = await QRCode.toDataURL(data.qr_code_url);
      setQrCodeUrl(qrImage);

      setShowSetupDialog(true);
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to setup 2FA',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter a 6-digit verification code',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/verify-2fa`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: verificationCode,
          enable: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Invalid verification code');
      }

      toast({
        title: '2FA Enabled',
        description: 'Two-factor authentication has been enabled successfully',
      });

      setShowSetupDialog(false);
      setVerificationCode('');
      onUpdate?.();
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to verify code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: 'Invalid Code',
        description: 'Please enter a 6-digit verification code',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/disable-2fa`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: verificationCode }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to disable 2FA');
      }

      toast({
        title: '2FA Disabled',
        description: 'Two-factor authentication has been disabled',
      });

      setShowDisableDialog(false);
      setVerificationCode('');
      onUpdate?.();
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to disable 2FA',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between p-4 border border-border rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className={`w-5 h-5 mt-0.5 ${twoFactorEnabled ? 'text-green-500' : 'text-muted-foreground'}`} />
          <div>
            <h3 className="font-medium">Two-Factor Authentication</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {twoFactorEnabled
                ? 'Your account is protected with 2FA'
                : 'Add an extra layer of security to your account'}
            </p>
          </div>
        </div>
        <Button
          onClick={twoFactorEnabled ? () => setShowDisableDialog(true) : handleSetup}
          variant={twoFactorEnabled ? 'destructive' : 'default'}
          disabled={loading}
        >
          {twoFactorEnabled ? 'Disable' : 'Enable'} 2FA
        </Button>
      </div>

      {/* Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app and enter the verification code
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* QR Code */}
            {qrCodeUrl && (
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
              </div>
            )}

            {/* Manual Entry */}
            <div className="space-y-2">
              <Label>Or enter this code manually:</Label>
              <div className="flex gap-2">
                <Input value={secret} readOnly className="font-mono text-sm" />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copySecret}
                >
                  {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Backup Codes */}
            <div className="space-y-2">
              <Label>Backup Codes (Save these in a safe place):</Label>
              <div className="bg-muted p-3 rounded-lg">
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {backupCodes.map((code, i) => (
                    <div key={i}>{code}</div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Each backup code can only be used once
              </p>
            </div>

            {/* Verification */}
            <div className="space-y-2">
              <Label htmlFor="verify-code">Enter Verification Code *</Label>
              <Input
                id="verify-code"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSetupDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleVerify} disabled={loading || verificationCode.length !== 6}>
              {loading ? 'Verifying...' : 'Enable 2FA'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your verification code to disable 2FA
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span>This will make your account less secure</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="disable-code">Verification Code *</Label>
              <Input
                id="disable-code"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisableDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={loading || verificationCode.length !== 6}
            >
              {loading ? 'Disabling...' : 'Disable 2FA'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

