import {
  castToDpk,
  deserializeDpk,
  freeObj,
  genDoublePubKey,
  genDpkWithKeysAndSubAddrId,
  serializeDpk,
} from '../blsct'

import { ManagedObj } from '../managedObj'
import { PublicKey } from './publicKey'
import { ViewKey } from './childKeyDesc/txKeyDesc/viewKey'

/** The unique source from which an address is derived.
 * A `DoublePublicKey` is a pair of `PublicKey`s that can be used to derive an address.
 *
 * Instantiating a `DoublePublicKey` object without a parameter returns a `DoublePublicKey` consisting of two randomly generated `PublicKey`s.
 *
 * Examples:
 * ```ts
 * const { DoublePublicKey, PublicKey, ViewKey } = require('navio-blsct')
 * const dpk = new DoublePublicKey()
 * const pk1 = PublicKey.random()
 * const pk2 = PublicKey.random()
 * const dpk2 = DoublePublicKey.from_public_keys(pk1, pk2)
 * const vk = new ViewKey()
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
      const dpk = DoublePublicKey.fromPublicKeys(pk1, pk2)
      super(dpk.move())
    }
  }

  // TODO add equals, getPk1 and getPk2 methods in libblsct

  /** Generates a random `DoublePublicKey`.
   * @returns A new DoublePublicKey instance with two random `PublicKey`s.
   */
  static random(): DoublePublicKey {
    const pk1 = PublicKey.random()
    const pk2 = PublicKey.random()
    return DoublePublicKey.fromPublicKeys(pk1, pk2)
  }

  /** Generates a `DoublePublicKey` from the provided `PublicKey`s.
   * @param pk1 - The first `PublicKey`. 
   * @param pk2 - The second `PublicKey`.
   * @returns A new `DoublePublicKey` instance.
   */
  static fromPublicKeys(
    pk1: PublicKey,
    pk2: PublicKey,
  ): DoublePublicKey {
    const rv = genDoublePubKey(pk1.value(), pk2.value())
    const dpk = DoublePublicKey.fromObj(rv.value)
    freeObj(rv)
    return dpk
  }

  /** Generates a `DoublePublicKey` from the provided `ViewKey`, `PublicKey`, account, and address 
   * @param viewKey - The `ViewKey` used to derive the `DoublePublicKey`.
   * @param spendingPubKey - The `PublicKey` used for spending.
   * @param account - The account.
   * @param address - The address.
   * @returns A new `DoublePublicKey` instance.
   */
  static fromKeysAndAcctAddr(
    viewKey: ViewKey,
    spendingPubKey: PublicKey,
    account: number,
    address: number,
  ): DoublePublicKey {
    const obj = genDpkWithKeysAndSubAddrId(
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

