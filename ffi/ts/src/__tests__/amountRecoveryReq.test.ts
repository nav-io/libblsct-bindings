import { AmountRecoveryReq } from '../amountRecoveryReq'
import { Point } from '../point'
import { RangeProof } from '../rangeProof'
import { TokenId } from '../tokenId'

const genAmountRecoveryReq = (): AmountRecoveryReq => {
  const amount = 456
  const nonce = Point.random()
  const msg = 'navio'
  const tokenId = TokenId.default()
  const rp = RangeProof.generate([amount], nonce, msg, tokenId)
  return new AmountRecoveryReq(rp, nonce, tokenId)
}

test('constructor with default tokenId', () => {
  const nonce = Point.random()
  const rp = RangeProof.generate([123], nonce, 'test', TokenId.default())
  const req = new AmountRecoveryReq(rp, nonce)

  expect(req.rangeProof).toBe(rp)
  expect(req.nonce).toBe(nonce)
  expect(req.tokenId).toBeInstanceOf(TokenId)
})

test('constructor with explicit tokenId', () => {
  const nonce = Point.random()
  const tokenId = TokenId.default()
  const rp = RangeProof.generate([123], nonce, 'test', tokenId)
  const req = new AmountRecoveryReq(rp, nonce, tokenId)

  expect(req.rangeProof).toBe(rp)
  expect(req.nonce).toBe(nonce)
  expect(req.tokenId).toBe(tokenId)
})

test('toString', () => {
  const req = genAmountRecoveryReq()
  const str = req.toString()

  expect(str).toContain('AmountRecoveryReq')
})

test('serialize', () => {
  const req = genAmountRecoveryReq()
  const hex = req.serialize()

  expect(typeof hex).toBe('string')
  expect(hex.length).toBeGreaterThan(0)
  expect(hex).toMatch(/^[0-9a-f]+$/i)
})

test('serialize and deserialize', () => {
  const a = genAmountRecoveryReq()
  const a_hex = a.serialize()
  const b = AmountRecoveryReq.deserialize(a_hex)
  const b_hex = b.serialize()

  expect(a_hex).toBe(b_hex)
})

test('deserialize with odd-length hex', () => {
  const req = genAmountRecoveryReq()
  const hex = req.serialize()
  // Remove first character to make it odd-length
  const oddHex = hex.slice(1)

  const deserialized = AmountRecoveryReq.deserialize(oddHex)
  expect(deserialized).toBeInstanceOf(AmountRecoveryReq)
})

test('integration with RangeProof.recoverAmounts', () => {
  const amount = 789
  const msg = 'integration_test'
  const nonce = Point.base()
  const tokenId = TokenId.default()
  const rp = RangeProof.generate([amount], nonce, msg, tokenId)
  const req = new AmountRecoveryReq(rp, nonce, tokenId)

  const results = RangeProof.recoverAmounts([req])

  expect(results.length).toBe(1)
  expect(results[0].isSucc).toBe(true)
  expect(results[0].amount).toBe(BigInt(amount))
  expect(results[0].msg).toBe(msg)
})
