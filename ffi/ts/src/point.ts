import {
  castToPoint,
  deserializePoint,
  freeObj,
  genBasePoint,
  genRandomPoint,
  arePointEqual,
  isValidPoint,
  pointFromScalar,
  pointToStr,
  scalarMultiplyPoint,
  serializePoint,
} from './blsct'
import { ManagedObj, isWasmPtrWrapper } from './managedObj'
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
   * - If no parameter is provided, a random point is generated.
   * - If a WASM pointer wrapper is provided (from fromObj/deserialize), it wraps the pointer.
   */
  constructor(obj?: any) {
    if (isWasmPtrWrapper(obj)) {
      // WASM pointer from fromObj or _deserialize - pass directly to parent
      super(obj)
    } else if (typeof obj === 'object' && obj !== null) {
      // Native NAPI object
      super(obj)
    } else if (typeof obj === 'number' && obj !== 0) {
      // Raw WASM pointer (from functions that return BlsctPoint* directly, not wrapped in BlsctRetVal)
      super(obj)
    } else {
      // Generate a random point
      const rv = genRandomPoint()
      super(rv.value)
      freeObj(rv)
    }
  }

  override value(): any {
    return castToPoint(this.obj)
  }

  /** Returns a random point.
   * * @returns A random point on the BLS12-381 G1 curve.
   */
  static random(): Point {
    const rv = genRandomPoint()
    const p = Point.fromObj(rv.value)
    freeObj(rv)
    return p
  }

  /** Returns the base point of the BLS12-381 G1 curve.
   * @returns The base point of the BLS12-381 G1 curve.
   */
  static base(): Point {
    const rv = genBasePoint()
    const p = Point.fromObj(rv.value)
    freeObj(rv)
    return p
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

  /** Multiplies the point by a scalar.
   * @param scalar - The scalar to multiply the point by.
   * @returns A new `Point` that is the result of the multiplication.
   */
  scalarMultiply(scalar: Scalar): Point {
    const obj = scalarMultiplyPoint(this.value(), scalar.value())
    return Point.fromObj(obj)
  }

  /** Alias for scalarMultiply. Multiplies the point by a scalar.
   * @param scalar - The scalar to multiply the point by.
   * @returns A new `Point` that is the result of the multiplication.
   */
  mulScalar(scalar: Scalar): Point {
    return this.scalarMultiply(scalar)
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
    return arePointEqual(this.value(), other.value())
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

