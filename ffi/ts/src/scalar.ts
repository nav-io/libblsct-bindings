import {
  castToScalar,
  deserializeScalar,
  freeObj,
  genRandomScalar,
  genScalar,
  isScalarEqual,
  scalarToUint64,
  serializeScalar,
} from './blsct'

import { ManagedObj } from './managedObj'

/**
 * Represents an element of the finite field $\mathbb{F}_r$, where $r$ is the order of the generator point of the BLS12-381 G1 group.
 * A wrapper of [MclScalar](https://github.com/nav-io/navio-core/blob/master/src/blsct/arith/mcl/mcl_scalar.h) in navio-core.
 *  
 * Examples:
 * ```ts
 * const { Scalar } = require('navio-blsct')
 * const s1 = new Scalar() // random scalar
 * const s2 = new Scalar(12345)
 * s2.toNumber() // returns 12345
 * const s3 = Scalar.deserialize(s2.serialize())
 * s3.equals(s2) // true
 * const ser = s1.serialize()
 * const deser = Scalar.deserialize(ser)
 * ser === deser.serialize() // true
 * ```
 */
export class Scalar extends ManagedObj {
  /** Constructs a new `Scalar` instance.
   * - If no parameter is provided, a random scalar is generated.
   * - If a number is provided, it is converted to a scalar.
   */
  constructor(obj?: any) {
    if (typeof obj === 'object') {
      super(obj)
    } else if (typeof obj === 'number') {
      const rv = genScalar(obj)
      super(rv.value)
      freeObj(rv)
    } else if (obj === undefined || obj === null) {
      const rv = genRandomScalar()
      super(rv.value)
      freeObj(rv)
    } else {
      throw new TypeError(`Scalar constructor received value of unexpected type ${typeof obj}`)
    }
  }

  override value(): any {
    return castToScalar(this.obj)
  }

  /**
   * Generates a random scalar.
   * @returns A random scalar in the finite field $\mathbb{F}_r$.
   */
  static random(): Scalar {
    const rv = genRandomScalar()
    const x = Scalar.fromObj(rv.value)
    freeObj(rv)
    return x
  }

  /** Converts the scalar to an integer.
   * * @returns The scalar as a number.
   */
  toNumber(): number {
    return scalarToUint64(this.value())
  }

  /** Returns if the scalar is equal to the provided scalar.
   * @param other - The scalar to compare with.
   * @returns `true` if the scalars are equal, `false` otherwise.
   */
  equals(other: Scalar): boolean {
    return isScalarEqual(this.value(), other.value())
  }

  /** Serialize the scalar to a hexadecimal string.
   */
  override serialize(): string {
    return serializeScalar(this.value())
  }

  /**
   * Deserializes a hexadecimal string into a Scalar instance.
   *
   * @param hex - The hexadecimal string to convert.
   * @returns The `Scalar` instance represented by the input string.
   */
  static deserialize(
    this: new (obj: any) => Scalar,
    hex: string
  ): Scalar {
    return Scalar._deserialize(hex, deserializeScalar)
  }
}

