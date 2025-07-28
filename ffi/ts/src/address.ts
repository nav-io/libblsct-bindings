import {
  asString,
  Bech32,
  Bech32M,
  castToDpk,
  decodeAddress,
  encodeAddress,
  freeObj,
} from './blsct'

import { DoublePublicKey } from './keys/doublePublicKey'

export enum AddressEncoding {
  Bech32,
  Bech32M,
}

export class Address {
  static encode(
    addrDpk: DoublePublicKey,
    encoding: AddressEncoding,
  ): string {
    let blsctEncoding: AddressEncoding = 
      encoding === AddressEncoding.Bech32 ? Bech32 : Bech32M

    const dpk = castToDpk(addrDpk.value())
    const rv = encodeAddress(dpk, blsctEncoding)
    if (rv.result !== 0) {
      freeObj(rv)
      throw new Error(`Failed to encode address. Error code = ${rv.result}`)
    }
    const encAddr = rv.value
    freeObj(rv)

    return encAddr
  }

  static decode(addrStr: string): DoublePublicKey {
    const addrCStr = asString(addrStr)
    const rv = decodeAddress(addrCStr)
    if (rv.result !== 0) {
      freeObj(rv)
      throw new Error(`Failed to decode address. Error code = ${rv.result}`)
    }
    const addrDpk = DoublePublicKey.fromObj(rv.value)
    freeObj(rv)

    return addrDpk
  }
}

