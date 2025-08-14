import { Scalar } from '../../scalar'

/** Represents a token key. A token key is a Scalar and introduces no new functionality; it serves purely as a semantic alias.
 *
 * Examples:
 * ```ts
 * const { Scalar, ChildKey } = require('navio-blsct')
 * const s = Scalar.random()
 * const ck = new ChildKey(s)
 * ck.toTokenKey()
 * ```
 */
export class TokenKey extends Scalar {
  constructor(obj?: any) {
    super(obj)
  }
}

