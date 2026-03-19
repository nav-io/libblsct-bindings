import {
  buildUnsignedCreateTokenOutput,
  buildUnsignedMintNftOutput,
  buildUnsignedMintTokenOutput,
  buildUnsignedOutput,
  deleteUnsignedOutput,
  deserializeUnsignedOutput,
  freeObj,
  serializeUnsignedOutput,
} from './blsct'
import { PublicKey } from './keys/publicKey'
import { ManagedObj, unwrapPtr } from './managedObj'
import { Scalar } from './scalar'
import { freeNativeStringMap, makeNativeStringMap, MetadataMap } from './stringMapUtil'
import { SubAddr } from './subAddr'
import { TokenInfo } from './tokenInfo'
import { TxOut } from './txOut'

export class UnsignedOutput extends ManagedObj {
  constructor(obj: any) {
    const ptr = unwrapPtr(obj)
    super(ptr, () => deleteUnsignedOutput(ptr))
  }

  static fromTxOut(txOut: TxOut): UnsignedOutput {
    const rv = buildUnsignedOutput(txOut.value())
    if (rv.result !== 0) {
      freeObj(rv)
      throw new Error(`Failed to build unsigned output. Error code = ${rv.result}`)
    }
    const output = UnsignedOutput.fromObjAndSize(rv.value, rv.value_size)
    freeObj(rv)
    return output
  }

  static createTokenCollection(
    tokenKey: Scalar,
    tokenInfo: TokenInfo
  ): UnsignedOutput {
    const rv = buildUnsignedCreateTokenOutput(tokenKey.value(), tokenInfo.value())
    if (rv.result !== 0) {
      freeObj(rv)
      throw new Error(`Failed to build unsigned create-token output. Error code = ${rv.result}`)
    }
    const output = UnsignedOutput.fromObjAndSize(rv.value, rv.value_size)
    freeObj(rv)
    return output
  }

  static mintToken(
    destination: SubAddr,
    amount: number,
    blindingKey: Scalar,
    tokenKey: Scalar,
    tokenPublicKey: PublicKey
  ): UnsignedOutput {
    const rv = buildUnsignedMintTokenOutput(
      destination.value(),
      amount,
      blindingKey.value(),
      tokenKey.value(),
      tokenPublicKey.value()
    )
    if (rv.result !== 0) {
      freeObj(rv)
      throw new Error(`Failed to build unsigned mint-token output. Error code = ${rv.result}`)
    }
    const output = UnsignedOutput.fromObjAndSize(rv.value, rv.value_size)
    freeObj(rv)
    return output
  }

  static mintNft(
    destination: SubAddr,
    blindingKey: Scalar,
    tokenKey: Scalar,
    tokenPublicKey: PublicKey,
    nftId: number,
    metadata: MetadataMap
  ): UnsignedOutput {
    const metadataMap = makeNativeStringMap(metadata)
    try {
      const rv = buildUnsignedMintNftOutput(
        destination.value(),
        blindingKey.value(),
        tokenKey.value(),
        tokenPublicKey.value(),
        nftId,
        metadataMap
      )
      if (rv.result !== 0) {
        freeObj(rv)
        throw new Error(`Failed to build unsigned mint-NFT output. Error code = ${rv.result}`)
      }
      const output = UnsignedOutput.fromObjAndSize(rv.value, rv.value_size)
      freeObj(rv)
      return output
    } finally {
      freeNativeStringMap(metadataMap)
    }
  }

  override value(): any {
    return this.obj
  }

  override serialize(): string {
    return serializeUnsignedOutput(this.value())
  }

  static deserialize(
    this: new (obj: any) => UnsignedOutput,
    hex: string
  ): UnsignedOutput {
    return UnsignedOutput._deserialize(hex, deserializeUnsignedOutput)
  }
}

