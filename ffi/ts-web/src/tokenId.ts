/**
 * Token ID for identifying tokens in BLSCT
 */

import { ManagedObj } from './managedObj.js';
import {
  genTokenId,
  genTokenIdWithSubid,
  genDefaultTokenId,
  getTokenIdToken,
  getTokenIdSubid,
  serializeTokenId,
  deserializeTokenId,
  assertSuccess,
} from './blsct.js';

/**
 * Represents a token identifier in the BLSCT system
 */
export class TokenId extends ManagedObj {
  constructor(ptr: number) {
    super(ptr);
  }

  /**
   * Create the default token ID (native currency)
   */
  static default(): TokenId {
    const result = genDefaultTokenId();
    const ptr = assertSuccess(result, 'Generate default token ID');
    return new TokenId(ptr);
  }

  /**
   * Create a token ID for a specific token
   */
  static fromToken(token: number | bigint): TokenId {
    const result = genTokenId(token);
    const ptr = assertSuccess(result, 'Generate token ID');
    return new TokenId(ptr);
  }

  /**
   * Create a token ID with a token and subid
   */
  static fromTokenAndSubid(token: number | bigint, subid: number | bigint): TokenId {
    const result = genTokenIdWithSubid(token, subid);
    const ptr = assertSuccess(result, 'Generate token ID with subid');
    return new TokenId(ptr);
  }

  /**
   * Deserialize from hex
   */
  static fromHex(hex: string): TokenId {
    const result = deserializeTokenId(hex);
    const ptr = assertSuccess(result, 'Deserialize token ID');
    return new TokenId(ptr);
  }

  /**
   * Get the token value
   */
  get token(): bigint {
    return getTokenIdToken(this.ptr);
  }

  /**
   * Get the subid value
   */
  get subid(): bigint {
    return getTokenIdSubid(this.ptr);
  }

  /**
   * Check if this is the default (native) token
   */
  isDefault(): boolean {
    return this.token === 0n && this.subid === 0n;
  }

  /**
   * Serialize to hex
   */
  toHex(): string {
    return serializeTokenId(this.ptr);
  }

  toString(): string {
    if (this.isDefault()) {
      return 'TokenId(default)';
    }
    return `TokenId(token=${this.token}, subid=${this.subid})`;
  }
}

