import { AmountRecoveryReq } from '../amountRecoveryReq'
import { genCTx } from './util'
import { Point } from '../point'
import { PublicKey } from '../keys/publicKey'
import { Scalar } from '../scalar'
import { TokenId } from '../tokenId'
import { RangeProof } from '../rangeProof'
import {
  createRangeProofVec,
  addToRangeProofVec,
  verifyRangeProofs,
  deleteRangeProofVec,
  createAmountRecoveryReqVec,
  addToAmountRecoveryReqVec,
  genAmountRecoveryReq,
  recoverAmount,
  getAmountRecoveryResultSize,
  getAmountRecoveryResultIsSucc,
  getAmountRecoveryResultAmount,
  getAmountRecoveryResultMsg,
  deleteAmountRecoveryReqVec,
} from '../blsct'

test('debug verify', () => {
  const amounts = [123]
  const nonce = Point.random()
  const msg = 'navio'
  const tokenId = TokenId.default()

  console.log('Generating range proof...')
  const rp = RangeProof.generate(amounts, nonce, msg, tokenId)
  console.log('Range proof value (ptr):', rp.value())
  console.log('Range proof size:', rp.size())
  
  const serialized = rp.serialize()
  console.log('Serialized hex length:', serialized.length)
  console.log('Serialized byte count:', serialized.length / 2)
  
  console.log('Testing get_A...')
  const pointA = rp.get_A()
  console.log('get_A result:', pointA.serialize().substring(0, 20) + '...')
  
  console.log('Creating range proof vector...')
  const vec = createRangeProofVec()
  console.log('Vector ptr:', vec)
  
  const rpValue = rp.value()
  const rpSize = rp.size()
  console.log('Adding to vector - value:', rpValue, 'type:', typeof rpValue)
  console.log('Adding to vector - size:', rpSize, 'type:', typeof rpSize)
  
  addToRangeProofVec(vec, rpValue, rpSize)
  console.log('Added to vector successfully')
  
  console.log('About to call verifyRangeProofs...')
  const rv = verifyRangeProofs(vec)
  console.log('Verify result:', rv)
  
  deleteRangeProofVec(vec)
  
  expect(rv.result).toBe(0)
  expect(rv.value).toBe(true)
})

test('debug amount recovery low-level', () => {
  // Generate a simple range proof with known nonce
  const amounts = [123]
  const nonce = Point.random()
  const msg = 'testmsg'
  const tokenId = TokenId.default()

  console.log('=== Low-level amount recovery debug ===')
  const nonceHex = nonce.serialize()
  console.log('Nonce hex:', nonceHex)
  console.log('Nonce hex length:', nonceHex.length, '(should be 96 for 48 bytes)')
  
  // Verify the Point value is a pointer to the right data
  const nonceValueForDebug = nonce.value()
  console.log('nonceValue (ptr):', nonceValueForDebug)
  
  const rp = RangeProof.generate(amounts, nonce, msg, tokenId)
  console.log('Range proof generated, size:', rp.size())
  
  // First verify the proof is valid
  console.log('Verifying range proof...')
  const isValid = RangeProof.verifyProofs([rp])
  console.log('  Range proof valid:', isValid)
  
  // Low-level API calls
  console.log('Creating request vector...')
  const reqVec = createAmountRecoveryReqVec()
  console.log('  reqVec:', reqVec)
  
  const rpValue = rp.value()
  const rpSize = rp.size()
  const nonceValue = nonce.value()
  
  console.log('Calling genAmountRecoveryReq with:')
  console.log('  rpValue:', rpValue, 'type:', typeof rpValue)
  console.log('  rpSize:', rpSize, 'type:', typeof rpSize)
  console.log('  nonceValue:', nonceValue, 'type:', typeof nonceValue)
  
  const blsctReq = genAmountRecoveryReq(rpValue, rpSize, nonceValue, tokenId.value())
  console.log('  blsctReq:', blsctReq)
  
  console.log('Adding to request vector...')
  addToAmountRecoveryReqVec(reqVec, blsctReq)
  
  console.log('Calling recoverAmount...')
  const rv = recoverAmount(reqVec)
  console.log('  rv.result:', rv.result)
  console.log('  rv.value:', rv.value)
  console.log('  rv._structPtr:', rv._structPtr)
  
  if (rv.result === 0 && rv.value) {
    const size = getAmountRecoveryResultSize(rv.value)
    console.log('  result size:', size)
    
    for (let i = 0; i < size; i++) {
      const isSucc = getAmountRecoveryResultIsSucc(rv.value, i)
      const amount = getAmountRecoveryResultAmount(rv.value, i)
      const msg = getAmountRecoveryResultMsg(rv.value, i)
      console.log(`  [${i}] isSucc:`, isSucc, 'amount:', amount, 'msg:', msg)
    }
  }
  
  deleteAmountRecoveryReqVec(reqVec)
  
  expect(rv.result).toBe(0)
})

test('debug amount recovery', () => {
  // Generate a simple range proof with known nonce
  const amounts = [123]
  const nonce = Point.random()
  const msg = 'testmsg'
  const tokenId = TokenId.default()

  console.log('=== Simple amount recovery test ===')
  const nonceHex = nonce.serialize()
  console.log('Nonce hex:', nonceHex)
  console.log('Nonce hex length:', nonceHex.length, '(should be 96 for 48 bytes)')
  
  const rp = RangeProof.generate(amounts, nonce, msg, tokenId)
  console.log('Range proof generated, size:', rp.size())
  console.log('Range proof hex:', rp.serialize().substring(0, 100) + '...')
  
  // Create a fresh Point from the same serialized nonce to ensure consistency
  const nonceDeserialized = Point.deserialize(nonceHex)
  console.log('Nonce deserialized hex:', nonceDeserialized.serialize())
  console.log('Nonce values equal:', nonce.serialize() === nonceDeserialized.serialize())
  
  const req = new AmountRecoveryReq(rp, nonce, tokenId)
  console.log('AmountRecoveryReq created')
  console.log('  rp.value():', rp.value())
  console.log('  rp.size():', rp.size())
  console.log('  nonce.value():', nonce.value())
  
  const results = RangeProof.recoverAmounts([req])
  console.log('Results:', results)
  console.log('  length:', results.length)
  if (results.length > 0) {
    console.log('  [0].isSucc:', results[0].isSucc)
    console.log('  [0].amount:', results[0].amount)
    console.log('  [0].msg:', results[0].msg)
  }
  
  expect(results.length).toBe(1)
  expect(results[0].isSucc).toBe(true)
  expect(results[0].amount).toBe(123n)
  expect(results[0].msg).toBe('testmsg')
})
