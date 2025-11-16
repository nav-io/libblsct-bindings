import { genCTx } from './ctx'
import { CTxOut } from '../ctxOut'

const genCTxOut = (): CTxOut => {
  const ctx = genCTx()
  const txOuts = ctx.getCTxOuts()
  return txOuts.at(0)
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

test('getSpendingKey', () => {
  const x = genCTxOut()
  x.getSpendingKey()
})

test('getEphemeralKey', () => {
  const x = genCTxOut()
  x.getEphemeralKey()
})

test('getBlindingKey', () => {
  const x = genCTxOut()
  x.getBlindingKey()
})

test('getRangeProof', () => {
  const x = genCTxOut()
  x.getRangeProof()
})

test('getViewTag', () => {
  const x = genCTxOut()
  x.getViewTag()
})

