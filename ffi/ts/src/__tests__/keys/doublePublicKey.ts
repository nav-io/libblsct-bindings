import { DoublePublicKey } from '../../keys/doublePublicKey'
import { PublicKey } from '../../keys/publicKey'
import { ChildKey } from '../../keys/childKey'

test('fromPublicKeys', () => {
  const pk1 = PublicKey.random()
  const pk2 = PublicKey.random()
  DoublePublicKey.fromPublicKeys(pk1, pk2)
})

test('fromKeysAndAcctAddr', () => {
  const childKey = new ChildKey()
  const viewKey = childKey.toTxKey().toViewKey()
  const spendingPubKey = new PublicKey()
  const account = 123
  const address = 456
  DoublePublicKey.fromKeysAndAcctAddr(
    viewKey,
    spendingPubKey,
    account,
    address
  )
})

test('serialize + deserialize', () => {
  const a = new DoublePublicKey()
  const a_hex = a.serialize()
  const b = DoublePublicKey.deserialize(a_hex)
  expect(a_hex === b.serialize()).toBe(true)
})

