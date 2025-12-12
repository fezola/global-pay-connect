/**
 * QR Code Display Component
 * Shows payment QR code for easy mobile scanning
 */

import { useState, useEffect } from "react";
import { QrCode, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QRCodeDisplayProps {
  address: string;
  amount: string;
  token: string;
  network: string;
  theme?: "light" | "dark" | "auto";
}

export function QRCodeDisplay({
  address,
  amount,
  token,
  network,
  theme = "light",
}: QRCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  const isDark = theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    // Generate QR code using a QR code API
    const qrData = `${token}:${address}?amount=${amount}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}`;
    setQrCodeUrl(qrUrl);
  }, [address, amount, token]);

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(amount);
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* QR Code */}
      <div className="flex flex-col items-center">
        <div className={cn(
          "p-4 rounded-xl border-2",
          isDark ? "bg-white border-slate-700" : "bg-white border-slate-200"
        )}>
          {qrCodeUrl ? (
            <img 
              src={qrCodeUrl} 
              alt="Payment QR Code"
              className="w-64 h-64"
            />
          ) : (
            <div className="w-64 h-64 flex items-center justify-center">
              <QrCode className="h-16 w-16 text-slate-400 animate-pulse" />
            </div>
          )}
        </div>
        <p className={cn(
          "text-sm mt-3 text-center",
          isDark ? "text-slate-400" : "text-slate-600"
        )}>
          Scan with your {token} wallet
        </p>
      </div>

      {/* Payment Details */}
      <div className="space-y-3">
        {/* Network */}
        <div className={cn(
          "p-3 rounded-lg border",
          isDark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"
        )}>
          <div className="text-xs text-slate-500 mb-1">Network</div>
          <div className="font-medium">{network}</div>
        </div>

        {/* Amount */}
        <div className={cn(
          "p-3 rounded-lg border",
          isDark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-xs text-slate-500 mb-1">Amount</div>
              <div className="font-mono font-medium">{amount} {token}</div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyAmount}
              className="ml-2"
            >
              {copiedAmount ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Address */}
        <div className={cn(
          "p-3 rounded-lg border",
          isDark ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-500 mb-1">Payment Address</div>
              <div className="font-mono text-sm truncate">{address}</div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyAddress}
              className="ml-2 flex-shrink-0"
            >
              {copiedAddress ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className={cn(
        "p-4 rounded-lg border",
        isDark ? "bg-blue-900/20 border-blue-800" : "bg-blue-50 border-blue-200"
      )}>
        <div className="text-sm space-y-2">
          <p className="font-medium">Payment Instructions:</p>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400">
            <li>Scan the QR code with your {token} wallet</li>
            <li>Or copy the address and amount manually</li>
            <li>Send exactly {amount} {token}</li>
            <li>Wait for blockchain confirmation</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

