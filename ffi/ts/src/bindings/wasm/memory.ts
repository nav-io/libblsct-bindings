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
  valueSize?: number;
  error?: string;
  errorCode?: number;
}

/**
 * Parse a BlsctRetVal structure from WASM memory
 * 
 * C struct layout:
 * typedef struct {
 *   BLSCT_RESULT result;   // uint8_t at offset 0
 *   // 3 bytes padding for 4-byte alignment
 *   void* value;           // pointer at offset 4
 *   size_t value_size;     // size_t at offset 8
 * } BlsctRetVal;
 */
export function parseRetVal(ptr: number): BlsctResult<number> {
  if (ptr === 0) {
    return { success: false, value: null, error: 'Null pointer returned' };
  }

  const module = getBlsctModule();
  
  // WASM32 struct layout offsets (with 4-byte pointer alignment)
  const RESULT_OFFSET = 0;
  const VALUE_PTR_OFFSET = 4;  // After 1-byte result + 3-byte padding
  const VALUE_SIZE_OFFSET = 8; // After value pointer
  
  // Read result as unsigned 8-bit (BLSCT_RESULT is uint8_t)
  const result = module.HEAPU8[ptr + RESULT_OFFSET];
  
  // Read value pointer as 32-bit integer (WASM32 pointer)
  // Using HEAPU32 for direct access is more reliable than getValue
  const valuePtrIndex = (ptr + VALUE_PTR_OFFSET) >> 2;  // Divide by 4 for i32 index
  const valuePtr = module.HEAPU32[valuePtrIndex];
  
  // Read value_size as 32-bit integer (size_t in WASM32)
  const valueSizeIndex = (ptr + VALUE_SIZE_OFFSET) >> 2;
  const valueSize = module.HEAPU32[valueSizeIndex];

  if (result === 0) {
    return { success: true, value: valuePtr, valueSize };
  } else {
    return {
      success: false,
      value: null,
      valueSize: 0,
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

/**
 * Parse a BlsctCTxRetVal structure from WASM memory
 * 
 * Struct layout (C):
 * typedef struct {
 *   uint8_t result;              // 1 byte at offset 0
 *   // padding: 3 bytes (to align pointer to 4-byte boundary in WASM32)
 *   void* ctx;                   // 4 bytes at offset 4 (WASM32 pointer)
 *   size_t in_amount_err_index;  // 4 bytes at offset 8 (WASM32 size_t)
 *   size_t out_amount_err_index; // 4 bytes at offset 12 (WASM32 size_t)
 * } BlsctCTxRetVal;
 * 
 * This function calculates field offsets based on WASM memory model
 * to avoid hardcoded offsets that may not be portable.
 */
export function parseCTxRetVal(ptr: number): {
  result: number;
  ctx: number;
  in_amount_err_index: number;
  out_amount_err_index: number;
} {
  if (ptr === 0) {
    throw new Error('Null pointer passed to parseCTxRetVal');
  }

  const module = getBlsctModule();
  
  // WASM32 memory model
  const POINTER_SIZE = 4; // WASM32 uses 4-byte pointers
  const SIZE_T_SIZE = 4;  // WASM32 uses 4-byte size_t
  
  // Read result field (uint8_t at offset 0)
  const result = module.getValue(ptr, 'i8');
  
  // Calculate ctx pointer offset with proper alignment
  // Align to POINTER_SIZE boundary: (offset + alignment - 1) & ~(alignment - 1)
  const ctxOffset = (1 + POINTER_SIZE - 1) & ~(POINTER_SIZE - 1);
  const ctx = module.getValue(ptr + ctxOffset, '*');
  
  // size_t fields follow immediately after the pointer (already aligned)
  const inAmountErrIndexOffset = ctxOffset + POINTER_SIZE;
  const outAmountErrIndexOffset = inAmountErrIndexOffset + SIZE_T_SIZE;
  
  const inAmountErrIndex = module.getValue(ptr + inAmountErrIndexOffset, 'i32');
  const outAmountErrIndex = module.getValue(ptr + outAmountErrIndexOffset, 'i32');

  return {
    result,
    ctx,
    in_amount_err_index: inAmountErrIndex,
    out_amount_err_index: outAmountErrIndex,
  };
}

