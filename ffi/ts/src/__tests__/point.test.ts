import { Point } from '../point'
import { Scalar } from '../scalar'

test('random', () => {
  const a = Point.random()
  const b = Point.random()
  const c = Point.random()
  expect(!a.equals(b) || !a.equals(c)).toBe(true)
})

test('base', () => {
  const a = Point.base()
  const exp = '97f1d3a73197d7942695638c4fa9ac0fc3688c4f9774b905a14e3a3f171bac586c55e83ff97a1aeffb3af00adb22c6bb'
  const act = a.serialize()
  expect(act).toBe(exp)
})

test('fromScalar', () => {
  const scalar = new Scalar(1)
  const p = Point.fromScalar(scalar)
  expect(p.equals(Point.base())).toBe(true)
})

test('toString', () => {
  const a = Point.base()
  const exp = 'Point(1 17f1d3a73197d7942695638c4fa9ac0fc3688c4f9774b905a14e3a3f171bac586c55e83ff97a1aeffb3af00adb22c6bb 8b3f481e3aaa0f1a09e30ed741d8ae4fcf5e095d5d00af600db18cb2c04b3edd03cc744a2888ae40caa232946c5e7e1)'
  expect(a.toString()).toBe(exp)
})

test('isValid', () => {
  const a = Point.random()
  expect(a.isValid()).toBe(true)
})

test('scalarMultiplyPoint', () => {
  const a = Point.random()
  const s = Scalar.random()
  const b = a.scalarMultiply(s)
  expect(b.isValid()).toBe(true)
})

test('equals', () => {
  const a = Point.fromScalar(new Scalar(5))
  const b = Point.base()

  expect(a.equals(a)).toBe(true)
  expect(b.equals(b)).toBe(true)
  expect(a.equals(b)).toBe(false)
})

test('serialize and deserialize', () => {
  const a = Point.random()
  const hex = a.serialize()
  const b = Point.deserialize(hex)
  expect(a.equals(b)).toBe(true)
})








