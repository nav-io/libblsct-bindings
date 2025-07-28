const blsct = require('../build/Release/blsct.node')

if (!blsct._initialized) {
  blsct.init()
  blsct._initialized = true
}

export const freeObj = (obj: any): void => {
  if (obj !== null && obj !== undefined) {
    blsct.free_obj(obj)
  }
}

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
export const deserializeDpk = (hex: string): any => {
  return blsct.deserialize_dpk(hex)
}
export const genDoublePubKey = (pk1: any, pk2: any): any => {
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

// scalar
export const deserializeScalar = (hex: string): any => {
  return blsct.deserialize_scalar(hex)
}
export const genRandomScalar = (): any => {
  return blsct.gen_random_scalar()
}
export const genScalar = (value: number): any => {
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

// point
export const deserializePoint = (hex: string): any => {
  return blsct.deserialize_point(hex)
}
export const genBasePoint = (): any => {
  return blsct.gen_base_point()
}
export const genRandomPoint = (): any => {
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
export const genRandomPublicKey = (): any => {
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

// tx key
export const fromTxKeyToSpendingKey = (txKey: any): any => {
  return blsct.from_tx_key_to_spending_key(txKey)
}
export const fromTxKeyToViewKey = (txKey: any): any => {
  return blsct.from_tx_key_to_view_key(txKey)
}

// typecast
export const castToDpk = (obj: any): any => {
  return blsct.cast_to_dpk(obj)
}
export const castToScalar = (obj: any): any => {
  return blsct.cast_to_scalar(obj)
}
export const castToPoint = (obj: any): any => {
  return blsct.cast_to_point(obj)
}
export const castToPubKey = (obj: any): any => {
  return blsct.cast_to_pub_key(obj)
}

