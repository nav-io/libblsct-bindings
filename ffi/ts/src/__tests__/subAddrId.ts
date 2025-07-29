import {
} from '../blsct'

import { SubAddrId } from '../subAddrId'

test('generate', () => {
  SubAddrId.generate(1, 2)
})

test('serialize and deserialize', () => {
  const a = SubAddrId.generate(1, 2)
  const a_hex = a.serialize()
  const b = SubAddrId.deserialize(a_hex)
  const b_hex = b.serialize()

  expect(a_hex).toBe(b_hex)
})


