import {
  fromTxKeyToSpendingKey,
  fromTxKeyToViewKey
} from '../blsct'

import { Scalar } from '../scalar'

/** Represents a tx key. A tx key is a Scalar and introduces no new functionality; it serves purely as a semantic alias. Both SpendingKey and ViewKey are exclusively derived from a TxKey.
 *
 * Examples:
 * ```ts
 * const { Scalar, ChildKey } = require('navio-blsct')
 * const s = Scalar.random()
 * const ck = new ChildKey(s)
 * const tk = ck.toTxKey()
 * tk.toSpendingKey()
 * tk.toViewKey()
 * ```
 */
export class TxKey extends Scalar {
  constructor(obj?: any) {
    super(obj)
  }

  toSpendingKey(): Scalar {
    const obj = fromTxKeyToSpendingKey(this.value())
    return Scalar.fromObj(obj)
  }

  toViewKey(): Scalar {
    const obj = fromTxKeyToViewKey(this.value())
    return Scalar.fromObj(obj)
  }
}

