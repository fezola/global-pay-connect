import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency amount with proper decimals
 * @param amount - The amount to format
 * @param currency - The currency code (e.g., 'USDC', 'USDT', 'USD')
 * @returns Formatted currency string (e.g., "100.00 USDC")
 */
export function formatCurrency(amount: number, currency: string = 'USDC'): string {
  // Different currencies have different decimal places
  const decimals = ['JPY', 'KRW'].includes(currency) ? 0 : 2;

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);

  return `${formatted} ${currency}`;
}
