import {
  addUnsignedTransactionInput,
  addUnsignedTransactionOutput,
  createUnsignedTransaction,
  deleteUnsignedTransaction,
  deserializeUnsignedTransaction,
  freeObj,
  getUnsignedTransactionFee,
  getUnsignedTransactionInputsSize,
  getUnsignedTransactionOutputsSize,
  getValueAsCStr,
  serializeUnsignedTransaction,
  setUnsignedTransactionFee,
  signUnsignedTransaction,
} from './blsct'
import { ManagedObj, unwrapPtr } from './managedObj'
import { UnsignedInput } from './unsignedInput'
import { UnsignedOutput } from './unsignedOutput'

export class UnsignedTransaction extends ManagedObj {
  constructor(obj: any) {
    const ptr = unwrapPtr(obj)
    super(ptr, () => deleteUnsignedTransaction(ptr))
  }

  static create(): UnsignedTransaction {
    return UnsignedTransaction.fromObj(createUnsignedTransaction())
  }

  override value(): any {
    return this.obj
  }

  addInput(input: UnsignedInput): void {
    addUnsignedTransactionInput(this.value(), input.value())
  }

  addOutput(output: UnsignedOutput): void {
    addUnsignedTransactionOutput(this.value(), output.value())
  }

  setFee(fee: number): void {
    setUnsignedTransactionFee(this.value(), fee)
  }

  getFee(): bigint {
    return getUnsignedTransactionFee(this.value())
  }

  getInputsSize(): number {
    return getUnsignedTransactionInputsSize(this.value())
  }

  getOutputsSize(): number {
    return getUnsignedTransactionOutputsSize(this.value())
  }

  sign(): string {
    const rv = signUnsignedTransaction(this.value())
    if (rv.result !== 0) {
      freeObj(rv)
      throw new Error(`Failed to sign unsigned transaction. Error code = ${rv.result}`)
    }
    const hex = getValueAsCStr(rv)
    freeObj(rv.value)
    freeObj(rv)
    return hex
  }

  override serialize(): string {
    return serializeUnsignedTransaction(this.value())
  }

  static deserialize(
    this: new (obj: any) => UnsignedTransaction,
    hex: string
  ): UnsignedTransaction {
    return UnsignedTransaction._deserialize(hex, deserializeUnsignedTransaction)
  }
}

