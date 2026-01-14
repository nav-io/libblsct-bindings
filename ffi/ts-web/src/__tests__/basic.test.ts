/**
 * Basic tests for the BLSCT web library
 * 
 * Note: These tests require the WASM module to be built first.
 * Run `npm run build:wasm` before running tests.
 */

import { describe, it, expect, beforeAll } from '@jest/globals';

// Note: In actual test runs, we'd need the WASM module to be built
// These are placeholder tests that demonstrate the API

describe('BLSCT Web Library', () => {
  describe('Module structure', () => {
    it('should export loadBlsctModule function', async () => {
      const { loadBlsctModule } = await import('../index.js');
      expect(typeof loadBlsctModule).toBe('function');
    });

    it('should export isModuleLoaded function', async () => {
      const { isModuleLoaded } = await import('../index.js');
      expect(typeof isModuleLoaded).toBe('function');
    });

    it('should export Scalar class', async () => {
      const { Scalar } = await import('../index.js');
      expect(Scalar).toBeDefined();
    });

    it('should export Point class', async () => {
      const { Point } = await import('../index.js');
      expect(Point).toBeDefined();
    });

    it('should export DoublePublicKey class', async () => {
      const { DoublePublicKey } = await import('../index.js');
      expect(DoublePublicKey).toBeDefined();
    });

    it('should export SubAddress class', async () => {
      const { SubAddress } = await import('../index.js');
      expect(SubAddress).toBeDefined();
    });

    it('should export BlsctChain enum', async () => {
      const { BlsctChain } = await import('../index.js');
      expect(BlsctChain.Mainnet).toBe(0);
      expect(BlsctChain.Testnet).toBe(1);
      expect(BlsctChain.Signet).toBe(2);
      expect(BlsctChain.Regtest).toBe(3);
    });

    it('should export TxOutputType enum', async () => {
      const { TxOutputType } = await import('../index.js');
      expect(TxOutputType.Normal).toBe(0);
      expect(TxOutputType.StakedCommitment).toBe(1);
    });

    it('should export AddressEncoding enum', async () => {
      const { AddressEncoding } = await import('../index.js');
      expect(AddressEncoding.Bech32).toBe(0);
      expect(AddressEncoding.Bech32M).toBe(1);
    });
  });

  describe('Key derivation exports', () => {
    it('should export ChildKey class', async () => {
      const { ChildKey } = await import('../index.js');
      expect(ChildKey).toBeDefined();
    });

    it('should export deriveAllKeys function', async () => {
      const { deriveAllKeys } = await import('../index.js');
      expect(typeof deriveAllKeys).toBe('function');
    });

    it('should export disposeAllKeys function', async () => {
      const { disposeAllKeys } = await import('../index.js');
      expect(typeof disposeAllKeys).toBe('function');
    });
  });

  describe('Utility exports', () => {
    it('should export hexToBytes function', async () => {
      const { hexToBytes } = await import('../index.js');
      expect(typeof hexToBytes).toBe('function');
      
      const bytes = hexToBytes('deadbeef');
      expect(bytes).toEqual(new Uint8Array([0xde, 0xad, 0xbe, 0xef]));
    });

    it('should export bytesToHex function', async () => {
      const { bytesToHex } = await import('../index.js');
      expect(typeof bytesToHex).toBe('function');
      
      const hex = bytesToHex(new Uint8Array([0xde, 0xad, 0xbe, 0xef]));
      expect(hex).toBe('deadbeef');
    });

    it('hexToBytes and bytesToHex should be inverse operations', async () => {
      const { hexToBytes, bytesToHex } = await import('../index.js');
      
      const original = 'cafebabe12345678';
      const bytes = hexToBytes(original);
      const roundTripped = bytesToHex(bytes);
      
      expect(roundTripped).toBe(original);
    });
  });

  describe('Constants', () => {
    it('should export size constants', async () => {
      const {
        DOUBLE_PUBLIC_KEY_SIZE,
        KEY_ID_SIZE,
        POINT_SIZE,
        PUBLIC_KEY_SIZE,
        SCRIPT_SIZE,
        SIGNATURE_SIZE,
        SUB_ADDR_ID_SIZE,
        CTX_ID_SIZE,
      } = await import('../index.js');

      expect(DOUBLE_PUBLIC_KEY_SIZE).toBe(96);
      expect(KEY_ID_SIZE).toBe(20);
      expect(POINT_SIZE).toBe(48);
      expect(PUBLIC_KEY_SIZE).toBe(48);
      expect(SCRIPT_SIZE).toBe(28);
      expect(SIGNATURE_SIZE).toBe(96);
      expect(SUB_ADDR_ID_SIZE).toBe(16);
      expect(CTX_ID_SIZE).toBe(32);
    });
  });
});

// Integration tests (require WASM module to be built)
describe('BLSCT Integration Tests', () => {
  // These tests would run with the actual WASM module
  // For now, they're skipped unless WASM is available
  
  describe.skip('With WASM module', () => {
    beforeAll(async () => {
      const { loadBlsctModule } = await import('../index.js');
      await loadBlsctModule();
    });

    it('should generate random scalar', async () => {
      const { Scalar } = await import('../index.js');
      const scalar = Scalar.random();
      
      expect(scalar).toBeDefined();
      expect(scalar.toHex()).toHaveLength(64); // 32 bytes = 64 hex chars
      
      scalar.dispose();
    });

    it('should generate random point', async () => {
      const { Point } = await import('../index.js');
      const point = Point.random();
      
      expect(point).toBeDefined();
      expect(point.isValid()).toBe(true);
      
      point.dispose();
    });

    it('should derive point from scalar', async () => {
      const { Scalar, Point } = await import('../index.js');
      
      const scalar = Scalar.random();
      const point = Point.fromScalar(scalar);
      
      expect(point.isValid()).toBe(true);
      
      point.dispose();
      scalar.dispose();
    });

    it('should derive all keys from seed', async () => {
      const { Scalar, deriveAllKeys, disposeAllKeys } = await import('../index.js');
      
      const seed = Scalar.random();
      const keys = deriveAllKeys(seed);
      
      expect(keys.childKey).toBeDefined();
      expect(keys.blindingKey).toBeDefined();
      expect(keys.tokenKey).toBeDefined();
      expect(keys.txKey).toBeDefined();
      expect(keys.viewKey).toBeDefined();
      expect(keys.spendingKey).toBeDefined();
      
      disposeAllKeys(keys);
      seed.dispose();
    });
  });
});

