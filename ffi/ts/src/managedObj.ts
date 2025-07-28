import { freeObj } from './blsct'
import util from 'util'

export type FinalizerInfo = {
  cls: string,
  obj: any,
}

const finalizer = new FinalizationRegistry(
  (fi: FinalizerInfo) => {
    if (fi.obj) {
      //console.log(`Finalizer called: ${JSON.stringify(fi)}`)
      freeObj(fi.obj)
      fi.obj = undefined
    }
  }
)

export abstract class ManagedObj {
  obj: any
  fi: FinalizerInfo

  constructor(
    obj: any,
  ) {
    this.fi = { obj, cls: this.constructor.name }
    finalizer.register(this, this.fi, this)
    this.obj = obj
  }

  abstract value(): any

  move(): any {
    if (this.obj === undefined) {
      throw new Error('Obj has already been moved')
    }
    const obj = this.obj
    this.obj = undefined

    // both fi.obj and unregister can suppress freeing memory
    // using both just in case either of them fails
    this.fi.obj = undefined
    finalizer.unregister(this)

    return obj  
  }

  static fromObj<T extends ManagedObj>(
    this: new (obj: any) => T, 
    obj: any
  ): T {
    return new this(obj)
  }

  toString(): string {
    return `${this.constructor.name}(${this.obj})`
  }

  [util.inspect.custom](): string {
    return this.toString()
  }

  serialize(): string {
    throw new Error('Not implemented')
  }

  protected static _deserialize<T extends ManagedObj>(
    this: new (obj: any) => T,
    hex: string,
    deserializer: (hex: string) => { result: number; value: any }
  ): T {
    if (hex.length % 2 !== 0) {
      hex = `0${hex}`
    }
    const rv = deserializer(hex)
    if (rv.result !== 0) {
      freeObj(rv)
      throw new Error(`Deserialization failed. Error code = ${rv.result}`)
    }
    const obj = rv.value
    freeObj(rv)
    return new this(obj)
  }
}
