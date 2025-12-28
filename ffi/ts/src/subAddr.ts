import {
  castToSubAddr,
  deriveSubAddress,
  deserializeSubAddr,
  dpkToSubAddr,
  freeObj,
  serializeSubAddr,
  subAddrToDpk,
} from './blsct'

import { PublicKey } from './keys/publicKey'
import { DoublePublicKey } from './keys/doublePublicKey'
import { Scalar } from './scalar'
import { ManagedObj } from './managedObj'
import { SubAddrId } from './subAddrId'

/** Represents a sub-address.
 *
 * Examples:
 * ```ts
 * const { SubAddr, PublicKey, DoublePublicKey, SubAddrId } = require('navio-blsct') 
 * const seed = new Scalar()
 * const viewKey = new ChildKey(seed).toTxKey().toViewKey()
 * const spendingPubKey = new PublicKey()
 * const subAddrId = new SubAddrId(123, 456)
 * new SubAddr(viewKey, spendingPubKey, subAddrId)
 * const dpk = new DoublePublicKey()
 * const x = SubAddr.fromDoublePublicKey(dpk)
 * const ser = x.serialize()
 * const deser = SubAddr.deserialize(ser)
 * ser === deser.serialize() // true
 * ```
 */
export class SubAddr extends ManagedObj {
  constructor(obj: any) {
    super(obj)
  }

  /** Generates a new `SubAddr` instance.
   *
   * @param viewKey - The view key used for deriving the sub-address.
   * @param spendingPubKey - The spending public key used for deriving the sub-address.
   * @param subAddrId - The sub-address ID used for deriving the sub-address.
   * @return A new `SubAddr` instance with the specified view key, spending public key, and sub-address ID.
   */
  static generate(
    viewKey: Scalar,
    spendingPubKey: PublicKey,
    subAddrId: SubAddrId,
  ): SubAddr {
    const obj = deriveSubAddress(
      viewKey.value(),
      spendingPubKey.value(),
      subAddrId.value(),
    )
    return new SubAddr(obj)
  }
  
  /** Generates a `SubAddr` from a `DoublePublicKey`.
   *
   * @param dpk - The `DoublePublicKey` used to derive the sub-address.
   * @return A new `SubAddr` instance derived from the `DoublePublicKey`.
   */
  static fromDoublePublicKey(
    dpk: DoublePublicKey,
  ): SubAddr {
    const rv = dpkToSubAddr(dpk.value())
    const inst = new SubAddr(rv.value)
    freeObj(rv)
    return inst
  }

  toDoublePublicKey(): DoublePublicKey {
    const blsctDpk = subAddrToDpk(this.value())
    return DoublePublicKey.fromObj(blsctDpk)
  }

  override value(): any {
    return castToSubAddr(this.obj)
  }

  override serialize(): string {
    return serializeSubAddr(this.value())
  }

  /** Deserializes a `SubAddr` from its hexadecimal representation.
   *
   * @param hex - The hexadecimal string to deserialize.
   * @returns A new `SubAddr` instance.
   */
  static deserialize(
    this: new (obj: any) => SubAddr,
    hex: string
  ): SubAddr {
    return SubAddr._deserialize(hex, deserializeSubAddr)
  }
}

