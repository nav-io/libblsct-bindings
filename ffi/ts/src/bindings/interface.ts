/**
 * Binding interface definitions
 * 
 * These types are shared between Node.js native addon and WASM implementations
 */

export interface BlsctRetVal {
  value: unknown;
  value_size: number;
  result: number;
}

export interface BlsctAmountsRetVal {
  result: number;
  value: unknown;
  _structPtr?: number;  // Internal: WASM struct pointer for cleanup
}

export interface BlsctBoolRetVal {
  value: boolean;
  result: number;
}

export interface BlsctCTxRetVal {
  result: number;
  ctx: unknown;
  in_amount_err_index: number;
  out_amount_err_index: number;
}

export enum BlsctChain {
  Mainnet = 0,
  Testnet = 1,
  Signet = 2,
  Regtest = 3,
}

export enum TxOutputType {
  Normal = 0,
  StakedCommitment = 1,
}
