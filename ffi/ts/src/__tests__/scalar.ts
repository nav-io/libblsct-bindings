import { Scalar } from '../scalar'

test('toNumber', () => {
  const s = new Scalar(12345)
  expect(s.toNumber()).toBe(12345)
})

test('equals', () => {
  const a = new Scalar(1)
  const b = new Scalar(2)
  expect(a.equals(b)).toBe(false)
  expect(a.equals(a)).toBe(true)
  expect(b.equals(b)).toBe(true)
})

test('random', () => {
  const a = Scalar.random()
  const b = Scalar.random()
  const c = Scalar.random()
  expect(!a.equals(b) || !a.equals(c)).toBe(true)
})

test('serialize and deserialize', () => {
  const a = Scalar.random()
  const hex = a.serialize()
  const b = Scalar.deserialize(hex)
  expect(a.equals(b)).toBe(true)
})

