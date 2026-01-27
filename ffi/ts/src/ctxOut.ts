import {
  castToCTxOut,
  castToUint8_tPtr,
  freeObj,
  getCTxOutBlindingKey,
  getCTxOutEphemeralKey,
  getCTxOutRangeProof,
  getCTxOutScriptPubkey,
  getCTxOutSpendingKey,
  getCTxOutTokenId,
  getCTxOutValue,
  getCTxOutVectorPredicate,
  getCTxOutViewTag,
  hexToMallocedBuf,
  toHex,
} from './blsct'

import { Point } from './point'
import { RangeProof } from './rangeProof'
import { Scalar } from './scalar'
import { Script } from './script'
import { TokenId } from './tokenId'

/** Represents a transaction output in a constructed confidential transaction. Also known as `CTxOut` on the C++ side.
 *
 * For code examples, see the `ctx.ts` class documentation.
 */
export class CTxOut {
  private obj: any
  private rangeProofCache?: RangeProof

  constructor(obj: any) {
    this.obj = obj
  }

  /** Returns the value of the transaction output.
   * * @returns The value of the output.
   */
  getValue(): bigint {
    return getCTxOutValue(this.obj)
  }

  /** Returns the `scriptPubKey' of the transaction output.
   * * @returns The `scriptPubKey` of the output.
   */
  getScriptPubKey(): Script {
    const obj = getCTxOutScriptPubkey(this.obj)
    return Script.fromObj(obj)
  }

  /** Returns the token ID associated with the transaction output.
   * @returns The token ID of the output.
   */
  getTokenId(): TokenId {
    const obj = getCTxOutTokenId(this.obj)
    return TokenId.fromObj(obj)
  }

  /** Returns the vector predicate of the transaction output.
   * * @returns The vector predicate as a hexadecimal string.
   */
  getVectorPredicate(): string {
    const rv = getCTxOutVectorPredicate(this.obj)
    if (rv.result != 0) {
      const msg = `Failed to get vector predicate. Error code = ${rv.result}`
      freeObj(rv)
      throw new Error(msg)
    }
    if (rv.value_size !== 0) {
      freeObj(rv)
      return ""
    }
    const buf = castToUint8_tPtr(rv.value)
    const hex = toHex(buf, rv.value_size)
    freeObj(rv)
    return hex 
  }

  /** Returns the spending key associated with the transaction output.
   * @returns The spending key of the output.
   */
  getSpendingKey(): Scalar {
    const obj = getCTxOutSpendingKey(this.obj)
    return Scalar.fromObj(obj)
  }
  
  /** Returns the ephemeral key associated with the transaction output.
   * @returns The ephemeral key of the output.
   */
  getEphemeralKey(): Point {
    const obj = getCTxOutEphemeralKey(this.obj)
    return Point.fromObj(obj)
  }

  /** Returns the blinding key associated with the transaction output.
   * @returns The blinding key of the output.
   */
  getBlindingKey(): Scalar {
    const obj = getCTxOutBlindingKey(this.obj)
    return Scalar.fromObj(obj)
  }

  /** Returns the range proof associated with the transaction output.
   * @returns The range proof of the output.
   */
  getRangeProof(): RangeProof {
    if (this.rangeProofCache !== undefined) {
      return this.rangeProofCache
    }
    const rv = getCTxOutRangeProof(this.obj)
    const x = RangeProof.fromObjAndSize(rv.value, rv.value_size)
    freeObj(rv)
    this.rangeProofCache = x
    return x
  }

  /** Returns the view tag associated with the view of the transaction output.
   * @returns The view tag of the output.
   */
  getViewTag(): number {
    return getCTxOutViewTag(this.obj)
  }
}

