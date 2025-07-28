import {
  castToPoint,
  deserializePoint,
  freeObj,
  genBasePoint,
  genRandomPoint,
  isPointEqual,
  isValidPoint,
  pointFromScalar,
  pointToStr,
  serializePoint,
} from './blsct'
import { ManagedObj } from './managedObj'
import { Scalar } from './scalar'

export class Point extends ManagedObj {
  constructor(obj?: any) {
    if (typeof obj === 'object') {
      super(obj)
    } else (
      super(genRandomPoint().value)
    )
  }

  override value(): any {
    return castToPoint(this.obj)
  }

  static random(): Point {
    const rv = genRandomPoint()
    const x = Point.fromObj(rv.value)
    freeObj(rv)
    return x
  }

  static base(): Point {
    const rv = genBasePoint()
    const x = Point.fromObj(rv.value)
    freeObj(rv)
    return x
  }

  static fromScalar(scalar: Scalar): Point {
    const obj = pointFromScalar(scalar.value())
    return Point.fromObj(obj)
  }

  isValid(): boolean {
    return isValidPoint(this.value())
  }

  override toString(): string {
    const s = pointToStr(this.value())
    return `Point(${s})`
  }

  equals(other: Point): boolean {
    return isPointEqual(this.value(), other.value())
  }

  override serialize(): string {
    return serializePoint(this.value())
  }

  static deserialize(
    this: new (obj: any) => Point,
    hex: string
  ): Point {
    return Point._deserialize(hex, deserializePoint)
  }
}

