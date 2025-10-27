import {
  castToCTxIn,
  castToUint8_tPtr,
  getCTxInPrevOutHash,
  getCTxInPrevOutN,
  getCTxInScriptSig,
  getCTxInSequence,
  getCTxInScriptWitness,
  hexToMallocedBuf,
  toHex,
} from './blsct'

import { ManagedObj } from './managedObj'
import { Script } from './script'
import { CTxId } from './ctxId'

/** Represents a transaction input in a constructed confidential transaction. Also known as `CTxIn` on the C++ side.
 *
 * For code examples, see the `ctx.ts` class documentation.
 */
export class CTxIn extends ManagedObj {
  constructor(obj: any) {
    super(obj)
  }

  override value(): any {
    return castToCTxIn(this.obj)
  }

  /** Returns the transaction ID of the previous output being spent.
   * @returns The transaction ID of the previous output.
   */
  getPrevOutHash(): CTxId {
    const obj = getCTxInPrevOutHash(this.value())
    return CTxId.fromObj(obj)
  }

  /** Returns the index of the previous output being spent.
   * @returns The index of the previous output.
   */
  getPrevOutN(): number {
    return getCTxInPrevOutN(this.value())
  }

  /** Returns the `scriptSig` of the input.
   * @returns The `scriptSig`.
   */
  getScriptSig(): Script {
    const obj = getCTxInScriptSig(this.value())
    return Script.fromObj(obj)
  }

  /** Returns the sequence number of the input.
   * @returns The sequence number.
   */
  getSequence(): number {
    return getCTxInSequence(this.value())
  }

  /** Returns the `scriptWitness` of the input.
   * @returns The `scriptWitness`.
   */
  getScriptWitness(): Script {
    const obj = getCTxInScriptWitness(this.value())
    return Script.fromObj(obj)
  }

  override serialize(): string {
    const buf = castToUint8_tPtr(this.value())
    return toHex(buf, this.size())
  }

  /** Deserializes a `CTxIn` from its hexadecimal representation.
   * @param hex - The hexadecimal string to deserialize.
   * @returns A new `CTxIn` instance.
   */
  static deserialize(
    this: new (obj: any) => CTxIn,
    hex: string
  ): CTxIn {
    if (hex.length % 2 !== 0) {
      hex = `0${hex}`
    }
    const obj = hexToMallocedBuf(hex)
    const x = new CTxIn(obj)
    x.objSize = hex.length / 2 
    return x
  }
}

