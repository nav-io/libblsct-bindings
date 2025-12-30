import {
  calcPrivSpendingKey,
} from '../blsct'

import { Scalar } from '../scalar'
import { PublicKey } from './publicKey'

/** Represents a private spending key. A private spending key is a `Scalar` and introduces no new functionality; it serves purely as a semantic alias.
  *
  * Examples:
  * ```ts
  * const { PrivSpendingKey, PublicKey, SpendingKey } = require('navio-blsct')
  * const pk = PublicKey.random()
  * const vk = Scalar.random()
  * const sk = SpendingKey.random()
  * new PrivSpendingKey(pk, vk, sk, 1, 2)
  * ```
  */
export class PrivSpendingKey extends Scalar {
  /** Constructs a new `PrivSpendingKey` instance.
   *
   * @param blindingPubKey - The public key used for blinding.
   * @param viewKey - The view key.
   * @param spendingKey - The spending key.
   * @param account - The account.
   * @param address - The address.
   */
  constructor(
    blindingPubKey: PublicKey,
    viewKey: Scalar,
    spendingKey: Scalar,
    account: number,
    address: number
  ) {
    const blsctPsk = calcPrivSpendingKey(
      blindingPubKey.value(),
      viewKey.value(),
      spendingKey.value(),
      account,
      address
    )
    super(blsctPsk)
  }
}

