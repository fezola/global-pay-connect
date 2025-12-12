import { useEnvironmentMode } from "./useEnvironmentMode";
import { useMerchant } from "./useMerchant";
import { useAppStore } from "@/lib/store";

/**
 * Hook to get the current API key based on the selected environment mode
 * Returns the appropriate test or production API key
 */
export function useCurrentApiKey() {
  const { isTestMode } = useEnvironmentMode();
  const { merchant } = useMerchant();
  const { merchant: storeMerchant } = useAppStore();

  // Get the appropriate API key based on mode
  const apiKey = isTestMode 
    ? (merchant?.api_key_sandbox || storeMerchant?.apiKey || '')
    : (merchant?.api_key_production || merchant?.api_key_live || storeMerchant?.apiKeyLive || '');

  const hasApiKey = Boolean(apiKey);
  const canUseProduction = merchant?.production_enabled || storeMerchant?.productionEnabled || false;

  return {
    apiKey,
    hasApiKey,
    isTestMode,
    canUseProduction,
    // Helper to check if current mode is usable
    canUseCurrentMode: isTestMode || canUseProduction,
  };
}

