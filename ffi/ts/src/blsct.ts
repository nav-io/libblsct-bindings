const blsct = require('../build/Release/blsct.node')

if (!blsct._initialized) {
  blsct.init()
  blsct._initialized = true
}

export interface BlsctRetVal {
  value: any
  result: number
}

export const freeObj = (obj: any): void => {
  if (obj !== null && obj !== undefined) {
    blsct.free_obj(obj)
  }
}

// address
export const decodeAddress = (addrStr: any): BlsctRetVal => {
  return blsct.decode_address(addrStr)
}
export const encodeAddress = (
  dpk: any,
  encoding: number
): BlsctRetVal => {
  return blsct.encode_address(dpk, encoding)
}
export const Bech32 = blsct.Bech32
export const Bech32M = blsct.Bech32M

// child key
export const fromSeedToChildKey = (seed: any): any => {
  return blsct.from_seed_to_child_key(seed)
}
export const fromChildKeyToBlindingKey = (childKey: any): any => {
  return blsct.from_child_key_to_blinding_key(childKey)
}
export const fromChildKeyToTokenKey = (childKey: any): any => {
  return blsct.from_child_key_to_token_key(childKey)
}
export const fromChildKeyToTxKey = (childKey: any): any => {
  return blsct.from_child_key_to_tx_key(childKey)
}

// double public key
export const deserializeDpk = (hex: string): BlsctRetVal => {
  return blsct.deserialize_dpk(hex)
}
export const genDoublePubKey = (pk1: any, pk2: any): BlsctRetVal => {
  return blsct.gen_double_pub_key(pk1, pk2)
}
export const genDpkWithKeysAndSubAddrId = (
  viewKey: any,
  spendingPubKey: any,
  account: number,
  address: number
): any => {
  return blsct.gen_dpk_with_keys_and_sub_addr_id(
    viewKey,
    spendingPubKey,
    account,
    address
  )
}
export const serializeDpk = (dpk: any): string => {
  return blsct.serialize_dpk(dpk)
}

// hash id
export const calcKeyId = (
  blindingPubKey: any,
  spendingPubKey: any,
  viewKey: any
): any => {
  return blsct.calc_key_id(blindingPubKey, spendingPubKey, viewKey)
}
export const deserializeKeyId = (hex: string): BlsctRetVal => {
  return blsct.deserialize_key_id(hex)
}
export const serializeKeyId = (hashId: any): string => {
  return blsct.serialize_key_id(hashId)
}

// memory management
export const runGc = async (): Promise<void> => {
  if (typeof global.gc === 'function') {
    ;(global as any).gc()
    await new Promise(r =>
      setImmediate(r)
    )
  } else {
    console.warn('Garbage collector is not exposed. Run Node.js with --expose-gc to expose it.')
  }
}

// point
export const deserializePoint = (hex: string): BlsctRetVal => {
  return blsct.deserialize_point(hex)
}
export const genBasePoint = (): BlsctRetVal => {
  return blsct.gen_base_point()
}
export const genRandomPoint = (): BlsctRetVal => {
  return blsct.gen_random_point()
}
export const isPointEqual = (a: any, b: any): boolean => {
  return blsct.is_point_equal(a, b) !== 0
}
export const isValidPoint = (point: any): boolean => {
  return blsct.is_valid_point(point) !== 0
}
export const pointFromScalar = (scalar: any): any => {
  return blsct.point_from_scalar(scalar)
}
export const pointToStr = (point: any): any => {
  return blsct.point_to_str(point)
}
export const serializePoint = (point: any): string => {
  return blsct.serialize_point(point)
}

// priv spending key
export const calcPrivSpendingKey = (
  blindingPubKey: any,
  viewKey: any,
  spendingKey: any,
  account: number,
  address: number): any => {

  return blsct.calc_priv_spending_key(
    blindingPubKey,
    viewKey,
    spendingKey,
    account,
    address
  )
}

// public key
export const calcNonce = (blindingPubKey: any, viewKey: any): any => {
  return blsct.calc_nonce(blindingPubKey, viewKey)
}
export const genRandomPublicKey = (): BlsctRetVal => {
  return blsct.gen_random_public_key()
}
export const getPublicKeyPoint = (obj: any): any => {
  return blsct.get_public_key_point(obj)
}
export const pointToPublicKey = (point: any): any => {
  return blsct.point_to_public_key(point)
}
export const scalarToPubKey = (scalar: any): any => {
  return blsct.scalar_to_pub_key(scalar)
}

// scalar
export const deserializeScalar = (hex: string): BlsctRetVal => {
  return blsct.deserialize_scalar(hex)
}
export const genRandomScalar = (): BlsctRetVal => {
  return blsct.gen_random_scalar()
}
export const genScalar = (value: number): BlsctRetVal => {
  return blsct.gen_scalar(value)
}
export const isScalarEqual = (a: any, b: any): boolean => {
  return blsct.is_scalar_equal(a, b) !== 0
}
export const scalarToUint64 = (scalar: any): number => {
  return blsct.scalar_to_uint64(scalar)
}
export const serializeScalar = (scalar: any): string => {
  return blsct.serialize_scalar(scalar)
}

// token id
export const deserializeTokenId = (hex: string): BlsctRetVal => {
  return blsct.deserialize_token_id(hex)
}
export const genTokenId = (token: number): BlsctRetVal => {
  return blsct.gen_token_id(token)
}
export const genTokenIdWithSubid = (token: number, subid: number): BlsctRetVal => {
  return blsct.gen_token_id_with_subid(token, subid)
}
export const genDefaultTokenId = (): BlsctRetVal => {
  return blsct.gen_default_token_id()
}
export const getTokenIdSubid = (tokenId: any): number => {
  return blsct.get_token_id_subid(tokenId)
}
export const getTokenIdToken = (tokenId: any): number => {
  return blsct.get_token_id_token(tokenId)
}
export const serializeTokenId = (tokenId: any): string => {
  return blsct.serialize_token_id(tokenId)
}

// tx key
export const fromTxKeyToSpendingKey = (txKey: any): any => {
  return blsct.from_tx_key_to_spending_key(txKey)
}
export const fromTxKeyToViewKey = (txKey: any): any => {
  return blsct.from_tx_key_to_view_key(txKey)
}

// typecast
export const asString = (obj: string): any => {
  return blsct.as_string(obj)
}
export const castToDpk = (obj: any): any => {
  return blsct.cast_to_dpk(obj)
}
export const castToKeyId = (obj: any): any => {
  return blsct.cast_to_key_id(obj)
}
export const castToPoint = (obj: any): any => {
  return blsct.cast_to_point(obj)
}
export const castToPubKey = (obj: any): any => {
  return blsct.cast_to_pub_key(obj)
}
export const castToScalar = (obj: any): any => {
  return blsct.cast_to_scalar(obj)
}
export const castToTokenId = (obj: any): any => {
  return blsct.cast_to_token_id(obj)
}

// view tag
export const calcViewTag = (
  blindingPubKey: any,
  viewKey: any
): any => {
  return blsct.calc_view_tag(blindingPubKey, viewKey)
}
