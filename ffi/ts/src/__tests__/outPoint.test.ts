import {
  CTX_ID_SIZE,
} from '../blsct'

import { randomHex } from './util'
import { CTxId } from '../ctxId'
import { OutPoint } from '../outPoint'

test('generate', () => {
  const hex = randomHex(CTX_ID_SIZE)
  const ctxId = CTxId.deserialize(hex)
  OutPoint.generate(ctxId)
})

test('serialize and deserialize', () => {
  const hex = randomHex(CTX_ID_SIZE)
  const ctxId = CTxId.deserialize(hex)
  const a = OutPoint.generate(ctxId)

  const a_hex = a.serialize()
  const b = OutPoint.deserialize(a_hex)
  const b_hex = b.serialize()

  expect(a_hex).toBe(b_hex)
})

