import { genCTx } from './ctx'
import { CTxOutBlsctData } from '../ctxOutBlsctData'

const genCTxOutBlsctData = (): CTxOutBlsctData => {
  const ctx = genCTx()
  const txOuts = ctx.getCTxOuts()
  return txOuts[0].blsctData()
}

test('getSpendingKey', () => {
  const x = genCTxOutBlsctData()
  x.getSpendingKey()
})

test('getEphemeralKey', () => {
  const x = genCTxOutBlsctData()
  x.getEphemeralKey()
})

test('getBlindingKey', () => {
  const x = genCTxOutBlsctData()
  x.getBlindingKey()
})

test('getRangeProof', () => {
  const x = genCTxOutBlsctData()
  x.getRangeProof()
})

test('getViewTag', () => {
  const x = genCTxOutBlsctData()
  x.getViewTag()
})

