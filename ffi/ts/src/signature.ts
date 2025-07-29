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

export class Signature extends ManagedObj {
  constructor(obj: any) {
    super(obj)
  }

  static generate(
    privKey: Scalar,
    msg: string,
  ): Signature {
    const obj = signMessage(privKey.value(), msg)
    return new Signature(obj)
  }

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

  static deserialize(
    this: new (obj: any) => Signature,
    hex: string
  ): Signature {
    return Signature._deserialize(hex, deserializeSignature)
  }
}

