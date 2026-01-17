/**
 * WebAssembly module loader for blsct
 * 
 * This module handles loading and initializing the WASM binary
 * in both browser and web worker environments.
 */

export interface BlsctWasmModule {
  // Memory management
  _malloc(size: number): number;
  _free(ptr: number): void;
  
  // Exported functions
  _init(): void;
  _free_obj(ptr: number): void;
  
  // Scalar operations
  _gen_random_scalar(): number;
  _gen_scalar(n: bigint): number;
  _scalar_to_uint64(ptr: number): bigint;
  _serialize_scalar(ptr: number): number;
  _deserialize_scalar(hex: number): number;
  _are_scalar_equal(a: number, b: number): number;
  
  // Point operations
  _gen_random_point(): number;
  _gen_base_point(): number;
  _serialize_point(ptr: number): number;
  _deserialize_point(hex: number): number;
  _is_valid_point(ptr: number): number;
  _point_from_scalar(scalar: number): number;
  _are_point_equal(a: number, b: number): number;
  _point_to_str(ptr: number): number;
  
  // Public key operations
  _gen_random_public_key(): number;
  _scalar_to_pub_key(scalar: number): number;
  _get_public_key_point(pk: number): number;
  _point_to_public_key(point: number): number;
  
  // Double public key operations
  _gen_double_pub_key(pk1: number, pk2: number): number;
  _gen_dpk_with_keys_acct_addr(viewKey: number, spendingPubKey: number, account: bigint, address: bigint): number;
  _serialize_dpk(ptr: number): number;
  _deserialize_dpk(hex: number): number;
  
  // Address operations
  _encode_address(dpk: number, encoding: number): number;
  _decode_address(addrStr: number): number;
  
  // Token ID operations
  _gen_token_id(token: bigint): number;
  _gen_token_id_with_token_and_subid(token: bigint, subid: bigint): number;
  _gen_default_token_id(): number;
  _get_token_id_token(tokenId: number): bigint;
  _get_token_id_subid(tokenId: number): bigint;
  _serialize_token_id(ptr: number): number;
  _deserialize_token_id(hex: number): number;
  
  // Sub address operations
  _gen_sub_addr_id(account: bigint, address: bigint): number;
  _derive_sub_address(viewKey: number, spendingPubKey: number, subAddrId: number): number;
  _sub_addr_to_dpk(subAddr: number): number;
  _dpk_to_sub_addr(dpk: number): number;
  _serialize_sub_addr(ptr: number): number;
  _deserialize_sub_addr(hex: number): number;
  _serialize_sub_addr_id(ptr: number): number;
  _deserialize_sub_addr_id(hex: number): number;
  
  // Range proof operations
  _build_range_proof(amounts: number, nonce: number, msg: number, tokenId: number): number;
  _verify_range_proofs(proofs: number): number;
  _serialize_range_proof(ptr: number, size: number): number;
  _deserialize_range_proof(hex: number, size: number): number;
  
  // Transaction building
  _build_tx_in(amount: bigint, gamma: bigint, spendingKey: number, tokenId: number, outPoint: number, stakedCommitment: boolean, rbf: boolean): number;
  _build_tx_out(dest: number, amount: bigint, memo: number, tokenId: number, outputType: number, minStake: bigint): number;
  _build_ctx(txIns: number, txOuts: number): number;
  _get_ctx_id(ctx: number): number;
  _serialize_ctx(ctx: number): number;
  _deserialize_ctx(hex: number): number;
  
  // Signature operations
  _sign_message(privKey: number, msg: number): number;
  _verify_msg_sig(pubKey: number, msg: number, signature: number): boolean;
  _serialize_signature(ptr: number): number;
  _deserialize_signature(hex: number): number;
  
  // Key derivation
  _from_seed_to_child_key(seed: number): number;
  _from_child_key_to_blinding_key(childKey: number): number;
  _from_child_key_to_token_key(childKey: number): number;
  _from_child_key_to_tx_key(childKey: number): number;
  _from_tx_key_to_view_key(txKey: number): number;
  _from_tx_key_to_spending_key(txKey: number): number;
  _calc_priv_spending_key(blindingPubKey: number, viewKey: number, spendingKey: number, account: bigint, address: bigint): number;
  
  // Helper functions
  _calc_view_tag(blindingPubKey: number, viewKey: number): bigint;
  _calc_nonce(blindingPubKey: number, viewKey: number): number;
  _calc_key_id(blindingPubKey: number, spendingPubKey: number, viewKey: number): number;
  _serialize_key_id(keyId: number): number;
  _deserialize_key_id(hex: number): number;
  
  // Chain configuration
  _get_blsct_chain(): number;
  _set_blsct_chain(chain: number): void;
  
  // Out point operations
  _gen_out_point(ctxId: number, n: number): number;
  _serialize_out_point(ptr: number): number;
  _deserialize_out_point(hex: number): number;
  
  // Script operations
  _serialize_script(ptr: number): number;
  _deserialize_script(hex: number): number;
  
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
}

export interface BlsctModuleFactory {
  (config?: Partial<BlsctModuleConfig>): Promise<BlsctWasmModule>;
}

export interface BlsctModuleConfig {
  locateFile?: (path: string, prefix: string) => string;
  wasmBinary?: ArrayBuffer;
  print?: (text: string) => void;
  printErr?: (text: string) => void;
}

let moduleInstance: BlsctWasmModule | null = null;
let modulePromise: Promise<BlsctWasmModule> | null = null;

/**
 * Load and initialize the WASM module
 */
export async function loadBlsctModule(
  wasmPath?: string
): Promise<BlsctWasmModule> {
  if (moduleInstance) {
    return moduleInstance;
  }

  if (modulePromise) {
    return modulePromise;
  }

  modulePromise = (async () => {
    let BlsctModuleFactory: BlsctModuleFactory;

    try {
      const moduleUrl = wasmPath || './wasm/blsct.js';
      const module = await import(/* webpackIgnore: true */ moduleUrl);
      BlsctModuleFactory = module.default || module;
    } catch {
      throw new Error(
        'Failed to load WASM module. Ensure the WASM files are built and accessible.'
      );
    }

    const config: BlsctModuleConfig = {
      locateFile: (path: string, prefix: string) => {
        if (wasmPath && path.endsWith('.wasm')) {
          return wasmPath.replace('.js', '.wasm');
        }
        return prefix + path;
      },
      print: console.log,
      printErr: console.error,
    };

    const instance = await BlsctModuleFactory(config);
    instance._init();
    moduleInstance = instance;
    return instance;
  })();

  return modulePromise;
}

/**
 * Get the loaded module instance
 */
export function getBlsctModule(): BlsctWasmModule {
  if (!moduleInstance) {
    throw new Error(
      'WASM module not loaded. Call loadBlsctModule() first and await its result.'
    );
  }
  return moduleInstance;
}

/**
 * Check if the module is loaded
 */
export function isModuleLoaded(): boolean {
  return moduleInstance !== null;
}

/**
 * Reset the module instance
 */
export function resetModule(): void {
  moduleInstance = null;
  modulePromise = null;
}

