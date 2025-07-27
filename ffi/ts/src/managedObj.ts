import { freeObj } from './blsct'

export type FinalizerInfo = {
  obj: any,
}

const finalizer = new FinalizationRegistry(
  (fi: FinalizerInfo) => {
    freeObj(fi.obj)
    fi.obj = undefined
  }
)

export abstract class ManagedObj {
  obj: any

  constructor(
    obj: any,
  ) {
    const fi: FinalizerInfo = { obj }
    finalizer.register(this, fi)
    this.obj = obj
  }

  abstract value(): any

  protected static fromObj<T extends ManagedObj>(
    this: new (obj: any) => T, 
    obj: any
  ): T {
    return new this(obj)
  }

  serialize(): string {
    throw new Error('Not implemented')
  }

  static deserialize<T extends ManagedObj>(
    this: new (obj: any) => T,
    hex: string
  ): T {
    throw new Error('Not implemented')
  }
}
