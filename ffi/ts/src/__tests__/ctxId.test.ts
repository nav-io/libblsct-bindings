import {
  CTX_ID_SIZE,
} from '../blsct'

import { randomHex } from './util'
import { CTxId } from '../ctxId'

test('serialize and deserialize', () => {
  const orgHex = randomHex(CTX_ID_SIZE)
  const ctxId = CTxId.deserialize(orgHex)
  const recHex = ctxId.serialize()

  expect(orgHex).toBe(recHex)
})



