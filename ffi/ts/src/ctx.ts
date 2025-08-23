import {
  addTxInToVec,
  addTxOutToVec,
  BLSCT_IN_AMOUNT_ERROR,
  BLSCT_OUT_AMOUNT_ERROR,
  buildCTx,
  castToUint8_tPtr,
  createTxInVec,
  createTxOutVec,
  freeObj,
  getCTxId,
  getCTxIn,
  getCTxInCount,
  getCTxIns,
  getCTxOut,
  getCTxOutCount,
  getCTxOuts,
  hexToMallocedBuf,
  toHex,
} from './blsct'

import { CTxId } from './ctxId'
import { CTxIn } from './ctxIn'
import { CTxOut } from './ctxOut'
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
    super(obj)
  }

  /** Constructs a new `CTx` instance.
   * @param srcTxIns - An array of `TxIn` objects representing the transaction inputs.
   * @param srcTxOuts - An array of `TxOut` objects representing the transaction outputs.
   * @returns A new `CTx` instance.
   */
  static generate(
    srcTxIns: TxIn[],
    srcTxOuts: TxOut[]
  ): CTx {
    const txIns: TxIn[] = []
    for (const srcTxIn of srcTxIns) {
      txIns.push(srcTxIn.clone())
    }

    const txOuts: TxOut[] = []
    for (const srcTxOut of srcTxOuts) {
      txOuts.push(srcTxOut.clone())
    }

    const freeTxInsOuts = () => {
      for (const txIn of txIns) {
        freeObj(txIn)
      }
      for (const txOut of txOuts) {
        freeObj(txOut)
      }
    }

    // create vector and add txIns to it
    const txInVec = createTxInVec()
    for (const txIn of txIns) {
      addTxInToVec(txInVec, txIn.value())
    }

    // create vector and add txOuts to it
    const txOutVec = createTxOutVec()
    for (const txOut of txOuts) {
      addTxOutToVec(txOutVec, txOut.value())
    }

    const rv = buildCTx(txInVec, txOutVec)

    // free the temporary vectors
    freeObj(txInVec)
    freeObj(txOutVec)

    if (rv.result === BLSCT_IN_AMOUNT_ERROR) {
      const msg = `Failed to build transaction. txIns[${rv.in_amount_err_index}] has an invalid amount`
      freeObj(rv)
      freeTxInsOuts()
      throw new Error(msg)
    }
    if (rv.result === BLSCT_OUT_AMOUNT_ERROR) {
      const msg = `Failed to build transaciton. tx_outs[${rv.out_amount_err_index}] has an invalid amount`
      freeObj(rv)
      freeTxInsOuts()
      throw new Error(msg)
    }

    if (rv.result !== 0) {
      freeTxInsOuts()
      const msg = `building tx failed. Error code = ${rv.result}`
      freeObj(rv)
      throw new Error(msg)
    }

    const obj = rv.ser_ctx // rv.ser_ctx is a byte array
    const objSize = rv.ser_ctx_size // rv.ser_ctx_size is the byte array size
    freeObj(rv)
    return CTx.fromObjAndSize(obj, objSize)
  }

  override value(): any {
    return castToUint8_tPtr(this.obj)
  }

  /** Returns the transaction ID of this confidential transaction.
   * @returns The transaction ID.
   */
  getCTxId(): CTxId {
    const txIdHex = getCTxId(this.value(), this.size())
    return CTxId.deserialize(txIdHex)
  }

  /** Returns the number of transaction inputs in this confidential transaction.
   * @returns The number of transaction inputs.
   */
  getCTxIns(): CTxIn[] {
    const ctxIns = getCTxIns(this.value(), this.size())
    const numCtxIns = getCTxInCount(ctxIns)

    const xs: CTxIn[] = []
    for (let i=0; i<numCtxIns; ++i) {
      const rv = getCTxIn(ctxIns, i)
      const x = CTxIn.fromObjAndSize(rv.value, rv.value_size)
      xs.push(x)
    }

    freeObj(ctxIns)
    return xs
  }

  /** Returns the number of transaction outputs in this confidential transaction.
   * @returns The number of transaction outputs.
   */ 
  getCTxOuts(): CTxOut[] {
    const ctxOuts = getCTxOuts(this.value(), this.size())
    const numCtxOuts = getCTxOutCount(ctxOuts)

    const xs: CTxOut[] = []
    for (let i=0; i<numCtxOuts; ++i) {
      const rv = getCTxOut(ctxOuts, i)
      const x = CTxOut.fromObjAndSize(rv.value, rv.value_size)
      xs.push(x)
    }

    freeObj(ctxOuts)
    return xs
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

