/**
 * Key derivation and management for BLSCT
 */

import { ManagedObj } from './managedObj.js';
import { Scalar } from './scalar.js';
import {
  fromSeedToChildKey,
  fromChildKeyToBlindingKey,
  fromChildKeyToTokenKey,
  fromChildKeyToTxKey,
  fromTxKeyToViewKey,
  fromTxKeyToSpendingKey,
  calcPrivSpendingKey,
  scalarToPubKey,
  calcKeyId,
  serializeKeyId,
  deserializeKeyId,
  assertSuccess,
} from './blsct.js';

/**
 * Represents a child key derived from a seed
 * 
 * Key derivation hierarchy:
 * ```
 * seed (scalar)
 *  └── child key (scalar)
 *       ├── blinding key (scalar)
 *       ├── token key (scalar)
 *       └── tx key (scalar)
 *            ├── view key (scalar)
 *            └── spending key (scalar)
 * ```
 */
export class ChildKey extends ManagedObj {
  constructor(ptr: number) {
    super(ptr);
  }

  /**
   * Derive a child key from a seed scalar
   */
  static fromSeed(seed: Scalar): ChildKey {
    const ptr = fromSeedToChildKey(seed.ptr);
    return new ChildKey(ptr);
  }

  /**
   * Derive the blinding key from this child key
   */
  deriveBlindingKey(): BlindingKey {
    const ptr = fromChildKeyToBlindingKey(this.ptr);
    return new BlindingKey(ptr);
  }

  /**
   * Derive the token key from this child key
   */
  deriveTokenKey(): TokenKey {
    const ptr = fromChildKeyToTokenKey(this.ptr);
    return new TokenKey(ptr);
  }

  /**
   * Derive the transaction key from this child key
   */
  deriveTxKey(): TxKey {
    const ptr = fromChildKeyToTxKey(this.ptr);
    return new TxKey(ptr);
  }
}

/**
 * Represents a blinding key used for confidential transactions
 */
export class BlindingKey extends ManagedObj {
  constructor(ptr: number) {
    super(ptr);
  }

  /**
   * Get the public key for this blinding key
   */
  toPublicKey(): number {
    return scalarToPubKey(this.ptr);
  }
}

/**
 * Represents a token key for token-related operations
 */
export class TokenKey extends ManagedObj {
  constructor(ptr: number) {
    super(ptr);
  }
}

/**
 * Represents a transaction key that can derive view and spending keys
 */
export class TxKey extends ManagedObj {
  constructor(ptr: number) {
    super(ptr);
  }

  /**
   * Derive the view key from this transaction key
   */
  deriveViewKey(): ViewKey {
    const ptr = fromTxKeyToViewKey(this.ptr);
    return new ViewKey(ptr);
  }

  /**
   * Derive the spending key from this transaction key
   */
  deriveSpendingKey(): SpendingKey {
    const ptr = fromTxKeyToSpendingKey(this.ptr);
    return new SpendingKey(ptr);
  }
}

/**
 * Represents a view key for viewing incoming transactions
 */
export class ViewKey extends ManagedObj {
  constructor(ptr: number) {
    super(ptr);
  }
}

/**
 * Represents a spending key for spending funds
 */
export class SpendingKey extends ManagedObj {
  constructor(ptr: number) {
    super(ptr);
  }

  /**
   * Get the public key for this spending key
   */
  toPublicKey(): number {
    return scalarToPubKey(this.ptr);
  }
}

/**
 * Calculate a private spending key from component keys
 */
export function calculatePrivSpendingKey(
  blindingPubKey: number,
  viewKey: ViewKey,
  spendingKey: SpendingKey,
  account: number | bigint,
  address: number | bigint
): Scalar {
  const ptr = calcPrivSpendingKey(
    blindingPubKey,
    viewKey.ptr,
    spendingKey.ptr,
    account,
    address
  );
  return new Scalar(ptr);
}

/**
 * Represents a key ID (hash of key components)
 */
export class KeyId extends ManagedObj {
  constructor(ptr: number) {
    super(ptr);
  }

  /**
   * Calculate a key ID from key components
   */
  static calculate(
    blindingPubKey: number,
    spendingPubKey: number,
    viewKey: ViewKey
  ): KeyId {
    const ptr = calcKeyId(blindingPubKey, spendingPubKey, viewKey.ptr);
    return new KeyId(ptr);
  }

  /**
   * Deserialize from hex
   */
  static fromHex(hex: string): KeyId {
    const result = deserializeKeyId(hex);
    const ptr = assertSuccess(result, 'Deserialize key ID');
    return new KeyId(ptr);
  }

  /**
   * Serialize to hex
   */
  toHex(): string {
    return serializeKeyId(this.ptr);
  }

  toString(): string {
    return `KeyId(${this.toHex()})`;
  }
}

/**
 * Complete key derivation from a seed
 * 
 * This is a convenience function that derives all keys from a seed
 * and returns them in a structured object.
 */
export interface DerivedKeys {
  childKey: ChildKey;
  blindingKey: BlindingKey;
  tokenKey: TokenKey;
  txKey: TxKey;
  viewKey: ViewKey;
  spendingKey: SpendingKey;
}

/**
 * Derive all keys from a seed
 */
export function deriveAllKeys(seed: Scalar): DerivedKeys {
  const childKey = ChildKey.fromSeed(seed);
  const blindingKey = childKey.deriveBlindingKey();
  const tokenKey = childKey.deriveTokenKey();
  const txKey = childKey.deriveTxKey();
  const viewKey = txKey.deriveViewKey();
  const spendingKey = txKey.deriveSpendingKey();

  return {
    childKey,
    blindingKey,
    tokenKey,
    txKey,
    viewKey,
    spendingKey,
  };
}

/**
 * Dispose all derived keys
 */
export function disposeAllKeys(keys: DerivedKeys): void {
  keys.spendingKey.dispose();
  keys.viewKey.dispose();
  keys.txKey.dispose();
  keys.tokenKey.dispose();
  keys.blindingKey.dispose();
  keys.childKey.dispose();
}

