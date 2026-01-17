/**
 * Basic browser/WASM tests
 * 
 * These tests verify that the WASM module can be loaded and basic
 * operations work in a browser-like environment.
 */

// Note: These tests require the WASM module to be built first
// Run: npm run build:wasm && npm run build:browser

describe('Browser WASM Module', () => {
  // Skip tests if WASM is not available
  const wasmAvailable = process.env.SKIP_WASM_TESTS !== '1';

  beforeAll(async () => {
    if (!wasmAvailable) {
      console.log('WASM tests skipped (SKIP_WASM_TESTS=1)');
      return;
    }
    
    // Dynamic import to avoid errors when WASM is not built
    try {
      const { loadBlsctModule } = await import('../bindings/wasm/index.js');
      await loadBlsctModule();
    } catch (err) {
      console.warn('WASM module not available:', err);
    }
  });

  describe('Module Loading', () => {
    it('should load WASM module', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { isModuleLoaded } = await import('../bindings/wasm/index.js');
      expect(isModuleLoaded()).toBe(true);
    });

    it('should get WASM module instance', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { getBlsctModule } = await import('../bindings/wasm/index.js');
      const module = getBlsctModule();
      expect(module).toBeDefined();
      expect(typeof module._malloc).toBe('function');
      expect(typeof module._free).toBe('function');
    });
  });

  describe('Scalar Operations', () => {
    it('should create random scalars', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { Scalar } = await import('../index.browser.js');
      const s1 = Scalar.random();
      const s2 = Scalar.random();
      expect(s1).toBeDefined();
      expect(s2).toBeDefined();
      expect(s1.equals(s2)).toBe(false);
    });

    it('should create scalar from number', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { Scalar } = await import('../index.browser.js');
      const s = new Scalar(12345);
      expect(s.toNumber()).toBe(12345);
    });

    it('should serialize and deserialize scalars', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { Scalar } = await import('../index.browser.js');
      const s1 = Scalar.random();
      const hex = s1.serialize();
      const s2 = Scalar.deserialize(hex);
      expect(s1.equals(s2)).toBe(true);
    });

    it('should compare scalars correctly', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { Scalar } = await import('../index.browser.js');
      const s1 = new Scalar(100);
      const s2 = new Scalar(200);
      expect(s1.equals(s1)).toBe(true);
      expect(s1.equals(s2)).toBe(false);
    });
  });

  describe('Point Operations', () => {
    it('should create random points', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { Point } = await import('../index.browser.js');
      const p1 = Point.random();
      const p2 = Point.random();
      expect(p1).toBeDefined();
      expect(p2).toBeDefined();
      expect(p1.equals(p2)).toBe(false);
    });

    it('should get base point', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { Point } = await import('../index.browser.js');
      const base = Point.base();
      expect(base).toBeDefined();
      expect(base.isValid()).toBe(true);
    });

    it('should create point from scalar', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { Point } = await import('../index.browser.js');
      const { Scalar } = await import('../index.browser.js');
      const s = new Scalar(5);
      const p = Point.fromScalar(s);
      expect(p).toBeDefined();
      expect(p.isValid()).toBe(true);
    });

    it('should serialize and deserialize points', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { Point } = await import('../index.browser.js');
      const p1 = Point.random();
      const hex = p1.serialize();
      const p2 = Point.deserialize(hex);
      expect(p1.equals(p2)).toBe(true);
    });

    it('should validate points', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { Point } = await import('../index.browser.js');
      const p = Point.random();
      expect(p.isValid()).toBe(true);
    });
  });

  describe('Public Key Operations', () => {
    it('should create random public keys', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { PublicKey } = await import('../index.browser.js');
      const pk1 = PublicKey.random();
      const pk2 = PublicKey.random();
      expect(pk1).toBeDefined();
      expect(pk2).toBeDefined();
      expect(pk1.equals(pk2)).toBe(false);
    });

    it('should create public key from point', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { Point } = await import('../index.browser.js');
      const { PublicKey } = await import('../index.browser.js');
      const p = Point.random();
      const pk = PublicKey.fromPoint(p);
      expect(pk.getPoint().equals(p)).toBe(true);
    });

    it('should create public key from scalar', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { Scalar } = await import('../index.browser.js');
      const { PublicKey } = await import('../index.browser.js');
      const s = new Scalar(1);
      const pk = PublicKey.fromScalar(s);
      expect(pk).toBeDefined();
    });

    it('should serialize and deserialize public keys', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { PublicKey } = await import('../index.browser.js');
      const pk1 = PublicKey.random();
      const hex = pk1.serialize();
      const pk2 = PublicKey.deserialize(hex);
      expect(pk1.equals(pk2)).toBe(true);
    });
  });

  describe('Signature Operations', () => {
    it('should generate and verify signatures', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { Scalar } = await import('../index.browser.js');
      const { PublicKey } = await import('../index.browser.js');
      const { Signature } = await import('../index.browser.js');
      
      const msg = 'navio';
      const privKey = Scalar.random();
      const pubKey = PublicKey.fromScalar(privKey);
      const sig = Signature.generate(privKey, msg);
      
      expect(sig).toBeDefined();
      expect(sig.verify(pubKey, msg)).toBe(true);
    });

    it('should fail verification with wrong public key', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { Scalar } = await import('../index.browser.js');
      const { PublicKey } = await import('../index.browser.js');
      const { Signature } = await import('../index.browser.js');
      
      const msg = 'navio';
      const privKey = Scalar.random();
      const wrongPubKey = PublicKey.random();
      const sig = Signature.generate(privKey, msg);
      
      expect(sig.verify(wrongPubKey, msg)).toBe(false);
    });

    it('should serialize and deserialize signatures', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { Scalar } = await import('../index.browser.js');
      const { Signature } = await import('../index.browser.js');
      
      const msg = 'navio';
      const privKey = Scalar.random();
      const sig1 = Signature.generate(privKey, msg);
      const hex = sig1.serialize();
      const sig2 = Signature.deserialize(hex);
      
      expect(hex).toBe(sig2.serialize());
    });
  });

  describe('Token ID Operations', () => {
    it('should create default token ID', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { TokenId } = await import('../index.browser.js');
      const tokenId = TokenId.default();
      expect(tokenId).toBeDefined();
    });

    it('should create token ID from token value', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { TokenId } = await import('../index.browser.js');
      const token = 12345;
      const tokenId = TokenId.fromToken(token);
      expect(tokenId.getToken()).toBe(token);
      expect(tokenId.getSubid()).toBe(0);
    });

    it('should create token ID with token and subid', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { TokenId } = await import('../index.browser.js');
      const token = 12345;
      const subid = 67890;
      const tokenId = TokenId.fromTokenAndSubid(token, subid);
      expect(tokenId.getToken()).toBe(token);
      expect(tokenId.getSubid()).toBe(subid);
    });

    it('should serialize and deserialize token IDs', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { TokenId } = await import('../index.browser.js');
      const tokenId1 = TokenId.fromToken(12345);
      const hex = tokenId1.serialize();
      const tokenId2 = TokenId.deserialize(hex);
      expect(tokenId1.getToken()).toBe(tokenId2.getToken());
      expect(tokenId1.getSubid()).toBe(tokenId2.getSubid());
    });
  });

  describe('Range Proof Operations', () => {
    it('should generate range proof', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { Point } = await import('../index.browser.js');
      const { TokenId } = await import('../index.browser.js');
      const { RangeProof } = await import('../index.browser.js');
      
      const amounts = [123];
      const nonce = Point.random();
      const msg = 'navio';
      const tokenId = TokenId.default();
      
      const rp = RangeProof.generate(amounts, nonce, msg, tokenId);
      expect(rp).toBeDefined();
    });

    it('should verify range proofs', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { Point } = await import('../index.browser.js');
      const { TokenId } = await import('../index.browser.js');
      const { RangeProof } = await import('../index.browser.js');
      
      const amounts = [123];
      const nonce = Point.random();
      const msg = 'navio';
      const tokenId = TokenId.default();
      
      const rp = RangeProof.generate(amounts, nonce, msg, tokenId);
      const res = RangeProof.verifyProofs([rp]);
      expect(res).toBe(true);
    });

    it('should serialize and deserialize range proofs', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { Point } = await import('../index.browser.js');
      const { TokenId } = await import('../index.browser.js');
      const { RangeProof } = await import('../index.browser.js');
      
      const amounts = [123];
      const nonce = Point.random();
      const msg = 'navio';
      const tokenId = TokenId.default();
      
      const rp1 = RangeProof.generate(amounts, nonce, msg, tokenId);
      const hex = rp1.serialize();
      const rp2 = RangeProof.deserialize(hex);
      expect(hex).toBe(rp2.serialize());
    });
  });

  describe('Address Operations', () => {
    it('should create and encode addresses', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { DoublePublicKey } = await import('../index.browser.js');
      const { Address } = await import('../index.browser.js');
      const { Bech32 } = await import('../blsct.browser.js');
      
      const dpk = new DoublePublicKey();
      const addr = Address.encode(dpk, Bech32);
      expect(addr).toBeDefined();
      expect(typeof addr.toString()).toBe('string');
    });

    it('should decode addresses', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { DoublePublicKey } = await import('../index.browser.js');
      const { Address } = await import('../index.browser.js');
      const { Bech32 } = await import('../blsct.browser.js');
      
      const dpk1 = new DoublePublicKey();
      const addr = Address.encode(dpk1, Bech32);
      const dpk2 = Address.decode(addr.toString());
      expect(dpk2).toBeDefined();
    });
  });

  describe('Transaction Building', () => {
    it('should create transaction input', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { TxIn } = await import('../index.browser.js');
      const { Scalar } = await import('../index.browser.js');
      const { TokenId } = await import('../index.browser.js');
      const { OutPoint } = await import('../index.browser.js');
      const { CTxId } = await import('../index.browser.js');
      
      // Create a random CTxId using crypto if available
      let ctxIdHex;
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        const bytes = new Uint8Array(32);
        crypto.getRandomValues(bytes);
        ctxIdHex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
      } else {
        // Fallback for environments without crypto
        ctxIdHex = '0'.repeat(64);
      }
      
      const ctxId = CTxId.deserialize(ctxIdHex);
      const outPoint = OutPoint.generate(ctxId, 0);
      const spendingKey = Scalar.random();
      const tokenId = TokenId.default();
      
      const txIn = TxIn.generate(1000, 100, spendingKey, tokenId, outPoint);
      expect(txIn).toBeDefined();
      expect(txIn.getAmount()).toBe(1000);
      expect(txIn.getGamma()).toBe(100);
    });

    it('should create transaction output', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { TxOut } = await import('../index.browser.js');
      const { SubAddr } = await import('../index.browser.js');
      const { DoublePublicKey } = await import('../index.browser.js');
      
      const subAddr = SubAddr.fromDoublePublicKey(new DoublePublicKey());
      const txOut = TxOut.generate(subAddr, 1000, 'navio');
      expect(txOut).toBeDefined();
      expect(txOut.getAmount()).toBe(1000);
      expect(txOut.getMemo()).toBe('navio');
    });
  });

  describe('Chain Configuration', () => {
    it('should get and set chain', async () => {
      if (!wasmAvailable) {
        return;
      }
      const { getChain, setChain, BlsctChain } = await import('../blsct.browser.js');
      
      const originalChain = getChain();
      expect([BlsctChain.Mainnet, BlsctChain.Testnet, BlsctChain.Signet, BlsctChain.Regtest])
        .toContain(originalChain);
      
      setChain(BlsctChain.Testnet);
      expect(getChain()).toBe(BlsctChain.Testnet);
      
      // Restore original chain
      setChain(originalChain);
    });
  });
});

