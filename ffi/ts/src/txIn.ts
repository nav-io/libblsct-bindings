import {
  buildTxIn,
  castToTxIn,
  castToUint8_tPtr,
  freeObj,
  getTxInAmount,
  getTxInGamma,
  getTxInSpendingKey,
  getTxInTokenId,
  getTxInOutPoint,
  getTxInStakedCommitment,
  getTxInRbf,
  hexToMallocedBuf,
  toHex,
} from './blsct'

import { ManagedObj } from './managedObj'
import { SpendingKey } from './keys/childKeyDesc/txKeyDesc/spendingKey'
import { TokenId } from './tokenId'
import { OutPoint } from './outPoint'

export class TxIn extends ManagedObj {
  constructor(obj: any) {
    super(obj)
  }

  static generate(
    amount: number,
    gamma: number,
    spendingKey: SpendingKey,
    tokenId: TokenId,
    outPoint: OutPoint,
    isStakedCommitment: boolean = false,
    isRbf: boolean = false,
  ): TxIn {
    const rv = buildTxIn(
      amount,
      gamma,
      spendingKey.value(),
      tokenId.value(),
      outPoint.value(),
      isStakedCommitment,
      isRbf
    )
    if (rv.result !== 0) {
      freeObj(rv)
      throw new Error(`Failed to build TxIn. Error code = ${rv.result}`)
    }
    const x = new TxIn(rv.value)
    x.objSize = rv.value_size
    freeObj(rv)

    return x
  }

  override value(): any {
    return castToTxIn(this.obj)
  }
  getAmount(): number {
    return getTxInAmount(this.value())
  }

  getGamma(): number {
    return getTxInGamma(this.value())
  }

  getSpendingKey(): SpendingKey {
    const obj = getTxInSpendingKey(this.value())
    return SpendingKey.fromObj(obj)
  }

  getTokenId(): TokenId {
    const obj = getTxInTokenId(this.value())
    return TokenId.fromObj(obj)
  }

  getOutPoint(): OutPoint {
    const obj = getTxInOutPoint(this.value())
    return OutPoint.fromObj(obj)
  }

  getIsStakedCommitment(): boolean {
    return getTxInStakedCommitment(this.value())
  }

  getIsRbf(): boolean {
    return getTxInRbf(this.value())
  }

  clone(): TxIn {
    const ser = this.serialize()
    return TxIn.deserialize(ser)
  }

  override serialize(): string {
    const buf = castToUint8_tPtr(this.value())
    return toHex(buf, this.size())
  }

  static deserialize(
    this: new (obj: any) => TxIn,
    hex: string
  ): TxIn {
    if (hex.length % 2 !== 0) {
      hex = `0${hex}`
    }
    const obj = hexToMallocedBuf(hex)
    const x = new TxIn(obj)
    x.objSize = hex.length / 2 
    return x
  }
}

