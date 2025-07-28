import { TokenId } from '../tokenId'

test('fromToken', () => {
  const x = TokenId.fromToken(12345)
  expect(x.getToken()).toBe(12345)
})

test('fromTokenAndSubid', () => {
  const x = TokenId.fromTokenAndSubid(123, 456)
  expect(x.getToken()).toBe(123)
  expect(x.getSubid()).toBe(456)
})

test('serialize and deserialize', () => {
  const a = new TokenId()
  const hex = a.serialize()
  const b = TokenId.deserialize(hex)
  expect(a.equals(b)).toBe(true)
})

