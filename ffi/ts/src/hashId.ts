import {
  calcKeyId,
  castToKeyId,
  deserializeKeyId,
  serializeKeyId,
} from './blsct'

import { ManagedObj, isWasmPtrWrapper, wrapWasmPtr } from './managedObj'
import { PublicKey } from './keys/publicKey'
import { Scalar } from './scalar'

/** Represents a hash ID consisting of a blinding public key, a spending public key, and a view key. Also known as `CKeyId` which is an alias for `uint160` on the C++ side.
 *
 * Examples:
 * ```ts
 * const { HashId, PublicKey, ChildKey, Scalar } = require('navio-blsct')
 * const blindingPubKey = PublicKey.random()
 * const spendingPubKey = PublicKey.random()
 * const seed = Scalar.random()
 * const viewKey = Scalar.random()
 * const hashId = HashId.generate(blindingPubKey, spendingPubKey, viewKey)
 * const ser = hashId.serialize()
 * const deser = HashId.deserialize(ser)
 * ser === deser.serialize() // true
 * ```
 */
export class HashId extends ManagedObj {
  /** Constructs a new `HashId` instance.
   * - If no parameter is provided, a random `HashId` is generated.
   * - If a WASM pointer wrapper is provided (from fromObj/deserialize), it wraps the pointer.
   */
  constructor(obj?: any) {
    if (isWasmPtrWrapper(obj)) {
      // WASM pointer from fromObj or _deserialize
      super(obj)
    } else if (typeof obj === 'object' && obj !== null) {
      // Native NAPI object
      super(obj)
    } else {
      const newObj = calcKeyId(
        PublicKey.random().value(),
        PublicKey.random().value(),
        Scalar.random().value(),
      )
      super(typeof newObj === 'number' ? wrapWasmPtr(newObj) : newObj)
    }
  }

  /** Generates a `HashId` from the provided blinding public key, spending public key, and view key.
   * @param blindingPubKey - The public key used for blinding.
   * @param spendingPubKey - The spending public key.
   * @param viewKey - The view key.
   * @returns A new `HashId` instance.
   */
  static generate(
    blindingPubKey: PublicKey,
    spendingPubKey: PublicKey,
    viewKey: Scalar,
  ): HashId {
    const obj = calcKeyId(
      blindingPubKey.value(),
      spendingPubKey.value(),
      viewKey.value()
    )
    return HashId.fromObj(obj)
  }

  /** Generates a random `HashId`.
   * @returns A new `HashId` instance with two random `PublicKey`s and a random `ViewKey`.
   */
  static random(): HashId {
    return HashId.generate(
      PublicKey.random(),
      PublicKey.random(),
      Scalar.random(),
    )
  }
  
  override value(): any {
    return castToKeyId(this.obj)
  }

  override serialize(): string {
    return serializeKeyId(this.value())
  }

  /** Deserializes a hexadecimal string into a `HashId` instance.
   * @param hex - The hexadecimal string to deserialize.
   * @returns A new `HashId` instance.
   */
  static deserialize(
    this: new (obj: any) => HashId,
    hex: string
  ): HashId {
    return HashId._deserialize(hex, deserializeKeyId)
  }
}

