import {
  castToCTxIn,
  castToUint8_tPtr,
  getCTxInPrevOutHash,
  getCTxInPrevOutN,
  getCTxInScriptSig,
  getCTxInSequence,
  getCTxInScriptWitness,
  hexToMallocedBuf,
  toHex,
} from './blsct'

import { ManagedObj } from './managedObj'
import { Script } from './script'
import { CTxId } from './ctxId'

export class CTxIn extends ManagedObj {
  constructor(obj: any) {
    super(obj)
  }

  override value(): any {
    return castToCTxIn(this.obj)
  }

  getPrevOutHash(): CTxId {
    const obj = getCTxInPrevOutHash(this.value())
    return CTxId.fromObj(obj)
  }

  getPrevOutN(): number {
    return getCTxInPrevOutN(this.value())
  }

  getScriptsig(): Script {
    const obj = getCTxInScriptSig(this.value())
    return Script.fromObj(obj)
  }

  getSequence(): number {
    return getCTxInSequence(this.value())
  }

  getScriptWitness(): Script {
    const obj = getCTxInScriptWitness(this.value())
    return Script.fromObj(obj)
  }

  override serialize(): string {
    const buf = castToUint8_tPtr(this.value())
    return toHex(buf, this.size())
  }

  static deserialize(
    this: new (obj: any) => CTxIn,
    hex: string
  ): CTxIn {
    if (hex.length % 2 !== 0) {
      hex = `0${hex}`
    }
    const obj = hexToMallocedBuf(hex)
    const x = new CTxIn(obj)
    x.objSize = hex.length / 2 
    return x
  }
}

