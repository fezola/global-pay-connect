/**
 * Klyr React Components
 * React wrapper for Klyr Checkout
 */

import React, { useEffect, useRef, useState } from 'react';
import KlyrCheckout, { type CheckoutOptions, type CheckoutSession } from './checkout';

export interface KlyrCheckoutButtonProps extends Omit<CheckoutOptions, 'mode'> {
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  mode?: 'modal' | 'redirect';
}

/**
 * Klyr Checkout Button Component
 * Opens checkout modal when clicked
 */
export function KlyrCheckoutButton({
  children = 'Pay with Klyr',
  className = '',
  disabled = false,
  mode = 'modal',
  ...checkoutOptions
}: KlyrCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const checkoutRef = useRef<KlyrCheckout | null>(null);
  const sessionRef = useRef<CheckoutSession | null>(null);

  useEffect(() => {
    checkoutRef.current = new KlyrCheckout();
    return () => {
      sessionRef.current?.close();
    };
  }, []);

  const handleClick = () => {
    if (!checkoutRef.current || loading || disabled) return;

    setLoading(true);

    try {
      sessionRef.current = checkoutRef.current.open({
        ...checkoutOptions,
        mode,
        onSuccess: (paymentId, txHash) => {
          setLoading(false);
          checkoutOptions.onSuccess?.(paymentId, txHash);
        },
        onClose: () => {
          setLoading(false);
          checkoutOptions.onClose?.();
        },
        onError: (error) => {
          setLoading(false);
          checkoutOptions.onError?.(error);
        },
      });
    } catch (error) {
      setLoading(false);
      console.error('Failed to open checkout:', error);
    }
  };

  const defaultClassName = `
    px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold
    hover:bg-blue-700 active:bg-blue-800 transition-colors
    disabled:opacity-50 disabled:cursor-not-allowed
    flex items-center justify-center gap-2
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={className || defaultClassName}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

export interface KlyrEmbeddedCheckoutProps extends Omit<CheckoutOptions, 'mode' | 'containerId'> {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Klyr Embedded Checkout Component
 * Embeds checkout directly in the page
 */
export function KlyrEmbeddedCheckout({
  className = '',
  style = {},
  ...checkoutOptions
}: KlyrEmbeddedCheckoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const checkoutRef = useRef<KlyrCheckout | null>(null);
  const sessionRef = useRef<CheckoutSession | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const containerId = `klyr-checkout-${Math.random().toString(36).substring(2, 9)}`;
    containerRef.current.id = containerId;

    checkoutRef.current = new KlyrCheckout();
    sessionRef.current = checkoutRef.current.open({
      ...checkoutOptions,
      mode: 'embedded',
      containerId,
    });

    return () => {
      sessionRef.current?.close();
    };
  }, []);

  const defaultStyle: React.CSSProperties = {
    width: '100%',
    minHeight: '600px',
    ...style,
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={defaultStyle}
    />
  );
}

/**
 * Hook for programmatic checkout control
 */
export function useKlyrCheckout() {
  const checkoutRef = useRef<KlyrCheckout | null>(null);
  const sessionRef = useRef<CheckoutSession | null>(null);

  useEffect(() => {
    checkoutRef.current = new KlyrCheckout();
    return () => {
      sessionRef.current?.close();
    };
  }, []);

  const openCheckout = (options: CheckoutOptions) => {
    if (!checkoutRef.current) {
      throw new Error('Checkout not initialized');
    }

    sessionRef.current = checkoutRef.current.open(options);
    return sessionRef.current;
  };

  const closeCheckout = () => {
    sessionRef.current?.close();
  };

  return {
    openCheckout,
    closeCheckout,
    session: sessionRef.current,
  };
}

