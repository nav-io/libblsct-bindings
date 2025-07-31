import {
  POINT_SIZE,
} from './blsct'

import { Point } from './point'
import { RangeProof } from './rangeProof'

export class AmountRecoveryReq {
  rangeProof: RangeProof
  nonce: Point

  constructor(
    rangeProof: RangeProof,
    nonce: Point,
  ) {
    this.rangeProof = rangeProof
    this.nonce = nonce
  }

  toString(): string {
    return `${this.constructor.name}(${this.rangeProof}, ${this.nonce})`
  }

  serialize(): string {
    const serRangeProof = this.rangeProof.serialize()
    const serNonce = this.nonce.serialize()
    return `${serRangeProof}${serNonce}`
  }

  static deserialize(
    hex: string
  ): AmountRecoveryReq {
    if (hex.length % 2 !== 0) {
      hex = `0${hex}`
    }
    const nonceHexLen = POINT_SIZE * 2
    const rangeProofHexLen = hex.length - nonceHexLen
    
    const rangeProofHex = hex.slice(0, rangeProofHexLen)
    const nonceHex = hex.slice(rangeProofHexLen)

    const rangeProof = RangeProof.deserialize(rangeProofHex)
    const nonce = Point.deserialize(nonceHex)

    return new AmountRecoveryReq(rangeProof, nonce)
  }
}

