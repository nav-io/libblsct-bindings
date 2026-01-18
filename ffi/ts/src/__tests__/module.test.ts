import { DoublePublicKey } from '../keys/doublePublicKey'

const doIt = async () => {
}

test('GC', async () => {
  if (typeof global.gc !== 'function') {
    return
  }
  // to visually see that the finalizer is called,
  // add console.log in the finalizer
  new DoublePublicKey()
  ;(global as any).gc()
  await new Promise(r =>
    setImmediate(r)
  )
})

