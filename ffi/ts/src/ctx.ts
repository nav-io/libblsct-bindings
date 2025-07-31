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

export class CTx extends ManagedObj {
  constructor(obj: any) {
    super(obj)
  }

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
      freeObj(rv)
      freeTxInsOuts()
      throw new Error(`Failed to build transaction. txIns[${rv.in_amount_err_index}] has an invalid amount`)
    }
    if (rv.result === BLSCT_OUT_AMOUNT_ERROR) {
      freeObj(rv)
      freeTxInsOuts()
      throw new Error(`Failed to build transaciton. tx_outs[${rv.out_amount_err_index}] has an invalid amount`)
    }

    if (rv.result !== 0) {
      freeTxInsOuts()
      freeObj(rv)
      throw new Error(`building tx failed. Error code = ${rv.result}`)
    }

    const obj = rv.ser_ctx // rv.ser_ctx is a byte array
    const objSize = rv.ser_ctx_size // rv.ser_ctx_size is the byte array size
    freeObj(rv)
    return CTx.fromObjAndSize(obj, objSize)
  }

  override value(): any {
    return castToUint8_tPtr(this.obj)
  }

  getCTxId(): CTxId {
    const txIdHex = getCTxId(this.value(), this.size())
    return CTxId.deserialize(txIdHex)
  }

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

  static deserialize(hex: string): CTx {
    if (hex.length % 2 !== 0) {
      hex = `0${hex}`
    }
    const objSize = hex.length / 2
    const obj = hexToMallocedBuf(hex)

    return CTx.fromObjAndSize(obj, objSize)
  }
}

