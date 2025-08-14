import { Scalar } from '../../scalar'

/** Represents a blinding key. A blinding key is a Scalar and introduces no new functionality; it serves purely as a semantic alias.
 *
 * Examples:
 * ```ts
 * const { Scalar, ChildKey } = require('navio-blsct')
 * const s = Scalar.random()
 * const ck = new ChildKey(s)
 * ck.toBlindingKey()
 * ```
 */
export class BlindingKey extends Scalar {
  constructor(obj?: any) {
    super(obj)
  }
}

