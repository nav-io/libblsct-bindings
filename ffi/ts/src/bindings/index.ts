/**
 * Unified bindings loader with runtime environment detection
 * 
 * This module automatically loads the appropriate binding based on the runtime:
 * - Node.js: Uses native addon (.node)
 * - Browser/WASM: Uses WebAssembly module
 */

export type { BlsctRetVal, BlsctBoolRetVal, BlsctCTxRetVal, BlsctAmountsRetVal } from './interface.js';
export { BlsctChain, TxOutputType } from './interface.js';

/**
 * Detect if running in Node.js environment
 */
export function isNode(): boolean {
  return typeof process !== 'undefined' && 
         process.versions != null && 
         process.versions.node != null;
}

/**
 * Detect if running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' || typeof self !== 'undefined';
}

/**
 * Get the current platform
 */
export function getPlatform(): 'node' | 'wasm' {
  return isNode() ? 'node' : 'wasm';
}

