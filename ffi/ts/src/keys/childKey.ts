import {
  fromChildKeyToBlindingKey,
  fromChildKeyToTokenKey,
  fromChildKeyToTxKey,
  fromSeedToChildKey,
} from '../blsct'

import { Scalar } from '../scalar'
import { TxKey } from './txKey'

/** Represents a child key. A child key is a Scalar and introduces no new functionality; it serves purely as a semantic alias. BlindingKey, TokenKey and TxKey are exclusively derived from a ChildKey.
 *
 * Examples:
 * ```ts
 * const { Scalar, ChildKey } = require('navio-blsct')
 * const s = Scalar.random()
 * const ck = new ChildKey(s)
 * ck.toBlindingKey()
 * ck.toTokenKey()
 * ck.toTxKey()
 * ```
 */
export class ChildKey extends Scalar {
  /**
   * Creates a new `ChildKey` derived from the given `Scalar`.
   *
   * @param obj - The `Scalar` to derive the `ChildKey` from.
   */
  constructor(obj?: Scalar) {
    if (obj === undefined || obj === null) {
      super(obj)
    } else {
      const childKeyObj = fromSeedToChildKey(obj.value())
      super(childKeyObj)
    }
  }

  /** Derives a ChildKey from a Scalar.
   *  @returns A new ChildKey instance derived from the provided Scalar.
   */
  toBlindingKey(): Scalar {
    const obj = fromChildKeyToBlindingKey(this.value())
    return Scalar.fromObj(obj)
  }

  /** Derives a TokenKey from a ChildKey.
   *  @returns A new TokenKey instance derived from the ChildKey.
   */
  toTokenKey(): Scalar {
    const obj = fromChildKeyToTokenKey(this.value())
    return Scalar.fromObj(obj)
  }

  /** Derives a TxKey from a ChildKey.
   *  @returns A new TxKey instance derived from the ChildKey.
   */
  toTxKey(): TxKey {
    const obj = fromChildKeyToTxKey(this.value())
    return TxKey.fromObj(obj)
  }
}

