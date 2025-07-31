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
  getRangeProof_t_aux,
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

export class RangeProof extends ManagedObj {
  constructor(obj: any) {
    super(obj)
  }

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
      freeObj(rv)
      console.log(`exception 1`)
      throw new Error(`Building range proof failed. Error code = ${rv.result}`)
    }
    const x = RangeProof.fromObjAndSize(
      rv.value,
      rv.value_size,
    )
    freeObj(rv)
    return x
  }

  verifyProofs(proofs: RangeProof[]): boolean {
    const vec = createRangeProofVec()
    for (const proof of proofs) {
      addRangeProofToVec(vec, proof.size(), proof.value())
    }
    
    const rv = verifyRangeProofs(vec)
    if (rv.result !== 0) {
      freeObj(rv)
      throw new Error(`Verifying range proofs failed. Error code = ${rv.result}`)
    }
    freeRangeProofVec(vec)
    return rv.value
  }

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
      freeAmountsRetVal(rv)
      throw new Error(`Recovering amount failed. Error code = ${rv.result}`)
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

  static deserialize(
    this: new (obj: any) => RangeProof,
    hex: string
  ): RangeProof {
    return RangeProof._deserialize(hex, deserializeRangeProof)
  }

  get_A(): Point {
    const obj = getRangeProof_A(this.value(), this.size())
    return Point.fromObj(obj)
  }

  get_A_wip(): Point {
    const obj = getRangeProof_A_wip(this.value(), this.size())
    return Point.fromObj(obj)
  }

  get_B(): Point {
    const obj = getRangeProof_B(this.value(), this.size())
    return Point.fromObj(obj)
  }

  get_r_prime(): Scalar {
    const obj = getRangeProof_r_prime(this.value(), this.size())
    return Scalar.fromObj(obj)
  }

  get_s_prime(): Scalar {
    const obj = getRangeProof_s_prime(this.value(), this.size())
    return Scalar.fromObj(obj)
  }

  get_delta_prime(): Scalar {
    const obj = getRangeProof_delta_prime(this.value(), this.size())
    return Scalar.fromObj(obj)
  }

  get_alpha_hat(): Scalar {
    const obj = getRangeProof_alpha_hat(this.value(), this.size())
    return Scalar.fromObj(obj)
  }

  get_t_aux(): Scalar {
    const obj = getRangeProof_t_aux(this.value(), this.size())
    return Scalar.fromObj(obj)
  }
}

