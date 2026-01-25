/**
 * WebAssembly module loader for blsct
 * 
 * This module handles loading and initializing the WASM binary
 * in both browser and web worker environments.
 * 
 * For browser/bundler usage, the loader automatically resolves WASM paths
 * relative to this file using import.meta.url for compatibility with
 * bundlers like Vite, Webpack, and Rollup.
 */

export interface BlsctWasmModule {
  // Memory management
  _malloc(size: number): number;
  _free(ptr: number): void;
  _init(): void;
  _free_obj(ptr: number): void;
  _free_amounts_ret_val(ptr: number): void;
  
  // Scalar operations
  _gen_random_scalar(): number;
  _gen_scalar(n: bigint): number;
  _scalar_to_uint64(ptr: number): bigint;
  _serialize_scalar(ptr: number): number;
  _deserialize_scalar(hex: number): number;
  _are_scalar_equal(a: number, b: number): number;
  _scalar_to_pub_key(scalar: number): number;
  
  // Point operations
  _gen_random_point(): number;
  _gen_base_point(): number;
  _serialize_point(ptr: number): number;
  _deserialize_point(hex: number): number;
  _is_valid_point(ptr: number): number;
  _point_from_scalar(scalar: number): number;
  _are_point_equal(a: number, b: number): number;
  _point_to_str(ptr: number): number;
  _scalar_muliply_point(point: number, scalar: number): number;
  
  // Public key operations
  _gen_random_public_key(): number;
  _get_public_key_point(pk: number): number;
  _point_to_public_key(point: number): number;
  
  // Double public key operations
  _gen_double_pub_key(pk1: number, pk2: number): number;
  _gen_dpk_with_keys_acct_addr(viewKey: number, spendingPubKey: number, account: bigint, address: bigint): number;
  _dpk_to_sub_addr(dpk: number): number;
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
  _get_sub_addr_id_account(subAddrId: number): bigint;
  _get_sub_addr_id_address(subAddrId: number): bigint;
  _derive_sub_address(viewKey: number, spendingPubKey: number, subAddrId: number): number;
  _sub_addr_to_dpk(subAddr: number): number;
  _serialize_sub_addr(ptr: number): number;
  _deserialize_sub_addr(hex: number): number;
  _serialize_sub_addr_id(ptr: number): number;
  _deserialize_sub_addr_id(hex: number): number;
  
  // Range proof operations
  _create_range_proof_vec(): number;
  _add_to_range_proof_vec(vec: number, rangeProof: number, size: number): void;
  _delete_range_proof_vec(vec: number): void;
  _build_range_proof(amounts: number, nonce: number, msg: number, tokenId: number): number;
  _verify_range_proofs(proofs: number): number;
  _serialize_range_proof(ptr: number, size: number): number;
  _deserialize_range_proof(hex: number, size: number): number;
  _get_range_proof_A(ptr: number, size: number): number;
  _get_range_proof_A_wip(ptr: number, size: number): number;
  _get_range_proof_B(ptr: number, size: number): number;
  _get_range_proof_r_prime(ptr: number, size: number): number;
  _get_range_proof_s_prime(ptr: number, size: number): number;
  _get_range_proof_delta_prime(ptr: number, size: number): number;
  _get_range_proof_alpha_hat(ptr: number, size: number): number;
  _get_range_proof_tau_x(ptr: number, size: number): number;
  
  // Amount recovery operations
  _gen_amount_recovery_req(rangeProof: number, size: number, nonce: number): number;
  _create_amount_recovery_req_vec(): number;
  _add_to_amount_recovery_req_vec(vec: number, req: number): void;
  _delete_amount_recovery_req_vec(vec: number): void;
  _recover_amount(vec: number): number;
  _get_amount_recovery_result_size(vec: number): number;
  _get_amount_recovery_result_is_succ(vec: number, i: number): boolean;
  _get_amount_recovery_result_amount(vec: number, i: number): bigint;
  _get_amount_recovery_result_msg(vec: number, i: number): number;
  
  // Out point operations
  _gen_out_point(ctxId: number, n: number): number;
  _get_out_point_n(ptr: number): number;
  _serialize_out_point(ptr: number): number;
  _deserialize_out_point(hex: number): number;
  
  // Transaction building
  _create_tx_in_vec(): number;
  _add_to_tx_in_vec(vec: number, txIn: number): void;
  _delete_tx_in_vec(vec: number): void;
  _create_tx_out_vec(): number;
  _add_to_tx_out_vec(vec: number, txOut: number): void;
  _delete_tx_out_vec(vec: number): void;
  _build_tx_in(amount: bigint, gamma: bigint, spendingKey: number, tokenId: number, outPoint: number, stakedCommitment: boolean, rbf: boolean): number;
  _build_tx_out(dest: number, amount: bigint, memo: number, tokenId: number, outputType: number, minStake: bigint, subtractFeeFromAmount: boolean, blindingKey: number): number;
  _build_ctx(txIns: number, txOuts: number): number;
  _get_ctx_id(ctx: number): number;
  _get_ctx_ins(ctx: number): number;
  _get_ctx_outs(ctx: number): number;
  _serialize_ctx(ctx: number): number;
  _deserialize_ctx(hex: number): number;
  _serialize_ctx_id(ctxId: number): number;
  _deserialize_ctx_id(hex: number): number;
  _delete_ctx(ctx: number): void;
  
  // CTxIns accessors
  _get_ctx_ins_size(ctxIns: number): number;
  _get_ctx_in_at(ctxIns: number, i: number): number;
  
  // CTxIn accessors
  _get_ctx_in_prev_out_hash(ctxIn: number): number;
  _get_ctx_in_prev_out_n(ctxIn: number): number;
  _get_ctx_in_script_sig(ctxIn: number): number;
  _get_ctx_in_sequence(ctxIn: number): number;
  _get_ctx_in_script_witness(ctxIn: number): number;
  
  // CTxOuts accessors
  _get_ctx_outs_size(ctxOuts: number): number;
  _get_ctx_out_at(ctxOuts: number, i: number): number;
  
  // CTxOut accessors
  _get_ctx_out_value(ctxOut: number): bigint;
  _get_ctx_out_script_pub_key(ctxOut: number): number;
  _get_ctx_out_token_id(ctxOut: number): number;
  _get_ctx_out_vector_predicate(ctxOut: number): number;
  _get_ctx_out_spending_key(ctxOut: number): number;
  _get_ctx_out_ephemeral_key(ctxOut: number): number;
  _get_ctx_out_blinding_key(ctxOut: number): number;
  _get_ctx_out_range_proof(ctxOut: number): number;
  _get_ctx_out_view_tag(ctxOut: number): number;
  
  // TxIn accessors
  _get_tx_in_amount(txIn: number): bigint;
  _get_tx_in_gamma(txIn: number): bigint;
  _get_tx_in_spending_key(txIn: number): number;
  _get_tx_in_token_id(txIn: number): number;
  _get_tx_in_out_point(txIn: number): number;
  _get_tx_in_staked_commitment(txIn: number): boolean;
  _get_tx_in_rbf(txIn: number): boolean;
  
  // TxOut accessors
  _get_tx_out_destination(txOut: number): number;
  _get_tx_out_amount(txOut: number): bigint;
  _get_tx_out_memo(txOut: number): number;
  _get_tx_out_token_id(txOut: number): number;
  _get_tx_out_output_type(txOut: number): number;
  _get_tx_out_min_stake(txOut: number): bigint;
  _get_tx_out_subtract_fee_from_amount(txOut: number): boolean;
  _get_tx_out_blinding_key(txOut: number): number;
  
  // Signature operations
  _sign_message(privKey: number, msg: number): number;
  _verify_msg_sig(pubKey: number, msg: number, signature: number): boolean;
  _serialize_signature(ptr: number): number;
  _deserialize_signature(hex: number): number;
  
  // Script operations
  _serialize_script(ptr: number): number;
  _deserialize_script(hex: number): number;
  
  // Key derivation
  _from_seed_to_child_key(seed: number): number;
  _from_child_key_to_blinding_key(childKey: number): number;
  _from_child_key_to_token_key(childKey: number): number;
  _from_child_key_to_tx_key(childKey: number): number;
  _from_tx_key_to_view_key(txKey: number): number;
  _from_tx_key_to_spending_key(txKey: number): number;
  _calc_priv_spending_key(blindingPubKey: number, viewKey: number, spendingKey: number, account: bigint, address: bigint): number;
  
  // Key ID / Hash ID
  _calc_key_id(blindingPubKey: number, spendingPubKey: number, viewKey: number): number;
  _serialize_key_id(keyId: number): number;
  _deserialize_key_id(hex: number): number;
  
  // Helper functions
  _calc_view_tag(blindingPubKey: number, viewKey: number): bigint;
  _calc_nonce(blindingPubKey: number, viewKey: number): number;
  
  // Misc utilities
  _hex_to_malloced_buf(hex: number): number;
  _buf_to_malloced_hex_c_str(buf: number, size: number): number;
  _create_uint64_vec(): number;
  _add_to_uint64_vec(vec: number, n: bigint): void;
  _delete_uint64_vec(vec: number): void;
  
  // Chain configuration
  _get_blsct_chain(): number;
  _set_blsct_chain(chain: number): void;
  
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
 * Options for loading the BLSCT WASM module
 */
export interface LoadBlsctModuleOptions {
  /**
   * Custom path to the WASM JS loader file.
   * If not provided, the path is automatically resolved relative to this loader file.
   */
  wasmPath?: string;
  /**
   * Pre-loaded WASM binary as ArrayBuffer.
   * When provided, the loader skips fetching the .wasm file and uses this binary directly.
   * Useful for environments where you want to bundle or inline the WASM binary.
   */
  wasmBinary?: ArrayBuffer;
}

/**
 * Calculate the default WASM path relative to this loader file.
 * Uses import.meta.url for bundler compatibility (Vite, Webpack, Rollup, etc.)
 */
function getDefaultWasmPath(): string {
  // In browser/bundler context, use import.meta.url to resolve relative paths
  // The WASM files are located at ../../wasm/blsct.js relative to this loader
  // (loader is at dist/browser/bindings/wasm/loader.js, wasm is at wasm/blsct.js)
  try {
    // @ts-ignore - import.meta.url is available in ESM contexts
    if (typeof import.meta !== 'undefined' && import.meta.url) {
      // @ts-ignore
      return new URL('../../../../wasm/blsct.mjs', import.meta.url).href;
    }
  } catch {
    // Fallback for environments where import.meta is not available
  }
  // Fallback to relative path (may not work with bundlers)
  return './wasm/blsct.js';
}

/**
 * Load and initialize the WASM module
 * 
 * @param options - Loading options or legacy wasmPath string
 * @returns Promise resolving to the initialized WASM module
 * 
 * @example
 * // Automatic path resolution (recommended for bundlers)
 * await loadBlsctModule();
 * 
 * @example
 * // Custom WASM path
 * await loadBlsctModule({ wasmPath: '/assets/wasm/blsct.js' });
 * 
 * @example
 * // Pre-loaded WASM binary (for inline/bundled WASM)
 * const wasmBinary = await fetch('/wasm/blsct.wasm').then(r => r.arrayBuffer());
 * await loadBlsctModule({ wasmBinary });
 */
export async function loadBlsctModule(
  options?: string | LoadBlsctModuleOptions
): Promise<BlsctWasmModule> {
  if (moduleInstance) {
    return moduleInstance;
  }

  if (modulePromise) {
    return modulePromise;
  }

  // Handle legacy string parameter (wasmPath)
  const opts: LoadBlsctModuleOptions = typeof options === 'string' 
    ? { wasmPath: options } 
    : (options || {});

  modulePromise = (async () => {
    let BlsctModuleFactory: BlsctModuleFactory;
    let moduleUrl = opts.wasmPath || getDefaultWasmPath();

    try {
      // In Node.js, convert absolute paths to file:// URLs for dynamic import
      const isNode = typeof process !== 'undefined' && process.versions?.node;
      if (isNode && moduleUrl.startsWith('/')) {
        // Use pathToFileURL for proper file:// URL conversion
        const { pathToFileURL } = await import('url');
        moduleUrl = pathToFileURL(moduleUrl).href;
      }
      
      const module = await import(/* webpackIgnore: true */ moduleUrl);
      
      // Handle both ESM default export and CommonJS module.exports
      BlsctModuleFactory = module.default;
      
      // If default is not a function, try other common patterns
      if (typeof BlsctModuleFactory !== 'function') {
        // Try the module itself (CommonJS pattern)
        if (typeof module === 'function') {
          BlsctModuleFactory = module;
        }
        // Try named export BlsctModule
        else if (typeof module.BlsctModule === 'function') {
          BlsctModuleFactory = module.BlsctModule;
        }
        // Try the entire module object as factory
        else if (typeof module === 'object' && module !== null) {
          // Some bundlers wrap the factory in the module object
          const keys = Object.keys(module);
          for (const key of keys) {
            if (typeof module[key] === 'function') {
              BlsctModuleFactory = module[key];
              break;
            }
          }
        }
      }
      
      if (typeof BlsctModuleFactory !== 'function') {
        throw new Error(
          `WASM module loaded but factory function not found. ` +
          `Module type: ${typeof module}, keys: ${Object.keys(module || {}).join(', ')}`
        );
      }
    } catch (err) {
      const originalMessage =
        err instanceof Error
          ? `${err.message}${err.stack ? `\nStack trace:\n${err.stack}` : ''}`
          : String(err);
      throw new Error(
        `Failed to load WASM module from "${moduleUrl}". ` +
        `Ensure the WASM files are built and accessible. ` +
        `If using a bundler, you may need to configure it to handle WASM files. ` +
        `Original error: ${originalMessage}`
      );
    }

    // Calculate WASM binary path for locateFile
    const wasmBinaryUrl = moduleUrl.replace(/\.m?js$/, '.wasm');

    const config: BlsctModuleConfig = {
      locateFile: (path: string, prefix: string) => {
        if (path.endsWith('.wasm')) {
          // Use the calculated WASM binary path
          return wasmBinaryUrl;
        }
        return prefix + path;
      },
      print: console.log,
      printErr: console.error,
    };
    
    // If wasmBinary is provided, use it directly
    if (opts.wasmBinary) {
      config.wasmBinary = opts.wasmBinary;
    }

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

