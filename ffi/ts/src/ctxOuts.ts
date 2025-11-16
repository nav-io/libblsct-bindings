import {
  getCTxOutAt,
  getCTxOutsSize,
} from './blsct'

import { CTxOut } from './ctxOut'

export class CTxOuts {
  private obj: any

  constructor(obj: any) {
    this.obj = obj
  }
  
  at = (i: number): CTxOut => {
    const size = this.size()
    if (i < 0 || i >= size) {
      throw new RangeError(`Index ${i} is out of bounds. the size is ${size}`)
    }
    const obj = getCTxOutAt(this.obj, i)
    return new CTxOut(obj)
  }

  size = (): number => {
    return getCTxOutsSize(this.obj)
  }
}

