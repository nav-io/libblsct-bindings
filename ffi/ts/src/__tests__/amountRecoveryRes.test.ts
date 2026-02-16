import { AmountRecoveryRes } from '../amountRecoveryRes'

const genAmountRecoveryRes = (): AmountRecoveryRes => {
  return new AmountRecoveryRes(true, 12345n, 'test_message')
}

test('constructor', () => {
  const isSucc = true
  const amount = 999n
  const msg = 'my_message'
  const res = new AmountRecoveryRes(isSucc, amount, msg)

  expect(res.isSucc).toBe(isSucc)
  expect(res.amount).toBe(amount)
  expect(res.msg).toBe(msg)
})

test('constructor with failed recovery', () => {
  const res = new AmountRecoveryRes(false, 0n, '')

  expect(res.isSucc).toBe(false)
  expect(res.amount).toBe(0n)
  expect(res.msg).toBe('')
})

test('toString', () => {
  const res = genAmountRecoveryRes()
  const str = res.toString()

  expect(str).toContain('AmountRecoveryRes')
  expect(str).toContain('true')
  expect(str).toContain('12345')
  expect(str).toContain('test_message')
})

test('serialize', () => {
  const res = genAmountRecoveryRes()
  const hex = res.serialize()

  expect(typeof hex).toBe('string')
  expect(hex.length).toBeGreaterThan(0)
  expect(hex).toMatch(/^[0-9a-f]+$/i)
})

test('serialize and deserialize', () => {
  const a = genAmountRecoveryRes()
  const a_hex = a.serialize()
  const b = a.deserialize(a_hex)
  const b_hex = b.serialize()

  expect(a.isSucc).toBe(b.isSucc)
  expect(a.amount).toBe(b.amount)
  expect(a.msg).toBe(b.msg)
  expect(a_hex).toBe(b_hex)
})

test('deserialize with various amounts', () => {
  const testCases = [
    { isSucc: true, amount: 0n, msg: 'zero' },
    { isSucc: true, amount: 1n, msg: 'one' },
    { isSucc: true, amount: 999999n, msg: 'large' },
    { isSucc: false, amount: 0n, msg: 'failed' },
  ]

  for (const tc of testCases) {
    const res = new AmountRecoveryRes(tc.isSucc, tc.amount, tc.msg)
    const hex = res.serialize()
    const deserialized = res.deserialize(hex)

    expect(deserialized.isSucc).toBe(tc.isSucc)
    expect(deserialized.amount).toBe(tc.amount)
    expect(deserialized.msg).toBe(tc.msg)
  }
})

test('deserialize with special characters in message', () => {
  const msg = 'special chars: !@#$%^&*()_+-={}[]|:";\'<>?,./'
  const res = new AmountRecoveryRes(true, 123n, msg)
  const hex = res.serialize()
  const deserialized = res.deserialize(hex)

  expect(deserialized.msg).toBe(msg)
})

test('deserialize with unicode in message', () => {
  const msg = 'unicode: 你好世界 🚀'
  const res = new AmountRecoveryRes(true, 456n, msg)
  const hex = res.serialize()
  const deserialized = res.deserialize(hex)

  expect(deserialized.msg).toBe(msg)
})

test('deserialize with invalid hex throws error', () => {
  const res = genAmountRecoveryRes()

  expect(() => {
    res.deserialize('invalid_hex')
  }).toThrow('Failed to deserialize to object')
})

test('deserialize with invalid JSON structure throws error', () => {
  const res = genAmountRecoveryRes()
  const invalidJson = Buffer.from('not a valid object structure', 'utf-8').toString('hex')

  expect(() => {
    res.deserialize(invalidJson)
  }).toThrow()
})

test('deserialize with missing fields throws error', () => {
  const res = genAmountRecoveryRes()
  const incompleteObj = { isSucc: true, amount: 100 } // missing msg
  const hex = Buffer.from(JSON.stringify(incompleteObj), 'utf-8').toString('hex')

  expect(() => {
    res.deserialize(hex)
  }).toThrow('Deserialize object is not AmountRecoveryRes')
})

test('deserialize with wrong types throws error', () => {
  const res = genAmountRecoveryRes()
  const wrongTypes = { isSucc: 'true', amount: '100', msg: 123 }
  const hex = Buffer.from(JSON.stringify(wrongTypes), 'utf-8').toString('hex')

  expect(() => {
    res.deserialize(hex)
  }).toThrow('Deserialize object is not AmountRecoveryRes')
})
