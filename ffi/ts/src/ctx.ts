import {
  addToTxInVec,
  addToTxOutVec,
  BLSCT_IN_AMOUNT_ERROR,
  BLSCT_OUT_AMOUNT_ERROR,
  buildCTx,
  castToUint8_tPtr,
  createTxInVec,
  createTxOutVec,
  deleteCTx,
  deleteTxInVec,
  deleteTxOutVec,
  freeObj,
  getCTxId,
  getCTxIns,
  getCTxOuts,
  hexToMallocedBuf,
  toHex,
} from './blsct'

import { CTxId } from './ctxId'
import { CTxIns } from './ctxIns'
import { CTxOuts } from './ctxOuts'
import { ManagedObj } from './managedObj'
import { TxIn } from './txIn'
import { TxOut } from './txOut'

/** Represents a confidential transaction. Also known as `CMutableTransaction` on the C++ side.
 * Examples:
 * ```ts
 * const { CTx, CTxId, TxIn, TxOut, ChildKey, SpendingKey, SubAddr, SubAddrId, DoublePublicKey, OutPoint, PublicKey, TokenId, CTX_ID_SIZE } = require('navio-blsct')
 * const { randomBytes } = require('crypto')
 * const cTxIdHex = randomBytes(CTX_ID_SIZE).toString('hex')
 * const cTxId = CTxId.deserialize(cTxIdHex)
 * const numTxIn = 1
 * const numTxOut = 1
 * const defaultFee = 200000
 * const fee = (numTxIn + numTxOut) * defaultFee
 * const outAmount = 10000
 * const inAmount = fee + outAmount
 * const outIndex = 0
 * const outPoint = OutPoint.generate(cTxId, outIndex)
 * const gamma = 100
 * const spendingKey = new SpendingKey()
 * const tokenId = TokenId.default()
 * const txIn = TxIn.generate(inAmount, gamma, spendingKey, tokenId, outPoint)
 * const viewKey = new ChildKey().toTxKey().toViewKey()
 * const spendingPubKey = new PublicKey()
 * const subAddrId = SubAddrId.generate(123, 456)
 * const subAddr = SubAddr.generate(viewKey, spendingPubKey, subAddrId)
 * const txOut = TxOut.generate(subAddr, outAmount, 'navio')
 * const cTx = CTx.generate([txIn], [txOut])
 * for (const cTxIn of cTx.getCTxIns()) {
 *   console.log(`prevOutHash: ${cTxIn.getPrevOutHash()}`)
 *   console.log(`prevOutN: ${cTxIn.getPrevOutN()}`)
 *   console.log(`scriptSig: ${cTxIn.getScriptSig()}`)
 *   console.log(`sequence: ${cTxIn.getSequence()}`)
 *   console.log(`scriptWitness: ${cTxIn.getScriptWitness()}`)
 * }
 * for (const cTxOut of cTx.getCTxOuts()) {
 *   console.log(`value: ${cTxOut.getValue()}`)
 *   console.log(`script_pub_key: ${cTxOut.getScriptPubKey()}`)
 *   console.log(`blsctData.spendingKey: ${cTxOut.blsctData().getSpendingKey()}`)
 *   console.log(`blsctData.ephemeralKey: ${cTxOut.blsctData().getEphemeralKey()}`)
 *   console.log(`blsctData.blindingKey: ${cTxOut.blsctData().getBlindingKey()}`)
 *   console.log(`blsctData.viewTag: ${cTxOut.blsctData().getViewTag()}`)
 *   const rp = cTxOut.blsctData().getRangeProof()
 *   console.log(`blsctData.rangeProof.A: ${rp.get_A()}`)
 *   console.log(`blsctData.rangeProof.A_wip: ${rp.get_A_wip()}`)
 *   console.log(`blsctData.rangeProof.B: ${rp.get_B()}`)
 *   console.log(`blsctData.rangeProof.r_prime: ${rp.get_r_prime()}`)
 *   console.log(`blsctData.rangeProof.s_prime: ${rp.get_s_prime()}`)
 *   console.log(`blsctData.rangeProof.delta_prime: ${rp.get_delta_prime()}`)
 *   console.log(`blsctData.rangeProof.alpha_hat: ${rp.get_alpha_hat()}`)
 *   console.log(`blsctData.rangeProof.tau_x: ${rp.get_tau_x()}`)
 *   console.log(`tokenId: token=${cTxOut.getTokenId().getToken()}, subid=${cTxOut.getTokenId().getSubid()}`)
 *   console.log(`vector_predicate: ${cTxOut.getVectorPredicate()}`)
 * }
 * const ser = cTx.serialize()
 * const deser = CTx.deserialize(ser)
 * ser === deser.serialize() // true 
 */
export class CTx extends ManagedObj {
  constructor(obj: any) {
    super(obj, () => deleteCTx(obj))
  }

  /** Constructs a new `CTx` instance.
   * @param srcTxIns - An array of `TxIn` objects representing the transaction inputs.
   * @param srcTxOuts - An array of `TxOut` objects representing the transaction outputs.
   * @returns A new `CTx` instance.
   */
  static generate(
    txIns: TxIn[],
    txOuts: TxOut[]
  ): CTx {
    // create vector and add txIns to it
    const txInVec = createTxInVec()
    for (const txIn of txIns) {
      addToTxInVec(txInVec, txIn.value())
    }

    // create vector and add txOuts to it
    const txOutVec = createTxOutVec()
    for (const txOut of txOuts) {
      addToTxOutVec(txOutVec, txOut.value())
    }

    const rv = buildCTx(txInVec, txOutVec)

    // free the temporary vectors
    deleteTxInVec(txInVec)
    deleteTxOutVec(txOutVec)

    if (rv.result === BLSCT_IN_AMOUNT_ERROR) {
      const msg = `Failed to build transaction. txIns[${rv.in_amount_err_index}] has an invalid amount`
      freeObj(rv)
      throw new Error(msg)
    }
    if (rv.result === BLSCT_OUT_AMOUNT_ERROR) {
      const msg = `Failed to build transaciton. tx_outs[${rv.out_amount_err_index}] has an invalid amount`
      freeObj(rv)
      throw new Error(msg)
    }

    if (rv.result !== 0) {
      const msg = `building tx failed. Error code = ${rv.result}`
      freeObj(rv)
      throw new Error(msg)
    }

    const obj = rv.ctx
    freeObj(rv)
    return CTx.fromObjAndSize(obj, 0)
  }

  override value(): any {
    return castToUint8_tPtr(this.obj)
  }

  /** Returns the transaction ID of this confidential transaction.
   * @returns The transaction ID.
   */
  getCTxId(): CTxId {
    const txIdHex = getCTxId(this.value())
    return CTxId.deserialize(txIdHex)
  }

  /** Returns the number of transaction inputs in this confidential transaction.
   * @returns The number of transaction inputs.
   */
  getCTxIns(): CTxIns {
    return new CTxIns(getCTxIns(this.value()))
  }

  /** Returns the number of transaction outputs in this confidential transaction.
   * @returns The number of transaction outputs.
   */ 
  getCTxOuts(): CTxOuts {
    return new CTxOuts(getCTxOuts(this.value()))
  }

  override serialize(): string {
    const buf = castToUint8_tPtr(this.value())
    return toHex(buf, this.size())
  }

  /** Deserializes a hexadecimal string into a `CTx` instance.
   * @param hex - The hexadecimal string to deserialize.
   * @returns A new `CTx` instance.
   */
  static deserialize(hex: string): CTx {
    if (hex.length % 2 !== 0) {
      hex = `0${hex}`
    }
    const objSize = hex.length / 2
    const obj = hexToMallocedBuf(hex)

    return CTx.fromObjAndSize(obj, objSize)
  }
}

