import { genCTx } from './ctx'
import { CTxOut } from '../ctxOut'

const genCTxOut = (): CTxOut => {
  const ctx = genCTx()
  const txOuts = ctx.getCTxOuts()
  return txOuts[0]
}

test('getValue', () => {
  const x = genCTxOut()
  x.getValue()
})

test('getScriptPubKey', () => {
  const x = genCTxOut()
  x.getScriptPubKey()
})

test('getTokenId', () => {
  const x = genCTxOut()
  x.getTokenId()
})

test('getVectorPredicate', () => {
  const x = genCTxOut()
  x.getVectorPredicate()
})

test('blsctData', () => {
  const x = genCTxOut()
  expect(x.blsctData() !== undefined).toBe(true)
})

test('serialize and deserialize', () => {
  const a = genCTxOut()
  const a_hex = a.serialize()
  const b = CTxOut.deserialize(a_hex)
  const b_hex = b.serialize()

  expect(a_hex).toBe(b_hex)
})

