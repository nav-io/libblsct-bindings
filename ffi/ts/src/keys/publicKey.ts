import {
  calcNonce,
  castToPubKey,
  freeObj,
  genRandomPublicKey,
  getPublicKeyPoint,
  pointToPublicKey,
  scalarToPubKey,
} from '../blsct'

import { ManagedObj } from '../managedObj'
import { Point } from '../point'
import { Scalar } from '../scalar'

/** Represents an element in the BLS12-381 G1 curve group that is used as a public key.
 *
 * Examples:
 * ```ts
 * const { PublicKey, Point, Scalar } = require('navio-blsct')
 * const s123 = new Scalar(123)
 * const pk123 = PublicKey.fromScalar(s123)
 * const s234 = new Scalar(234)
 * const pk234 = PublicKey.fromScalar(s234)
 * pk123.equals(pk234) // false
 * pk123.equals(pk123) // true
 * const p = Point.random()
 * const pk = PublicKey.fromPoint(p)
 * pk.getPoint()
 * const vk = Scalar.random()
 * pk.generateNonce(vk)
 * const ser = pk.serialize()
 * const deser = PublicKey.deserialize(ser)
 * ser == deser.serialize()
 * ```
 */
export class PublicKey extends ManagedObj {
  /** Constructs a new `PublicKey` instance.
   * - If no parameter is provided, a random public key is generated.
   */
  constructor(obj?: any) {
    if (typeof obj === 'object') {
      super(obj)
    } else {
      const rv = genRandomPublicKey()
      if (rv.result !== 0) {
        throw new Error('Failed to generate random PublicKey')
      }
      super(rv.value)
    }
  }

  /** Return the underlying point of the public key
   * @return {Point} The underlying point of the public key.
   */
  getPoint(): Point {
    const blsctPoint = getPublicKeyPoint(this.value())
    return Point.fromObj(blsctPoint)
  }

  /** Returns a random public key.
   * @returns A new random `PublicKey`.
   */
  static random(): PublicKey {
    const rv = genRandomPublicKey()
    const pk = PublicKey.fromObj(rv.value)
    freeObj(rv)
    return pk
  }

  /** Creates a `PublicKey` from a `Point` object.
   * @param point - The `Point` object to convert.
   */
  static fromPoint(point: Point): PublicKey {
    const blsctPubKey = pointToPublicKey(point.value())
    return PublicKey.fromObj(blsctPubKey)
  }

  /** Creates a `PublicKey` from a `Scalar` object.
   * @param scalar - The `Scalar` object to convert.
   */
  static fromScalar(scalar: Scalar): PublicKey {
    const blsctPubKey = scalarToPubKey(scalar.value())
    return PublicKey.fromObj(blsctPubKey)
  }

  /** Generates a nonce from this `PublicKey` using a `Scalar` view key.
   *
   * @param viewKey - The view key.
   * @returns A new `PublicKey` that represents the nonce.
   */
  generateNonce(
    viewKey: Scalar
  ): PublicKey {
    const blsctNonce = calcNonce(
      this.value(),
      viewKey.value()
    )
    return PublicKey.fromObj(blsctNonce)
  }

  /** Returns if the provied public key is equal to this public key.
   * @param other - The public key to compare with.
   * @returns `true` if the public keys are equal, `false` otherwise.
   */
  equals(other: PublicKey): boolean {
    return this.getPoint().equals(other.getPoint())
  }

  override value(): any {
    return castToPubKey(this.obj)
  }

  override serialize(): string {
    return this.getPoint().serialize()
  }

  /** Deserializes a hexadecimal string into a `PublicKey` instance.
   * @param hex - The hexadecimal string to convert.
   * @returns The `PublicKey` instance represented by the input string.
   */
  static deserialize(
    this: new (obj: any) => PublicKey,
    hex: string
  ): PublicKey {
    const p = Point.deserialize(hex)
    return PublicKey.fromPoint(p)
  }
}

