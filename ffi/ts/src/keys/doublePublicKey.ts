import {
  castToDpk,
  deserializeDpk,
  freeObj,
  genDoublePubKey,
  genDpkWithKeysAcctAddr,
  serializeDpk,
} from '../blsct'

import { ManagedObj } from '../managedObj'
import { PublicKey } from './publicKey'
import { Scalar } from '../scalar'

/** The unique source from which an address is derived.
 * A `DoublePublicKey` is a pair of `PublicKey`s that can be used to derive an address.
 *
 * Instantiating a `DoublePublicKey` object without a parameter returns a `DoublePublicKey` consisting of two randomly generated `PublicKey`s.
 *
 * Examples:
 * ```ts
 * const { DoublePublicKey, PublicKey } = require('navio-blsct')
 * const dpk = new DoublePublicKey()
 * const pk1 = PublicKey.random()
 * const pk2 = PublicKey.random()
 * const dpk2 = DoublePublicKey.from_public_keys(pk1, pk2)
 * const vk = Scalar.random()
 * const spendingPk = PublicKey.random()
 * const dpk3 = DoublePublicKey.fromKeysAndAcctAddr(vk, spendingPk, 1, 2)
 * const ser = dpk3.serialize()
 * const deser = DoublePublicKey.deserialize(ser)
 * deser.serialize() == ser
 * ```
 */ 
export class DoublePublicKey extends ManagedObj {
  constructor(obj?: any) {
    if (typeof obj === 'object') {
      super(obj)
    } else {
      const pk1 = PublicKey.random()
      const pk2 = PublicKey.random()

      const rv = genDoublePubKey(pk1.value(), pk2.value())
      if (rv.result !== 0) {
        throw new Error(`Failed to generate DoublePublicKey: ${rv.result}`)
      }
      super(rv.value)
    }
  }

  // TODO add equals, getPk1 and getPk2 methods in libblsct

  /** Generates a random `DoublePublicKey`.
   * @returns A new DoublePublicKey instance with two random `PublicKey`s.
   */
  static random(): DoublePublicKey {
    const vk = PublicKey.random()
    const sk = PublicKey.random()
    return DoublePublicKey.fromViewAndSpendKeys(vk, sk)
  }

  /** Generates a `DoublePublicKey` from the provided view key and spend keys.
   * @param vk - the view key.
   * @param sk - The spend key.
   * @returns A new `DoublePublicKey` instance.
   */
  static fromViewAndSpendKeys(
    vk: PublicKey,
    sk: PublicKey,
  ): DoublePublicKey {
    const rv = genDoublePubKey(vk.value(), sk.value())
    const dpk = DoublePublicKey.fromObj(rv.value)
    freeObj(rv)
    return dpk
  }

  /** Generates a `DoublePublicKey` from the provided `PublicKey`, account, and address 
   * @param viewKey - The `Scalar` used to derive the `DoublePublicKey`.
   * @param spendingPubKey - The `PublicKey` used for spending.
   * @param account - The account.
   * @param address - The address.
   * @returns A new `DoublePublicKey` instance.
   */
  static fromKeysAcctAddr(
    viewKey: Scalar,
    spendingPubKey: PublicKey,
    account: number,
    address: number,
  ): DoublePublicKey {
    const obj = genDpkWithKeysAcctAddr(
      viewKey.value(),
      spendingPubKey.value(),
      account,
      address
    )
    return DoublePublicKey.fromObj(obj) 
  }

  override value(): any {
    return castToDpk(this.obj)
  }

  override serialize(): string {
    return serializeDpk(this.value())
  }

  /** Deserializes a hexadecimal string into a `DoublePublicKey` instance.
   * @param hex - The hexadecimal string to convert.
   * @returns The `DoublePublicKey` instance represented by the input string.
   */
  static deserialize(
    this: new (obj: any) => DoublePublicKey,
    hex: string
  ): DoublePublicKey {
    return DoublePublicKey._deserialize(hex, deserializeDpk)
  }
}

