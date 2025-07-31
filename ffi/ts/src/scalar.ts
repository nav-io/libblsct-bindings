import {
  castToScalar,
  deserializeScalar,
  freeObj,
  genRandomScalar,
  genScalar,
  isScalarEqual,
  scalarToUint64,
  serializeScalar,
} from './blsct'

import { ManagedObj } from './managedObj'

export class Scalar extends ManagedObj {
  constructor(obj?: any) {
    if (typeof obj === 'object') {
      super(obj)
    } else if (typeof obj === 'number') {
      const rv = genScalar(obj)
      super(rv.value)
    } else if (obj === undefined || obj === null) {
      const rv = genRandomScalar()
      super(rv.value)
      freeObj(rv)
    } else {
      throw new TypeError(`Scalar constructor received value of unexpected type ${typeof obj}`)
    }
  }

  override value(): any {
    return castToScalar(this.obj)
  }

  static random(): Scalar {
    const rv = genRandomScalar()
    const x = Scalar.fromObj(rv.value)
    freeObj(rv)
    return x
  }

  toNumber(): number {
    return scalarToUint64(this.value())
  }

  equals(other: Scalar): boolean {
    return isScalarEqual(this.value(), other.value())
  }

  override serialize(): string {
    return serializeScalar(this.value())
  }

  static deserialize(
    this: new (obj: any) => Scalar,
    hex: string
  ): Scalar {
    return Scalar._deserialize(hex, deserializeScalar)
  }
}

