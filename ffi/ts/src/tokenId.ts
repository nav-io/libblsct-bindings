import {
  castToTokenId,
  deserializeTokenId,
  genDefaultTokenId,
  genTokenId,
  genTokenIdWithSubid,
  getTokenIdSubid,
  getTokenIdToken,
  freeObj,
  serializeTokenId,
} from './blsct'

import { ManagedObj } from './managedObj'

/** Represents a token ID. A token ID consists of two parameters: token and subid, both of which are optional. When omitted, default values are used instead of random values.
 * 
 * Examples:
 * ```ts
 * const { TokenId } = require('navio-blsct')
 * const tid1 = TokenId.default()
 * const tid2 = TokenId.fromToken(123)
 * const tid3 = TokenId.fromTokenAndSubid(123, 456)
 * tid3.getToken() // 123
 * tid3.getSubid() // 456
 * tid3.equals(tid2) // false
 * tid3.equals(tid3) // true
 * ser = tid3.serialize()
 * deser = TokenId.deserialize(ser)
 * deser.serialize() === ser // true
 * ```
 */  
export class TokenId extends ManagedObj {
  constructor(obj: any) {
    super(obj)
  }

  /** Generates a new default `TokenId` instance.
   * @returns A new `TokenId` instance with default values for token and subid.
   */
  static default(): TokenId {
    const rv = genDefaultTokenId()
    return new TokenId(rv.value)
  }

  /** Generates a `TokenId` from the provided token.
   *
   * @param token - The token number to use for the `TokenId`.
   * @return A new `TokenId` instance with the specified token and a default subid.
   */
  static fromToken(token: number): TokenId {
    const rv = genTokenId(token)
    const tokenId = TokenId.fromObj(rv.value)
    freeObj(rv)
    return tokenId
  }

  /** Generates a `TokenId` from the provided token and subid.
   *
   * @param token - The token number to use for the `TokenId`.
   * @param subid - The subid number to use for the `TokenId`.
   * @return A new `TokenId` instance with the specified token and subid.
   */
  static fromTokenAndSubid(token: number, subid: number): TokenId {
    const rv = genTokenIdWithSubid(token, subid)
    const tokenId = TokenId.fromObj(rv.value)
    freeObj(rv)
    return tokenId
  }

  /** Returns the token number of the `TokenId`.
   *
   * @return The token number of the `TokenId`.
   */
  getToken(): number {
    return getTokenIdToken(this.value())
  }

  /** Returns the subid number of the `TokenId`.
   *
   * @return The subid number of the `TokenId`.
   */
  getSubid(): number {
    return getTokenIdSubid(this.value())
  }

  /** Checks if the current `TokenId` is equal to another `TokenId`.
   *
   * @param other - The `TokenId` to compare with.
   * @return `true` if both token and subid are equal, `false` otherwise.
   */
  equals(other: TokenId): boolean {
    return this.getToken() === other.getToken() &&
      this.getSubid() === other.getSubid()
  }

  override value(): any {
    return castToTokenId(this.obj)
  }

  override serialize(): string {
    return serializeTokenId(this.value())
  }

  /** Deserializes a hexadecimal string into a `TokenId` instance.
   *
   * @param hex - The hexadecimal string to convert.
   * @returns The `TokenId` instance represented by the input string.
   */
  static deserialize(
    this: new (obj: any) => TokenId,
    hex: string
  ): TokenId {
    return TokenId._deserialize(hex, deserializeTokenId)
  }
}

