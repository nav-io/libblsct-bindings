import { HashId } from '../hashId'
import { PublicKey } from '../keys/publicKey'
import { ViewKey } from '../keys/childKeyDesc/txKeyDesc/viewKey'

test('generate', () => {
  const blindingPubKey = PublicKey.random()
  const spendingPubKey = PublicKey.random()
  const viewKey = ViewKey.random()
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

