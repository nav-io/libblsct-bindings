import {
  SCRIPT_SIZE,
} from '../blsct'

import * as crypto from 'crypto'

import { Script } from '../script'

test('serialize and deserialize', () => {
  const org_hex = crypto.randomBytes(SCRIPT_SIZE).toString('hex')
  const a = Script.deserialize(org_hex)
  const rec_hex = a.serialize() 
 
  expect(org_hex).toBe(rec_hex)
})


