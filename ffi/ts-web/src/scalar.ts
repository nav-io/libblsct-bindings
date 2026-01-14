/**
 * Scalar value on the BLS12-381 curve
 */

import { ManagedObj } from './managedObj.js';
import {
  genRandomScalar,
  genScalar,
  serializeScalar,
  deserializeScalar,
  scalarToUint64,
  areScalarEqual,
  assertSuccess,
} from './blsct.js';

/**
 * Represents a scalar value (field element) on the BLS12-381 curve
 */
export class Scalar extends ManagedObj {
  /**
   * Create a Scalar from a WASM pointer
   * @internal Use static factory methods instead
   */
  constructor(ptr: number) {
    super(ptr);
  }

  /**
   * Generate a random scalar
   */
  static random(): Scalar {
    const result = genRandomScalar();
    const ptr = assertSuccess(result, 'Generate random scalar');
    return new Scalar(ptr);
  }

  /**
   * Create a scalar from a numeric value
   */
  static fromNumber(value: number | bigint): Scalar {
    const result = genScalar(value);
    const ptr = assertSuccess(result, 'Create scalar from number');
    return new Scalar(ptr);
  }

  /**
   * Deserialize a scalar from a hex string
   */
  static fromHex(hex: string): Scalar {
    const result = deserializeScalar(hex);
    const ptr = assertSuccess(result, 'Deserialize scalar');
    return new Scalar(ptr);
  }

  /**
   * Serialize this scalar to a hex string
   */
  toHex(): string {
    return serializeScalar(this.ptr);
  }

  /**
   * Convert this scalar to a uint64 value
   * @throws If the scalar value is too large for uint64
   */
  toUint64(): bigint {
    return scalarToUint64(this.ptr);
  }

  /**
   * Check if this scalar equals another scalar
   */
  equals(other: Scalar): boolean {
    return areScalarEqual(this.ptr, other.ptr);
  }

  /**
   * Get a string representation
   */
  toString(): string {
    return `Scalar(${this.toHex().slice(0, 16)}...)`;
  }
}

