import { TokenId } from '../tokenId'

test('default', () => {
  TokenId.default()
})

test('fromToken', () => {
  const x = TokenId.fromToken(12345)
  expect(x.getToken()).toBe(12345n)
})

test('fromTokenAndSubid', () => {
  const x = TokenId.fromTokenAndSubid(123, 456)
  expect(x.getToken()).toBe(123n)
  expect(x.getSubid()).toBe(456n)
})

test('serialize and deserialize', () => {
  const a = TokenId.default()
  const hex = a.serialize()
  const b = TokenId.deserialize(hex)
  expect(a.equals(b)).toBe(true)
})

