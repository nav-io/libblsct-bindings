import { Scalar } from '../../scalar'
import { ChildKey } from '../../keys/childKey'

describe('KeyDerivation', () => {
  test('ChildKey', () => {
    const seed = new Scalar(12345)
    new ChildKey(seed)
    new ChildKey()
  })

  test('ChildKey -> blindingKey', () => {
    const child = new ChildKey()
    child.toBlindingKey()
  })

  test('ChildKey -> TokenKey', () => {
    const child = new ChildKey()
    child.toTokenKey()
  })

  test('ChildKey -> TxKey', () => {
    const x = new ChildKey()
    x.toTxKey()
  })

  test('TxKey -> SpendingKey', () => {
    const x = new ChildKey()
    x.toTxKey().toSpendingKey()
  })

  test('TxKey -> ViewKey', () => {
    const x = new ChildKey()
    x.toTxKey().toSpendingKey()
  })
})
