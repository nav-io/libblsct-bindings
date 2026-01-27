/**
 * Type declarations for the BLSCT WASM module ESM wrapper
 */

export interface BlsctModuleConfig {
  /**
   * Function to locate the WASM binary file
   */
  locateFile?: (path: string, prefix: string) => string;
  /**
   * Pre-loaded WASM binary as ArrayBuffer
   */
  wasmBinary?: ArrayBuffer;
  /**
   * Custom print function for stdout
   */
  print?: (text: string) => void;
  /**
   * Custom print function for stderr
   */
  printErr?: (text: string) => void;
}

export interface BlsctWasmModule {
  // Memory management
  _malloc(size: number): number;
  _free(ptr: number): void;
  _init(): void;
  _free_obj(ptr: number): void;
  
  // Emscripten runtime methods
  ccall: (name: string, returnType: string | null, argTypes: string[], args: unknown[]) => unknown;
  cwrap: (name: string, returnType: string | null, argTypes: string[]) => (...args: unknown[]) => unknown;
  getValue: (ptr: number, type: string) => number;
  setValue: (ptr: number, value: number, type: string) => void;
  UTF8ToString: (ptr: number) => string;
  stringToUTF8: (str: string, ptr: number, maxBytes: number) => void;
  lengthBytesUTF8: (str: string) => number;
  stackSave: () => number;
  stackRestore: (ptr: number) => void;
  stackAlloc: (size: number) => number;
  HEAPU8: Uint8Array;
  HEAP32: Int32Array;
  HEAPU32: Uint32Array;
  
  // Additional BLSCT-specific functions are available but not fully typed here
  // See the full type definitions in the main package
  [key: string]: unknown;
}

export interface BlsctModuleFactory {
  (config?: Partial<BlsctModuleConfig>): Promise<BlsctWasmModule>;
}

/**
 * BLSCT WASM Module Factory
 * 
 * Call this function with optional configuration to instantiate the WASM module.
 */
declare const BlsctModuleFactory: (config?: Partial<BlsctModuleConfig>) => Promise<BlsctWasmModule>;
export default BlsctModuleFactory;

export { BlsctModuleFactory };

