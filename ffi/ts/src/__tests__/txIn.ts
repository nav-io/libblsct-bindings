import {
  CTX_ID_SIZE,
} from '../blsct'

import * as crypto from 'crypto'
import { TxIn } from '../txIn'
import { SpendingKey } from '../keys/childKeyDesc/txKeyDesc/spendingKey'
import { TokenId } from '../tokenId'
import { OutPoint } from '../outPoint'
import { CTxId } from '../ctxId'

const genTxIn = (): TxIn => {
  const spendingKey = SpendingKey.random()
  const tokenId = TokenId.default()
  const ctxIdHex = crypto.randomBytes(CTX_ID_SIZE).toString('hex')
  const ctxId = CTxId.deserialize(ctxIdHex)
  const outPoint = OutPoint.generate(ctxId, 1)

  return TxIn.generate(
    123,
    456,
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
  x.getIsStakedCommitment()
})

test('getIsRbf', () => {
  const x = genTxIn()
  x.getIsRbf()
})

test('serialize and deserialize', () => {
  const a = genTxIn()
  const a_hex = a.serialize()
  const b = TxIn.deserialize(a_hex)
  const b_hex = b.serialize()

  expect(a_hex).toBe(b_hex)
})

