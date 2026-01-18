import { Signature } from '../signature'
import { Scalar } from '../scalar'
import { PublicKey } from '../keys/publicKey'

const msg = 'navio'
const privKey = Scalar.random()

const getInstance = (): Signature => {
  return Signature.generate(privKey, msg)
}

test('generate', () => {
  getInstance()
})

test('vefiry', () => {
  const pubKey = PublicKey.fromScalar(privKey)
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


