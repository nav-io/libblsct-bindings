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

/**  Represents a transaction output used to construct a CTxOut in a confidential transaction.
 *
 * Examples:
 * ```ts
 * const { SubAddr, DoublePublicKey, TxOut, TokenId, TxOutputType } = require('navio-blsct')
 * const dpk = new DoublePublicKey()
 * const subAddr = SubAddr.fromDoublePublicKey(dpk)
 * const amount = 789
 * const memo = "apple"
 * const txOut = TxOut.generate(subAddr, amount, memo)
 * txOut.getDestination()
 * txOut.getAmount() // 789
 * txOut.getMemo() // "apple"
 * txOut.getTokenId()
 * txOut.getMinStake() // 0
 * const ser = txOut.serialize()
 * const deser = TxOut.deserialize(ser)
 * ser === deser.serialize() // true
 * ```
 */
export class TxOut extends ManagedObj {
  constructor(obj: any) {
    super(obj)
  }

  /** Constructs a new `TxOut` instance.
   * @param subAddr - The destination SubAddr of the output.
   * @param amount - The amount of the output.
   * @param memo - The memo of the output.
   * @param tokenId - The token ID associated with the output (optional).
   * @param outputType - The type of the output (default is `TxOutputType.Normal`).
   * @param minStake - The minimum stake for the output (default is 0).
   * @returns A new `TxOut` instance.
   */
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

  /** Returns the destination SubAddr of the transaction output.
   * @returns The destination SubAddr of the transaction output.
   */
  getDestination(): SubAddr {
    const obj = getTxOutDestination(this.value())
    return SubAddr.fromObj(obj)
  }

  /** Returns the amount of the transaction output.
   * @returns The amount of the transaction output.
   */
  getAmount(): number {
    return getTxOutAmount(this.value())
  }

  /** Returns the memo of the transaction output.
   * @returns The memo of the transaction output.
   */
  getMemo(): string {
    return getTxOutMemo(this.value())
  }

  /** Returns the token ID associated with the transaction output.
   * @returns The token ID associated with the transaction output.
   */
  getTokenId(): TokenId {
    const obj = getTxOutTokenId(this.value())
    return TokenId.fromObj(obj)
  }

  /** Returns the type of the transaction output.
   * @returns The type of the transaction output.
   */
  getOutputType(): TxOutputType {
    return getTxOutOutputType(this.value())
  }

  /** Returns the minimum stake required for the transaction output.
   * @returns The minimum stake required for the transaction output.
   */
  getMinStake(): number {
    return getTxOutMinStake(this.value())
  }

  /** Returns a deep copy of the instance.
   * @returns A new `TxOut` instance that is a deep copy of this instance.
   */
  clone(): TxOut {
    const ser = this.serialize()
    return TxOut.deserialize(ser)
  }

  override serialize(): string {
    const buf = castToUint8_tPtr(this.value())
    return toHex(buf, this.size())
  }

  /** Deserializes a `TxOut` from its hexadecimal representation.
   * @param hex - The hexadecimal string to deserialize.
   * @returns A new `TxOut` instance.
   */
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

