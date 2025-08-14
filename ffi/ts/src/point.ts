import {
  castToPoint,
  deserializePoint,
  freeObj,
  genBasePoint,
  genRandomPoint,
  isPointEqual,
  isValidPoint,
  pointFromScalar,
  pointToStr,
  serializePoint,
} from './blsct'
import { ManagedObj } from './managedObj'
import { Scalar } from './scalar'

/** Represents an element in the BLS12-381 G1 curve group.
 * A wrapper of [MclG1Point](https://github.com/nav-io/navio-core/blob/master/src/blsct/arith/mcl/mcl_g1point.h)in navio-core.
 *
 * Instantiating a Point object without a parameter returns a random point. 
 * Examples:
 * ```ts
 * const { Point, Scalar } = require('navio-blsct')
 * const p1 = new Point()  // random point
 * const p2 = Point.random()
 * const s = new Scalar()
 * const p3 = Point.fromScalar(s)
 * p3.isValid() // true
 * const p4 = Point.base()
 * const p5 = Point.base()
 * p4.equals(p5) // true
 * const p6 = Point.deserialize(p4.serialize())
 * p6.equals(p4) // true
 * const ser = p1.serialize()
 * const deser = Point.deserialize(ser)
 * ser === deser.serialize() // true
 * ```
 */
export class Point extends ManagedObj {
  /** Constructs a new random `Point` instance.
   */
  constructor(obj?: any) {
    if (typeof obj === 'object') {
      super(obj)
    } else (
      super(genRandomPoint().value)
    )
  }

  override value(): any {
    return castToPoint(this.obj)
  }

  /** Returns a random point.
   * * @returns A random point on the BLS12-381 G1 curve.
   */
  static random(): Point {
    const rv = genRandomPoint()
    const x = Point.fromObj(rv.value)
    freeObj(rv)
    return x
  }

  /** Returns the base point of the BLS12-381 G1 curve.
   * @returns The base point of the BLS12-381 G1 curve.
   */
  static base(): Point {
    const rv = genBasePoint()
    const x = Point.fromObj(rv.value)
    freeObj(rv)
    return x
  }

  /**
   * Computes the product of the BLS12-381 G1 base point and the given scalar.
   *
   * @param scalar - The scalar by which to multiply the base point.
   * @returns The point on the BLS12-381 G1 curve obtained by multiplying the base point by the scalar.
   */
  static fromScalar(scalar: Scalar): Point {
    const obj = pointFromScalar(scalar.value())
    return Point.fromObj(obj)
  }

  /** Checks if the point is valid.
   * @returns `true` if the point is valid, `false` otherwise.
   */
  isValid(): boolean {
    return isValidPoint(this.value())
  }

  override toString(): string {
    const s = pointToStr(this.value())
    return `Point(${s})`
  }

  /** Returns if the point is equal to the provided point.
   * @param other - The point to compare with.
   * @returns `true` if the points are equal, `false` otherwise.
   */
  equals(other: Point): boolean {
    return isPointEqual(this.value(), other.value())
  }

  override serialize(): string {
    return serializePoint(this.value())
  }

  /**
   * Deserializes a hexadecimal string into a Point instance.
   *
   * @param hex - The hexadecimal string to convert.
   * @returns The `Point` instance represented by the input string.
   */
  static deserialize(
    this: new (obj: any) => Point,
    hex: string
  ): Point {
    return Point._deserialize(hex, deserializePoint)
  }
}

