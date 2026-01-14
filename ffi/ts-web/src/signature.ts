/**
 * BLS signature operations
 */

import { ManagedObj } from './managedObj.js';
import {
  signMessage,
  verifyMsgSig,
  serializeSignature,
  deserializeSignature,
  assertSuccess,
} from './blsct.js';
import { Scalar } from './scalar.js';

/**
 * Represents a BLS signature
 */
export class Signature extends ManagedObj {
  constructor(ptr: number) {
    super(ptr);
  }

  /**
   * Sign a message with a private key
   */
  static sign(privateKey: Scalar, message: string): Signature {
    const ptr = signMessage(privateKey.ptr, message);
    return new Signature(ptr);
  }

  /**
   * Deserialize from hex
   */
  static fromHex(hex: string): Signature {
    const result = deserializeSignature(hex);
    const ptr = assertSuccess(result, 'Deserialize signature');
    return new Signature(ptr);
  }

  /**
   * Verify this signature against a message and public key
   */
  verify(publicKey: number, message: string): boolean {
    return verifyMsgSig(publicKey, message, this.ptr);
  }

  /**
   * Serialize to hex
   */
  toHex(): string {
    return serializeSignature(this.ptr);
  }

  toString(): string {
    return `Signature(${this.toHex().slice(0, 16)}...)`;
  }
}

