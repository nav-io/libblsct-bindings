import { SubAddr } from '../subAddr'
import { SubAddrId } from '../subAddrId'
import { PublicKey } from '../keys/publicKey'
import { DoublePublicKey } from '../keys/doublePublicKey'
import { ViewKey } from '../keys/childKeyDesc/txKeyDesc/viewKey'

test('generate', () => {
  const vk = ViewKey.random()
  const spendingPk = PublicKey.random()
  const subAddrId = SubAddrId.generate(1, 2)

  SubAddr.generate(vk, spendingPk, subAddrId)
})

test('fromDoublePublicKey', () => {
  const dpk = DoublePublicKey.random()
  SubAddr.fromDoublePublicKey(dpk)
})

test('serialize and deserialize', () => {
  const dpk = DoublePublicKey.random()
  const a = SubAddr.fromDoublePublicKey(dpk)

  const a_hex = a.serialize()
  const b = SubAddr.deserialize(a_hex)
  const b_hex = b.serialize()
 
  expect(a_hex).toBe(b_hex)
})

