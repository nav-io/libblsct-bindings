import {
  fromChildKeyToBlindingKey,
  fromChildKeyToTokenKey,
  fromChildKeyToTxKey,
  fromSeedToChildKey,
} from '../blsct'

import { BlindingKey } from './childKeyDesc/blindingKey'
import { Scalar } from '../scalar'
import { TokenKey } from './childKeyDesc/tokenKey'
import { TxKey } from './childKeyDesc/txKey'

export class ChildKey extends Scalar {
  constructor(seed?: Scalar) {
    if (seed === undefined || seed === null) {
      seed = Scalar.random()
    }
    const obj = fromSeedToChildKey(seed.value())
    super(obj)
  }

  toBlindingKey(): BlindingKey {
    const obj = fromChildKeyToBlindingKey(this.value())
    return BlindingKey.fromObj(obj)
  }

  toTokenKey(): TokenKey {
    const obj = fromChildKeyToTokenKey(this.value())
    return TokenKey.fromObj(obj)
  }

  toTxKey(): TxKey {
    const obj = fromChildKeyToTxKey(this.value())
    return TxKey.fromObj(obj)
  }
}

