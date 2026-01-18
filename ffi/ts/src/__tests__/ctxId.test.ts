import {
  CTX_ID_SIZE,
} from '../blsct'

import * as crypto from 'crypto'
import { CTxId } from '../ctxId'

test('serialize and deserialize', () => {
  const orgHex = crypto.randomBytes(CTX_ID_SIZE).toString('hex')
  const ctxId = CTxId.deserialize(orgHex)
  const recHex = ctxId.serialize()

  expect(orgHex).toBe(recHex)
})



