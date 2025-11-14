import {
  getCTxInAt,
  getCTxInsSize,
} from './blsct'

import { CTxIn } from './ctxIn'

export class CTxIns {
  private obj: any

  constructor(obj: any) {
    this.obj = obj
  }
  
  at = (i: number): CTxIn => {
    const size = this.size()
    if (i < 0 || i >= size) {
      throw new RangeError(`Index ${i} is out of bounds. the size is ${size}`)
    }
    const obj = getCTxInAt(this.obj, i)
    return new CTxIn(obj)
  }

  size = (): number => {
    return getCTxInsSize(this.obj)
  }
}

