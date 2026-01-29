import {
  BlsctRetVal,
  freeObj,
} from './blsct'

export type FinalizerInfo = {
  cls: string,
  obj: any,
  deleteMethod?: () => void,
}

/**
 * Symbol used to mark an object as containing a WASM pointer.
 * In native builds, this is never used but is exported for API compatibility.
 */
export const WASM_PTR_SYMBOL = Symbol.for('blsct.wasmPtr')

/**
 * Wrapper type for WASM pointers (browser only).
 * In native builds, pointers are NAPI objects, not numbers.
 */
export interface WasmPtrWrapper {
  [WASM_PTR_SYMBOL]: true
  ptr: number
}

/**
 * Creates a wrapper object for a WASM pointer.
 * In native builds, this just returns the object as-is (never called with numbers).
 */
export function wrapWasmPtr(ptr: number): WasmPtrWrapper {
  return {
    [WASM_PTR_SYMBOL]: true,
    ptr,
  }
}

/**
 * Checks if an object is a WASM pointer wrapper.
 * In native builds, this always returns false since NAPI objects are used.
 */
export function isWasmPtrWrapper(obj: any): obj is WasmPtrWrapper {
  return obj !== null && typeof obj === 'object' && obj[WASM_PTR_SYMBOL] === true
}

/**
 * Extracts the pointer from an object, handling both wrapped and unwrapped forms.
 */
export function unwrapPtr(obj: any): any {
  if (isWasmPtrWrapper(obj)) {
    return obj.ptr
  }
  return obj
}

// Shutdown guard: prevents finalizers from running during process exit
// This avoids crashes when native module is being torn down
let isShuttingDown = false

// Register shutdown handlers in Node.js environment
if (typeof process !== 'undefined' && process.on) {
  // 'exit' fires synchronously when process is about to exit
  process.on('exit', () => {
    isShuttingDown = true
  })
  // 'beforeExit' fires when event loop is empty (before 'exit')
  process.on('beforeExit', () => {
    isShuttingDown = true
  })
}

const finalizer = new FinalizationRegistry(
  (fi: FinalizerInfo) => {
    // Skip finalization during shutdown to prevent crashes
    // The OS will reclaim all memory anyway when the process exits
    if (isShuttingDown) {
      return
    }
    if (fi.obj) {
      if (fi.deleteMethod) {
        fi.deleteMethod()
      } else {
        freeObj(fi.obj)
      }
      fi.obj = undefined
    }
  }
)

// Symbol for custom inspection in Node.js
// This is safely ignored in browsers where util.inspect doesn't exist
const inspectSymbol: symbol | undefined = (() => {
  try {
    // Dynamic import check for Node.js environment
    if (typeof Symbol !== 'undefined' && Symbol.for) {
      return Symbol.for('nodejs.util.inspect.custom')
    }
  } catch {
    // Ignore errors in browser environments
  }
  return undefined
})()

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
    if (obj === undefined || obj === null) {
      throw new Error("Undefined/null object passed to ManagedObj")
    }
    this.obj = obj
    this.objSize = 0

    this.fi = {
      obj,
      cls: this.constructor.name,
      deleteMethod,
    }
    finalizer.register(this, this.fi, this)
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

// Add inspect symbol method if available (for Node.js compatibility)
// This enables proper console.log output in Node.js
if (inspectSymbol) {
  (ManagedObj.prototype as any)[inspectSymbol] = function(): string {
    return this.toString()
  }
}
