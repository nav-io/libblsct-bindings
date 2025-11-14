import {
  getCTxInPrevOutHash,
  getCTxInPrevOutN,
  getCTxInScriptSig,
  getCTxInSequence,
  getCTxInScriptWitness,
} from './blsct'

import { Script } from './script'
import { CTxId } from './ctxId'

/** Represents a transaction input in a constructed confidential transaction. Also known as `CTxIn` on the C++ side.
 *
 * For code examples, see the `ctx.ts` class documentation.
 */
export class CTxIn {
  private obj: any

  constructor(obj: any) {
    this.obj = obj
  }

  /** Returns the transaction ID of the previous output being spent.
   * @returns The transaction ID of the previous output.
   */
  getPrevOutHash(): CTxId {
    const obj = getCTxInPrevOutHash(this.obj)
    return CTxId.fromObj(obj)
  }

  /** Returns the index of the previous output being spent.
   * @returns The index of the previous output.
   */
  getPrevOutN(): number {
    return getCTxInPrevOutN(this.obj)
  }

  /** Returns the `scriptSig` of the input.
   * @returns The `scriptSig`.
   */
  getScriptSig(): Script {
    const obj = getCTxInScriptSig(this.obj)
    return Script.fromObj(obj)
  }

  /** Returns the sequence number of the input.
   * @returns The sequence number.
   */
  getSequence(): number {
    return getCTxInSequence(this.obj)
  }

  /** Returns the `scriptWitness` of the input.
   * @returns The `scriptWitness`.
   */
  getScriptWitness(): Script {
    const obj = getCTxInScriptWitness(this.obj)
    return Script.fromObj(obj)
  }
}

