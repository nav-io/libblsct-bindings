/**
 * Memory management utilities for WASM interop
 */

import { getBlsctModule } from './loader.js';

/**
 * Allocate a string in WASM memory and return its pointer
 */
export function allocString(str: string): number {
  const module = getBlsctModule();
  const len = module.lengthBytesUTF8(str) + 1;
  const ptr = module._malloc(len);
  module.stringToUTF8(str, ptr, len);
  return ptr;
}

/**
 * Read a null-terminated string from WASM memory
 */
export function readString(ptr: number): string {
  if (ptr === 0) return '';
  const module = getBlsctModule();
  return module.UTF8ToString(ptr);
}

/**
 * Free memory allocated in WASM
 */
export function freePtr(ptr: number): void {
  if (ptr !== 0) {
    const module = getBlsctModule();
    module._free(ptr);
  }
}

/**
 * Free a blsct object
 */
export function freeObj(ptr: number): void {
  if (ptr !== 0) {
    const module = getBlsctModule();
    module._free_obj(ptr);
  }
}

/**
 * Result structure from blsct functions
 */
export interface BlsctResult<T> {
  success: boolean;
  value: T | null;
  error?: string;
  errorCode?: number;
}

/**
 * Parse a BlsctRetVal structure from WASM memory
 */
export function parseRetVal(ptr: number): BlsctResult<number> {
  if (ptr === 0) {
    return { success: false, value: null, error: 'Null pointer returned' };
  }

  const module = getBlsctModule();
  // Must match the C-side struct layout for BlsctRetVal:
  // struct BlsctRetVal { int8_t result; /* padding as needed */ void *value; };
  // The value pointer is stored at an offset aligned to the pointer size.
  const RETVAL_VALUE_PTR_OFFSET = module.HEAP32.BYTES_PER_ELEMENT;
  const result = module.getValue(ptr, 'i8');
  const valuePtr = module.getValue(ptr + RETVAL_VALUE_PTR_OFFSET, '*');

  if (result === 0) {
    return { success: true, value: valuePtr };
  } else {
    return {
      success: false,
      value: null,
      errorCode: result,
      error: getErrorMessage(result),
    };
  }
}

/**
 * Error code to message mapping
 */
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

/**
 * Assert that a result was successful
 */
export function assertSuccess<T>(result: BlsctResult<T>, operation: string): T {
  if (!result.success || result.value === null) {
    throw new Error(`${operation} failed: ${result.error || 'Unknown error'}`);
  }
  return result.value;
}

