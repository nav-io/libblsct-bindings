import {
  castToSubAddrId,
  deserializeSubAddrId,
  genSubAddrId,
  serializeSubAddrId,
} from './blsct'

import { ManagedObj } from './managedObj'

export class SubAddrId extends ManagedObj {
  constructor(obj: any) {
    super(obj)
  }

  static generate(
    account: number,
    address: number,
  ): SubAddrId {
    const obj = genSubAddrId(account, address)
    return new SubAddrId(obj)
  }

  override value(): any {
    return castToSubAddrId(this.obj)
  }

  override serialize(): string {
    return serializeSubAddrId(this.value())
  }

  static deserialize(
    this: new (obj: any) => SubAddrId,
    hex: string
  ): SubAddrId {
    return SubAddrId._deserialize(hex, deserializeSubAddrId)
  }
}

