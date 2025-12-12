/**
 * Klyr Checkout SDK
 * Embeddable JavaScript SDK for crypto payments
 */

export interface CheckoutOptions {
  merchantId: string;
  apiKey?: string;
  amount: string;
  currency?: string;
  description?: string;
  metadata?: Record<string, any>;
  customerEmail?: string;
  theme?: "light" | "dark" | "auto";
  primaryColor?: string;
  showBranding?: boolean;
  onSuccess?: (paymentId: string, txHash: string) => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
  mode?: "modal" | "redirect" | "embedded";
  containerId?: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
  close: () => void;
}

class KlyrCheckout {
  private baseUrl: string;
  private iframe: HTMLIFrameElement | null = null;
  private overlay: HTMLDivElement | null = null;

  constructor(baseUrl: string = "https://checkout.klyr.io") {
    this.baseUrl = baseUrl;
    this.setupMessageListener();
  }

  /**
   * Open checkout modal
   */
  public open(options: CheckoutOptions): CheckoutSession {
    const sessionId = this.generateSessionId();
    const mode = options.mode || "modal";

    if (mode === "redirect") {
      return this.openRedirect(options, sessionId);
    } else if (mode === "embedded") {
      return this.openEmbedded(options, sessionId);
    } else {
      return this.openModal(options, sessionId);
    }
  }

  /**
   * Open checkout in modal
   */
  private openModal(options: CheckoutOptions, sessionId: string): CheckoutSession {
    // Create overlay
    this.overlay = document.createElement("div");
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Create iframe
    this.iframe = this.createIframe(options, sessionId);
    this.iframe.style.cssText = `
      width: 100%;
      max-width: 480px;
      height: 90vh;
      max-height: 800px;
      border: none;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;

    this.overlay.appendChild(this.iframe);
    document.body.appendChild(this.overlay);

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    // Close on overlay click
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) {
        this.close();
        options.onClose?.();
      }
    });

    return {
      id: sessionId,
      url: this.buildCheckoutUrl(options, sessionId),
      close: () => this.close(),
    };
  }

  /**
   * Open checkout in redirect mode
   */
  private openRedirect(options: CheckoutOptions, sessionId: string): CheckoutSession {
    const url = this.buildCheckoutUrl(options, sessionId);
    window.location.href = url;

    return {
      id: sessionId,
      url,
      close: () => {},
    };
  }

  /**
   * Open checkout in embedded mode
   */
  private openEmbedded(options: CheckoutOptions, sessionId: string): CheckoutSession {
    const containerId = options.containerId || "klyr-checkout";
    const container = document.getElementById(containerId);

    if (!container) {
      throw new Error(`Container element with id "${containerId}" not found`);
    }

    this.iframe = this.createIframe(options, sessionId);
    this.iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 8px;
    `;

    container.appendChild(this.iframe);

    return {
      id: sessionId,
      url: this.buildCheckoutUrl(options, sessionId),
      close: () => this.close(),
    };
  }

  /**
   * Create iframe element
   */
  private createIframe(options: CheckoutOptions, sessionId: string): HTMLIFrameElement {
    const iframe = document.createElement("iframe");
    iframe.src = this.buildCheckoutUrl(options, sessionId);
    iframe.allow = "payment";
    iframe.setAttribute("data-klyr-checkout", sessionId);
    return iframe;
  }

  /**
   * Build checkout URL with parameters
   */
  private buildCheckoutUrl(options: CheckoutOptions, sessionId: string): string {
    const params = new URLSearchParams({
      session_id: sessionId,
      merchant_id: options.merchantId,
      amount: options.amount,
      currency: options.currency || "USD",
      ...(options.description && { description: options.description }),
      ...(options.customerEmail && { customer_email: options.customerEmail }),
      ...(options.theme && { theme: options.theme }),
      ...(options.primaryColor && { primary_color: options.primaryColor }),
      ...(options.showBranding !== undefined && { show_branding: String(options.showBranding) }),
      ...(options.metadata && { metadata: JSON.stringify(options.metadata) }),
    });

    return `${this.baseUrl}?${params.toString()}`;
  }

  /**
   * Close checkout
   */
  private close(): void {
    if (this.iframe) {
      this.iframe.remove();
      this.iframe = null;
    }

    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }

    // Restore body scroll
    document.body.style.overflow = "";
  }

  /**
   * Setup message listener for iframe communication
   */
  private setupMessageListener(): void {
    window.addEventListener("message", (event) => {
      // Verify origin
      if (!event.origin.includes("klyr.io")) {
        return;
      }

      const { type, data } = event.data;

      switch (type) {
        case "klyr:payment:success":
          // Handle success
          break;
        case "klyr:payment:error":
          // Handle error
          break;
        case "klyr:checkout:close":
          this.close();
          break;
      }
    });
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `cs_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
}

// Export singleton instance
export const checkout = new KlyrCheckout();

// Export class for custom instances
export default KlyrCheckout;

