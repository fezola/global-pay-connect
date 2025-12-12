/**
 * Hosted Checkout Page
 * Standalone checkout page for redirects
 */

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckoutWidget, type CheckoutConfig } from "@/components/checkout/CheckoutWidget";
import { Loader2 } from "lucide-react";

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [config, setConfig] = useState<CheckoutConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Parse URL parameters
    const merchantId = searchParams.get("merchant_id");
    const amount = searchParams.get("amount");
    const currency = searchParams.get("currency") || "USD";
    const description = searchParams.get("description") || undefined;
    const customerEmail = searchParams.get("customer_email") || undefined;
    const theme = (searchParams.get("theme") as "light" | "dark" | "auto") || "auto";
    const showBranding = searchParams.get("show_branding") !== "false";
    const returnUrl = searchParams.get("return_url") || undefined;
    const cancelUrl = searchParams.get("cancel_url") || undefined;

    // Validate required parameters
    if (!merchantId || !amount) {
      setError("Missing required parameters: merchant_id and amount");
      setLoading(false);
      return;
    }

    // Get merchant name (in production, fetch from API)
    const merchantName = searchParams.get("merchant_name") || "Merchant";

    // Parse metadata
    let metadata: Record<string, any> | undefined;
    const metadataParam = searchParams.get("metadata");
    if (metadataParam) {
      try {
        metadata = JSON.parse(metadataParam);
      } catch (e) {
        console.error("Failed to parse metadata:", e);
      }
    }

    setConfig({
      merchantId,
      merchantName,
      amount,
      currency,
      description,
      metadata,
      theme,
      showBranding,
      embedded: true,
      onSuccess: (paymentId, txHash) => {
        // Redirect to return URL with success parameters
        if (returnUrl) {
          const url = new URL(returnUrl);
          url.searchParams.set("payment_id", paymentId);
          url.searchParams.set("tx_hash", txHash);
          url.searchParams.set("status", "success");
          window.location.href = url.toString();
        } else {
          // Show success page
          navigate(`/checkout/success?payment_id=${paymentId}&tx_hash=${txHash}`);
        }
      },
      onClose: () => {
        // Redirect to cancel URL
        if (cancelUrl) {
          window.location.href = cancelUrl;
        } else {
          navigate("/");
        }
      },
      onError: (error) => {
        console.error("Payment error:", error);
        setError(error.message);
      },
    });

    setLoading(false);
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-slate-600 dark:text-slate-400">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="max-w-md p-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">Checkout Error</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!config) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <CheckoutWidget {...config} />
    </div>
  );
}

