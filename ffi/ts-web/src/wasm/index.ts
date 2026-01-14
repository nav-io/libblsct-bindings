/**
 * WASM module exports
 */

export {
  loadBlsctModule,
  getBlsctModule,
  isModuleLoaded,
  resetModule,
  type BlsctWasmModule,
  type BlsctModuleConfig,
} from './loader.js';

export {
  allocString,
  readString,
  allocBytes,
  readBytes,
  freePtr,
  freeObj,
  hexToBytes,
  bytesToHex,
  WasmPtr,
  withStack,
  parseRetVal,
  parseBoolRetVal,
  assertSuccess,
  type BlsctResult,
} from './memory.js';

