import {
  castToOutPoint,
  deserializeOutPoint,
  freeObj,
  genOutPoint,
  serializeOutPoint,
} from './blsct'

import { ManagedObj } from './managedObj'
import { CTxId } from './ctxId'

export class OutPoint extends ManagedObj {
  constructor(obj: any) {
    super(obj)
  }
  
  static generate(
    ctxId: CTxId,
    outIndex: number,
  ) {
    const rv = genOutPoint(ctxId.serialize(), outIndex)
    const obj = rv.value
    freeObj(rv)
    return new OutPoint(obj)
  }

  override value(): any {
    return castToOutPoint(this.obj)
  }

  override serialize(): string {
    return serializeOutPoint(this.value())
  }

  static deserialize(
    this: new (obj: any) => OutPoint,
    hex: string
  ): OutPoint {
    return OutPoint._deserialize(hex, deserializeOutPoint)
  }
}

