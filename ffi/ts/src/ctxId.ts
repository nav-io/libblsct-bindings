import {
  castToUint8_tPtr,
  CTX_ID_SIZE,
  hexToMallocedBuf,
  toHex,
} from './blsct'

import { ManagedObj } from './managedObj'

export class CTxId extends ManagedObj {
  constructor(obj: any) {
    super(obj)
  }

  override value(): any {
    return castToUint8_tPtr(this.obj)
  }

  override serialize(): string {
    const buf = this.value()
    return toHex(buf, CTX_ID_SIZE)
  }

  static deserialize(
    this: new (obj: any) => CTxId,
    hex: string
  ): CTxId {
    if (hex.length % 2 !== 0) {
      hex = `0${hex}`
    }
    if (hex.length !== CTX_ID_SIZE * 2) {
      throw new Error(`Invalir TxId hex length. Expected ${CTX_ID_SIZE * 2}, but got ${hex.length}.`)
    }

    const obj = hexToMallocedBuf(hex) 
    return new CTxId(obj)
  }
}

