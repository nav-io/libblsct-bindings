import {
  castToCTxOut,
  freeObj,
  getCTxOutBlindingKey,
  getCTxOutEphemeralKey,
  getCTxOutSpendingKey,
  getCTxOutRangeProof,
  getCTxOutViewTag,
} from './blsct'

import { BlindingKey } from './keys/childKeyDesc/blindingKey'
import { ManagedObj } from './managedObj'
import { Point } from './point'
import { RangeProof } from './rangeProof'
import { SpendingKey } from './keys/childKeyDesc/txKeyDesc/spendingKey'

/** Represents a blsct-related data in transaction output in a constructed confidential transaction.
 *
 * Also known as `CTxOutBlsctData` on the C++ side. This class provides access to the `CTxOutBlsctData` object, but does not own neither the `CTxOut` nor `CTxOutBlsctData` object.
 *
 * For code examples, see the `ctx.ts` class documentation.
 */
export class CTxOutBlsctData extends ManagedObj {
  rangeProofCache?: RangeProof

  constructor(obj: any) {
    super(obj)
    this.fi.isBorrow = true
  }

  override value(): any {
    // all the properties provided by this class
    // are actually properties of CTxOut
    return castToCTxOut(this.obj)
  }

  /** Returns the spending key associated with the transaction output.
   * @returns The spending key of the output.
   */
  getSpendingKey(): SpendingKey {
    const obj = getCTxOutSpendingKey(this.value())
    return SpendingKey.fromObj(obj)
  }
  
  /** Returns the ephemeral key associated with the transaction output.
   * @returns The ephemeral key of the output.
   */
  getEphemeralKey(): Point {
    const obj = getCTxOutEphemeralKey(this.value())
    return Point.fromObj(obj)
  }

  /** Returns the blinding key associated with the transaction output.
   * @returns The blinding key of the output.
   */
  getBlindingKey(): BlindingKey {
    const obj = getCTxOutBlindingKey(this.value())
    return BlindingKey.fromObj(obj)
  }

  /** Returns the range proof associated with the transaction output.
   * @returns The range proof of the output.
   */
  getRangeProof(): RangeProof {
    if (this.rangeProofCache !== undefined) {
      return this.rangeProofCache
    }
    const rv = getCTxOutRangeProof(this.value())
    const x = RangeProof.fromObjAndSize(rv.value, rv.value_size)
    freeObj(rv)
    this.rangeProofCache = x
    return x
  }

  /** Returns the view tag associated with the view of the transaction output.
   * @returns The view tag of the output.
   */
  getViewTag(): number {
    return getCTxOutViewTag(this.value())
  }
}

