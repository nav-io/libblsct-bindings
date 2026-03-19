import {
  BlsctTokenType,
  UINT256_SIZE,
  buildTokenInfo,
  calcCollectionTokenHash as calcCollectionTokenHashRaw,
  castToUint8_tPtr,
  castToUint256,
  deriveCollectionTokenKey as deriveCollectionTokenKeyRaw,
  deriveCollectionTokenPublicKey as deriveCollectionTokenPublicKeyRaw,
  deserializeTokenInfo,
  freeObj,
  getTokenInfoMetadata,
  getTokenInfoPublicKey,
  getTokenInfoTotalSupply,
  getTokenInfoType,
  hexToMallocedBuf,
  serializeTokenInfo,
  toHex,
  deleteTokenInfo,
} from './blsct'
import { ManagedObj, unwrapPtr } from './managedObj'
import { PublicKey } from './keys/publicKey'
import { Scalar } from './scalar'
import { freeNativeStringMap, makeNativeStringMap, MetadataMap, readNativeStringMap } from './stringMapUtil'

export enum TokenType {
  Token = BlsctTokenType.BlsctToken,
  Nft = BlsctTokenType.BlsctNft,
}

export class TokenInfo extends ManagedObj {
  constructor(obj: any) {
    const ptr = unwrapPtr(obj)
    super(ptr, () => deleteTokenInfo(ptr))
  }

  static build(
    type: TokenType,
    publicKey: PublicKey,
    metadata: MetadataMap = {},
    totalSupply: number = 0,
  ): TokenInfo {
    const metadataMap = makeNativeStringMap(metadata)
    try {
      const rv = buildTokenInfo(type as unknown as BlsctTokenType, publicKey.value(), metadataMap, totalSupply)
      if (rv.result !== 0) {
        freeObj(rv)
        throw new Error(`Failed to build TokenInfo. Error code = ${rv.result}`)
      }
      const info = TokenInfo.fromObjAndSize(rv.value, rv.value_size)
      freeObj(rv)
      return info
    } finally {
      freeNativeStringMap(metadataMap)
    }
  }

  override value(): any {
    return this.obj
  }

  getType(): TokenType {
    return getTokenInfoType(this.value()) as unknown as TokenType
  }

  getPublicKey(): PublicKey {
    return PublicKey.fromObj(getTokenInfoPublicKey(this.value()))
  }

  getTotalSupply(): bigint {
    return getTokenInfoTotalSupply(this.value())
  }

  getMetadata(): MetadataMap {
    const nativeMap = getTokenInfoMetadata(this.value())
    try {
      return readNativeStringMap(nativeMap)
    } finally {
      freeNativeStringMap(nativeMap)
    }
  }

  override serialize(): string {
    return serializeTokenInfo(this.value())
  }

  static deserialize(
    this: new (obj: any) => TokenInfo,
    hex: string
  ): TokenInfo {
    return TokenInfo._deserialize(hex, deserializeTokenInfo)
  }
}

export const calcCollectionTokenHashHex = (
  metadata: MetadataMap,
  totalSupply: number
): string => {
  const metadataMap = makeNativeStringMap(metadata)
  try {
    const rv = calcCollectionTokenHashRaw(metadataMap, totalSupply)
    if (rv.result !== 0) {
      freeObj(rv)
      throw new Error(`Failed to calculate collection token hash. Error code = ${rv.result}`)
    }
    const hashHex = toHex(castToUint8_tPtr(rv.value), UINT256_SIZE)
    freeObj(rv.value)
    freeObj(rv)
    return hashHex
  } finally {
    freeNativeStringMap(metadataMap)
  }
}

export const deriveCollectionTokenKeyFromMaster = (
  masterTokenKey: Scalar,
  collectionTokenHashHex: string
): Scalar => {
  const collectionHash = castToUint256(hexToMallocedBuf(collectionTokenHashHex))
  try {
    const rv = deriveCollectionTokenKeyRaw(masterTokenKey.value(), collectionHash)
    if (rv.result !== 0) {
      freeObj(rv)
      throw new Error(`Failed to derive collection token key. Error code = ${rv.result}`)
    }
    const key = Scalar.fromObj(rv.value)
    freeObj(rv)
    return key
  } finally {
    freeObj(collectionHash)
  }
}

export const deriveCollectionTokenPublicKeyFromMaster = (
  masterTokenKey: Scalar,
  collectionTokenHashHex: string
): PublicKey => {
  const collectionHash = castToUint256(hexToMallocedBuf(collectionTokenHashHex))
  try {
    const obj = deriveCollectionTokenPublicKeyRaw(masterTokenKey.value(), collectionHash)
    if (!obj) {
      throw new Error('Failed to derive collection token public key.')
    }
    return PublicKey.fromObj(obj)
  } finally {
    freeObj(collectionHash)
  }
}
