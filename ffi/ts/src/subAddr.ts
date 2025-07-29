import {
  castToSubAddr,
  deriveSubAddress,
  deserializeSubAddr,
  dpkToSubAddr,
  freeObj,
  serializeSubAddr,
} from './blsct'

import { PublicKey } from './keys/publicKey'
import { DoublePublicKey } from './keys/doublePublicKey'
import { ViewKey } from './keys/childKeyDesc/txKeyDesc/viewKey'
import { ManagedObj } from './managedObj'
import { SubAddrId } from './subAddrId'

export class SubAddr extends ManagedObj {
  constructor(obj: any) {
    super(obj)
  }

  static generate(
    viewKey: ViewKey,
    spendingPubKey: PublicKey,
    subAddrId: SubAddrId,
  ): SubAddr {
    const obj = deriveSubAddress(
      viewKey.value(),
      spendingPubKey.value(),
      subAddrId.value(),
    )
    return new SubAddr(obj)
  }
  
  static fromDoublePublicKey(
    dpk: DoublePublicKey,
  ): SubAddr {
    const rv = dpkToSubAddr(dpk.value())
    const inst = new SubAddr(rv.value)
    freeObj(rv)
    return inst
  }

  override value(): any {
    return castToSubAddr(this.obj)
  }

  override serialize(): string {
    return serializeSubAddr(this.value())
  }

  static deserialize(
    this: new (obj: any) => SubAddr,
    hex: string
  ): SubAddr {
    return SubAddr._deserialize(hex, deserializeSubAddr)
  }
}

