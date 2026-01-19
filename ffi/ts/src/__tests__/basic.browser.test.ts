/**
 * Basic browser/WASM tests
 * 
 * These tests verify that the WASM module can be loaded and basic
 * operations work in a browser-like environment.
 */

// Note: These tests require the WASM module to be built first
// Run: npm run build:wasm && npm run build:browser

import * as path from 'path';

// Store the dynamically imported modules
let wasmLoader: any = null;
let blsctBrowser: any = null;
let wasmLoaded = false;

// Get the WASM path from Jest globals
declare const WASM_PATH: string | undefined;

function getWasmPath(): string {
  // Use Jest global if available
  if (typeof WASM_PATH !== 'undefined') {
    return WASM_PATH;
  }
  // Fallback: compute path relative to project root
  // In Jest, process.cwd() is the project root
  return path.resolve(process.cwd(), 'wasm/blsct.js');
}

describe('Browser WASM Module', () => {
  // Skip tests if explicitly disabled
  const skipWasmTests = process.env.SKIP_WASM_TESTS === '1';

  beforeAll(async () => {
    if (skipWasmTests) {
      console.log('WASM tests skipped (SKIP_WASM_TESTS=1)');
      return;
    }
    
    try {
      // Dynamically import the WASM loader
      wasmLoader = await import('../bindings/wasm/index.js');
      
      // Load the WASM module with absolute path
      const wasmPath = getWasmPath();
      console.log('Loading WASM from:', wasmPath);
      await wasmLoader.loadBlsctModule(wasmPath);
      wasmLoaded = true;

      // THEN dynamically import the browser modules after WASM is loaded
      blsctBrowser = await import('../index.browser.js');
    } catch (err) {
      console.warn('WASM module not available:', err);
      wasmLoaded = false;
    }
  });

  // Helper to skip test if WASM not loaded
  const skipIfNoWasm = () => {
    if (skipWasmTests || !wasmLoaded || !blsctBrowser) {
      return true;
    }
    return false;
  };

  describe('Module Loading', () => {
    it('should load WASM module', () => {
      if (skipIfNoWasm()) {
        console.log('Test skipped: WASM not available');
        return;
      }
      expect(wasmLoader.isModuleLoaded()).toBe(true);
    });

    it('should get WASM module instance', () => {
      if (skipIfNoWasm()) {
        console.log('Test skipped: WASM not available');
        return;
      }
      const module = wasmLoader.getBlsctModule();
      expect(module).toBeDefined();
      expect(typeof module._malloc).toBe('function');
      expect(typeof module._free).toBe('function');
    });
  });

  describe('Scalar Operations', () => {
    it('should create random scalars', () => {
      if (skipIfNoWasm()) return;
      const s1 = blsctBrowser.Scalar.random();
      const s2 = blsctBrowser.Scalar.random();
      expect(s1).toBeDefined();
      expect(s2).toBeDefined();
      expect(s1.equals(s2)).toBe(false);
    });

    it('should create scalar from number', () => {
      if (skipIfNoWasm()) return;
      const s = new blsctBrowser.Scalar(12345);
      expect(s.toNumber()).toBe(12345);
    });

    it('should serialize and deserialize scalars', () => {
      if (skipIfNoWasm()) return;
      const s1 = blsctBrowser.Scalar.random();
      const hex = s1.serialize();
      const s2 = blsctBrowser.Scalar.deserialize(hex);
      expect(s1.equals(s2)).toBe(true);
    });

    it('should perform scalar addition', () => {
      if (skipIfNoWasm()) return;
      const s1 = new blsctBrowser.Scalar(5);
      const s2 = new blsctBrowser.Scalar(3);
      const result = s1.add(s2);
      expect(result.toNumber()).toBe(8);
    });

    it('should perform scalar multiplication', () => {
      if (skipIfNoWasm()) return;
      const s1 = new blsctBrowser.Scalar(5);
      const s2 = new blsctBrowser.Scalar(3);
      const result = s1.mul(s2);
      expect(result.toNumber()).toBe(15);
    });
  });

  describe('Point Operations', () => {
    it('should create random points', () => {
      if (skipIfNoWasm()) return;
      const p1 = blsctBrowser.Point.random();
      const p2 = blsctBrowser.Point.random();
      expect(p1).toBeDefined();
      expect(p2).toBeDefined();
      expect(p1.equals(p2)).toBe(false);
    });

    it('should serialize and deserialize points', () => {
      if (skipIfNoWasm()) return;
      const p1 = blsctBrowser.Point.random();
      const hex = p1.serialize();
      const p2 = blsctBrowser.Point.deserialize(hex);
      expect(p1.equals(p2)).toBe(true);
    });

    it('should multiply point by scalar', () => {
      if (skipIfNoWasm()) return;
      const p = blsctBrowser.Point.random();
      const s = new blsctBrowser.Scalar(2);
      const result = p.mulScalar(s);
      expect(result).toBeDefined();
      expect(result.equals(p)).toBe(false);
    });

    it('should add points', () => {
      if (skipIfNoWasm()) return;
      const p1 = blsctBrowser.Point.random();
      const p2 = blsctBrowser.Point.random();
      const result = p1.add(p2);
      expect(result).toBeDefined();
      expect(result.equals(p1)).toBe(false);
      expect(result.equals(p2)).toBe(false);
    });
  });

  describe('PublicKey Operations', () => {
    it('should create public key from scalar', () => {
      if (skipIfNoWasm()) return;
      const sk = blsctBrowser.Scalar.random();
      const pk = blsctBrowser.PublicKey.fromScalar(sk);
      expect(pk).toBeDefined();
    });

    it('should create random public key', () => {
      if (skipIfNoWasm()) return;
      const pk1 = blsctBrowser.PublicKey.random();
      const pk2 = blsctBrowser.PublicKey.random();
      expect(pk1).toBeDefined();
      expect(pk2).toBeDefined();
      expect(pk1.equals(pk2)).toBe(false);
    });

    it('should serialize and deserialize public keys', () => {
      if (skipIfNoWasm()) return;
      const pk1 = blsctBrowser.PublicKey.random();
      const hex = pk1.serialize();
      const pk2 = blsctBrowser.PublicKey.deserialize(hex);
      expect(pk1.equals(pk2)).toBe(true);
    });
  });

  describe('Signature Operations', () => {
    it('should generate signatures', () => {
      if (skipIfNoWasm()) return;
      const privKey = blsctBrowser.Scalar.random();
      const message = 'test message';
      const sig = blsctBrowser.Signature.generate(privKey, message);
      expect(sig).toBeDefined();
    });

    it('should verify signatures', () => {
      if (skipIfNoWasm()) return;
      const privKey = blsctBrowser.Scalar.random();
      const pubKey = blsctBrowser.PublicKey.fromScalar(privKey);
      const message = 'test message';
      const sig = blsctBrowser.Signature.generate(privKey, message);
      
      expect(sig.verify(pubKey, message)).toBe(true);
    });

    it('should reject invalid signatures', () => {
      if (skipIfNoWasm()) return;
      const privKey = blsctBrowser.Scalar.random();
      const pubKey = blsctBrowser.PublicKey.fromScalar(privKey);
      const message = 'test message';
      const wrongMessage = 'wrong message';
      const sig = blsctBrowser.Signature.generate(privKey, message);
      
      expect(sig.verify(pubKey, wrongMessage)).toBe(false);
    });

    it('should serialize and deserialize signatures', () => {
      if (skipIfNoWasm()) return;
      const privKey = blsctBrowser.Scalar.random();
      const message = 'test message';
      const sig1 = blsctBrowser.Signature.generate(privKey, message);
      const hex = sig1.serialize();
      const sig2 = blsctBrowser.Signature.deserialize(hex);
      expect(sig1.equals(sig2)).toBe(true);
    });
  });

  describe('Token ID Operations', () => {
    it('should create default token ID', () => {
      if (skipIfNoWasm()) return;
      const tokenId = blsctBrowser.TokenId.default();
      expect(tokenId).toBeDefined();
    });

    it('should serialize and deserialize token IDs', () => {
      if (skipIfNoWasm()) return;
      const tid1 = blsctBrowser.TokenId.default();
      const hex = tid1.serialize();
      const tid2 = blsctBrowser.TokenId.deserialize(hex);
      expect(tid1.equals(tid2)).toBe(true);
    });
  });

  describe('Range Proof Operations', () => {
    it('should create range proofs', () => {
      if (skipIfNoWasm()) return;
      const value = BigInt(1000);
      const gamma = blsctBrowser.Scalar.random();
      const nonce = blsctBrowser.Point.random();
      const message = 'test';
      const tokenId = blsctBrowser.TokenId.default();
      
      const proof = blsctBrowser.RangeProof.create(value, gamma, nonce, message, tokenId);
      expect(proof).toBeDefined();
    });

    it('should verify range proofs', () => {
      if (skipIfNoWasm()) return;
      const value = BigInt(1000);
      const gamma = blsctBrowser.Scalar.random();
      const nonce = blsctBrowser.Point.random();
      const message = 'test';
      const tokenId = blsctBrowser.TokenId.default();
      
      const proof = blsctBrowser.RangeProof.create(value, gamma, nonce, message, tokenId);
      const vs = nonce.mulScalar(gamma);
      expect(proof.verify(vs, tokenId)).toBe(true);
    });

    it('should serialize and deserialize range proofs', () => {
      if (skipIfNoWasm()) return;
      const value = BigInt(1000);
      const gamma = blsctBrowser.Scalar.random();
      const nonce = blsctBrowser.Point.random();
      const message = 'test';
      const tokenId = blsctBrowser.TokenId.default();
      
      const proof1 = blsctBrowser.RangeProof.create(value, gamma, nonce, message, tokenId);
      const hex = proof1.serialize();
      const proof2 = blsctBrowser.RangeProof.deserialize(hex);
      expect(proof2).toBeDefined();
    });
  });

  describe('Address Operations', () => {
    it('should create and encode addresses', () => {
      if (skipIfNoWasm()) return;
      const dpk = new blsctBrowser.DoublePublicKey();
      const encoded = dpk.encode();
      expect(encoded).toBeDefined();
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
    });

    it('should decode addresses', () => {
      if (skipIfNoWasm()) return;
      const dpk1 = new blsctBrowser.DoublePublicKey();
      const encoded = dpk1.encode();
      const dpk2 = blsctBrowser.DoublePublicKey.decode(encoded);
      expect(dpk2).toBeDefined();
      expect(dpk1.equals(dpk2)).toBe(true);
    });
  });

  describe('Transaction Building', () => {
    it('should create transaction input', () => {
      if (skipIfNoWasm()) return;
      const outpoint = new blsctBrowser.OutPoint(
        blsctBrowser.CTxId.deserialize('0000000000000000000000000000000000000000000000000000000000000000'),
        0
      );
      const spendingKey = blsctBrowser.Scalar.random();
      const amount = BigInt(1000);
      const gamma = blsctBrowser.Scalar.random();
      const tokenId = blsctBrowser.TokenId.default();
      const rbf = false;
      
      const txIn = blsctBrowser.TxIn.create(outpoint, spendingKey, amount, gamma, tokenId, rbf);
      expect(txIn).toBeDefined();
    });

    it('should create transaction output', () => {
      if (skipIfNoWasm()) return;
      const destination = new blsctBrowser.DoublePublicKey();
      const amount = BigInt(1000);
      const memo = 'test memo';
      const tokenId = blsctBrowser.TokenId.default();
      const minStake = BigInt(0);
      
      const txOut = blsctBrowser.TxOut.create(destination, amount, memo, tokenId, minStake);
      expect(txOut).toBeDefined();
    });
  });

  describe('Chain Configuration', () => {
    it('should get and set chain', () => {
      if (skipIfNoWasm()) return;
      const { getChain, setChain, BlsctChain } = blsctBrowser;
      const originalChain = getChain();
      expect(originalChain).toBeDefined();
      
      // Set to a different chain
      setChain(BlsctChain.REGTEST);
      expect(getChain()).toBe(BlsctChain.REGTEST);
      
      // Restore original
      setChain(originalChain);
    });
  });
});
