/**
 * Browser polyfills for Node.js modules
 * Required for Solana web3.js and SPL token libraries
 */

import { Buffer } from 'buffer';

// Make Buffer available globally
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  (window as any).global = window;
  (window as any).process = {
    env: {},
    version: '',
    nextTick: (fn: Function) => setTimeout(fn, 0)
  };
}

export {};

