import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface PaymentQRCodeProps {
  address: string;
  amount?: number;
  currency?: string;
  label?: string;
  size?: number;
}

/**
 * Generate Solana Pay QR code
 * Format: solana:<address>?amount=<amount>&spl-token=<mint>&label=<label>
 */
export function PaymentQRCode({ 
  address, 
  amount, 
  currency = 'USDC',
  label = 'Klyr Payment',
  size = 256 
}: PaymentQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !address) return;

    // USDC mint address on Solana mainnet
    const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
    const USDT_MINT = 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB';
    
    const tokenMint = currency === 'USDT' ? USDT_MINT : USDC_MINT;

    // Build Solana Pay URL
    let url = `solana:${address}`;
    const params = new URLSearchParams();
    
    if (amount) {
      params.append('amount', amount.toString());
    }
    
    params.append('spl-token', tokenMint);
    params.append('label', label);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    // Generate QR code
    QRCode.toCanvas(
      canvasRef.current,
      url,
      {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      },
      (error) => {
        if (error) {
          console.error('Error generating QR code:', error);
        }
      }
    );
  }, [address, amount, currency, label, size]);

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas ref={canvasRef} className="rounded-lg border border-border" />
      <p className="text-xs text-muted-foreground text-center">
        Scan with Solana wallet app
      </p>
    </div>
  );
}

