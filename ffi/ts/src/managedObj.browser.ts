import {
  BlsctRetVal,
  freeObj,
} from './blsct.browser.js'

export type FinalizerInfo = {
  cls: string,
  obj: any,
  deleteMethod?: () => void,
}

/**
 * Symbol used to mark an object as containing a WASM pointer.
 * This allows fromObj and _deserialize to pass pointers through
 * class constructors without triggering value conversion logic.
 */
export const WASM_PTR_SYMBOL = Symbol.for('blsct.wasmPtr')

/**
 * Wrapper type for WASM pointers.
 * Used by fromObj and _deserialize to pass pointers to constructors.
 */
export interface WasmPtrWrapper {
  [WASM_PTR_SYMBOL]: true
  ptr: number
}

/**
 * Creates a wrapper object for a WASM pointer.
 * @param ptr - The WASM pointer (memory address as number)
 * @returns An object that can be passed to constructors
 */
export function wrapWasmPtr(ptr: number): WasmPtrWrapper {
  return {
    [WASM_PTR_SYMBOL]: true,
    ptr,
  }
}

/**
 * Checks if an object is a WASM pointer wrapper.
 * @param obj - The object to check
 * @returns true if the object is a WASM pointer wrapper
 */
export function isWasmPtrWrapper(obj: any): obj is WasmPtrWrapper {
  return obj !== null && typeof obj === 'object' && obj[WASM_PTR_SYMBOL] === true
}

/**
 * Extracts the pointer from an object, handling both wrapped and unwrapped forms.
 * @param obj - Either a WasmPtrWrapper or a raw pointer/NAPI object
 * @returns The underlying pointer or object
 */
export function unwrapPtr(obj: any): any {
  if (isWasmPtrWrapper(obj)) {
    return obj.ptr
  }
  return obj
}

let isShuttingDown = false
if (typeof process !== 'undefined' && process.on) {
  process.on('exit', () => {
    isShuttingDown = true
  })
  process.on('beforeExit', () => {
    isShuttingDown = true
  })
}

const finalizer = new FinalizationRegistry(
  (fi: FinalizerInfo) => {
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

// Note: WASM_PTR_SYMBOL, isWasmPtrWrapper, unwrapPtr, wrapWasmPtr, WasmPtrWrapper
// are already exported via their individual 'export' declarations above

export abstract class ManagedObj {
  protected obj: any
  protected objSize: number
  protected fi: FinalizerInfo

  /** Constructs a new instance of the class using the C++ object.
   * @param obj - The C++ object to use for the new instance.
   *              Can be a WasmPtrWrapper (from fromObj/deserialize) or a raw pointer/NAPI object.
   */
  constructor(
    obj: any,
    deleteMethod?: () => void,
  ) {
    if (obj === undefined || obj === null) {
      throw new Error("Undefined/null object passed to ManagedObj")
    }
    // Unwrap WASM pointer wrappers
    const unwrappedObj = unwrapPtr(obj)
    this.obj = unwrappedObj
    this.objSize = 0

    this.fi = {
      obj: unwrappedObj,
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
   * @param obj - The object to use for the new instance (typically a WASM pointer).
   * @return A new instance of the class.
   */
  static fromObj<T extends ManagedObj>(
    this: new (obj: any, objSize?: number) => T, 
    obj: any
  ): T {
    // Wrap numeric pointers so constructors can distinguish them from values to convert
    if (typeof obj === 'number') {
      return new this(wrapWasmPtr(obj))
    }
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
      // In browser/WASM, we free the value pointer, not the result object
      if (typeof rv.value === 'number' && rv.value !== 0) {
        freeObj(rv.value)
      }
      throw new Error(msg)
    }
    // Wrap the pointer so constructors can distinguish it from values to convert
    const wrappedValue = typeof rv.value === 'number' ? wrapWasmPtr(rv.value) : rv.value
    const x = new this(wrappedValue)
    x.objSize = rv.value_size
    // Note: We don't free rv.value here as it's now owned by the ManagedObj instance
    // The FinalizationRegistry will handle cleanup when the instance is garbage collected
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

