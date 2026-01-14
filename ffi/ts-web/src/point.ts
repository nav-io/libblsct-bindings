/**
 * Point on the BLS12-381 curve
 */

import { ManagedObj } from './managedObj.js';
import { Scalar } from './scalar.js';
import {
  genRandomPoint,
  genBasePoint,
  serializePoint,
  deserializePoint,
  isValidPoint,
  arePointEqual,
  pointFromScalar,
  pointToStr,
  assertSuccess,
} from './blsct.js';

/**
 * Represents a point (group element) on the BLS12-381 G1 curve
 */
export class Point extends ManagedObj {
  /**
   * Create a Point from a WASM pointer
   * @internal Use static factory methods instead
   */
  constructor(ptr: number) {
    super(ptr);
  }

  /**
   * Generate a random point on the curve
   */
  static random(): Point {
    const result = genRandomPoint();
    const ptr = assertSuccess(result, 'Generate random point');
    return new Point(ptr);
  }

  /**
   * Get the base point (generator) of the curve
   */
  static basePoint(): Point {
    const result = genBasePoint();
    const ptr = assertSuccess(result, 'Get base point');
    return new Point(ptr);
  }

  /**
   * Create a point from a scalar (scalar multiplication of base point)
   */
  static fromScalar(scalar: Scalar): Point {
    const ptr = pointFromScalar(scalar.ptr);
    return new Point(ptr);
  }

  /**
   * Deserialize a point from a hex string
   */
  static fromHex(hex: string): Point {
    const result = deserializePoint(hex);
    const ptr = assertSuccess(result, 'Deserialize point');
    return new Point(ptr);
  }

  /**
   * Serialize this point to a hex string
   */
  toHex(): string {
    return serializePoint(this.ptr);
  }

  /**
   * Check if this is a valid point on the curve
   */
  isValid(): boolean {
    return isValidPoint(this.ptr);
  }

  /**
   * Check if this point equals another point
   */
  equals(other: Point): boolean {
    return arePointEqual(this.ptr, other.ptr);
  }

  /**
   * Get a string representation
   */
  toString(): string {
    return pointToStr(this.ptr);
  }
}

