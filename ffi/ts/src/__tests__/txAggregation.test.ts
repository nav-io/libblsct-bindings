import {
  CTx,
  CTxId,
  OutPoint,
  PublicKey,
  Scalar,
  SubAddr,
  SubAddrId,
  TokenId,
  TxIn,
  TxOut,
  TxOutputType,
  UnsignedInput,
  UnsignedOutput,
  UnsignedTransaction,
} from '../index'

const makeDestination = (): SubAddr => {
  const viewKey = new Scalar(91)
  const spendingPubKey = PublicKey.fromScalar(new Scalar(92))
  return SubAddr.generate(viewKey, spendingPubKey, SubAddrId.generate(7, 9))
}

const makeSignedTxHex = (hexByte: string, outAmount: number): string => {
  const destination = makeDestination()
  const tokenId = TokenId.default()
  const ctxId = CTxId.deserialize(hexByte.repeat(32))
  const outPoint = OutPoint.generate(ctxId)

  const txIn = TxIn.generate(
    250_000,
    new Scalar(100),
    new Scalar(101),
    tokenId,
    outPoint,
    false,
    false,
  )

  const txOut = TxOut.generate(
    destination,
    outAmount,
    `memo-${hexByte}`,
    tokenId,
    TxOutputType.Normal,
    0,
    false,
    new Scalar(777),
  )

  const unsignedTx = UnsignedTransaction.create()
  unsignedTx.addInput(UnsignedInput.fromTxIn(txIn))
  unsignedTx.addOutput(UnsignedOutput.fromTxOut(txOut))
  unsignedTx.setFee(1_000)

  return unsignedTx.sign()
}

describe('Signed transaction aggregation', () => {
  test('CTx.aggregateTransactions merges two signed transactions', () => {
    const txHex1 = makeSignedTxHex('11', 10_000)
    const txHex2 = makeSignedTxHex('22', 20_000)

    const tx1 = CTx.deserialize(txHex1)
    const tx2 = CTx.deserialize(txHex2)
    const tx1Outs = tx1.getCTxOuts().size()
    const tx2Outs = tx2.getCTxOuts().size()

    const aggregatedHex = CTx.aggregateTransactions([txHex1, txHex2])
    expect(aggregatedHex).toMatch(/^[0-9a-f]+$/)
    expect(aggregatedHex.length % 2).toBe(0)

    const aggregated = CTx.deserialize(aggregatedHex)
    expect(aggregated.getCTxIns().size()).toBe(tx1.getCTxIns().size() + tx2.getCTxIns().size())
    expect(aggregated.getCTxOuts().size()).toBe(tx1Outs + tx2Outs - 1)
  })

  test('CTx.aggregateTransactions rejects empty input', () => {
    expect(() => CTx.aggregateTransactions([])).toThrow('At least one signed transaction is required')
  })
})

