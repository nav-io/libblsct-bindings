/**
 * BLSCT library bindings for browser (WASM)
 * 
 * This module provides the core cryptographic functions for the
 * Navio BLSCT (BLS Confidential Transactions) library using WebAssembly.
 */

import {
  getBlsctModule,
  allocString,
  readString,
  freePtr,
  freeObj as freeObjPtr,
  parseRetVal,
  parseCTxRetVal,
  type BlsctResult,
} from './bindings/wasm/index.js';

import { unwrapPtr } from './managedObj';

// Re-export initialization and utilities
export { loadBlsctModule, isModuleLoaded } from './bindings/wasm/index.js';
export { assertSuccess, type BlsctResult } from './bindings/wasm/memory.js';

// ============================================================================
// Emscripten i64 Helpers
// ============================================================================

/**
 * Split a number into low and high 32-bit parts for Emscripten i64 ABI.
 * Emscripten without WASM_BIGINT splits i64 into two i32 values (lo, hi).
 */
function splitI64(value: number): [number, number] {
  const lo = value >>> 0; // unsigned 32-bit low part
  const hi = (value / 0x100000000) >>> 0; // high 32 bits
  return [lo, hi];
}

// ============================================================================
// Constants
// ============================================================================

export const CTX_ID_SIZE = 32;
export const POINT_SIZE = 48;
export const SCRIPT_SIZE = 28;
export const BLSCT_IN_AMOUNT_ERROR = 14;
export const BLSCT_OUT_AMOUNT_ERROR = 15;

// ============================================================================
// Enums
// ============================================================================

export enum BlsctChain {
  Mainnet = 0,
  Testnet = 1,
  Signet = 2,
  Regtest = 3,
}

export enum TxOutputType {
  Normal = 0,
  StakedCommitment = 1,
}

// ============================================================================
// Return Value Types
// ============================================================================

export interface BlsctRetVal {
  value: unknown;
  value_size: number;
  result: number;
}

export interface BlsctAmountsRetVal {
  result: number;
  value: unknown;
  _structPtr?: number;  // Internal: WASM struct pointer for cleanup
}

export interface BlsctBoolRetVal {
  value: boolean;
  result: number;
}

export interface BlsctCTxRetVal {
  result: number;
  ctx: unknown;
  in_amount_err_index: number;
  out_amount_err_index: number;
}

// Address encoding constants
export const Bech32 = 0;
export const Bech32M = 1;

// ============================================================================
// Chain Configuration
// ============================================================================

export function getChain(): BlsctChain {
  const module = getBlsctModule();
  return module._get_blsct_chain();
}

export function setChain(chain: BlsctChain): void {
  const module = getBlsctModule();
  module._set_blsct_chain(chain);
}

// ============================================================================
// Address Functions
// ============================================================================

export function decodeAddress(addrStr: string): BlsctRetVal {
  const module = getBlsctModule();
  const strPtr = allocString(addrStr);
  try {
    const resultPtr = module._decode_address(strPtr);
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return {
      result: result.success ? 0 : (result.errorCode ?? 1),
      value: result.value,
      value_size: 0,
    };
  } finally {
    freePtr(strPtr);
  }
}

export function encodeAddress(dpk: unknown, encoding: number): BlsctRetVal {
  const module = getBlsctModule();
  const resultPtr = module._encode_address(dpk as number, encoding);
  const result = parseRetVal(resultPtr);
  
  if (result.success && result.value !== null && result.value !== 0) {
    // Read the string BEFORE freeing the struct
    const str = readString(result.value);
    // Free the string pointer (allocated by C++ MALLOC_BYTES)
    freePtr(result.value);
    // Free the BlsctRetVal struct
    freePtr(resultPtr);
    return { result: 0, value: str, value_size: str.length };
  }
  // Free the BlsctRetVal struct even on failure
  freePtr(resultPtr);
  return { result: result.errorCode ?? 1, value: null, value_size: 0 };
}

// ============================================================================
// Scalar Functions
// ============================================================================

export function genRandomScalar(): BlsctRetVal {
  const module = getBlsctModule();
  const resultPtr = module._gen_random_scalar();
  const result = parseRetVal(resultPtr);
  freePtr(resultPtr);
  return {
    result: result.success ? 0 : (result.errorCode ?? 1),
    value: result.value,
    value_size: 0,
  };
}

export function genScalar(value: number): BlsctRetVal {
  const module = getBlsctModule();
  // Emscripten with BigInt support expects i64 as BigInt
  const resultPtr = module._gen_scalar(BigInt(value));
  const result = parseRetVal(resultPtr);
  freePtr(resultPtr);
  return {
    result: result.success ? 0 : (result.errorCode ?? 1),
    value: result.value,
    value_size: 0,
  };
}

export function serializeScalar(scalar: unknown): string {
  const module = getBlsctModule();
  const strPtr = module._serialize_scalar(scalar as number);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

export function deserializeScalar(hex: string): BlsctRetVal {
  const module = getBlsctModule();
  const strPtr = allocString(hex);
  try {
    const resultPtr = module._deserialize_scalar(strPtr);
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return {
      result: result.success ? 0 : (result.errorCode ?? 1),
      value: result.value,
      value_size: 0,
    };
  } finally {
    freePtr(strPtr);
  }
}

export function areScalarEqual(a: unknown, b: unknown): boolean {
  const module = getBlsctModule();
  return module._are_scalar_equal(a as number, b as number) !== 0;
}

export function scalarToUint64(scalar: unknown): bigint {
  const module = getBlsctModule();
  return module._scalar_to_uint64(scalar as number);
}

// ============================================================================
// Point Functions
// ============================================================================

export function genRandomPoint(): BlsctRetVal {
  const module = getBlsctModule();
  const resultPtr = module._gen_random_point();
  const result = parseRetVal(resultPtr);
  freePtr(resultPtr);
  return {
    result: result.success ? 0 : (result.errorCode ?? 1),
    value: result.value,
    value_size: 0,
  };
}

export function genBasePoint(): BlsctRetVal {
  const module = getBlsctModule();
  const resultPtr = module._gen_base_point();
  const result = parseRetVal(resultPtr);
  freePtr(resultPtr);
  return {
    result: result.success ? 0 : (result.errorCode ?? 1),
    value: result.value,
    value_size: 0,
  };
}

export function serializePoint(point: unknown): string {
  const module = getBlsctModule();
  const strPtr = module._serialize_point(point as number);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

export function deserializePoint(hex: string): BlsctRetVal {
  const module = getBlsctModule();
  const strPtr = allocString(hex);
  try {
    const resultPtr = module._deserialize_point(strPtr);
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return {
      result: result.success ? 0 : (result.errorCode ?? 1),
      value: result.value,
      value_size: 0,
    };
  } finally {
    freePtr(strPtr);
  }
}

export function isValidPoint(point: unknown): boolean {
  const module = getBlsctModule();
  return module._is_valid_point(point as number) !== 0;
}

export function arePointEqual(a: unknown, b: unknown): boolean {
  const module = getBlsctModule();
  return module._are_point_equal(a as number, b as number) !== 0;
}

export function pointFromScalar(scalar: unknown): unknown {
  const module = getBlsctModule();
  return module._point_from_scalar(scalar as number);
}

export function pointToStr(point: unknown): string {
  const module = getBlsctModule();
  const strPtr = module._point_to_str(point as number);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

export function scalarMultiplyPoint(point: unknown, scalar: unknown): unknown {
  const module = getBlsctModule();
  // Note: typo in the underlying C function name (muliply instead of multiply)
  return module._scalar_muliply_point(point as number, scalar as number);
}

// ============================================================================
// Public Key Functions
// ============================================================================

export function genRandomPublicKey(): BlsctRetVal {
  const module = getBlsctModule();
  const resultPtr = module._gen_random_public_key();
  const result = parseRetVal(resultPtr);
  freePtr(resultPtr);
  return {
    result: result.success ? 0 : (result.errorCode ?? 1),
    value: result.value,
    value_size: 0,
  };
}

export function scalarToPubKey(scalar: unknown): unknown {
  const module = getBlsctModule();
  return module._scalar_to_pub_key(scalar as number);
}

export function getPublicKeyPoint(pubKey: unknown): unknown {
  const module = getBlsctModule();
  return module._get_public_key_point(pubKey as number);
}

export function pointToPublicKey(point: unknown): unknown {
  const module = getBlsctModule();
  return module._point_to_public_key(point as number);
}

export function calcNonce(blindingPubKey: unknown, viewKey: unknown): unknown {
  const module = getBlsctModule();
  return module._calc_nonce(blindingPubKey as number, viewKey as number);
}

// ============================================================================
// Double Public Key Functions
// ============================================================================

export function genDoublePubKey(pk1: unknown, pk2: unknown): BlsctRetVal {
  const module = getBlsctModule();
  const resultPtr = module._gen_double_pub_key(pk1 as number, pk2 as number);
  const result = parseRetVal(resultPtr);
  freePtr(resultPtr);
  return {
    result: result.success ? 0 : (result.errorCode ?? 1),
    value: result.value,
    value_size: 0,
  };
}

export function genDpkWithKeysAcctAddr(
  viewKey: unknown,
  spendingPubKey: unknown,
  account: number,
  address: number
): unknown {
  const module = getBlsctModule();
  return module._gen_dpk_with_keys_acct_addr(
    viewKey as number,
    spendingPubKey as number,
    BigInt(account),
    BigInt(address)
  );
}

export function serializeDpk(dpk: unknown): string {
  const module = getBlsctModule();
  const strPtr = module._serialize_dpk(dpk as number);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

export function deserializeDpk(hex: string): BlsctRetVal {
  const module = getBlsctModule();
  const strPtr = allocString(hex);
  try {
    const resultPtr = module._deserialize_dpk(strPtr);
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return {
      result: result.success ? 0 : (result.errorCode ?? 1),
      value: result.value,
      value_size: 0,
    };
  } finally {
    freePtr(strPtr);
  }
}

// ============================================================================
// Token ID Functions
// ============================================================================

export function genTokenId(token: number): BlsctRetVal {
  const module = getBlsctModule();
  const resultPtr = module._gen_token_id(BigInt(token));
  const result = parseRetVal(resultPtr);
  freePtr(resultPtr);
  return {
    result: result.success ? 0 : (result.errorCode ?? 1),
    value: result.value,
    value_size: 0,
  };
}

export function genTokenIdWithSubid(token: number, subid: number): BlsctRetVal {
  const module = getBlsctModule();
  const resultPtr = module._gen_token_id_with_token_and_subid(BigInt(token), BigInt(subid));
  const result = parseRetVal(resultPtr);
  freePtr(resultPtr);
  return {
    result: result.success ? 0 : (result.errorCode ?? 1),
    value: result.value,
    value_size: 0,
  };
}

export function genDefaultTokenId(): BlsctRetVal {
  const module = getBlsctModule();
  const resultPtr = module._gen_default_token_id();
  const result = parseRetVal(resultPtr);
  freePtr(resultPtr);
  return {
    result: result.success ? 0 : (result.errorCode ?? 1),
    value: result.value,
    value_size: 0,
  };
}

export function getTokenIdToken(tokenId: unknown): bigint {
  const module = getBlsctModule();
  return module._get_token_id_token(tokenId as number);
}

export function getTokenIdSubid(tokenId: unknown): bigint {
  const module = getBlsctModule();
  return module._get_token_id_subid(tokenId as number);
}

export function serializeTokenId(tokenId: unknown): string {
  const module = getBlsctModule();
  const strPtr = module._serialize_token_id(tokenId as number);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

export function deserializeTokenId(hex: string): BlsctRetVal {
  const module = getBlsctModule();
  const strPtr = allocString(hex);
  try {
    const resultPtr = module._deserialize_token_id(strPtr);
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return {
      result: result.success ? 0 : (result.errorCode ?? 1),
      value: result.value,
      value_size: 0,
    };
  } finally {
    freePtr(strPtr);
  }
}

// ============================================================================
// Sub Address Functions
// ============================================================================

export function genSubAddrId(account: number, address: number): unknown {
  const module = getBlsctModule();
  return module._gen_sub_addr_id(BigInt(account), BigInt(address));
}

export function deriveSubAddress(
  viewKey: unknown,
  spendingPubKey: unknown,
  subAddrId: unknown
): unknown {
  const module = getBlsctModule();
  return module._derive_sub_address(
    viewKey as number,
    spendingPubKey as number,
    subAddrId as number
  );
}

export function subAddrToDpk(subAddr: unknown): unknown {
  const module = getBlsctModule();
  return module._sub_addr_to_dpk(subAddr as number);
}

export function dpkToSubAddr(dpk: unknown): BlsctRetVal {
  const module = getBlsctModule();
  const resultPtr = module._dpk_to_sub_addr(dpk as number);
  const result = parseRetVal(resultPtr);
  freePtr(resultPtr);
  return {
    result: result.success ? 0 : (result.errorCode ?? 1),
    value: result.value,
    value_size: 0,
  };
}

export function serializeSubAddr(subAddr: unknown): string {
  const module = getBlsctModule();
  const strPtr = module._serialize_sub_addr(subAddr as number);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

export function deserializeSubAddr(hex: string): BlsctRetVal {
  const module = getBlsctModule();
  const strPtr = allocString(hex);
  try {
    const resultPtr = module._deserialize_sub_addr(strPtr);
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return {
      result: result.success ? 0 : (result.errorCode ?? 1),
      value: result.value,
      value_size: 0,
    };
  } finally {
    freePtr(strPtr);
  }
}

export function serializeSubAddrId(subAddrId: unknown): string {
  const module = getBlsctModule();
  const strPtr = module._serialize_sub_addr_id(subAddrId as number);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

export function deserializeSubAddrId(hex: string): BlsctRetVal {
  const module = getBlsctModule();
  const strPtr = allocString(hex);
  try {
    const resultPtr = module._deserialize_sub_addr_id(strPtr);
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return {
      result: result.success ? 0 : (result.errorCode ?? 1),
      value: result.value,
      value_size: 0,
    };
  } finally {
    freePtr(strPtr);
  }
}

// ============================================================================
// Key Derivation Functions
// ============================================================================

export function fromSeedToChildKey(seed: unknown): unknown {
  const module = getBlsctModule();
  return module._from_seed_to_child_key(seed as number);
}

export function fromChildKeyToBlindingKey(childKey: unknown): unknown {
  const module = getBlsctModule();
  return module._from_child_key_to_blinding_key(childKey as number);
}

export function fromChildKeyToTokenKey(childKey: unknown): unknown {
  const module = getBlsctModule();
  return module._from_child_key_to_token_key(childKey as number);
}

export function fromChildKeyToTxKey(childKey: unknown): unknown {
  const module = getBlsctModule();
  return module._from_child_key_to_tx_key(childKey as number);
}

export function fromTxKeyToViewKey(txKey: unknown): unknown {
  const module = getBlsctModule();
  return module._from_tx_key_to_view_key(txKey as number);
}

export function fromTxKeyToSpendingKey(txKey: unknown): unknown {
  const module = getBlsctModule();
  return module._from_tx_key_to_spending_key(txKey as number);
}

export function calcPrivSpendingKey(
  blindingPubKey: unknown,
  viewKey: unknown,
  spendingKey: unknown,
  account: number,
  address: number
): unknown {
  const module = getBlsctModule();
  return module._calc_priv_spending_key(
    blindingPubKey as number,
    viewKey as number,
    spendingKey as number,
    BigInt(account),
    BigInt(address)
  );
}

// ============================================================================
// Signature Functions
// ============================================================================

export function signMessage(privKey: unknown, msg: string): unknown {
  const module = getBlsctModule();
  const msgPtr = allocString(msg);
  try {
    return module._sign_message(privKey as number, msgPtr);
  } finally {
    freePtr(msgPtr);
  }
}

export function verifyMsgSig(
  pubKey: unknown,
  msg: string,
  signature: unknown
): boolean {
  const module = getBlsctModule();
  const msgPtr = allocString(msg);
  try {
    const result = module._verify_msg_sig(
      pubKey as number,
      msgPtr,
      signature as number
    ) as unknown as number;
    return result !== 0;
  } finally {
    freePtr(msgPtr);
  }
}

export function serializeSignature(signature: unknown): string {
  const module = getBlsctModule();
  const strPtr = module._serialize_signature(signature as number);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

export function deserializeSignature(hex: string): BlsctRetVal {
  const module = getBlsctModule();
  const strPtr = allocString(hex);
  try {
    const resultPtr = module._deserialize_signature(strPtr);
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return {
      result: result.success ? 0 : (result.errorCode ?? 1),
      value: result.value,
      value_size: 0,
    };
  } finally {
    freePtr(strPtr);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

export function calcViewTag(blindingPubKey: unknown, viewKey: unknown): bigint {
  const module = getBlsctModule();
  return module._calc_view_tag(blindingPubKey as number, viewKey as number);
}

export function calcKeyId(
  blindingPubKey: unknown,
  spendingPubKey: unknown,
  viewKey: unknown
): unknown {
  const module = getBlsctModule();
  return module._calc_key_id(
    blindingPubKey as number,
    spendingPubKey as number,
    viewKey as number
  );
}

export function serializeKeyId(keyId: unknown): string {
  const module = getBlsctModule();
  const strPtr = module._serialize_key_id(keyId as number);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

export function deserializeKeyId(hex: string): BlsctRetVal {
  const module = getBlsctModule();
  const strPtr = allocString(hex);
  try {
    const resultPtr = module._deserialize_key_id(strPtr);
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return {
      result: result.success ? 0 : (result.errorCode ?? 1),
      value: result.value,
      value_size: 0,
    };
  } finally {
    freePtr(strPtr);
  }
}

// ============================================================================
// Out Point Functions
// ============================================================================

export function genOutPoint(serCtxId: string): BlsctRetVal {
  const module = getBlsctModule();
  const strPtr = allocString(serCtxId);
  try {
    const resultPtr = module._gen_out_point(strPtr);
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return {
      result: result.success ? 0 : (result.errorCode ?? 1),
      value: result.value,
      value_size: 0,
    };
  } finally {
    freePtr(strPtr);
  }
}

export function serializeOutPoint(outPoint: unknown): string {
  const module = getBlsctModule();
  const strPtr = module._serialize_out_point(outPoint as number);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

export function deserializeOutPoint(hex: string): BlsctRetVal {
  const module = getBlsctModule();
  const strPtr = allocString(hex);
  try {
    const resultPtr = module._deserialize_out_point(strPtr);
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return {
      result: result.success ? 0 : (result.errorCode ?? 1),
      value: result.value,
      value_size: 0,
    };
  } finally {
    freePtr(strPtr);
  }
}

// ============================================================================
// Script Functions
// ============================================================================

export function serializeScript(script: unknown): string {
  const module = getBlsctModule();
  const strPtr = module._serialize_script(script as number);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

export function deserializeScript(hex: string): BlsctRetVal {
  const module = getBlsctModule();
  const strPtr = allocString(hex);
  try {
    const resultPtr = module._deserialize_script(strPtr);
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return {
      result: result.success ? 0 : (result.errorCode ?? 1),
      value: result.value,
      value_size: 0,
    };
  } finally {
    freePtr(strPtr);
  }
}

// ============================================================================
// CTx Serialization Functions
// ============================================================================

export function serializeCTx(ctx: unknown): string {
  const module = getBlsctModule();
  const strPtr = module._serialize_ctx(ctx as number);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

export function deserializeCTx(hex: string): BlsctRetVal {
  const module = getBlsctModule();
  const strPtr = allocString(hex);
  try {
    const resultPtr = module._deserialize_ctx(strPtr);
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return {
      result: result.success ? 0 : (result.errorCode ?? 1),
      value: result.value,
      value_size: result.valueSize ?? 0,
    };
  } finally {
    freePtr(strPtr);
  }
}

// ============================================================================
// CTx ID Functions
// ============================================================================

export function serializeCTxId(ctxId: unknown): string {
  const module = getBlsctModule();
  const strPtr = module._serialize_ctx_id(ctxId as number);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

// ============================================================================
// Memory Management
// ============================================================================

/**
 * Free a BLSCT object. Handles both:
 * - Pointer values (numbers) - calls the WASM _free_obj function
 * - BlsctRetVal objects - no-op (these are plain JS objects, nothing to free)
 */
export function freeObj(obj: unknown): void {
  if (typeof obj === 'number' && obj !== 0) {
    freeObjPtr(obj);
  }
  // For objects (like BlsctRetVal), strings, null, etc. - nothing to free
}

export async function runGc(): Promise<void> {
  // In the browser, we rely on automatic garbage collection
  return Promise.resolve();
}

export function hexToMallocedBuf(hex: string): unknown {
  const module = getBlsctModule();
  const strPtr = allocString(hex);
  try {
    return module._hex_to_malloced_buf(strPtr);
  } finally {
    freePtr(strPtr);
  }
}

export function toHex(buf: unknown, size: number): string {
  const module = getBlsctModule();
  const strPtr = module._buf_to_malloced_hex_c_str(buf as number, size);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

export function getValueAsCStr(rv: BlsctRetVal): string {
  // Handle case where value is already a string (e.g., from encodeAddress)
  if (typeof rv.value === 'string') {
    return rv.value;
  }
  return readString(rv.value as number);
}

// ============================================================================
// Range Proof Functions (stubs for API compatibility)
// ============================================================================

export function createUint64Vec(): unknown {
  const module = getBlsctModule();
  return module._create_uint64_vec();
}

export function addToUint64Vec(vec: unknown, n: number): void {
  const module = getBlsctModule();
  module._add_to_uint64_vec(vec as number, BigInt(n));
}

export function deleteUint64Vec(vec: unknown): void {
  const module = getBlsctModule();
  module._delete_uint64_vec(vec as number);
}

export function buildRangeProof(
  amounts: unknown,
  nonce: unknown,
  msg: string,
  tokenId: unknown
): BlsctRetVal {
  const module = getBlsctModule();
  const msgPtr = allocString(msg);
  try {
    const resultPtr = module._build_range_proof(
      amounts as number,
      nonce as number,
      msgPtr,
      tokenId as number
    );
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return {
      result: result.success ? 0 : (result.errorCode ?? 1),
      value: result.value,
      value_size: result.valueSize ?? 0,
    };
  } finally {
    freePtr(msgPtr);
  }
}

export function serializeRangeProof(rangeProof: unknown, rangeProofSize: number): string {
  const module = getBlsctModule();
  const strPtr = module._serialize_range_proof(rangeProof as number, rangeProofSize);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

export function deserializeRangeProof(hex: string): BlsctRetVal {
  if (hex.length % 2 !== 0) {
    return { result: 1, value: null, value_size: 0 };
  }
  const objSize = hex.length / 2;
  const module = getBlsctModule();
  const strPtr = allocString(hex);
  try {
    const resultPtr = module._deserialize_range_proof(strPtr, objSize);
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return {
      result: result.success ? 0 : (result.errorCode ?? 1),
      value: result.value,
      value_size: objSize,
    };
  } finally {
    freePtr(strPtr);
  }
}

export function createRangeProofVec(): unknown {
  const module = getBlsctModule();
  return module._create_range_proof_vec();
}

export function addToRangeProofVec(
  rangeProofs: unknown,
  rangeProof: unknown,
  rangeProofSize: number
): void {
  const module = getBlsctModule();
  module._add_to_range_proof_vec(
    rangeProofs as number,
    rangeProof as number,
    rangeProofSize
  );
}

export function deleteRangeProofVec(rangeProofs: unknown): void {
  const module = getBlsctModule();
  module._delete_range_proof_vec(rangeProofs as number);
}

export function verifyRangeProofs(rangeProofsVec: unknown): BlsctBoolRetVal {
  const module = getBlsctModule();
  const resultPtr = module._verify_range_proofs(rangeProofsVec as number);
  
  // Check for null pointer - indicates WASM error (memory allocation failure, exception, etc.)
  if (resultPtr === 0) {
    return { result: 1, value: false };
  }
  
  // BlsctBoolRetVal struct layout: result (uint8_t @ offset 0), value (bool @ offset 1)
  const result = module.HEAPU8[resultPtr];
  const value = module.HEAPU8[resultPtr + 1] !== 0;
  freePtr(resultPtr);
  return { result, value };
}

// ============================================================================
// Amount Recovery Functions
// ============================================================================

export function createAmountRecoveryReqVec(): unknown {
  const module = getBlsctModule();
  return module._create_amount_recovery_req_vec();
}

export function addToAmountRecoveryReqVec(reqs: unknown, req: unknown): void {
  const module = getBlsctModule();
  module._add_to_amount_recovery_req_vec(reqs as number, req as number);
}

export function deleteAmountRecoveryReqVec(reqs: unknown): void {
  const module = getBlsctModule();
  module._delete_amount_recovery_req_vec(reqs as number);
}

export function genAmountRecoveryReq(
  rangeProof: unknown,
  rangeProofSize: number,
  nonce: unknown,
  tokenId: unknown
): unknown {
  const module = getBlsctModule();
  return module._gen_amount_recovery_req(
    rangeProof as number,
    rangeProofSize,
    nonce as number
  );
}

export function recoverAmount(vec: unknown): BlsctAmountsRetVal {
  const module = getBlsctModule();
  const ptr = module._recover_amount(vec as number);
  
  if (ptr === 0) {
    return { result: 1, value: null, _structPtr: 0 };
  }
  
  // BlsctAmountsRetVal struct layout:
  // - result: uint8_t (1 byte) at offset 0
  // - padding: 3 bytes
  // - value: void* (4 bytes in WASM32) at offset 4
  const RESULT_OFFSET = 0;
  const VALUE_PTR_OFFSET = 4;
  
  const result = module.HEAPU8[ptr + RESULT_OFFSET];
  const valuePtrIndex = (ptr + VALUE_PTR_OFFSET) >> 2;
  const valuePtr = module.HEAPU32[valuePtrIndex];
  
  // Store original struct pointer for proper cleanup
  return { result, value: valuePtr, _structPtr: ptr };
}

export function getAmountRecoveryResultSize(resVec: unknown): number {
  const module = getBlsctModule();
  return module._get_amount_recovery_result_size(resVec as number);
}

export function getAmountRecoveryResultIsSucc(req: unknown, i: number): boolean {
  const module = getBlsctModule();
  // WASM returns an integer (0 or 1), need to cast through unknown to convert to boolean
  const result = module._get_amount_recovery_result_is_succ(req as number, i) as unknown as number;
  return result !== 0;
}

export function getAmountRecoveryResultAmount(req: unknown, i: number): bigint {
  const module = getBlsctModule();
  return module._get_amount_recovery_result_amount(req as number, i);
}

export function getAmountRecoveryResultMsg(req: unknown, i: number): string {
  const module = getBlsctModule();
  const strPtr = module._get_amount_recovery_result_msg(req as number, i);
  const str = readString(strPtr);
  // Don't free strPtr here - it points into the result vector and will be
  // freed by free_amounts_ret_val via deleteAmountsRetVal
  return str;
}

export function deleteAmountsRetVal(rv: BlsctAmountsRetVal): void {
  const module = getBlsctModule();
  // In WASM, we need the struct pointer (stored in _structPtr), not the value pointer
  const structPtr = rv._structPtr;
  if (structPtr) {
    module._free_amounts_ret_val(structPtr);
  }
}

// ============================================================================
// Transaction Building Functions
// ============================================================================

export function createTxInVec(): unknown {
  const module = getBlsctModule();
  return module._create_tx_in_vec();
}

export function addToTxInVec(vec: unknown, txIn: unknown): void {
  const module = getBlsctModule();
  module._add_to_tx_in_vec(vec as number, txIn as number);
}

export function deleteTxInVec(txInVec: unknown): void {
  const module = getBlsctModule();
  module._delete_tx_in_vec(txInVec as number);
}

export function createTxOutVec(): unknown {
  const module = getBlsctModule();
  return module._create_tx_out_vec();
}

export function addToTxOutVec(vec: unknown, txOut: unknown): void {
  const module = getBlsctModule();
  module._add_to_tx_out_vec(vec as number, txOut as number);
}

export function deleteTxOutVec(txOutVec: unknown): void {
  const module = getBlsctModule();
  module._delete_tx_out_vec(txOutVec as number);
}

export function buildTxIn(
  amount: number,
  gamma: number,
  spendingKey: unknown,
  tokenId: unknown,
  outPoint: unknown,
  isStakedCommitment: boolean,
  isRbf: boolean
): BlsctRetVal {
  const module = getBlsctModule();
  const resultPtr = module._build_tx_in(
    BigInt(amount),
    BigInt(gamma),
    spendingKey as number,
    tokenId as number,
    outPoint as number,
    isStakedCommitment,
    isRbf
  );
  const result = parseRetVal(resultPtr);
  freePtr(resultPtr);
  return {
    result: result.success ? 0 : (result.errorCode ?? 1),
    value: result.value,
    value_size: result.valueSize ?? 0,
  };
}

export function buildTxOut(
  subAddr: unknown,
  amount: number,
  memo: string,
  tokenId: unknown,
  outputType: TxOutputType,
  minStake: number,
  subtractFeeFromAmount: boolean = false,
  blindingKey: unknown = 0
): BlsctRetVal {
  const module = getBlsctModule();
  const memoPtr = allocString(memo);
  try {
    const resultPtr = module._build_tx_out(
      subAddr as number,
      BigInt(amount),
      memoPtr,
      tokenId as number,
      outputType,
      BigInt(minStake),
      subtractFeeFromAmount,
      blindingKey as number
    );
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return {
      result: result.success ? 0 : (result.errorCode ?? 1),
      value: result.value,
      value_size: result.valueSize ?? 0,
    };
  } finally {
    freePtr(memoPtr);
  }
}

export function buildCTx(txIns: unknown, txOuts: unknown): BlsctCTxRetVal {
  const module = getBlsctModule();
  const resultPtr = module._build_ctx(txIns as number, txOuts as number);
  const parsed = parseCTxRetVal(resultPtr);
  freePtr(resultPtr);
  return parsed;
}

export function deleteCTx(ctx: unknown): void {
  const module = getBlsctModule();
  module._delete_ctx(ctx as number);
}

export function getCTxId(ctx: unknown): string {
  const module = getBlsctModule();
  const strPtr = module._get_ctx_id(ctx as number);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

export function getCTxIns(ctx: unknown): unknown {
  const module = getBlsctModule();
  return module._get_ctx_ins(ctx as number);
}

export function getCTxInsSize(ctxIns: unknown): number {
  const module = getBlsctModule();
  return module._get_ctx_ins_size(ctxIns as number);
}

export function getCTxInAt(ctxIns: unknown, i: number): unknown {
  const module = getBlsctModule();
  return module._get_ctx_in_at(ctxIns as number, i);
}

export function getCTxOuts(ctx: unknown): unknown {
  const module = getBlsctModule();
  return module._get_ctx_outs(ctx as number);
}

export function getCTxOutsSize(ctxOuts: unknown): number {
  const module = getBlsctModule();
  return module._get_ctx_outs_size(ctxOuts as number);
}

export function getCTxOutAt(ctxOuts: unknown, i: number): unknown {
  const module = getBlsctModule();
  return module._get_ctx_out_at(ctxOuts as number, i);
}

// CTxIn accessors
export function getCTxInPrevOutHash(obj: unknown): unknown {
  const module = getBlsctModule();
  return module._get_ctx_in_prev_out_hash(obj as number);
}

export function getCTxInScriptSig(obj: unknown): unknown {
  const module = getBlsctModule();
  return module._get_ctx_in_script_sig(obj as number);
}

export function getCTxInSequence(obj: unknown): number {
  const module = getBlsctModule();
  return module._get_ctx_in_sequence(obj as number);
}

export function getCTxInScriptWitness(obj: unknown): unknown {
  const module = getBlsctModule();
  return module._get_ctx_in_script_witness(obj as number);
}

// CTxOut accessors
export function getCTxOutValue(obj: unknown): bigint {
  const module = getBlsctModule();
  return module._get_ctx_out_value(obj as number);
}

export function getCTxOutScriptPubkey(obj: unknown): unknown {
  const module = getBlsctModule();
  return module._get_ctx_out_script_pub_key(obj as number);
}

export function getCTxOutTokenId(obj: unknown): unknown {
  const module = getBlsctModule();
  return module._get_ctx_out_token_id(obj as number);
}

export function getCTxOutVectorPredicate(obj: unknown): BlsctRetVal {
  const module = getBlsctModule();
  const resultPtr = module._get_ctx_out_vector_predicate(obj as number);
  const result = parseRetVal(resultPtr);
  freePtr(resultPtr);
  return {
    result: result.success ? 0 : (result.errorCode ?? 1),
    value: result.value,
    value_size: 0,
  };
}

export function getCTxOutBlindingKey(obj: unknown): unknown {
  const module = getBlsctModule();
  return module._get_ctx_out_blinding_key(obj as number);
}

export function getCTxOutEphemeralKey(obj: unknown): unknown {
  const module = getBlsctModule();
  return module._get_ctx_out_ephemeral_key(obj as number);
}

export function getCTxOutSpendingKey(obj: unknown): unknown {
  const module = getBlsctModule();
  return module._get_ctx_out_spending_key(obj as number);
}

export function getCTxOutRangeProof(obj: unknown): BlsctRetVal {
  const module = getBlsctModule();
  const resultPtr = module._get_ctx_out_range_proof(obj as number);
  const result = parseRetVal(resultPtr);
  freePtr(resultPtr);
  return {
    result: result.success ? 0 : (result.errorCode ?? 1),
    value: result.value,
    value_size: result.valueSize ?? 0,
  };
}

export function getCTxOutViewTag(obj: unknown): number {
  const module = getBlsctModule();
  return module._get_ctx_out_view_tag(obj as number);
}

// TxIn accessors
export function getTxInAmount(obj: unknown): bigint {
  const module = getBlsctModule();
  return module._get_tx_in_amount(obj as number);
}

export function getTxInGamma(obj: unknown): bigint {
  const module = getBlsctModule();
  return module._get_tx_in_gamma(obj as number);
}

export function getTxInSpendingKey(obj: unknown): unknown {
  const module = getBlsctModule();
  return module._get_tx_in_spending_key(obj as number);
}

export function getTxInTokenId(obj: unknown): unknown {
  const module = getBlsctModule();
  return module._get_tx_in_token_id(obj as number);
}

export function getTxInOutPoint(obj: unknown): unknown {
  const module = getBlsctModule();
  return module._get_tx_in_out_point(obj as number);
}

export function getTxInStakedCommitment(obj: unknown): boolean {
  const module = getBlsctModule();
  // WASM returns an integer (0 or 1), need to cast through unknown to convert to boolean
  const result = module._get_tx_in_staked_commitment(obj as number) as unknown as number;
  return result !== 0;
}

export function getTxInRbf(obj: unknown): boolean {
  const module = getBlsctModule();
  // WASM returns an integer (0 or 1), need to cast through unknown to convert to boolean
  const result = module._get_tx_in_rbf(obj as number) as unknown as number;
  return result !== 0;
}

// TxOut accessors
export function getTxOutDestination(obj: unknown): unknown {
  const module = getBlsctModule();
  return module._get_tx_out_destination(obj as number);
}

export function getTxOutAmount(obj: unknown): bigint {
  const module = getBlsctModule();
  return module._get_tx_out_amount(obj as number);
}

export function getTxOutMemo(obj: unknown): string {
  const module = getBlsctModule();
  const strPtr = module._get_tx_out_memo(obj as number);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

export function getTxOutTokenId(obj: unknown): unknown {
  const module = getBlsctModule();
  return module._get_tx_out_token_id(obj as number);
}

export function getTxOutOutputType(obj: unknown): TxOutputType {
  const module = getBlsctModule();
  return module._get_tx_out_output_type(obj as number);
}

export function getTxOutMinStake(obj: unknown): bigint {
  const module = getBlsctModule();
  return module._get_tx_out_min_stake(obj as number);
}

// Note: These functions are not yet exposed in WASM - providing stubs
// TODO: Add to WASM exports in future version
export function getTxOutSubtractFeeFromAmount(_obj: unknown): boolean {
  // TxOut subtract_fee_from_amount not exposed in WASM yet
  return false;
}

export function getTxOutBlindingKey(_obj: unknown): unknown {
  // TxOut blinding_key not exposed in WASM yet - return null
  // For CTxOut, use getCTxOutBlindingKey instead
  return 0;
}

// Range proof field accessors
export function getRangeProof_A(rangeProof: unknown, rangeProofSize: number): unknown {
  const module = getBlsctModule();
  return module._get_range_proof_A(rangeProof as number, rangeProofSize);
}

export function getRangeProof_alpha_hat(rangeProof: unknown, rangeProofSize: number): unknown {
  const module = getBlsctModule();
  return module._get_range_proof_alpha_hat(rangeProof as number, rangeProofSize);
}

export function getRangeProof_A_wip(rangeProof: unknown, rangeProofSize: number): unknown {
  const module = getBlsctModule();
  return module._get_range_proof_A_wip(rangeProof as number, rangeProofSize);
}

export function getRangeProof_B(rangeProof: unknown, rangeProofSize: number): unknown {
  const module = getBlsctModule();
  return module._get_range_proof_B(rangeProof as number, rangeProofSize);
}

export function getRangeProof_delta_prime(rangeProof: unknown, rangeProofSize: number): unknown {
  const module = getBlsctModule();
  return module._get_range_proof_delta_prime(rangeProof as number, rangeProofSize);
}

export function getRangeProof_r_prime(rangeProof: unknown, rangeProofSize: number): unknown {
  const module = getBlsctModule();
  return module._get_range_proof_r_prime(rangeProof as number, rangeProofSize);
}

export function getRangeProof_s_prime(rangeProof: unknown, rangeProofSize: number): unknown {
  const module = getBlsctModule();
  return module._get_range_proof_s_prime(rangeProof as number, rangeProofSize);
}

export function getRangeProof_tau_x(rangeProof: unknown, rangeProofSize: number): unknown {
  const module = getBlsctModule();
  return module._get_range_proof_tau_x(rangeProof as number, rangeProofSize);
}

// Cast functions (no-ops in WASM as pointers are just numbers)
export function asString(obj: unknown): unknown { return obj; }
// Cast functions unwrap WASM pointers to return raw pointer values
export function castToCTxIn(obj: unknown): unknown { return unwrapPtr(obj); }
export function castToCTxOut(obj: unknown): unknown { return unwrapPtr(obj); }
export function castToDpk(obj: unknown): unknown { return unwrapPtr(obj); }
export function castToKeyId(obj: unknown): unknown { return unwrapPtr(obj); }
export function castToOutPoint(obj: unknown): unknown { return unwrapPtr(obj); }
export function castToPoint(obj: unknown): unknown { return unwrapPtr(obj); }
export function castToPubKey(obj: unknown): unknown { return unwrapPtr(obj); }
export function castToRangeProof(obj: unknown): unknown { return unwrapPtr(obj); }
export function castToScalar(obj: unknown): unknown { return unwrapPtr(obj); }
export function castToScript(obj: unknown): unknown { return unwrapPtr(obj); }
export function castToSignature(obj: unknown): unknown { return unwrapPtr(obj); }
export function castToSubAddr(obj: unknown): unknown { return unwrapPtr(obj); }
export function castToSubAddrId(obj: unknown): unknown { return unwrapPtr(obj); }
export function castToTokenId(obj: unknown): unknown { return unwrapPtr(obj); }
export function castToTxIn(obj: unknown): unknown { return unwrapPtr(obj); }
export function castToTxOut(obj: unknown): unknown { return unwrapPtr(obj); }
export function castToUint8_tPtr(obj: unknown): unknown { return unwrapPtr(obj); }

