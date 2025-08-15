import {
  castToCTxOut,
  castToUint8_tPtr,
  freeObj,
  getCTxOutValue,
  getCTxOutScriptPubkey,
  getCTxOutTokenId,
  getCTxOutVectorPredicate,
  hexToMallocedBuf,
  toHex,
} from './blsct'

import { ManagedObj } from './managedObj'
import { TokenId } from './tokenId'
import { CTxOutBlsctData } from './ctxOutBlsctData'
import { Script } from './script'

/** Represents a transaction output in a constructed confidential transaction. Also known as `CTxOut` on the C++ side.
 *
 * For code examples, see the `ctx.py` class documentation.
 */
export class CTxOut extends ManagedObj {
  blsctDataCache?: CTxOutBlsctData

  constructor(obj: any) {
    super(obj)
  }

  override value(): any {
    return castToCTxOut(this.obj)
  }

  /** Returns the value of the transaction output.
   * * @returns The value of the output.
   */
  getValue(): number {
    return getCTxOutValue(this.value())
  }

  /** Returns the `scriptPubKey' of the transaction output.
   * * @returns The `scriptPubKey` of the output.
   */
  getScriptPubKey(): Script {
    const obj = getCTxOutScriptPubkey(this.value())
    return Script.fromObj(obj)
  }

  /** Returns the `CTxOutBlsctData` object associated with the transaction output.
   * @returns The `CTxOutBlsctData` object.
   */
  blsctData(): CTxOutBlsctData {
    if (this.blsctDataCache !== undefined) {
      return this.blsctDataCache
    }
    const x = CTxOutBlsctData.fromObj(this.value())
    this.blsctDataCache = x
    return x
  }

  /** Returns the token ID associated with the transaction output.
   * @returns The token ID of the output.
   */
  getTokenId(): TokenId {
    const obj = getCTxOutTokenId(this.value())
    return TokenId.fromObj(obj)
  }

  /** Returns the vector predicate of the transaction output.
   * * @returns The vector predicate as a hexadecimal string.
   */
  getVectorPredicate(): string {
    const rv = getCTxOutVectorPredicate(this.value())
    if (rv.result != 0) {
      freeObj(rv)
      throw new Error(`Failed to get vector predicate. Error code = ${rv.result}`)
    }
    if (rv.value_size !== 0) {
      freeObj(rv)
      return ""
    }
    const buf = castToUint8_tPtr(rv.value)
    const hex = toHex(buf, rv.value_size)
    freeObj(rv)
    return hex 
  }

  override serialize(): string {
    const buf = castToUint8_tPtr(this.value())
    return toHex(buf, this.size())
  }

  /** Deserializes a `CTxOut` from its hexadecimal representation.
   * @param hex - The hexadecimal string to deserialize.
   * @returns A new `CTxOut` instance. w
   */
  static deserialize(
    this: new (obj: any) => CTxOut,
    hex: string
  ): CTxOut {
    if (hex.length % 2 !== 0) {
      hex = `0${hex}`
    }
    const obj = hexToMallocedBuf(hex)
    const x = new CTxOut(obj)
    x.objSize = hex.length / 2 
    return x
  }
}

