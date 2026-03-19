import {
  addToStringMap,
  createStringMap,
  deleteStringMap,
  getStringMapKeyAt,
  getStringMapSize,
  getStringMapValueAt,
} from './blsct'

export type MetadataMap = Record<string, string>

export const makeNativeStringMap = (metadata: MetadataMap = {}): any => {
  const nativeMap = createStringMap()
  for (const [key, value] of Object.entries(metadata)) {
    addToStringMap(nativeMap, key, value)
  }
  return nativeMap
}

export const readNativeStringMap = (nativeMap: any): MetadataMap => {
  const ret: MetadataMap = {}
  const size = getStringMapSize(nativeMap)
  for (let i = 0; i < size; i += 1) {
    ret[getStringMapKeyAt(nativeMap, i)] = getStringMapValueAt(nativeMap, i)
  }
  return ret
}

export const freeNativeStringMap = (nativeMap: any): void => {
  if (nativeMap !== null && nativeMap !== undefined) {
    deleteStringMap(nativeMap)
  }
}

