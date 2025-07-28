import { Point } from '../../point'
import { PublicKey } from '../../keys/publicKey'
import { ChildKey } from '../../keys/childKey'
import { Scalar } from '../../scalar'

test('getPoint', () => {
  const p = Point.random()
  const pk = PublicKey.fromPoint(p)
  expect(pk.getPoint().equals(p)).toBe(true)
})

test('random', () => {
  const a = PublicKey.random()
  const b = PublicKey.random()
  const c = PublicKey.random()
  expect(!a.equals(b) || !a.equals(c)).toBe(true)
})

test('fromPoint', () => {
  const p = Point.random()
  const pk = PublicKey.fromPoint(p)
  expect(pk.getPoint().equals(p)).toBe(true)
})

test('fromScalar', () => {
  const s = new Scalar(1)
  PublicKey.fromScalar(s)
})

test('generateNonce', () => {
  const pk = PublicKey.random()
  const viewKey = new ChildKey().toTxKey().toViewKey()
  const nonce = PublicKey.generateNonce(pk, viewKey)
  expect(nonce.getPoint().isValid()).toBe(true)
})

test('equals', () => {
  const a = Point.fromScalar(new Scalar(5))
  const b = Point.base()
  const pkA = PublicKey.fromPoint(a)
  const pkB = PublicKey.fromPoint(b)

  expect(pkA.equals(pkA)).toBe(true)
  expect(pkB.equals(pkB)).toBe(true)
  expect(pkA.equals(pkB)).toBe(false)
})

test('serialize and deserialize', () => {
  const a = PublicKey.random()
  const hex = a.serialize()
  const b = PublicKey.deserialize(hex)
  expect(a.equals(b)).toBe(true)
})

