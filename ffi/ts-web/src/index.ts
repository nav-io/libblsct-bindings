/**
 * BLSCT Browser Library
 * 
 * Browser-compatible TypeScript bindings for the BLSCT
 * (BLS Confidential Transactions) library used by the Navio blockchain.
 * 
 * @example
 * ```typescript
 * import { loadBlsctModule, Scalar, Point, BlsctChain, setChain } from 'navio-blsct-web';
 * 
 * // Initialize the WASM module (required before using any other functions)
 * await loadBlsctModule();
 * 
 * // Set the network
 * setChain(BlsctChain.Mainnet);
 * 
 * // Generate a random scalar (private key)
 * const privateKey = Scalar.random();
 * console.log('Private key:', privateKey.toHex());
 * 
 * // Derive a point (public key)
 * const publicKey = Point.fromScalar(privateKey);
 * console.log('Public key:', publicKey.toHex());
 * 
 * // Clean up
 * privateKey.dispose();
 * publicKey.dispose();
 * ```
 * 
 * @packageDocumentation
 */

// WASM Module initialization
export { loadBlsctModule, isModuleLoaded } from './wasm/index.js';

// Core types
export { ManagedObj, ObjectRegistry } from './managedObj.js';
export { Scalar } from './scalar.js';
export { Point } from './point.js';
export { Signature } from './signature.js';
export { TokenId } from './tokenId.js';

// Address types
export {
  DoublePublicKey,
  SubAddress,
  SubAddressId,
  BlsctChain,
  AddressEncoding,
} from './address.js';

// Key management
export {
  ChildKey,
  BlindingKey,
  TokenKey,
  TxKey,
  ViewKey,
  SpendingKey,
  KeyId,
  deriveAllKeys,
  disposeAllKeys,
  calculatePrivSpendingKey,
  type DerivedKeys,
} from './keys.js';

// Low-level BLSCT functions
export {
  // Constants
  DOUBLE_PUBLIC_KEY_SIZE,
  KEY_ID_SIZE,
  POINT_SIZE,
  PUBLIC_KEY_SIZE,
  SCRIPT_SIZE,
  SIGNATURE_SIZE,
  SUB_ADDR_ID_SIZE,
  CTX_ID_SIZE,
  BLSCT_IN_AMOUNT_ERROR,
  BLSCT_OUT_AMOUNT_ERROR,

  // Enums
  TxOutputType,

  // Chain configuration
  getChain,
  setChain,

  // Address functions
  decodeAddress,
  encodeAddress,

  // Scalar functions
  genRandomScalar,
  genScalar,
  serializeScalar,
  deserializeScalar,
  areScalarEqual,
  scalarToUint64,

  // Point functions
  genRandomPoint,
  genBasePoint,
  serializePoint,
  deserializePoint,
  isValidPoint,
  arePointEqual,
  pointFromScalar,
  pointToStr,

  // Public key functions
  genRandomPublicKey,
  scalarToPubKey,
  getPublicKeyPoint,
  pointToPublicKey,

  // Double public key functions
  genDoublePubKey,
  genDpkWithKeysAcctAddr,
  serializeDpk,
  deserializeDpk,

  // Token ID functions
  genTokenId,
  genTokenIdWithSubid,
  genDefaultTokenId,
  getTokenIdToken,
  getTokenIdSubid,
  serializeTokenId,
  deserializeTokenId,

  // Sub address functions
  genSubAddrId,
  deriveSubAddress,
  subAddrToDpk,
  dpkToSubAddr,
  serializeSubAddr,
  deserializeSubAddr,
  serializeSubAddrId,
  deserializeSubAddrId,

  // Key derivation functions
  fromSeedToChildKey,
  fromChildKeyToBlindingKey,
  fromChildKeyToTokenKey,
  fromChildKeyToTxKey,
  fromTxKeyToViewKey,
  fromTxKeyToSpendingKey,
  calcPrivSpendingKey,

  // Signature functions
  signMessage,
  verifyMsgSig,
  serializeSignature,
  deserializeSignature,

  // Helper functions
  calcViewTag,
  calcNonce,
  calcKeyId,
  serializeKeyId,
  deserializeKeyId,

  // Out point functions
  genOutPoint,
  serializeOutPoint,
  deserializeOutPoint,

  // Script functions
  serializeScript,
  deserializeScript,

  // Memory management
  freeObj,
  runGc,

  // Types
  type BlsctRetVal,
  type BlsctAmountsRetVal,
  type BlsctBoolRetVal,
  type BlsctCTxRetVal,
} from './blsct.js';

// WASM utilities
export {
  hexToBytes,
  bytesToHex,
  WasmPtr,
  withStack,
  type BlsctResult,
} from './wasm/index.js';

