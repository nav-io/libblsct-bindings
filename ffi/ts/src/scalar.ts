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
  constructor(value?: number) {
    if (typeof value === 'object') {
      super(value)
    }
    else if (
      typeof value === 'number' ||
      value === undefined || value === null
    ) {
      if (value === undefined || value === null) {
        value = 0
      }
      const rv = genScalar(value)
      super(rv.value)
    } else {
      throw new TypeError(`Scalar constructor received value of unexpected type ${typeof value}`)
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

  static override deserialize<T extends ManagedObj>(
    this: new (obj: any) => T,
    hex: string
  ): T {
    if (hex.length % 2 != 0) {
      hex = `0${hex}`
    }
    const rv = deserializeScalar(hex)
    console.log(`rv's result type id ${typeof rv.result}`)
    if (rv.result != 0) {
      freeObj(rv)
      throw new Error(`Deserializaiton failed. Error code = ${rv.result}`)
    }
    const obj = rv.value
    freeObj(rv)

    return new this(obj)
  }
}

