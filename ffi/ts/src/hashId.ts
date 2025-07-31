import {
  calcKeyId,
  castToKeyId,
  deserializeKeyId,
  freeObj,
  serializeKeyId,
} from './blsct'

import { ManagedObj } from './managedObj'
import { PublicKey } from './keys/publicKey'
import { ViewKey } from './keys/childKeyDesc/txKeyDesc/viewKey'

export class HashId extends ManagedObj {
  constructor(obj?: any) {
    if (typeof obj === 'object') {
      super(obj)
    } else {
      super(HashId.random().move())
    }
  }

  static generate(
    blindingPubKey: PublicKey,
    spendingPubKey: PublicKey,
    viewKey: ViewKey,
  ): HashId {
    const obj = calcKeyId(
      blindingPubKey.value(),
      spendingPubKey.value(),
      viewKey.value()
    )
    return HashId.fromObj(obj)
  }

  static random(): HashId {
    return HashId.generate(
      PublicKey.random(),
      PublicKey.random(),
      ViewKey.random(),
    )
  }
  
  override value(): any {
    return castToKeyId(this.obj)
  }

  override serialize(): string {
    return serializeKeyId(this.value())
  }

  static deserialize(
    this: new (obj: any) => HashId,
    hex: string
  ): HashId {
    return HashId._deserialize(hex, deserializeKeyId)
  }
}

