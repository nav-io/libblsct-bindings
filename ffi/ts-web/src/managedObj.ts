/**
 * Base class for managed WASM objects
 * 
 * This class provides automatic memory management for objects
 * allocated in WASM memory. Objects are automatically freed
 * when they go out of scope or when dispose() is called.
 */

import { freeObj } from './wasm/index.js';

/**
 * Base class for objects that wrap WASM pointers
 */
export abstract class ManagedObj {
  protected _ptr: number;
  protected _disposed = false;

  constructor(ptr: number) {
    if (ptr === 0) {
      throw new Error('Cannot create ManagedObj with null pointer');
    }
    this._ptr = ptr;
  }

  /**
   * Get the underlying WASM pointer
   */
  get ptr(): number {
    if (this._disposed) {
      throw new Error('Object has been disposed');
    }
    return this._ptr;
  }

  /**
   * Check if the object has been disposed
   */
  get isDisposed(): boolean {
    return this._disposed;
  }

  /**
   * Dispose of the object and free its WASM memory
   */
  dispose(): void {
    if (!this._disposed) {
      freeObj(this._ptr);
      this._disposed = true;
    }
  }

  /**
   * Execute a function with automatic disposal
   */
  using<T>(fn: (obj: this) => T): T {
    try {
      return fn(this);
    } finally {
      this.dispose();
    }
  }
}

/**
 * Registry for tracking managed objects (useful for debugging memory leaks)
 */
export class ObjectRegistry {
  private static objects = new Set<ManagedObj>();
  private static enabled = false;

  static enable(): void {
    this.enabled = true;
  }

  static disable(): void {
    this.enabled = false;
    this.objects.clear();
  }

  static register(obj: ManagedObj): void {
    if (this.enabled) {
      this.objects.add(obj);
    }
  }

  static unregister(obj: ManagedObj): void {
    if (this.enabled) {
      this.objects.delete(obj);
    }
  }

  static get activeCount(): number {
    return this.objects.size;
  }

  static get activeObjects(): ManagedObj[] {
    return Array.from(this.objects);
  }
}

