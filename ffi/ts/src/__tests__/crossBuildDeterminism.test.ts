/**
 * Cross-build deterministic test
 *
 * Exercises every navio-blsct function that navio-sdk depends on,
 * using a fixed seed so outputs are reproducible.  Because this file
 * lives under __tests__/, it runs with BOTH the native (npm test) and
 * WASM (npm run test:browser) backends.  If the outputs diverge, at
 * least one build has a pointer-wrapping or serialization bug.
 *
 * The "expected" hex values below were captured from the native build.
 * If a WASM change makes them differ, the test will fail and force
 * investigation.
 */

import { Scalar } from '../scalar'
import { ChildKey } from '../keys/childKey'
import { PublicKey } from '../keys/publicKey'
import { DoublePublicKey } from '../keys/doublePublicKey'
import { SubAddr } from '../subAddr'
import { SubAddrId } from '../subAddrId'
import { HashId } from '../hashId'
import { ViewTag } from '../viewTag'
import { Point } from '../point'
import { Address, AddressEncoding } from '../address'
import { RangeProof } from '../rangeProof'
import { AmountRecoveryReq } from '../amountRecoveryReq'
import { TokenId } from '../tokenId'

const SEED_VALUE = 12345

describe('Cross-build deterministic derivation', () => {
  let seed: InstanceType<typeof Scalar>
  let childKey: InstanceType<typeof ChildKey>

  beforeAll(() => {
    seed = new Scalar(SEED_VALUE)
    childKey = new ChildKey(seed)
  })

  it('Scalar from number round-trips', () => {
    const s = new Scalar(42)
    expect(s.toBigInt()).toBe(42n)
    const hex = s.serialize()
    const s2 = Scalar.deserialize(hex)
    expect(s2.toBigInt()).toBe(42n)
    expect(s.equals(s2)).toBe(true)
  })

  it('seed value round-trips', () => {
    const hex = seed.serialize()
    expect(hex.length).toBeGreaterThan(0)
    expect(seed.toBigInt()).toBe(BigInt(SEED_VALUE))
    const restored = Scalar.deserialize(hex)
    expect(restored.equals(seed)).toBe(true)
  })

  it('ChildKey derivation is deterministic', () => {
    const ck2 = new ChildKey(new Scalar(SEED_VALUE))
    expect(ck2.serialize()).toBe(childKey.serialize())
  })

  it('key derivation chain is deterministic', () => {
    const txKey = childKey.toTxKey()
    const viewKey = txKey.toViewKey()
    const spendKey = txKey.toSpendingKey()
    const blindingKey = childKey.toBlindingKey()
    const tokenKey = childKey.toTokenKey()

    // All derived keys must serialize to 64-char hex
    for (const k of [txKey, viewKey, spendKey, blindingKey, tokenKey]) {
      expect(k.serialize().length).toBe(64)
    }

    // Second derivation from same seed must match
    const ck2 = new ChildKey(new Scalar(SEED_VALUE))
    expect(ck2.toTxKey().serialize()).toBe(txKey.serialize())
    expect(ck2.toTxKey().toViewKey().serialize()).toBe(viewKey.serialize())
    expect(ck2.toTxKey().toSpendingKey().serialize()).toBe(spendKey.serialize())
    expect(ck2.toBlindingKey().serialize()).toBe(blindingKey.serialize())
    expect(ck2.toTokenKey().serialize()).toBe(tokenKey.serialize())
  })

  it('PublicKey.fromScalar is deterministic', () => {
    const spendKey = childKey.toTxKey().toSpendingKey()
    const pk1 = PublicKey.fromScalar(spendKey)
    const pk2 = PublicKey.fromScalar(spendKey)
    expect(pk1.serialize()).toBe(pk2.serialize())
    expect(pk1.serialize().length).toBe(96)
  })

  it('PublicKey serialize/deserialize round-trips', () => {
    const sk = childKey.toTxKey().toSpendingKey()
    const pk = PublicKey.fromScalar(sk)
    const hex = pk.serialize()
    const pk2 = PublicKey.deserialize(hex)
    expect(pk.equals(pk2)).toBe(true)
  })

  it('SubAddrId.generate is deterministic', () => {
    const id1 = SubAddrId.generate(0, 0)
    const id2 = SubAddrId.generate(0, 0)
    expect(id1.serialize()).toBe(id2.serialize())

    const id3 = SubAddrId.generate(1, 5)
    const id4 = SubAddrId.generate(1, 5)
    expect(id3.serialize()).toBe(id4.serialize())
    expect(id1.serialize()).not.toBe(id3.serialize())
  })

  it('SubAddrId serialize/deserialize round-trips', () => {
    const id = SubAddrId.generate(0, 0)
    const hex = id.serialize()
    const id2 = SubAddrId.deserialize(hex)
    expect(id2.serialize()).toBe(hex)
  })

  it('SubAddr.generate is deterministic', () => {
    const viewKey = childKey.toTxKey().toViewKey()
    const spendPk = PublicKey.fromScalar(childKey.toTxKey().toSpendingKey())
    const subAddrId = SubAddrId.generate(0, 0)

    const sa1 = SubAddr.generate(viewKey, spendPk, subAddrId)
    const sa2 = SubAddr.generate(viewKey, spendPk, subAddrId)
    expect(sa1.serialize()).toBe(sa2.serialize())
    expect(sa1.serialize().length).toBe(192) // 2 × 48-byte G1 points = 192 hex
  })

  it('SubAddr serialize/deserialize round-trips', () => {
    const viewKey = childKey.toTxKey().toViewKey()
    const spendPk = PublicKey.fromScalar(childKey.toTxKey().toSpendingKey())
    const subAddrId = SubAddrId.generate(0, 0)
    const sa = SubAddr.generate(viewKey, spendPk, subAddrId)
    const hex = sa.serialize()
    const sa2 = SubAddr.deserialize(hex)
    expect(sa2.serialize()).toBe(hex)
  })

  it('SubAddr.fromDoublePublicKey round-trips', () => {
    const viewKey = childKey.toTxKey().toViewKey()
    const spendPk = PublicKey.fromScalar(childKey.toTxKey().toSpendingKey())
    const subAddrId = SubAddrId.generate(0, 0)
    const sa = SubAddr.generate(viewKey, spendPk, subAddrId)

    const dpk = DoublePublicKey.deserialize(sa.serialize())
    const saFromDpk = SubAddr.fromDoublePublicKey(dpk)
    expect(saFromDpk.serialize()).toBe(sa.serialize())
  })

  it('DoublePublicKey.fromKeysAcctAddr is deterministic', () => {
    const viewKey = childKey.toTxKey().toViewKey()
    const spendPk = PublicKey.fromScalar(childKey.toTxKey().toSpendingKey())

    const dpk1 = DoublePublicKey.fromKeysAcctAddr(viewKey, spendPk, 0, 0)
    const dpk2 = DoublePublicKey.fromKeysAcctAddr(viewKey, spendPk, 0, 0)
    expect(dpk1.serialize()).toBe(dpk2.serialize())
    expect(dpk1.serialize().length).toBe(192)
  })

  it('DoublePublicKey serialize/deserialize round-trips', () => {
    const viewKey = childKey.toTxKey().toViewKey()
    const spendPk = PublicKey.fromScalar(childKey.toTxKey().toSpendingKey())
    const dpk = DoublePublicKey.fromKeysAcctAddr(viewKey, spendPk, 0, 0)
    const hex = dpk.serialize()
    const dpk2 = DoublePublicKey.deserialize(hex)
    expect(dpk2.serialize()).toBe(hex)
  })

  it('Address encode/decode round-trips', () => {
    const viewKey = childKey.toTxKey().toViewKey()
    const spendPk = PublicKey.fromScalar(childKey.toTxKey().toSpendingKey())
    const dpk = DoublePublicKey.fromKeysAcctAddr(viewKey, spendPk, 0, 0)

    const addr = Address.encode(dpk, AddressEncoding.Bech32M)
    expect(addr.length).toBeGreaterThan(0)

    const decoded = Address.decode(addr)
    expect(decoded.serialize()).toBe(dpk.serialize())
  })

  it('Address is deterministic for same keys', () => {
    const viewKey = childKey.toTxKey().toViewKey()
    const spendPk = PublicKey.fromScalar(childKey.toTxKey().toSpendingKey())

    const dpk1 = DoublePublicKey.fromKeysAcctAddr(viewKey, spendPk, 0, 0)
    const dpk2 = DoublePublicKey.fromKeysAcctAddr(viewKey, spendPk, 0, 0)

    const addr1 = Address.encode(dpk1, AddressEncoding.Bech32M)
    const addr2 = Address.encode(dpk2, AddressEncoding.Bech32M)
    expect(addr1).toBe(addr2)
  })

  it('ViewTag is deterministic', () => {
    const viewKey = childKey.toTxKey().toViewKey()
    const blindPk = PublicKey.fromScalar(childKey.toBlindingKey())

    const vt1 = new ViewTag(blindPk, viewKey)
    const vt2 = new ViewTag(blindPk, viewKey)
    expect(vt1.value).toBe(vt2.value)
    expect(typeof vt1.value).toBe('number')
  })

  it('HashId.generate is deterministic', () => {
    const viewKey = childKey.toTxKey().toViewKey()
    const blindPk = PublicKey.fromScalar(childKey.toBlindingKey())
    const spendPk = PublicKey.fromScalar(childKey.toTxKey().toSpendingKey())

    const h1 = HashId.generate(blindPk, spendPk, viewKey)
    const h2 = HashId.generate(blindPk, spendPk, viewKey)
    expect(h1.serialize()).toBe(h2.serialize())
    expect(h1.serialize().length).toBe(40) // 20 bytes = 40 hex
  })

  it('HashId serialize/deserialize round-trips', () => {
    const viewKey = childKey.toTxKey().toViewKey()
    const blindPk = PublicKey.fromScalar(childKey.toBlindingKey())
    const spendPk = PublicKey.fromScalar(childKey.toTxKey().toSpendingKey())

    const h = HashId.generate(blindPk, spendPk, viewKey)
    const hex = h.serialize()
    const h2 = HashId.deserialize(hex)
    expect(h2.serialize()).toBe(hex)
  })

  it('PublicKey.generateNonce is deterministic', () => {
    const viewKey = childKey.toTxKey().toViewKey()
    const blindPk = PublicKey.fromScalar(childKey.toBlindingKey())

    const n1 = blindPk.generateNonce(viewKey)
    const n2 = blindPk.generateNonce(viewKey)
    expect(n1.serialize()).toBe(n2.serialize())
    expect(n1.serialize().length).toBe(96) // G1 point
  })

  it('Point.fromScalar is deterministic', () => {
    const sk = childKey.toTxKey().toSpendingKey()
    const p1 = Point.fromScalar(sk)
    const p2 = Point.fromScalar(sk)
    expect(p1.equals(p2)).toBe(true)
    expect(p1.serialize()).toBe(p2.serialize())
  })

  it('TokenId.default is deterministic', () => {
    const t1 = TokenId.default()
    const t2 = TokenId.default()
    expect(t1.serialize()).toBe(t2.serialize())
    expect(t1.equals(t2)).toBe(true)
  })

  it('TokenId serialize/deserialize round-trips', () => {
    const t = TokenId.default()
    const hex = t.serialize()
    const t2 = TokenId.deserialize(hex)
    expect(t2.serialize()).toBe(hex)
    expect(t.equals(t2)).toBe(true)
  })

  it('RangeProof generate + verify + recover', () => {
    const amounts = [5000]
    const nonce = Point.fromScalar(childKey.toTxKey().toViewKey())
    const msg = 'test'
    const tokenId = TokenId.default()

    const proof = RangeProof.generate(amounts, nonce, msg, tokenId)
    expect(proof).toBeDefined()
    expect(proof.serialize().length).toBeGreaterThan(0)

    expect(RangeProof.verifyProofs([proof])).toBe(true)

    const req = new AmountRecoveryReq(proof, nonce, tokenId)
    const results = RangeProof.recoverAmounts([req])
    expect(results.length).toBe(1)
    expect(results[0].isSucc).toBe(true)
    expect(results[0].amount).toBe(5000n)
  })

  it('RangeProof field accessors return valid objects', () => {
    const nonce = Point.fromScalar(childKey.toTxKey().toViewKey())
    const proof = RangeProof.generate([100], nonce, '', TokenId.default())

    // Points serialize to 96 hex chars (48 bytes)
    expect(proof.get_A().serialize().length).toBe(96)
    expect(proof.get_A_wip().serialize().length).toBe(96)
    expect(proof.get_B().serialize().length).toBe(96)
    // Scalars may omit leading zeros, so check reasonable range
    for (const s of [proof.get_r_prime(), proof.get_s_prime(),
                     proof.get_delta_prime(), proof.get_alpha_hat(),
                     proof.get_tau_x()]) {
      const len = s.serialize().length
      expect(len).toBeGreaterThan(0)
      expect(len).toBeLessThanOrEqual(64)
    }
  })

  it('derived values match golden reference', () => {
    const txKey = childKey.toTxKey()
    const viewKey = txKey.toViewKey()
    const spendKey = txKey.toSpendingKey()
    const spendPk = PublicKey.fromScalar(spendKey)
    const dpk = DoublePublicKey.fromKeysAcctAddr(viewKey, spendPk, 0, 0)
    const blindPk = PublicKey.fromScalar(childKey.toBlindingKey())
    const vt = new ViewTag(blindPk, viewKey)
    const hi = HashId.generate(blindPk, spendPk, viewKey)

    expect(txKey.serialize()).toBe('40bfc8642c6b2d6a486bce01020d40f820f1b6d6ec754c442d3cc88cf0ba4d77')
    expect(viewKey.serialize()).toBe('56a81847101d56c621fd9ee7aba124a73b29c7c22543beec406c4464611d4031')
    expect(spendKey.serialize()).toBe('65d2466b27fad55e7794391f136fa35ec82407f1ddb61b34f43ef35945b91fb3')
    expect(spendPk.serialize()).toBe('85799b2f7251f894167865f175e20cb8c2feb227e5077ce11c852175057d93dab33709d432539c837fb2f2be6866ed39')
    expect(dpk.serialize()).toBe('84b249cbffbefcf62fbda1972144751560e963d76da96dd144c901f4cdb1f834d319fd05e4c3a701cc6fa2ac896a1ff1823638e3d085518c6265ae2f208dbd854287479a16643fca6f24597347dc14c259142e62785ae49a66fc494b06c93fdf')
    expect(vt.value).toBe(11533)
    expect(hi.serialize()).toBe('1a2fc8181f858ee9885a4006c230b2c683f8948e')
  })

  it('full wallet derivation chain matches across runs', () => {
    const seed2 = new Scalar(SEED_VALUE)
    const ck = new ChildKey(seed2)
    const txKey = ck.toTxKey()
    const viewKey = txKey.toViewKey()
    const spendKey = txKey.toSpendingKey()
    const spendPk = PublicKey.fromScalar(spendKey)

    const subAddrId = SubAddrId.generate(0, 0)
    const subAddr = SubAddr.generate(viewKey, spendPk, subAddrId)
    const dpk = DoublePublicKey.fromKeysAcctAddr(viewKey, spendPk, 0, 0)
    const addr = Address.encode(dpk, AddressEncoding.Bech32M)

    // Run the same derivation again
    const seed3 = new Scalar(SEED_VALUE)
    const ck3 = new ChildKey(seed3)
    const txKey3 = ck3.toTxKey()
    const viewKey3 = txKey3.toViewKey()
    const spendKey3 = txKey3.toSpendingKey()
    const spendPk3 = PublicKey.fromScalar(spendKey3)

    const subAddrId3 = SubAddrId.generate(0, 0)
    const subAddr3 = SubAddr.generate(viewKey3, spendPk3, subAddrId3)
    const dpk3 = DoublePublicKey.fromKeysAcctAddr(viewKey3, spendPk3, 0, 0)
    const addr3 = Address.encode(dpk3, AddressEncoding.Bech32M)

    expect(viewKey3.serialize()).toBe(viewKey.serialize())
    expect(spendKey3.serialize()).toBe(spendKey.serialize())
    expect(spendPk3.serialize()).toBe(spendPk.serialize())
    expect(subAddr3.serialize()).toBe(subAddr.serialize())
    expect(dpk3.serialize()).toBe(dpk.serialize())
    expect(addr3).toBe(addr)
  })
})
