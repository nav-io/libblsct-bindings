import {
  fromTxKeyToSpendingKey,
  fromTxKeyToViewKey
} from '../../blsct'

import { Scalar } from '../../scalar'
import { SpendingKey } from './txKeyDesc/spendingKey'
import { ViewKey } from './txKeyDesc/viewKey'

/** Represents a tx key. A tx key is a Scalar and introduces no new functionality; it serves purely as a semantic alias. Both SpendingKey and ViewKey are exclusively derived from a TxKey.
 *
 * Examples:
 * ```ts
 * const { Scalar, ChildKey } = require('navio-blsct')
 * const s = Scalar.random()
 * const ck = new ChildKey(s)
 * const txk = ck.toTxKey()
 * txk.toSpendingKey()
 * txk.toViewKey()
 * ```
 */
export class TxKey extends Scalar {
  constructor(obj?: any) {
    super(obj)
  }

  toSpendingKey(): SpendingKey {
    const obj = fromTxKeyToSpendingKey(this.value())
    return new SpendingKey(obj)
  }

  toViewKey(): ViewKey {
    const obj = fromTxKeyToViewKey(this.value())
    return new ViewKey(obj)
  }
}

