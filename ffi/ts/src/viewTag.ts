import {
  calcViewTag,
} from './blsct'

import { PublicKey } from './keys/publicKey'
import { Scalar } from './scalar'

/** Represents a view tag derived from a blinding public key and a view key. The view tag is a 64-bit unsigned integer.
 *
 * Examples:
 * ```ts
 * const { ViewTag, PublicKey, ChildKey, Scalar } = require('navio-blsct')
 * const blindingPubKey = PublicKey.random()
 * const seed = Scalar.random()
 * const viewKey = new ChildKey(seed).toTxKey().toViewKey()
 * new ViewTag(blindingPubKey, viewKey)
 * ```
 */
export class ViewTag {
  value: number

  /** Constructs a new `ViewTag` instance.
   *
   * @param blindingPubKey - The public key used for blinding.
   * @param viewKey - The view key.
   */
  constructor(
    blindingPubKey: PublicKey,
    viewKey: Scalar
  ) {
    this.value = calcViewTag(
      blindingPubKey.value(),
      viewKey.value()
    )
  }

  /** Generates a random view tag.
   * @returns A new `ViewTag` instance with a random blinding public key and view key.
   */
  static random(): ViewTag {
    const blindingPubKey = PublicKey.random()
    const viewKey = Scalar.random()
    return new ViewTag(blindingPubKey, viewKey)
  }
}

