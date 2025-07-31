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

  getSpendingKey(): SpendingKey {
    const obj = getCTxOutSpendingKey(this.value())
    return SpendingKey.fromObj(obj)
  }

  getEphemeralKey(): Point {
    const obj = getCTxOutEphemeralKey(this.value())
    return Point.fromObj(obj)
  }

  getBlindingKey(): BlindingKey {
    const obj = getCTxOutBlindingKey(this.value())
    return BlindingKey.fromObj(obj)
  }

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

  getViewTag(): number {
    return getCTxOutViewTag(this.value())
  }
}

