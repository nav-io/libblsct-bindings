import { AmountRecoveryReq } from '../amountRecoveryReq'
import { genCTx } from './util'
import { Point } from '../point'
import { PublicKey } from '../keys/publicKey'
import { Scalar } from '../scalar'
import { TokenId } from '../tokenId'
import { RangeProof } from '../rangeProof'

const genRangeProof = (): RangeProof => {
  const amounts = [123]
  const nonce = Point.random()
  const msg = 'navio'
  const tokenId = TokenId.default()

  return RangeProof.generate(
    amounts,
    nonce,
    msg,
    tokenId,
  )
}

test('generate', () => {
  genRangeProof()
})

test('verifyProofs', () => {
  const rp = genRangeProof()
  const res = RangeProof.verifyProofs([rp])
  expect(res).toBe(true)
})

test('get_A', () => {
  const rp = genRangeProof()
  rp.get_A()
})

test('get_A_wip', () => {
  const rp = genRangeProof()
  rp.get_A_wip()
})

test('get_B', () => {
  const rp = genRangeProof()
  rp.get_B()
})

test('get_r_prime', () => {
  const rp = genRangeProof()
  rp.get_r_prime()
})

test('get_s_prime', () => {
  const rp = genRangeProof()
  rp.get_s_prime()
})

test('get_delta_prime', () => {
  const rp = genRangeProof()
  rp.get_delta_prime()
})

test('get_alpha_hat', () => {
  const rp = genRangeProof()
  rp.get_alpha_hat()
})

test('get_tau_x', () => {
  const rp = genRangeProof()
  rp.get_tau_x()
})

test('serialize and deserialize', () => {
  const a = genRangeProof()
  const a_hex = a.serialize()
  const b = RangeProof.deserialize(a_hex)
  const b_hex = b.serialize()

  expect(a_hex).toBe(b_hex)
})

test('amount recovery', () => {
  const pkViewKey = PublicKey.random()
  const blindingKey = Scalar.random()
  const nonce = pkViewKey.getPoint().scalarMultiply(blindingKey)  

  const ctx = genCTx(
    123,
    pkViewKey,
    blindingKey,
    'space_x',
  )

  const ctxOuts = ctx.getCTxOuts()
  const rp = ctxOuts.at(0).getRangeProof()
  const req = new AmountRecoveryReq(rp, nonce)
  const amounts = RangeProof.recoverAmounts([req])

  expect(amounts.length).toBe(1)
  expect(amounts[0].isSucc).toBe(true)
  expect(amounts[0].amount).toBe(123)
  expect(amounts[0].msg).toBe('space_x')
})
