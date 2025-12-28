import { BlsctChain, getChain, setChain } from '../blsct'

test('set and get', () => {
  const chains = [
    BlsctChain.Mainnet,
    BlsctChain.Testnet,
    BlsctChain.Signet,
    BlsctChain.Regtest,
  ]
  for (const chain of chains) {
    setChain(chain)
    expect(getChain()).toBe(chain)
  }
  // reset to mainnet
  setChain(BlsctChain.Mainnet)
})

