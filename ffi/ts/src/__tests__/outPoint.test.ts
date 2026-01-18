import {
  CTX_ID_SIZE,
} from '../blsct'

import * as crypto from 'crypto'
import { CTxId } from '../ctxId'
import { OutPoint } from '../outPoint'

test('generate', () => {
  const hex = crypto.randomBytes(CTX_ID_SIZE).toString('hex')
  const ctxId = CTxId.deserialize(hex)
  OutPoint.generate(ctxId, 2)
})

test('serialize and deserialize', () => {
  const hex = crypto.randomBytes(CTX_ID_SIZE).toString('hex')
  const ctxId = CTxId.deserialize(hex)
  const a = OutPoint.generate(ctxId, 2)

  const a_hex = a.serialize()
  const b = OutPoint.deserialize(a_hex)
  const b_hex = b.serialize()

  expect(a_hex).toBe(b_hex)
})

