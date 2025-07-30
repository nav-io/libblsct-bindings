import {
  buildTxOut,
  castToTxOut,
  castToUint8_tPtr,
  freeObj,
  getTxOutDestination,
  getTxOutAmount,
  getTxOutMemo,
  getTxOutTokenId,
  getTxOutOutputType,
  getTxOutMinStake,
  hexToMallocedBuf,
  toHex,
  TxOutputType,
} from './blsct'

import { ManagedObj } from './managedObj'
import { SubAddr } from './subAddr'
import { TokenId } from './tokenId'

export class TxOut extends ManagedObj {
  constructor(obj: any) {
    super(obj)
  }

  static generate(
    subAddr: SubAddr,
    amount: number,
    memo: string,
    tokenId?: TokenId,
    outputType: TxOutputType = TxOutputType.Normal,
    minStake: number = 0,
  ): TxOut {
    tokenId = tokenId === undefined ?
      TokenId.default() : tokenId

    const rv = buildTxOut(
      subAddr.value(),
      amount,
      memo,
      tokenId.value(),
      outputType,
      minStake,
    )
    if (rv.result !== 0) {
      freeObj(rv)
      throw new Error(`Failed to build TxOut. Error code = ${rv.result}`)
    }
    const x = new TxOut(rv.value)
    x.objSize = rv.value_size
    freeObj(rv)
    return x
  }

  override value(): any {
    return castToTxOut(this.obj)
  }

  getDestination(): SubAddr {
    const obj = getTxOutDestination(this.value())
    return SubAddr.fromObj(obj)
  }

  getAmount(): number {
    return getTxOutAmount(this.value())
  }

  getMemo(): string {
    return getTxOutMemo(this.value())
  }

  getTokenId(): TokenId {
    const obj = getTxOutTokenId(this.value())
    return TokenId.fromObj(obj)
  }

  getOutputType(): TxOutputType {
    return getTxOutOutputType(this.value())
  }

  getMinStake(): number {
    return getTxOutMinStake(this.value())
  }

  override serialize(): string {
    const buf = castToUint8_tPtr(this.value())
    return toHex(buf, this.size())
  }

  static deserialize(
    this: new (obj: any) => TxOut,
    hex: string
  ): TxOut {
    if (hex.length % 2 !== 0) {
      hex = `0${hex}`
    }
    const obj = hexToMallocedBuf(hex)
    const x = new TxOut(obj)
    x.objSize = hex.length / 2 
    return x
  }
}

/*
class TxOut(ManagedObj, Serializable):
  def get_destination(self) -> SubAddr:
    """Get the destination of the transaction output."""
    obj = blsct.get_tx_out_destination(self.value())
    return SubAddr.from_obj(obj)

  def get_amount(self) -> int:
    """Get the amount of the transaction output."""
    return blsct.get_tx_out_amount(self.value())

  def get_memo(self) -> str:
    """Get the memo of the transaction output."""
    return blsct.get_tx_out_memo(self.value())

  def get_token_id(self) -> TokenId:
    """Get the token ID of the transaction output."""
    obj = blsct.get_tx_out_token_id(self.value())
    return TokenId.from_obj(obj)

  def get_output_type(self) -> TxOutputType:
    """Get the output type of the transaction output."""
    return blsct.get_tx_out_output_type(self.value())

  def get_min_stake(self) -> int:
    """Get the min stake of the transaction output."""
    return blsct.get_tx_out_min_stake(self.value())
*/
