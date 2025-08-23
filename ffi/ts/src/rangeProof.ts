import {
  addRangeProofToVec,
  addToAmountRecoveryReqVec,
  addToUint64Vec,
  buildRangeProof,
  createAmountRecoveryReqVec,
  castToRangeProof,
  createRangeProofVec,
  createUint64Vec,
  deserializeRangeProof,
  freeAmountRecoveryReqVec,
  freeAmountsRetVal,
  freeObj,
  freeRangeProofVec,
  freeUint64Vec,
  genAmountRecoveryReq,
  getAmountRecoveryResultAmount,
  getAmountRecoveryResultIsSucc,
  getAmountRecoveryResultMsg,
  getAmountRecoveryResultSize,
  getRangeProof_A,
  getRangeProof_alpha_hat,
  getRangeProof_A_wip,
  getRangeProof_B,
  getRangeProof_delta_prime,
  getRangeProof_r_prime,
  getRangeProof_s_prime,
  getRangeProof_tau_x,
  recoverAmount,
  serializeRangeProof,
  verifyRangeProofs,
} from './blsct'

import { AmountRecoveryReq } from './amountRecoveryReq'
import { AmountRecoveryRes } from './amountRecoveryRes'
import { ManagedObj } from './managedObj'
import { Point } from './point'
import { Scalar } from './scalar'
import { TokenId } from './tokenId'

/** Represents a (possibly aggregated) range proof for one or more confidential transaction amounts.
 *
 * Examples:
 * ```ts
 * const { RangeProof, AmountRecoveryReq, AmountRecoveryRes, Point, TokenId } = require('navio-blsct')
 * const nonce = Point.random()
 * const tokenId = TokenId.default()
 * const rp = RangeProof.generate([456], nonce, 'navio', tokenId)
 * RangeProof.verifyProofs([rp]) // true
 * const req = new AmountRecoveryReq(rp, nonce)
 * const res = RangeProof.recoverAmounts([req1])
 * res[0].isSucc // true
 * res[0].amount // 456
 * res[0].message // 'navio'
 * rp.get_A() // Point object representing A
 * rp.get_A_wip() // Point object representing A_wip
 * rp.get_B() // Point object representing B
 * rp.get_r_prime() // Scalar object representing r'
 * rp.get_s_prime() // Scalar object representing s'
 * rp.get_delta_prime() // Scalar object representing delta'
 * rp.get_alpha_hat() // Scalar object representing alpha_hat
 * rp.get_tau_x() // Scalar object representing tau_x
 * const ser = rp.serialize()
 * const deser = RangeProof.deserialize(ser)
 * ser === deser.serialize() // true
 * ```
 */
export class RangeProof extends ManagedObj {
  constructor(obj: any) {
    super(obj)
  }

  /** Generates a range proof for the given amounts, nonce, and message.
   * @param amounts - An array of amounts to be included in the range proof.
   * @param nonce - A nonce used to generate the range proof.
   * @param msg - A message associated with the range proof.
   * @param tokenId - An optional token ID. If not provided, a default token ID is used.
   * @returns A new `RangeProof` instance containing the generated range proof.
   */
  static generate(
    amounts: number[],
    nonce: Point,
    msg: string,
    tokenId?: TokenId,
  ): RangeProof {
    tokenId = tokenId ?? TokenId.default()

    const vec = createUint64Vec()
    for (const amount of amounts) {
      addToUint64Vec(vec, amount)
    }

    const rv = buildRangeProof(
      vec,
      nonce.value(),
      msg,
      tokenId.value(),
    )
    freeUint64Vec(vec)

    if (rv.result !== 0) {
      const msg = `Building range proof failed. Error code = ${rv.result}`
      freeObj(rv)
      throw new Error(msg)
    }
    const x = RangeProof.fromObjAndSize(
      rv.value,
      rv.value_size,
    )
    freeObj(rv)
    return x
  }

  /** Verifies a list of range proofs.
   * @param proofs - An array of `RangeProof` instances to be verified.
   * @returns `true` if all proofs are valid, `false` otherwise.
   */
  static verifyProofs(proofs: RangeProof[]): boolean {
    const vec = createRangeProofVec()
    for (const proof of proofs) {
      addRangeProofToVec(vec, proof.size(), proof.value())
    }
    
    const rv = verifyRangeProofs(vec)
    if (rv.result !== 0) {
      const msg = `Verifying range proofs failed. Error code = ${rv.result}`
      freeObj(rv)
      throw new Error(msg)
    }
    freeRangeProofVec(vec)
    return rv.value
  }

  /** Recovers amounts from a list of `AmountRecoveryReq` instances.
   * @param reqs - An array of `AmountRecoveryReq` instances containing range proofs and nonces.
   * @returns An array of `AmountRecoveryRes` instances containing the recovery results.
   */
  recoverAmounts(reqs: AmountRecoveryReq[]): AmountRecoveryRes[] {
    const reqVec = createAmountRecoveryReqVec()

    for (const req of reqs) {
      const blsctReq = genAmountRecoveryReq(
        req.rangeProof.value(),
        req.rangeProof.size(),
        req.nonce.value(),
      )
      addToAmountRecoveryReqVec(reqVec, blsctReq)
    }

    const rv = recoverAmount(reqVec)
    freeAmountRecoveryReqVec(reqVec)

    if (rv.result !== 0) {
      const msg = `Recovering amount failed. Error code = ${rv.result}`
      freeAmountsRetVal(rv)
      throw new Error(msg)
    } 

    let results: AmountRecoveryRes[] = []
    const size = getAmountRecoveryResultSize(rv.value)

    for (let i=0; i<size; ++i) {
      const isSucc = getAmountRecoveryResultIsSucc(rv.value, i)
      const amount = getAmountRecoveryResultAmount(rv.value, i)
      const msg = getAmountRecoveryResultMsg(rv.value, i)
      const x = new AmountRecoveryRes(
        isSucc, 
        amount,
        msg,
      )
      results.push(x)
    }
    
    freeAmountsRetVal(rv)
    return results
  }

  override value(): any {
    return castToRangeProof(this.obj)
  }

  override serialize(): string {
    return serializeRangeProof(this.value(), this.size())
  }

  /** Deserializes a hexadecimal string into a `RangeProof` instance.
   * @param hex - A hexadecimal string representing the serialized range proof.
   * @returns A new `RangeProof` instance containing the deserialized data.
   */
  static deserialize(
    this: new (obj: any) => RangeProof,
    hex: string
  ): RangeProof {
    return RangeProof._deserialize(hex, deserializeRangeProof)
  }

  /** Returns the A point of the range proof.
    * @returns A `Point` object representing the A point.
    */
  get_A(): Point {
    const obj = getRangeProof_A(this.value(), this.size())
    return Point.fromObj(obj)
  }

  /** Returns the A_wip point of the range proof.
   * @returns A `Point` object representing the A_wip point.
   */
  get_A_wip(): Point {
    const obj = getRangeProof_A_wip(this.value(), this.size())
    return Point.fromObj(obj)
  }

  /** Returns the B point of the range proof.
   * @returns A `Point` object representing the B point.
   */
  get_B(): Point {
    const obj = getRangeProof_B(this.value(), this.size())
    return Point.fromObj(obj)
  }

  /** Returns the r' scalar of the range proof.
   * @returns A `Scalar` object representing the r' scalar.
   */
  get_r_prime(): Scalar {
    const obj = getRangeProof_r_prime(this.value(), this.size())
    return Scalar.fromObj(obj)
  }

  /** Returns the s' scalar of the range proof.
   * @returns A `Scalar` object representing the s' scalar.
   */
  get_s_prime(): Scalar {
    const obj = getRangeProof_s_prime(this.value(), this.size())
    return Scalar.fromObj(obj)
  }

  /** Returns the tau_x scalar of the range proof.
   * @returns A `Scalar` object representing the tau_x scalar.
   */
  get_delta_prime(): Scalar {
    const obj = getRangeProof_delta_prime(this.value(), this.size())
    return Scalar.fromObj(obj)
  }

  /** Returns the alpha_hat scalar of the range proof.
   * @returns A `Scalar` object representing the alpha_hat scalar.
   */
  get_alpha_hat(): Scalar {
    const obj = getRangeProof_alpha_hat(this.value(), this.size())
    return Scalar.fromObj(obj)
  }

  /** Returns the tau_x scalar of the range proof.
   * @returns A `Scalar` object representing the t_aux scalar.
   */
  get_tau_x(): Scalar {
    const obj = getRangeProof_tau_x(this.value(), this.size())
    return Scalar.fromObj(obj)
  }
}

