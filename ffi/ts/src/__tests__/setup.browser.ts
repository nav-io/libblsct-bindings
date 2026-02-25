/**
 * Jest setup file for browser/WASM tests
 * 
 * This file initializes the WASM module before any tests run.
 */

import * as path from 'path';

// Get the WASM path
declare const WASM_PATH: string | undefined;

// Global flag to indicate WASM mode (used by tests to skip WASM-incompatible tests)
declare global {
  // eslint-disable-next-line no-var
  var __BLSCT_WASM_MODE__: boolean;
}
globalThis.__BLSCT_WASM_MODE__ = true;

// BigInt cannot be serialized by JSON.stringify, which Jest uses internally
// to send test results between worker processes. Without this, any assertion
// failure involving BigInt values crashes the worker with
// "TypeError: Do not know how to serialize a BigInt".
if (typeof BigInt !== 'undefined' && !(BigInt.prototype as any).toJSON) {
  ;(BigInt.prototype as any).toJSON = function () {
    return this.toString()
  }
}

function getWasmPath(): string {
  if (typeof WASM_PATH !== 'undefined') {
    return WASM_PATH;
  }
  return path.resolve(process.cwd(), 'wasm/blsct.js');
}

// Initialize WASM before all tests
beforeAll(async () => {
  const wasmLoader = await import('../bindings/wasm/index.js');
  const wasmPath = getWasmPath();
  console.log('Initializing WASM module from:', wasmPath);
  await wasmLoader.loadBlsctModule(wasmPath);
  console.log('WASM module initialized successfully');
}, 30000);

// Ensure finalization doesn't happen during test shutdown
afterAll(() => {
  // Signal that we're shutting down to prevent WASM finalizers from running
  if (typeof process !== 'undefined' && process.emit) {
    process.emit('beforeExit' as any, 0);
  }
});
