import { CTx } from '../ctx'
import { CTxId } from '../ctxId'
import { DoublePublicKey } from '../keys/doublePublicKey' 
import { OutPoint } from '../outPoint'
import { PublicKey } from '../keys/publicKey'
import { Scalar } from '../scalar'
import { SubAddr } from '../subAddr'
import { TokenId } from '../tokenId'
import { TxIn } from '../txIn'
import { TxOut } from '../txOut'
import * as crypto from 'crypto'
import {
  CTX_ID_SIZE,
  TxOutputType,
} from '../blsct'

export const genCTx = (
  outAmount: number = 10000,
  pkViewKey: PublicKey = PublicKey.random(),
  blindingKey: Scalar = Scalar.random(),
  msg: string = 'navio',
): CTx => {
  const numTxIn = 1
  const numTxOut = 1
  const defaultFee = 200000
  const fee = (numTxIn + numTxOut) * defaultFee
  const inAmount = fee + outAmount

  const ctxIdHex = crypto.randomBytes(CTX_ID_SIZE).toString('hex')
  const ctxId = CTxId.deserialize(ctxIdHex)

  const outIndex = 0
  const outPoint = OutPoint.generate(ctxId, outIndex)
  const gamma = 100
  const spendingKey = Scalar.random()
  const tokenId = TokenId.default()
  const txIn = TxIn.generate(
    inAmount,
    gamma,
    spendingKey,
    tokenId,
    outPoint,
  )
  const pkSpendKey = PublicKey.random()
  const dpk = DoublePublicKey.fromViewAndSpendKeys(pkViewKey, pkSpendKey)
  const subAddr = SubAddr.fromDoublePublicKey(dpk)

  const txOut = TxOut.generate(
    subAddr,
    outAmount,
    msg,
    tokenId,
    TxOutputType.Normal,
    0,
    false,
    blindingKey,
  )
  return CTx.generate([txIn], [txOut])
}

