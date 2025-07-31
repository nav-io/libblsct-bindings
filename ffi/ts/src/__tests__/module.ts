import { DoublePublicKey } from '../keys/doublePublicKey'

test('GC', async () => {
  if (typeof global.gc !== 'function') {
    return
  }
  // to visually see that the finalizer is called,
  // add console.log in the finalizer
  var a = new DoublePublicKey()
  ;a.move()
  ;(global as any).gc()
  await new Promise(r =>
    setImmediate(r)
  )
})

