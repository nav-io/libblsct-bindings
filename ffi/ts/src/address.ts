import {
  Bech32,
  Bech32M,
  castToDpk,
  decodeAddress,
  encodeAddress,
  freeObj,
  getValueAsCStr,
} from './blsct'

import { DoublePublicKey } from './keys/doublePublicKey'

/**
 * Represents the available address encoding formats.
 */
export enum AddressEncoding {
  /** Bech32 encoding as defined in BIP-173. */
  Bech32,
  /** Bech32m encoding as defined in BIP-350. */
  Bech32M,
}

/**
 * Provides static utility methods for encoding and decoding addresses.
 *
 * This class is intended to be used as a static container and should not be instantiated.
 *
 * Examples:
 * ```ts
 * const { Address, DoublePublicKey, AddressEncoding } = require('navio-blsct')
 * const dpk = DoublePublicKey.random()
 * const addr = Address.encode(dpk, AddressEncoding.Bech32M)
 * addr
 * const decDpk = Address.decode(addr)
 * decDpk.serialize() === dpk.serialize()  // true
 * ```
 */
export class Address {
  /** Encode a `DoublePublicKey` to an address string using the specified encoding 
   *
   * @param addrDpk - The `DoublePublicKey` to encode.
   * @param encoding - The desired address encoding format (`Bech32` or `Bech32M`).
   * @return The encoded address as a string.
   */
  static encode(
    addrDpk: DoublePublicKey,
    encoding: AddressEncoding,
  ): string {
    let blsctEncoding: AddressEncoding = 
      encoding === AddressEncoding.Bech32 ? Bech32 : Bech32M

    const dpk = castToDpk(addrDpk.value())
    const rv = encodeAddress(dpk, blsctEncoding)
    if (rv.result !== 0) {
      const msg = `Failed to encode address. Error code = ${rv.result}`
      freeObj(rv)
      throw new Error(msg)
    }
    const addrCStr = getValueAsCStr(rv);
    freeObj(rv)

    return addrCStr;
  }

  /** Decode an address string to a `DoublePublicKey`.
   *
   * @param addrStr - The address string to decode.
   * @return A `DoublePublicKey` instance representing the decoded address.
   * @throws Error if the decoding fails.
   */
  static decode(addrStr: string): DoublePublicKey {
    const rv = decodeAddress(addrStr)
    if (rv.result !== 0) {
      const msg = `Failed to decode address. Error code = ${rv.result}`
      freeObj(rv)
      throw new Error(msg)
    }
    const addrDpk = DoublePublicKey.fromObj(rv.value)
    freeObj(rv)

    return addrDpk
  }
}

