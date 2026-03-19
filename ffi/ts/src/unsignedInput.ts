import {
  buildUnsignedInput,
  deleteUnsignedInput,
  deserializeUnsignedInput,
  freeObj,
  serializeUnsignedInput,
} from './blsct'
import { ManagedObj, unwrapPtr } from './managedObj'
import { TxIn } from './txIn'

export class UnsignedInput extends ManagedObj {
  constructor(obj: any) {
    const ptr = unwrapPtr(obj)
    super(ptr, () => deleteUnsignedInput(ptr))
  }

  static fromTxIn(txIn: TxIn): UnsignedInput {
    const rv = buildUnsignedInput(txIn.value())
    if (rv.result !== 0) {
      freeObj(rv)
      throw new Error(`Failed to build unsigned input. Error code = ${rv.result}`)
    }
    const input = UnsignedInput.fromObjAndSize(rv.value, rv.value_size)
    freeObj(rv)
    return input
  }

  override value(): any {
    return this.obj
  }

  override serialize(): string {
    return serializeUnsignedInput(this.value())
  }

  static deserialize(
    this: new (obj: any) => UnsignedInput,
    hex: string
  ): UnsignedInput {
    return UnsignedInput._deserialize(hex, deserializeUnsignedInput)
  }
}

