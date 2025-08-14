import {
  castToOutPoint,
  deserializeOutPoint,
  freeObj,
  genOutPoint,
  serializeOutPoint,
} from './blsct'

import { ManagedObj } from './managedObj'
import { CTxId } from './ctxId'

/** Represents an outpoint of a confidential transaction. Also known as `COutPoint` on the C++ side.
  *
  * Examples:
  * ```ts
  * const { OutPoint, CTxId, CTX_ID_SIZE } = require('navio-blsct')
  * const { randomBytes } = require('crypto')
  * const cTxIdHex = randomBytes(CTX_ID_SIZE).toString('hex')
  * const cTxId = CTxId.deserialize(cTxIdHex)
  * const outIndex = 0
  * const outPoint = OutPoint.generate(cTxId, outIndex)
  * outPoint
  * const ser = outPoint.serialize()
  * const deser = OutPoint.deserialize(ser)
  * ser === deser.serialize() // true
  * ```
  */
export class OutPoint extends ManagedObj {
  constructor(obj: any) {
    super(obj)
  }
  
  /** Generates a new `OutPoint` instance.
   *
   * @param ctxId - The transaction ID of the outpoint.
   * @param outIndex - The output index of the outpoint.
   * @return A new `OutPoint` instance with the specified transaction ID and output index.
   */
  static generate(
    ctxId: CTxId,
    outIndex: number,
  ) {
    const rv = genOutPoint(ctxId.serialize(), outIndex)
    const obj = rv.value
    freeObj(rv)
    return new OutPoint(obj)
  }

  override value(): any {
    return castToOutPoint(this.obj)
  }

  override serialize(): string {
    return serializeOutPoint(this.value())
  }

  /** Deserializes an `OutPoint` from its hexadecimal representation.
   *
   * @param hex - The hexadecimal string to deserialize.
   * @returns A new `OutPoint` instance.
   */
  static deserialize(
    this: new (obj: any) => OutPoint,
    hex: string
  ): OutPoint {
    return OutPoint._deserialize(hex, deserializeOutPoint)
  }
}

