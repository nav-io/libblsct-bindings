import {
  TxOutputType,
} from '../blsct'

import { PublicKey } from '../keys/publicKey'
import { SubAddr } from '../subAddr'
import { SubAddrId } from '../subAddrId'
import { TokenId } from '../tokenId'
import { TxOut } from '../txOut'
import { Scalar } from '../scalar'

const genTxOut = (): TxOut => {
  const vk = Scalar.random()
  const spendingPk = PublicKey.random()
  const subAddrId = SubAddrId.generate(1, 2)
  const subAddr = SubAddr.generate(vk, spendingPk, subAddrId)
  const tokenId = TokenId.default()
  const outputType = TxOutputType.Normal

  return TxOut.generate(
    subAddr,
    12345,
    'navio',
    tokenId,
    outputType,
    0,
  )
}

test('generate', () => {
  genTxOut()
})

test('getDestination', () => {
  const x = genTxOut()
  x.getDestination()
})

test('getAmount', () => {
  const x = genTxOut()
  x.getAmount()
})

test('getMemo', () => {
  const x = genTxOut()
  x.getMemo()
})

test('getTokenId', () => {
  const x = genTxOut()
  x.getTokenId()
})

test('getOutputType', () => {
  const x = genTxOut()
  x.getOutputType()
})

test('getMinStake', () => {
  const x = genTxOut()
  x.getMinStake()
})

test('serialize and deserialize', () => {
  const a = genTxOut()

  const a_hex = a.serialize()
  const b = TxOut.deserialize(a_hex)
  const b_hex = b.serialize()

  expect(a_hex).toBe(b_hex)
})

