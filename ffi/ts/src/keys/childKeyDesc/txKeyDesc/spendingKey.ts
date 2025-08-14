import { Scalar } from '../../../scalar'

/** Represents a spending key. A spending key is a Scalar and introduces no new functionality; it serves purely as a semantic alias.
 *
 * Examples:
 * ```ts
 * const { Scalar, ChildKey } = require('navio-blsct')
 * const s = Scalar.random()
 * const ck = new ChildKey(s)
 * const txk = ck.toTxKey()
 * txk.toSpendingKey()
 * ```
 */
export class SpendingKey extends Scalar {
  constructor(obj?: any) {
    super(obj)
  }
}

