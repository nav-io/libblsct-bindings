/**
 * Memory management utilities for WASM interop
 */

import { getBlsctModule, type BlsctWasmModule } from './loader.js';

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
 * Allocate bytes in WASM memory
 */
export function allocBytes(bytes: Uint8Array): number {
  const module = getBlsctModule();
  const ptr = module._malloc(bytes.length);
  module.HEAPU8.set(bytes, ptr);
  return ptr;
}

/**
 * Read bytes from WASM memory
 */
export function readBytes(ptr: number, length: number): Uint8Array {
  const module = getBlsctModule();
  return new Uint8Array(module.HEAPU8.buffer, ptr, length).slice();
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
 * Convert a hex string to bytes
 */
export function hexToBytes(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex string length');
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Convert bytes to a hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * RAII-style resource guard for automatic cleanup
 */
export class WasmPtr {
  private ptr: number;
  private freed = false;

  constructor(ptr: number) {
    this.ptr = ptr;
  }

  get value(): number {
    if (this.freed) {
      throw new Error('Pointer has been freed');
    }
    return this.ptr;
  }

  free(): void {
    if (!this.freed && this.ptr !== 0) {
      freePtr(this.ptr);
      this.freed = true;
    }
  }

  freeObj(): void {
    if (!this.freed && this.ptr !== 0) {
      freeObj(this.ptr);
      this.freed = true;
    }
  }

  isValid(): boolean {
    return !this.freed && this.ptr !== 0;
  }
}

/**
 * Execute a function with temporary WASM stack allocation
 */
export function withStack<T>(fn: (alloc: (size: number) => number) => T): T {
  const module = getBlsctModule();
  const stackPtr = module.stackSave();
  try {
    return fn((size: number) => module.stackAlloc(size));
  } finally {
    module.stackRestore(stackPtr);
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
  
  // BlsctRetVal structure:
  // { uint8_t result; void* value; size_t value_size; }
  const result = module.getValue(ptr, 'i8');
  const valuePtr = module.getValue(ptr + 4, '*'); // Assuming 4-byte alignment
  const valueSize = module.getValue(ptr + 8, 'i32');

  if (result === 0) {
    // BLSCT_SUCCESS
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
 * Parse a BlsctBoolRetVal structure
 */
export function parseBoolRetVal(ptr: number): BlsctResult<boolean> {
  if (ptr === 0) {
    return { success: false, value: null, error: 'Null pointer returned' };
  }

  const module = getBlsctModule();
  const result = module.getValue(ptr, 'i8');
  const value = module.getValue(ptr + 1, 'i8') !== 0;

  if (result === 0) {
    return { success: true, value };
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
 * Assert that a result was successful, throwing an error if not
 */
export function assertSuccess<T>(result: BlsctResult<T>, operation: string): T {
  if (!result.success || result.value === null) {
    throw new Error(`${operation} failed: ${result.error || 'Unknown error'}`);
  }
  return result.value;
}

