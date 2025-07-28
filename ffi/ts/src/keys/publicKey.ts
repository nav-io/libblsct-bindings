import {
  calcNonce,
  castToPubKey,
  deserializePoint,
  freeObj,
  genRandomPublicKey,
  getPublicKeyPoint,
  pointToPublicKey,
  scalarToPubKey,
} from '../blsct'

import { ManagedObj } from '../managedObj'
import { Point } from '../point'
import { Scalar } from '../scalar'
import { ViewKey } from './childKeyDesc/txKeyDesc/viewKey'

export class PublicKey extends ManagedObj {
  constructor(obj?: any) {
    if (typeof obj === 'object') {
      super(obj)
    } else {
      const rv = genRandomPublicKey()
      super(rv.value)
    }
  }

  getPoint(): Point {
    const blsctPoint = getPublicKeyPoint(this.value())
    return Point.fromObj(blsctPoint)
  }

  static random(): PublicKey {
    const rv = genRandomPublicKey()
    const pk = PublicKey.fromObj(rv.value)
    freeObj(rv)
    return pk
  }

  static fromPoint(point: Point): PublicKey {
    const blsctPubKey = pointToPublicKey(point.value())
    return PublicKey.fromObj(blsctPubKey)
  }

  static fromScalar(scalar: Scalar): PublicKey {
    const blsctPubKey = scalarToPubKey(scalar.value())
    return PublicKey.fromObj(blsctPubKey)
  }

  static generateNonce(
    blindingPubKey: PublicKey,
    viewKey: ViewKey
  ): PublicKey {
    const blsctNonce = calcNonce(
      blindingPubKey.value(),
      viewKey.value()
    )
    return PublicKey.fromObj(blsctNonce)
  }

  equals(other: PublicKey): boolean {
    return this.getPoint().equals(other.getPoint())
  }

  override value(): any {
    return castToPubKey(this.obj)
  }

  override serialize(): string {
    return this.getPoint().serialize()
  }

  static deserialize(
    this: new (obj: any) => PublicKey,
    hex: string
  ): PublicKey {
    const p = Point.deserialize(hex)
    return PublicKey.fromPoint(p)
  }
}

