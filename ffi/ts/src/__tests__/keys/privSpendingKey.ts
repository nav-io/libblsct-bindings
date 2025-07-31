import { PublicKey } from '../../keys/publicKey'
import { ChildKey } from '../../keys/childKey'
import { PrivSpendingKey } from '../../keys/privSpendingKey'

test('ctor', () => {
  const pk = PublicKey.random()
  const childKey = new ChildKey()
  const spendingKey = childKey.toTxKey().toSpendingKey()
  const viewKey = childKey.toTxKey().toViewKey()

  new PrivSpendingKey(
    pk,
    viewKey,
    spendingKey,
    1, // account
    2  // address
  )
})

