import {
  CTX_ID_SIZE,
} from '../blsct'

import { CTx } from '../ctx'
import { CTxId } from '../ctxId'
import { OutPoint } from '../outPoint'
import { SpendingKey } from '../keys/childKeyDesc/txKeyDesc/spendingKey'
import { SubAddr } from '../subAddr'
import { TxIn } from '../txIn'
import { TxOut } from '../txOut'
import { TokenId } from '../tokenId'
import { DoublePublicKey } from '../keys/doublePublicKey'

import * as crypto from 'crypto'

export const genCTx = (): CTx => {
  const numTxIn = 1
  const numTxOut = 1
  const defaultFee = 200000
  const fee = (numTxIn + numTxOut) * defaultFee
  const outAmount = 10000
  const inAmount = fee + outAmount

  const ctxIdHex = crypto.randomBytes(CTX_ID_SIZE).toString('hex')
  const ctxId = CTxId.deserialize(ctxIdHex)

  const outIndex = 0
  const outPoint = OutPoint.generate(ctxId, outIndex)
  const gamma = 100
  const spendingKey = new SpendingKey()
  const tokenId = TokenId.default()
  const txIn = TxIn.generate(
    inAmount,
    gamma,
    spendingKey,
    tokenId,
    outPoint,
  )
  const subAddr = SubAddr.fromDoublePublicKey(new DoublePublicKey())
  const txOut = TxOut.generate(
    subAddr,
    outAmount,
    'navio',
  )
  return CTx.generate([txIn], [txOut])
}

test('generate', () => {
  genCTx()
})

test('getCtxId', () => {
  const x = genCTx()
  x.getCTxId()
})

test('getCtxIns', () => {
  const x = genCTx()
  x.getCTxIns()
})

test('getCtxOuts', () => {
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

