/**
 * WASM bindings for browser environments
 */

export {
  loadBlsctModule,
  getBlsctModule,
  isModuleLoaded,
  resetModule,
  type BlsctWasmModule,
  type BlsctModuleConfig,
  type LoadBlsctModuleOptions,
} from './loader.js';

export {
  allocString,
  readString,
  freePtr,
  freeObj,
  parseRetVal,
  parseCTxRetVal,
  assertSuccess,
  type BlsctResult,
} from './memory.js';

/**
 * Platform identifier
 */
export const platform = 'wasm' as const;

