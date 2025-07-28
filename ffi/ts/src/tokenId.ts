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

export class TokenId extends ManagedObj {
  constructor(obj?: any) {
    if (typeof obj === 'object') {
      super(obj)
    } else {
      const rv = genDefaultTokenId()
      super(rv.value)
    }
  }

  static fromToken(token: number): TokenId {
    const rv = genTokenId(token)
    const tokenId = TokenId.fromObj(rv.value)
    freeObj(rv)
    return tokenId
  }

  static fromTokenAndSubid(token: number, subid: number): TokenId {
    const rv = genTokenIdWithSubid(token, subid)
    const tokenId = TokenId.fromObj(rv.value)
    freeObj(rv)
    return tokenId
  }

  getToken(): number {
    return getTokenIdToken(this.value())
  }

  getSubid(): number {
    return getTokenIdSubid(this.value())
  }

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

  static deserialize(
    this: new (obj: any) => TokenId,
    hex: string
  ): TokenId {
    return TokenId._deserialize(hex, deserializeTokenId)
  }
}

