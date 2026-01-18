import { genCTx } from './util'
import { CTx } from '../ctx'

test('generate', () => {
  genCTx()
})

test('getCTxId', () => {
  const x = genCTx()
  x.getCTxId()
})

test('getCTxIns', () => {
  const x = genCTx()
  x.getCTxIns()
})

test('getCTxOuts', () => {
  const x = genCTx()
  x.getCTxOuts()
})

test('serialize and deserialize', () => {
  const a = genCTx()
  const a_hex = a.serialize()
  const b = CTx.deserialize(a_hex)
  const b_hex = b.serialize()

  expect(a_hex).toBe(b_hex)
})

