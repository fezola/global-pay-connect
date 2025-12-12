/**
 * Currency Conversion Service
 * Handles real-time exchange rates and country-based currency conversion
 */

import axios from 'axios';

// Supported currencies by country
export const COUNTRY_CURRENCIES: Record<string, { currency: string; symbol: string; name: string }> = {
  NG: { currency: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  US: { currency: 'USD', symbol: '$', name: 'US Dollar' },
  GB: { currency: 'GBP', symbol: '£', name: 'British Pound' },
  EU: { currency: 'EUR', symbol: '€', name: 'Euro' },
  KE: { currency: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  ZA: { currency: 'ZAR', symbol: 'R', name: 'South African Rand' },
  GH: { currency: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
  IN: { currency: 'INR', symbol: '₹', name: 'Indian Rupee' },
  CA: { currency: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  AU: { currency: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
};

// Cache for exchange rates
let exchangeRateCache: Record<string, number> = {};
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Detect user's country from IP
 */
export async function detectUserCountry(): Promise<string> {
  try {
    // Try ipapi.co (free, no API key needed)
    const response = await axios.get('https://ipapi.co/json/', {
      timeout: 5000,
    });
    
    const countryCode = response.data.country_code;
    console.log('Detected country:', countryCode, response.data.country_name);
    return countryCode;
  } catch (error) {
    console.error('Failed to detect country:', error);
    // Default to Nigeria if detection fails
    return 'NG';
  }
}

/**
 * Get user's local currency based on country
 */
export function getLocalCurrency(countryCode: string): { currency: string; symbol: string; name: string } {
  return COUNTRY_CURRENCIES[countryCode] || COUNTRY_CURRENCIES['NG'];
}

/**
 * Fetch real-time exchange rates from USD to other currencies
 */
export async function fetchExchangeRates(): Promise<Record<string, number>> {
  const now = Date.now();
  
  // Return cached rates if still valid
  if (now - lastFetchTime < CACHE_DURATION && Object.keys(exchangeRateCache).length > 0) {
    console.log('Using cached exchange rates');
    return exchangeRateCache;
  }

  try {
    // Using exchangerate-api.com (free tier: 1,500 requests/month)
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', {
      timeout: 5000,
    });

    exchangeRateCache = response.data.rates;
    lastFetchTime = now;
    
    console.log('Fetched exchange rates:', {
      NGN: exchangeRateCache.NGN,
      GBP: exchangeRateCache.GBP,
      EUR: exchangeRateCache.EUR,
    });

    return exchangeRateCache;
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    
    // Fallback to approximate rates if API fails
    return {
      NGN: 1550,  // 1 USD = 1,550 NGN (approximate)
      GBP: 0.79,  // 1 USD = 0.79 GBP
      EUR: 0.92,  // 1 USD = 0.92 EUR
      KES: 129,   // 1 USD = 129 KES
      ZAR: 18.5,  // 1 USD = 18.5 ZAR
      GHS: 15.5,  // 1 USD = 15.5 GHS
      INR: 83,    // 1 USD = 83 INR
      CAD: 1.36,  // 1 USD = 1.36 CAD
      AUD: 1.52,  // 1 USD = 1.52 AUD
      USD: 1,     // 1 USD = 1 USD
    };
  }
}

/**
 * Convert USD to local currency
 */
export async function convertUSDToLocal(
  amountUSD: number,
  targetCurrency: string
): Promise<{ amount: number; rate: number }> {
  const rates = await fetchExchangeRates();
  const rate = rates[targetCurrency] || 1;
  const amount = amountUSD * rate;

  return { amount, rate };
}

/**
 * Format currency amount with proper symbol and decimals
 */
export function formatCurrency(
  amount: number,
  currency: string,
  symbol: string
): string {
  // Different currencies have different decimal places
  const decimals = ['JPY', 'KRW'].includes(currency) ? 0 : 2;
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Get full currency display with symbol
 */
export function getCurrencyDisplay(
  amount: number,
  currency: string,
  symbol: string
): string {
  const formatted = formatCurrency(amount, currency, symbol);
  return `${symbol}${formatted}`;
}

/**
 * Initialize currency conversion for a user
 */
export async function initializeCurrencyConversion(): Promise<{
  countryCode: string;
  currency: string;
  symbol: string;
  name: string;
  rates: Record<string, number>;
}> {
  const countryCode = await detectUserCountry();
  const localCurrency = getLocalCurrency(countryCode);
  const rates = await fetchExchangeRates();

  return {
    countryCode,
    ...localCurrency,
    rates,
  };
}

