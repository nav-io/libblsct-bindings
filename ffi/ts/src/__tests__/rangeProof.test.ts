import { AmountRecoveryReq } from '../amountRecoveryReq'
import { Point } from '../point'
import { TokenId } from '../tokenId'
import { RangeProof } from '../rangeProof'

// Detect if running in WASM mode (browser tests)
// The __BLSCT_WASM_MODE__ flag is set by setup.browser.ts
declare global {
  // eslint-disable-next-line no-var
  var __BLSCT_WASM_MODE__: boolean | undefined;
}
const isWasmMode = globalThis.__BLSCT_WASM_MODE__ === true;

// Skip tests that have known issues in WASM mode
// TODO: Enable these tests when WASM is built with pthread support
const testOrSkipInWasm = isWasmMode ? test.skip : test;

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
  const amount = 123
  const msg = 'space_x'
  const nonce = Point.base()
  const tokenId = TokenId.default()
  const rp = RangeProof.generate([amount], nonce, msg, tokenId)
  const req = new AmountRecoveryReq(rp, nonce, tokenId)
  const amounts = RangeProof.recoverAmounts([req])

  expect(amounts.length).toBe(1)
  expect(amounts[0].isSucc).toBe(true)
  expect(amounts[0].amount).toBe(123n)
  expect(amounts[0].msg).toBe('space_x')
})
