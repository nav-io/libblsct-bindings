import { DoublePublicKey } from '../keys/doublePublicKey'
import { Address, AddressEncoding } from '../address'

test('encode + decode', () => {
  const addrDpk = DoublePublicKey.random()
  const encoding = AddressEncoding.Bech32

  const addrStr = Address.encode(addrDpk, encoding)
  const recDpk = Address.decode(addrStr)

  expect(recDpk.serialize() === addrDpk.serialize()).toBe(true)
})

