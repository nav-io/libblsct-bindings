import {
  BlsctRetVal,
  freeObj,
} from './blsct'
import util from 'util'

export type FinalizerInfo = {
  cls: string,
  obj: any,
  isBorrow: boolean,
  deleteMethod?: () => void,
}

const finalizer = new FinalizationRegistry(
  (fi: FinalizerInfo) => {
    if (fi.obj && !fi.isBorrow) {
      if (fi.deleteMethod) {
        fi.deleteMethod()
      } else {
        freeObj(fi.obj)
      }
    }
  }
)

export abstract class ManagedObj {
  protected obj: any
  protected objSize: number
  protected fi: FinalizerInfo

  /** Constructs a new instance of the class using the C++ object.
   * @param obj - The C++ object to use for the new instance.
   */
  constructor(
    obj: any,
    deleteMethod?: () => void,
  ) {
    this.fi = {
      obj,
      cls: this.constructor.name,
      isBorrow: false,
      deleteMethod,
    }
    if (obj !== undefined) {
      finalizer.register(this, this.fi, this)
    }
    this.obj = obj
    this.objSize = 0
  }

  /** Returnsthe underlying C++ object.
   * @returns The underlying C++ object.
   */
  abstract value(): any
  
  /** Returns the size of the underlying C++ object.
   * @returns The size of the underlying C++ object in bytes.
   */
  size(): number {
    return this.objSize
  }

  /** Returns the underlying C++ object,
   * transferring ownership from this instance to the caller.
   * @returns The underlying object of the instance.
   */
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

  /** Constucts a new instance using the provided object.
   *
   * @param obj - The object to use for the new instance.
   * @return A new instance of the class.
   */
  static fromObj<T extends ManagedObj>(
    this: new (obj: any, objSize?: number) => T, 
    obj: any
  ): T {
    return new this(obj)
  }

  /** Constructs a new instance using the provided object and size.
   *
   * @param obj - The object to use for the new instance.
   * @param objSize - The size of the object.
   * @return A new instance of the class.
   */
  static fromObjAndSize<T extends ManagedObj>(
    this: new (obj: any) => T, 
    obj: any,
    objSize: number,
  ): T {
    const x = new this(obj)
    x.objSize = objSize
    return x
  }

  /** Returns a string representation of the instance.
   * @returns A string representation of the instance.
   */
  toString(): string {
    return `${this.constructor.name}(${this.serialize()})`
  }

  /** @hidden */
  [util.inspect.custom](): string {
    return this.toString()
  }

  /** Serializes the instance to a hexadecimal string.
   * @returns A hexadecimal string representation of the instance.
   */
  serialize(): string {
    return 'NOT IMPLEMENTED'
  }

  /** @hidden */
  protected static _deserialize<T extends ManagedObj>(
    this: new (obj: any) => T,
    hex: string,
    deserializer: (hex: string) => BlsctRetVal
  ): T {
    if (hex.length % 2 !== 0) {
      hex = `0${hex}`
    }
    const rv = deserializer(hex)
    if (rv.result !== 0) {
      const msg = `Deserialization failed. Error code = ${rv.result}`
      freeObj(rv)
      throw new Error(msg)
    }
    const x = new this(rv.value)
    x.objSize = rv.value_size
    freeObj(rv)
    return x
  }
}
