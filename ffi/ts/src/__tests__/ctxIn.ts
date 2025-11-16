import { genCTx } from './ctx'
import { CTxIn } from '../ctxIn'

const genCTxIn = (): CTxIn => {
  const ctx = genCTx()
  const txIns = ctx.getCTxIns()
  return txIns.at(0)
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

