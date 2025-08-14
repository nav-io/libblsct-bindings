import {
  castToSubAddrId,
  deserializeSubAddrId,
  genSubAddrId,
  serializeSubAddrId,
} from './blsct'

import { ManagedObj } from './managedObj'

/** Represents a sub-address ID.
 *
 * Examples:
 * ```ts
 * const { SubAddrId } = require('navio-blsct')
 * const x = SubAddrId.generate(123, 456)
 * x
 * const ser = x.serialize()
 * const deser = SubAddrId.deserialize(ser)
 * ser === deser.serialize() // true
 * ```
 */
export class SubAddrId extends ManagedObj {
  constructor(obj: any) {
    super(obj)
  }

  /** Generates a new `SubAddrId` instance.
   *
   * @param account - The account for the sub-address.
   * @param address - The address for the sub-address.
   * @return A new `SubAddrId` instance with the specified account and address.
   */
  static generate(
    account: number,
    address: number,
  ): SubAddrId {
    const obj = genSubAddrId(account, address)
    return new SubAddrId(obj)
  }

  override value(): any {
    return castToSubAddrId(this.obj)
  }

  override serialize(): string {
    return serializeSubAddrId(this.value())
  }

  /** Deserializes a `SubAddrId` from its hexadecimal representation.
   *
   * @param hex - The hexadecimal string to deserialize.
   * @returns A new `SubAddrId` instance.
   */
  static deserialize(
    this: new (obj: any) => SubAddrId,
    hex: string
  ): SubAddrId {
    return SubAddrId._deserialize(hex, deserializeSubAddrId)
  }
}

