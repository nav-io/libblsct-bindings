import * as blsct from '../blsct'
import { Scalar } from '../scalar'

describe('Module', () => {
  test('Initialization', () => {
    blsct.init()
  })
  test('GC', async () => {
    // to check if the finalizer is called,
    // add console.log in the finalizer
    var a = new Scalar()
    a = new Scalar()
    a = new Scalar()
    a = new Scalar()
    ;(global as any).gc()
    await new Promise(r =>
      setImmediate(r)
    )
  })
})

describe('Scalar', () => {
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
})
