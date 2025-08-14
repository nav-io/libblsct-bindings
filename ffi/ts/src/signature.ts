import {
  castToSignature,
  deserializeSignature,
  serializeSignature,
  signMessage,
  verifyMsgSig,
} from './blsct'

import { Scalar } from './scalar'
import { PublicKey } from './keys/publicKey'
import { ManagedObj } from './managedObj'

/** Represents the signature of a transaction.
 *
 * Examples:
 * ```ts
 * const { PublicKey, Scalar, Signature } = require('navio-blsct')
 * const sk = Scalar.random()
 * const pk = PublicKey.fromScalar(sk)
 * const sig = Signature.generate(sk, 'navio')
 * sig.verify(pk, 'navio')
 * const ser = sig.serialize()
 * const deser = Signature.deserialize(ser)
 * ser === deser.serialize() // true
 * ```
 */
export class Signature extends ManagedObj {
  constructor(obj: any) {
    super(obj)
  }

  /** Generates a new `Signature` instance.
   *
   * @param privKey - The private key used to sign the message.
   * @param msg - The message to be signed.
   * @return A new `Signature` instance containing the signature of the message.
   */
  static generate(
    privKey: Scalar,
    msg: string,
  ): Signature {
    const obj = signMessage(privKey.value(), msg)
    return new Signature(obj)
  }

  /** Verifies the signature against a public key and message.
   *
   * @param pubKey - The public key used to verify the signature.
   * @param msg - The message that was signed.
   * @return `true` if the signature is valid for the given public key and message, otherwise `false`.
   */
  verify(
    pubKey: PublicKey,
    msg: string,
  ): boolean {
    return verifyMsgSig(pubKey.value(), msg, this.value())
  }

  override value(): any {
    return castToSignature(this.obj)
  }

  override serialize(): string {
    return serializeSignature(this.value())
  }

  /** Serializes the signature to a hexadecimal string.
   *
   * @param hex - The hexadecimal string to serialize.
   * @returns A hexadecimal string representation of the signature.
   */
  static deserialize(
    this: new (obj: any) => Signature,
    hex: string
  ): Signature {
    return Signature._deserialize(hex, deserializeSignature)
  }
}

