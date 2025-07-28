import { Scalar } from '../../scalar'
import { ChildKey } from '../../keys/childKey'

describe('KeyDerivation', () => {
  test('derive from childKey', () => {
    const seed = new Scalar(12345)
    const childKey = new ChildKey(seed)
  })

  test('toBlindingKey', () => {
    const seed = new Scalar(12345)
    const x = new ChildKey(seed)
    x.toBlindingKey()
  })

  test('toTokenKey', () => {
    const seed = new Scalar(12345)
    const x = new ChildKey(seed)
    x.toTokenKey()
  })

  test('toTxKey', () => {
    const seed = new Scalar(12345)
    const x = new ChildKey(seed)
    x.toTxKey()
  })
})
