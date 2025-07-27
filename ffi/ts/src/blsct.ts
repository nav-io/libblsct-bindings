const blsct = require('../build/Release/blsct.node')

export const freeObj = (obj: any): void => {
  if (obj !== null && obj !== undefined) {
    blsct.free_obj(obj)
  }
}

export const init = (): void => {
  blsct.init()
}

// scalar
export const genScalar = (value: number): any => {
  return blsct.gen_scalar(value)
}
export const scalarToUint64 = (scalar: any): number => {
  return blsct.scalar_to_uint64(scalar)
}
export const genRandomScalar = (): any => {
  return blsct.gen_random_scalar()
}
export const isScalarEqual = (a: any, b: any): boolean => {
  return blsct.is_scalar_equal(a, b) !== 0
}
export const serializeScalar = (scalar: any): string => {
  return blsct.serialize_scalar(scalar)
}
export const deserializeScalar = (hex: string): any => {
  return blsct.deserialize_scalar(hex)
}

// typecast
export const castToScalar = (obj: any): any => {
  return blsct.cast_to_scalar(obj)
}
