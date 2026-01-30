import { Signature } from '../signature'
import { Scalar } from '../scalar'
import { PublicKey } from '../keys/publicKey'

const msg = 'navio'

// Create privKey lazily to ensure WASM is initialized first
let privKey: Scalar | null = null
const getPrivKey = (): Scalar => {
  if (!privKey) {
    privKey = Scalar.random()
  }
  return privKey
}

const getInstance = (): Signature => {
  return Signature.generate(getPrivKey(), msg)
}

test('generate', () => {
  getInstance()
})

test('verify', () => {
  const pubKey = PublicKey.fromScalar(getPrivKey())
  const sig = getInstance()
  const res = sig.verify(pubKey, msg)
  expect(res).toBe(true)
})

test('serialize and deserialize', () => {
  const a = getInstance()
  const a_hex = a.serialize()
  const b = Signature.deserialize(a_hex)
  const b_hex = b.serialize()

  expect(a_hex).toBe(b_hex)
})


