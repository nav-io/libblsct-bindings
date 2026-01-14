/**
 * BLSCT Address handling
 */

import { ManagedObj } from './managedObj.js';
import {
  decodeAddress,
  encodeAddress,
  serializeDpk,
  deserializeDpk,
  genDoublePubKey,
  genDpkWithKeysAcctAddr,
  dpkToSubAddr,
  subAddrToDpk,
  genSubAddrId,
  deriveSubAddress,
  serializeSubAddr,
  deserializeSubAddr,
  serializeSubAddrId,
  deserializeSubAddrId,
  BlsctChain,
  AddressEncoding,
  assertSuccess,
} from './blsct.js';
import { freeObj } from './wasm/index.js';

/**
 * Represents a BLSCT double public key (spending key + view key)
 */
export class DoublePublicKey extends ManagedObj {
  constructor(ptr: number) {
    super(ptr);
  }

  /**
   * Decode a BLSCT address string to a double public key
   */
  static fromAddress(addressStr: string): DoublePublicKey {
    const result = decodeAddress(addressStr);
    const ptr = assertSuccess(result, 'Decode address');
    return new DoublePublicKey(ptr);
  }

  /**
   * Deserialize a double public key from hex
   */
  static fromHex(hex: string): DoublePublicKey {
    const result = deserializeDpk(hex);
    const ptr = assertSuccess(result, 'Deserialize double public key');
    return new DoublePublicKey(ptr);
  }

  /**
   * Create a double public key from two public keys
   */
  static fromPublicKeys(spendingKey: number, viewKey: number): DoublePublicKey {
    const result = genDoublePubKey(spendingKey, viewKey);
    const ptr = assertSuccess(result, 'Generate double public key');
    return new DoublePublicKey(ptr);
  }

  /**
   * Generate a double public key with derived keys
   */
  static fromKeysAndAddress(
    viewKey: number,
    spendingPubKey: number,
    account: number | bigint,
    address: number | bigint
  ): DoublePublicKey {
    const ptr = genDpkWithKeysAcctAddr(viewKey, spendingPubKey, account, address);
    return new DoublePublicKey(ptr);
  }

  /**
   * Encode this double public key as a BLSCT address string
   */
  toAddress(encoding: AddressEncoding = AddressEncoding.Bech32M): string {
    const result = encodeAddress(this.ptr, encoding);
    if (!result.success || result.value === null) {
      throw new Error(`Failed to encode address: ${result.error}`);
    }
    return result.value;
  }

  /**
   * Serialize to hex string
   */
  toHex(): string {
    return serializeDpk(this.ptr);
  }

  /**
   * Convert to a SubAddress
   */
  toSubAddress(): SubAddress {
    const result = dpkToSubAddr(this.ptr);
    const ptr = assertSuccess(result, 'Convert to sub address');
    return new SubAddress(ptr);
  }

  toString(): string {
    try {
      return this.toAddress();
    } catch {
      return `DoublePublicKey(${this.toHex().slice(0, 16)}...)`;
    }
  }
}

/**
 * Represents a BLSCT sub address
 */
export class SubAddress extends ManagedObj {
  constructor(ptr: number) {
    super(ptr);
  }

  /**
   * Derive a sub address from keys
   */
  static derive(
    viewKey: number,
    spendingPubKey: number,
    account: number | bigint,
    address: number | bigint
  ): SubAddress {
    const subAddrId = genSubAddrId(account, address);
    try {
      const ptr = deriveSubAddress(viewKey, spendingPubKey, subAddrId);
      return new SubAddress(ptr);
    } finally {
      freeObj(subAddrId);
    }
  }

  /**
   * Derive a sub address with a SubAddressId
   */
  static deriveWithId(
    viewKey: number,
    spendingPubKey: number,
    subAddrId: SubAddressId
  ): SubAddress {
    const ptr = deriveSubAddress(viewKey, spendingPubKey, subAddrId.ptr);
    return new SubAddress(ptr);
  }

  /**
   * Deserialize from hex
   */
  static fromHex(hex: string): SubAddress {
    const result = deserializeSubAddr(hex);
    const ptr = assertSuccess(result, 'Deserialize sub address');
    return new SubAddress(ptr);
  }

  /**
   * Serialize to hex
   */
  toHex(): string {
    return serializeSubAddr(this.ptr);
  }

  /**
   * Convert to a DoublePublicKey
   */
  toDoublePublicKey(): DoublePublicKey {
    const ptr = subAddrToDpk(this.ptr);
    return new DoublePublicKey(ptr);
  }

  /**
   * Get as a BLSCT address string
   */
  toAddress(encoding: AddressEncoding = AddressEncoding.Bech32M): string {
    const dpk = this.toDoublePublicKey();
    try {
      return dpk.toAddress(encoding);
    } finally {
      dpk.dispose();
    }
  }

  toString(): string {
    return `SubAddress(${this.toHex().slice(0, 16)}...)`;
  }
}

/**
 * Represents a BLSCT sub address ID (account + address index)
 */
export class SubAddressId extends ManagedObj {
  constructor(ptr: number) {
    super(ptr);
  }

  /**
   * Create a new sub address ID
   */
  static create(account: number | bigint, address: number | bigint): SubAddressId {
    const ptr = genSubAddrId(account, address);
    return new SubAddressId(ptr);
  }

  /**
   * Deserialize from hex
   */
  static fromHex(hex: string): SubAddressId {
    const result = deserializeSubAddrId(hex);
    const ptr = assertSuccess(result, 'Deserialize sub address ID');
    return new SubAddressId(ptr);
  }

  /**
   * Serialize to hex
   */
  toHex(): string {
    return serializeSubAddrId(this.ptr);
  }

  toString(): string {
    return `SubAddressId(${this.toHex()})`;
  }
}

// Re-export enums for convenience
export { BlsctChain, AddressEncoding };

