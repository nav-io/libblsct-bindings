/**
 * Node.js native addon bindings
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const blsct = require('../../../build/Release/blsct.node');

if (!blsct._initialized) {
  blsct.init();
  blsct._initialized = true;
}

export { blsct };
export const platform = 'node' as const;

// Re-export memory utilities that work with native addon
export interface BlsctResult<T> {
  success: boolean;
  value: T | null;
  error?: string;
  errorCode?: number;
}

export function parseRetVal(retVal: { result: number; value: unknown }): BlsctResult<unknown> {
  if (retVal.result === 0) {
    return { success: true, value: retVal.value };
  }
  return {
    success: false,
    value: null,
    errorCode: retVal.result,
    error: getErrorMessage(retVal.result),
  };
}

function getErrorMessage(code: number): string {
  const errors: Record<number, string> = {
    0: 'Success',
    1: 'Failure',
    2: 'Exception occurred',
    10: 'Bad double public key size',
    11: 'Unknown encoding',
    12: 'Value outside the valid range',
    13: 'Did not run to completion',
    14: 'Input amount error',
    15: 'Output amount error',
    16: 'Bad output type',
    17: 'Memo too long',
    18: 'Memory allocation failed',
  };
  return errors[code] || `Unknown error (code: ${code})`;
}

export function assertSuccess<T>(result: BlsctResult<T>, operation: string): T {
  if (!result.success || result.value === null) {
    throw new Error(`${operation} failed: ${result.error || 'Unknown error'}`);
  }
  return result.value;
}

// Stub functions for compatibility with WASM API
export function allocString(_str: string): never {
  throw new Error('allocString is unsupported in Node.js bindings and should not be called in this environment');
}

export function readString(_ptr: number): never {
  throw new Error('readString is unsupported in Node.js bindings and should not be called in this environment');
}

export function freePtr(_ptr: number): void {
  // No-op for Node.js - native addon handles memory
}

export function freeObj(obj: unknown): void {
  if (obj !== null && obj !== undefined) {
    blsct.free_obj(obj);
  }
}
