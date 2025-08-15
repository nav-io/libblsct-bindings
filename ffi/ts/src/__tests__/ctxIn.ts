import { genCTx } from './ctx'
import { CTxIn } from '../ctxIn'

const genCTxIn = (): CTxIn => {
  const ctx = genCTx()
  const txIns = ctx.getCTxIns()
  return txIns[0]
}

test('getPrevOutHash', () => {
  const x = genCTxIn()
  x.getPrevOutHash()
})

test('getPrevOutN', () => {
  const x = genCTxIn()
  x.getPrevOutN()
})

test('getScriptSig', () => {
  const x = genCTxIn()
  x.getScriptSig()
})

test('getSequence', () => {
  const x = genCTxIn()
  x.getSequence()
})

test('getScriptWitness', () => {
  const x = genCTxIn()
  x.getScriptWitness()
})

test('serialize and deserialize', () => {
  const a = genCTxIn()
  const a_hex = a.serialize()
  const b = CTxIn.deserialize(a_hex)
  const b_hex = b.serialize()

  expect(a_hex).toBe(b_hex)
})

