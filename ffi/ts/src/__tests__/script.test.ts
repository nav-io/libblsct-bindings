import {
  SCRIPT_SIZE,
} from '../blsct'

import { randomHex } from './util'
import { Script } from '../script'

test('serialize and deserialize', () => {
  const org_hex = randomHex(SCRIPT_SIZE)
  const a = Script.deserialize(org_hex)
  const rec_hex = a.serialize() 
 
  expect(org_hex).toBe(rec_hex)
})


