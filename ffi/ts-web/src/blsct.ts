/**
 * BLSCT library bindings for browser
 * 
 * This module provides the core cryptographic functions for the
 * Navio BLSCT (BLS Confidential Transactions) library.
 */

import {
  getBlsctModule,
  allocString,
  readString,
  freePtr,
  freeObj,
  parseRetVal,
  type BlsctResult,
} from './wasm/index.js';

// Re-export initialization and utilities
export { loadBlsctModule, isModuleLoaded, assertSuccess } from './wasm/index.js';

// ============================================================================
// Constants
// ============================================================================

export const DOUBLE_PUBLIC_KEY_SIZE = 96;
export const KEY_ID_SIZE = 20;
export const POINT_SIZE = 48;
export const PUBLIC_KEY_SIZE = 48;
export const SCRIPT_SIZE = 28;
export const SIGNATURE_SIZE = 96;
export const SUB_ADDR_ID_SIZE = 16;
export const CTX_ID_SIZE = 32;
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

export enum AddressEncoding {
  Bech32 = 0,
  Bech32M = 1,
}

// ============================================================================
// Return Value Types
// ============================================================================

export interface BlsctRetVal {
  value: number;
  value_size: number;
  result: number;
}

export interface BlsctAmountsRetVal {
  result: number;
  value: number;
}

export interface BlsctBoolRetVal {
  value: boolean;
  result: number;
}

export interface BlsctCTxRetVal {
  result: number;
  ctx: number;
  in_amount_err_index: number;
  out_amount_err_index: number;
}

// ============================================================================
// Chain Configuration
// ============================================================================

/**
 * Get the current blockchain network configuration
 */
export function getChain(): BlsctChain {
  const module = getBlsctModule();
  return module._get_blsct_chain();
}

/**
 * Set the blockchain network configuration
 */
export function setChain(chain: BlsctChain): void {
  const module = getBlsctModule();
  module._set_blsct_chain(chain);
}

// ============================================================================
// Address Functions
// ============================================================================

/**
 * Decode a BLSCT address string to a double public key
 */
export function decodeAddress(addrStr: string): BlsctResult<number> {
  const module = getBlsctModule();
  const strPtr = allocString(addrStr);
  try {
    const resultPtr = module._decode_address(strPtr);
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return result;
  } finally {
    freePtr(strPtr);
  }
}

/**
 * Encode a double public key as a BLSCT address string
 */
export function encodeAddress(
  dpk: number,
  encoding: AddressEncoding = AddressEncoding.Bech32M
): BlsctResult<string> {
  const module = getBlsctModule();
  const resultPtr = module._encode_address(dpk, encoding);
  const result = parseRetVal(resultPtr);
  freePtr(resultPtr);
  
  if (result.success && result.value !== null) {
    const str = readString(result.value);
    return { success: true, value: str };
  }
  return { success: false, value: null, error: result.error };
}

// ============================================================================
// Scalar Functions
// ============================================================================

/**
 * Generate a random scalar value
 */
export function genRandomScalar(): BlsctResult<number> {
  const module = getBlsctModule();
  const resultPtr = module._gen_random_scalar();
  const result = parseRetVal(resultPtr);
  freePtr(resultPtr);
  return result;
}

/**
 * Generate a scalar from a numeric value
 */
export function genScalar(value: number | bigint): BlsctResult<number> {
  const module = getBlsctModule();
  const resultPtr = module._gen_scalar(BigInt(value));
  const result = parseRetVal(resultPtr);
  freePtr(resultPtr);
  return result;
}

/**
 * Serialize a scalar to a hex string
 */
export function serializeScalar(scalar: number): string {
  const module = getBlsctModule();
  const strPtr = module._serialize_scalar(scalar);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

/**
 * Deserialize a scalar from a hex string
 */
export function deserializeScalar(hex: string): BlsctResult<number> {
  const module = getBlsctModule();
  const strPtr = allocString(hex);
  try {
    const resultPtr = module._deserialize_scalar(strPtr);
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return result;
  } finally {
    freePtr(strPtr);
  }
}

/**
 * Check if two scalars are equal
 */
export function areScalarEqual(a: number, b: number): boolean {
  const module = getBlsctModule();
  return module._are_scalar_equal(a, b) !== 0;
}

/**
 * Convert a scalar to a uint64 value
 */
export function scalarToUint64(scalar: number): bigint {
  const module = getBlsctModule();
  return module._scalar_to_uint64(scalar);
}

// ============================================================================
// Point Functions
// ============================================================================

/**
 * Generate a random point on the curve
 */
export function genRandomPoint(): BlsctResult<number> {
  const module = getBlsctModule();
  const resultPtr = module._gen_random_point();
  const result = parseRetVal(resultPtr);
  freePtr(resultPtr);
  return result;
}

/**
 * Get the base point of the curve
 */
export function genBasePoint(): BlsctResult<number> {
  const module = getBlsctModule();
  const resultPtr = module._gen_base_point();
  const result = parseRetVal(resultPtr);
  freePtr(resultPtr);
  return result;
}

/**
 * Serialize a point to a hex string
 */
export function serializePoint(point: number): string {
  const module = getBlsctModule();
  const strPtr = module._serialize_point(point);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

/**
 * Deserialize a point from a hex string
 */
export function deserializePoint(hex: string): BlsctResult<number> {
  const module = getBlsctModule();
  const strPtr = allocString(hex);
  try {
    const resultPtr = module._deserialize_point(strPtr);
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return result;
  } finally {
    freePtr(strPtr);
  }
}

/**
 * Check if a point is valid
 */
export function isValidPoint(point: number): boolean {
  const module = getBlsctModule();
  return module._is_valid_point(point) !== 0;
}

/**
 * Check if two points are equal
 */
export function arePointEqual(a: number, b: number): boolean {
  const module = getBlsctModule();
  return module._are_point_equal(a, b) !== 0;
}

/**
 * Generate a point from a scalar
 */
export function pointFromScalar(scalar: number): number {
  const module = getBlsctModule();
  return module._point_from_scalar(scalar);
}

/**
 * Convert a point to a string representation
 */
export function pointToStr(point: number): string {
  const module = getBlsctModule();
  const strPtr = module._point_to_str(point);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

// ============================================================================
// Public Key Functions
// ============================================================================

/**
 * Generate a random public key
 */
export function genRandomPublicKey(): BlsctResult<number> {
  const module = getBlsctModule();
  const resultPtr = module._gen_random_public_key();
  const result = parseRetVal(resultPtr);
  freePtr(resultPtr);
  return result;
}

/**
 * Convert a scalar to a public key
 */
export function scalarToPubKey(scalar: number): number {
  const module = getBlsctModule();
  return module._scalar_to_pub_key(scalar);
}

/**
 * Get the point from a public key
 */
export function getPublicKeyPoint(pubKey: number): number {
  const module = getBlsctModule();
  return module._get_public_key_point(pubKey);
}

/**
 * Convert a point to a public key
 */
export function pointToPublicKey(point: number): number {
  const module = getBlsctModule();
  return module._point_to_public_key(point);
}

// ============================================================================
// Double Public Key Functions
// ============================================================================

/**
 * Generate a double public key from two public keys
 */
export function genDoublePubKey(pk1: number, pk2: number): BlsctResult<number> {
  const module = getBlsctModule();
  const resultPtr = module._gen_double_pub_key(pk1, pk2);
  const result = parseRetVal(resultPtr);
  freePtr(resultPtr);
  return result;
}

/**
 * Generate a double public key with view key, spending key, account and address
 */
export function genDpkWithKeysAcctAddr(
  viewKey: number,
  spendingPubKey: number,
  account: number | bigint,
  address: number | bigint
): number {
  const module = getBlsctModule();
  return module._gen_dpk_with_keys_acct_addr(
    viewKey,
    spendingPubKey,
    BigInt(account),
    BigInt(address)
  );
}

/**
 * Serialize a double public key to hex
 */
export function serializeDpk(dpk: number): string {
  const module = getBlsctModule();
  const strPtr = module._serialize_dpk(dpk);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

/**
 * Deserialize a double public key from hex
 */
export function deserializeDpk(hex: string): BlsctResult<number> {
  const module = getBlsctModule();
  const strPtr = allocString(hex);
  try {
    const resultPtr = module._deserialize_dpk(strPtr);
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return result;
  } finally {
    freePtr(strPtr);
  }
}

// ============================================================================
// Token ID Functions
// ============================================================================

/**
 * Generate a token ID
 */
export function genTokenId(token: number | bigint): BlsctResult<number> {
  const module = getBlsctModule();
  const resultPtr = module._gen_token_id(BigInt(token));
  const result = parseRetVal(resultPtr);
  freePtr(resultPtr);
  return result;
}

/**
 * Generate a token ID with a subid
 */
export function genTokenIdWithSubid(
  token: number | bigint,
  subid: number | bigint
): BlsctResult<number> {
  const module = getBlsctModule();
  const resultPtr = module._gen_token_id_with_token_and_subid(
    BigInt(token),
    BigInt(subid)
  );
  const result = parseRetVal(resultPtr);
  freePtr(resultPtr);
  return result;
}

/**
 * Generate the default token ID
 */
export function genDefaultTokenId(): BlsctResult<number> {
  const module = getBlsctModule();
  const resultPtr = module._gen_default_token_id();
  const result = parseRetVal(resultPtr);
  freePtr(resultPtr);
  return result;
}

/**
 * Get the token value from a token ID
 */
export function getTokenIdToken(tokenId: number): bigint {
  const module = getBlsctModule();
  return module._get_token_id_token(tokenId);
}

/**
 * Get the subid from a token ID
 */
export function getTokenIdSubid(tokenId: number): bigint {
  const module = getBlsctModule();
  return module._get_token_id_subid(tokenId);
}

/**
 * Serialize a token ID to hex
 */
export function serializeTokenId(tokenId: number): string {
  const module = getBlsctModule();
  const strPtr = module._serialize_token_id(tokenId);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

/**
 * Deserialize a token ID from hex
 */
export function deserializeTokenId(hex: string): BlsctResult<number> {
  const module = getBlsctModule();
  const strPtr = allocString(hex);
  try {
    const resultPtr = module._deserialize_token_id(strPtr);
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return result;
  } finally {
    freePtr(strPtr);
  }
}

// ============================================================================
// Sub Address Functions
// ============================================================================

/**
 * Generate a sub address ID
 */
export function genSubAddrId(
  account: number | bigint,
  address: number | bigint
): number {
  const module = getBlsctModule();
  return module._gen_sub_addr_id(BigInt(account), BigInt(address));
}

/**
 * Derive a sub address
 */
export function deriveSubAddress(
  viewKey: number,
  spendingPubKey: number,
  subAddrId: number
): number {
  const module = getBlsctModule();
  return module._derive_sub_address(viewKey, spendingPubKey, subAddrId);
}

/**
 * Convert a sub address to a double public key
 */
export function subAddrToDpk(subAddr: number): number {
  const module = getBlsctModule();
  return module._sub_addr_to_dpk(subAddr);
}

/**
 * Convert a double public key to a sub address
 */
export function dpkToSubAddr(dpk: number): BlsctResult<number> {
  const module = getBlsctModule();
  const resultPtr = module._dpk_to_sub_addr(dpk);
  const result = parseRetVal(resultPtr);
  freePtr(resultPtr);
  return result;
}

/**
 * Serialize a sub address to hex
 */
export function serializeSubAddr(subAddr: number): string {
  const module = getBlsctModule();
  const strPtr = module._serialize_sub_addr(subAddr);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

/**
 * Deserialize a sub address from hex
 */
export function deserializeSubAddr(hex: string): BlsctResult<number> {
  const module = getBlsctModule();
  const strPtr = allocString(hex);
  try {
    const resultPtr = module._deserialize_sub_addr(strPtr);
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return result;
  } finally {
    freePtr(strPtr);
  }
}

/**
 * Serialize a sub address ID to hex
 */
export function serializeSubAddrId(subAddrId: number): string {
  const module = getBlsctModule();
  const strPtr = module._serialize_sub_addr_id(subAddrId);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

/**
 * Deserialize a sub address ID from hex
 */
export function deserializeSubAddrId(hex: string): BlsctResult<number> {
  const module = getBlsctModule();
  const strPtr = allocString(hex);
  try {
    const resultPtr = module._deserialize_sub_addr_id(strPtr);
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return result;
  } finally {
    freePtr(strPtr);
  }
}

// ============================================================================
// Key Derivation Functions
// ============================================================================

/**
 * Derive a child key from a seed
 */
export function fromSeedToChildKey(seed: number): number {
  const module = getBlsctModule();
  return module._from_seed_to_child_key(seed);
}

/**
 * Derive a blinding key from a child key
 */
export function fromChildKeyToBlindingKey(childKey: number): number {
  const module = getBlsctModule();
  return module._from_child_key_to_blinding_key(childKey);
}

/**
 * Derive a token key from a child key
 */
export function fromChildKeyToTokenKey(childKey: number): number {
  const module = getBlsctModule();
  return module._from_child_key_to_token_key(childKey);
}

/**
 * Derive a transaction key from a child key
 */
export function fromChildKeyToTxKey(childKey: number): number {
  const module = getBlsctModule();
  return module._from_child_key_to_tx_key(childKey);
}

/**
 * Derive a view key from a transaction key
 */
export function fromTxKeyToViewKey(txKey: number): number {
  const module = getBlsctModule();
  return module._from_tx_key_to_view_key(txKey);
}

/**
 * Derive a spending key from a transaction key
 */
export function fromTxKeyToSpendingKey(txKey: number): number {
  const module = getBlsctModule();
  return module._from_tx_key_to_spending_key(txKey);
}

/**
 * Calculate a private spending key
 */
export function calcPrivSpendingKey(
  blindingPubKey: number,
  viewKey: number,
  spendingKey: number,
  account: number | bigint,
  address: number | bigint
): number {
  const module = getBlsctModule();
  return module._calc_priv_spending_key(
    blindingPubKey,
    viewKey,
    spendingKey,
    BigInt(account),
    BigInt(address)
  );
}

// ============================================================================
// Signature Functions
// ============================================================================

/**
 * Sign a message with a private key
 */
export function signMessage(privKey: number, msg: string): number {
  const module = getBlsctModule();
  const msgPtr = allocString(msg);
  try {
    return module._sign_message(privKey, msgPtr);
  } finally {
    freePtr(msgPtr);
  }
}

/**
 * Verify a message signature
 */
export function verifyMsgSig(
  pubKey: number,
  msg: string,
  signature: number
): boolean {
  const module = getBlsctModule();
  const msgPtr = allocString(msg);
  try {
    return module._verify_msg_sig(pubKey, msgPtr, signature);
  } finally {
    freePtr(msgPtr);
  }
}

/**
 * Serialize a signature to hex
 */
export function serializeSignature(signature: number): string {
  const module = getBlsctModule();
  const strPtr = module._serialize_signature(signature);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

/**
 * Deserialize a signature from hex
 */
export function deserializeSignature(hex: string): BlsctResult<number> {
  const module = getBlsctModule();
  const strPtr = allocString(hex);
  try {
    const resultPtr = module._deserialize_signature(strPtr);
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return result;
  } finally {
    freePtr(strPtr);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate a view tag
 */
export function calcViewTag(blindingPubKey: number, viewKey: number): bigint {
  const module = getBlsctModule();
  return module._calc_view_tag(blindingPubKey, viewKey);
}

/**
 * Calculate a nonce
 */
export function calcNonce(blindingPubKey: number, viewKey: number): number {
  const module = getBlsctModule();
  return module._calc_nonce(blindingPubKey, viewKey);
}

/**
 * Calculate a key ID
 */
export function calcKeyId(
  blindingPubKey: number,
  spendingPubKey: number,
  viewKey: number
): number {
  const module = getBlsctModule();
  return module._calc_key_id(blindingPubKey, spendingPubKey, viewKey);
}

/**
 * Serialize a key ID to hex
 */
export function serializeKeyId(keyId: number): string {
  const module = getBlsctModule();
  const strPtr = module._serialize_key_id(keyId);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

/**
 * Deserialize a key ID from hex
 */
export function deserializeKeyId(hex: string): BlsctResult<number> {
  const module = getBlsctModule();
  const strPtr = allocString(hex);
  try {
    const resultPtr = module._deserialize_key_id(strPtr);
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return result;
  } finally {
    freePtr(strPtr);
  }
}

// ============================================================================
// Out Point Functions
// ============================================================================

/**
 * Generate an out point
 */
export function genOutPoint(
  serCtxId: string,
  outIndex: number
): BlsctResult<number> {
  const module = getBlsctModule();
  const strPtr = allocString(serCtxId);
  try {
    const resultPtr = module._gen_out_point(strPtr, outIndex);
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return result;
  } finally {
    freePtr(strPtr);
  }
}

/**
 * Serialize an out point to hex
 */
export function serializeOutPoint(outPoint: number): string {
  const module = getBlsctModule();
  const strPtr = module._serialize_out_point(outPoint);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

/**
 * Deserialize an out point from hex
 */
export function deserializeOutPoint(hex: string): BlsctResult<number> {
  const module = getBlsctModule();
  const strPtr = allocString(hex);
  try {
    const resultPtr = module._deserialize_out_point(strPtr);
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return result;
  } finally {
    freePtr(strPtr);
  }
}

// ============================================================================
// Script Functions
// ============================================================================

/**
 * Serialize a script to hex
 */
export function serializeScript(script: number): string {
  const module = getBlsctModule();
  const strPtr = module._serialize_script(script);
  const str = readString(strPtr);
  freePtr(strPtr);
  return str;
}

/**
 * Deserialize a script from hex
 */
export function deserializeScript(hex: string): BlsctResult<number> {
  const module = getBlsctModule();
  const strPtr = allocString(hex);
  try {
    const resultPtr = module._deserialize_script(strPtr);
    const result = parseRetVal(resultPtr);
    freePtr(resultPtr);
    return result;
  } finally {
    freePtr(strPtr);
  }
}

// ============================================================================
// Memory Management
// ============================================================================

/**
 * Free a blsct object
 */
export { freeObj };

/**
 * Run garbage collection (no-op in browser, kept for API compatibility)
 */
export async function runGc(): Promise<void> {
  // In the browser, we rely on automatic garbage collection
  // This function exists for API compatibility with the Node.js version
  return Promise.resolve();
}

