import {
  CTX_ID_SIZE,
} from '../blsct'

import { randomHex } from './util'
import { CTxId } from '../ctxId'
import { OutPoint } from '../outPoint'
import { Scalar } from '../scalar'
import { TokenId } from '../tokenId'
import { TxIn } from '../txIn'

const genTxIn = (): TxIn => {
  const spendingKey = Scalar.random()
  const tokenId = TokenId.default()
  const ctxIdHex = randomHex(CTX_ID_SIZE)
  const ctxId = CTxId.deserialize(ctxIdHex)
  const outPoint = OutPoint.generate(ctxId)

  return TxIn.generate(
    123,
    new Scalar(456),
    spendingKey,
    tokenId,
    outPoint,
    false,
    false,
  )
}

test('generate', () => {
  genTxIn()
})

test('getAmount', () => {
  const x = genTxIn()
  x.getAmount()
})

test('getGamma', () => {
  const x = genTxIn()
  x.getGamma()
})

test('getSpendingKey', () => {
  const x = genTxIn()
  x.getSpendingKey()
})

test('getTokenId', () => {
  const x = genTxIn()
  x.getTokenId()
})

test('getOutPoint', () => {
  const x = genTxIn()
  x.getOutPoint()
})

test('getIsStakedCommitment', () => {
  const x = genTxIn()
  x.getStakedCommitment()
})

test('getIsRbf', () => {
  const x = genTxIn()
  x.getRbf()
})

test('serialize and deserialize', () => {
  const a = genTxIn()
  const a_hex = a.serialize()
  const b = TxIn.deserialize(a_hex)
  const b_hex = b.serialize()

  expect(a_hex).toBe(b_hex)
})

