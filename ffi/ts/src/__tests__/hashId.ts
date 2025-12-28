import { HashId } from '../hashId'
import { PublicKey } from '../keys/publicKey'
import { Scalar } from '../scalar'

test('generate', () => {
  const blindingPubKey = PublicKey.random()
  const spendingPubKey = PublicKey.random()
  const viewKey = Scalar.random()
  HashId.generate(blindingPubKey, spendingPubKey, viewKey)
})

test('random', () => {
  HashId.random()
})

test('serialize and deserialize', () => {
  const a = HashId.random()
  const a_hex = a.serialize()
  const b = HashId.deserialize(a_hex)
  const b_hex = b.serialize()
  expect(a_hex).toBe(b_hex)
})

