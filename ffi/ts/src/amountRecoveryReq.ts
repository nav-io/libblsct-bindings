import {
  POINT_SIZE,
} from './blsct'

import { Point } from './point'
import { RangeProof } from './rangeProof'
import { TokenId } from './tokenId'

/** A request for recovering a single amount from a non-aggregated range proof.
 * Refer to `RangeProof` for a usage example.
 */
export class AmountRecoveryReq {
  rangeProof: RangeProof
  nonce: Point
  tokenId: TokenId

  /** Constructs a new `AmountRecoveryReq` instance.
   * @param rangeProof - The range proof to recover the amount from.
   * @param nonce - The nonce used to generate the range proof.
   */
  constructor(
    rangeProof: RangeProof,
    nonce: Point,
    tokenId: TokenId = TokenId.default(),
  ) {
    this.rangeProof = rangeProof
    this.nonce = nonce
    this.tokenId = tokenId
  }

  /** Returns a string representation of the `AmountRecoveryReq`.
   * @returns a string representation of the `AmountRecoveryReq`.
   */
  toString(): string {
    return `${this.constructor.name}(${this.rangeProof}, ${this.nonce})`
  }

  serialize(): string {
    const serRangeProof = this.rangeProof.serialize()
    const serNonce = this.nonce.serialize()
    return `${serRangeProof}${serNonce}`
  }

  /** Deserializes a hexadecimal string into an `AmountRecoveryReq` instance.
   * @param hex - The hexadecimal string to deserialize.
   * @returns An instance of `AmountRecoveryReq`.
   */
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

