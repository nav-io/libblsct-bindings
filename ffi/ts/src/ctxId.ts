import {
  castToUint8_tPtr,
  CTX_ID_SIZE,
  hexToMallocedBuf,
  toHex,
} from './blsct'

import { ManagedObj } from './managedObj'

/** Represents the transaction ID of a CMutableTransaction
 *
 * Examples:
 * ```ts
 * const { CTxId, CTX_ID_SIZE } = require('navio-blsct')
 * const { randomBytes } = require('crypto')
 * const cTxIdHex = randomBytes(CTX_ID_SIZE).toString('hex')
 * const cTxId = CTxId.deserialize(cTxIdHex)
 * const ser = cTxId.serialize() 
 * const deser = CTxId.deserialize(ser)
 * ser === deser.serialize() // true
 * ```
 */
export class CTxId extends ManagedObj {
  constructor(obj: any) {
    super(obj)
  }

  override value(): any {
    return castToUint8_tPtr(this.obj)
  }

  override serialize(): string {
    const buf = this.value()
    return toHex(buf, CTX_ID_SIZE)
  }

  /** Deserializes a `CTxId` from its hexadecimal representation.
   *
   * * @param hex - The hexadecimal string to deserialize.
   * * @returns A new `CTxId` instance.
   */
  static deserialize(
    this: new (obj: any) => CTxId,
    hex: string
  ): CTxId {
    if (hex.length % 2 !== 0) {
      hex = `0${hex}`
    }
    if (hex.length !== CTX_ID_SIZE * 2) {
      throw new Error(`Invalir TxId hex length. Expected ${CTX_ID_SIZE * 2}, but got ${hex.length}.`)
    }

    const obj = hexToMallocedBuf(hex) 
    return new CTxId(obj)
  }
}

