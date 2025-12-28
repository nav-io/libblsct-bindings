use crate::ffi::{
  get_blsct_chain,
  set_blsct_chain,
};
use std::os::raw::c_int;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum Error {
  #[error("Invalid chain ID: {0}")]
  InvalidChainId(u8),
}

#[repr(u8)]
#[derive(Debug, Copy, Clone, PartialEq, Eq)]
pub enum Chain {
  Mainnet = 0,
  Testnet = 1,
  Signet = 2,
  Regtest = 3,
}

impl Chain {
  pub fn get() -> Chain {
    match unsafe { get_blsct_chain() } {
      0 => Chain::Mainnet,
      1 => Chain::Testnet,
      2 => Chain::Signet,
      3 => Chain::Regtest,
      n => panic!("Unexpected chain ID {n}. Check code."),
    }
  }

  pub fn set(chain: Chain) {
    unsafe { set_blsct_chain(chain as u8 as c_int) }
  }
}

impl TryFrom<u8> for Chain {
  type Error = Error;

  fn try_from(n: u8) -> Result<Self, Error> {
    match n {
      0 => Ok(Chain::Mainnet),
      1 => Ok(Chain::Testnet),
      2 => Ok(Chain::Signet),
      3 => Ok(Chain::Regtest),
      n => Err(Error::InvalidChainId(n)),
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_get_set_chain() {
    for exp_chain in [Chain::Mainnet, Chain::Testnet, Chain::Signet, Chain::Regtest] {
      Chain::set(exp_chain);
      assert_eq!(exp_chain, Chain::get());
    }
    // reset to mainnet
    Chain::set(Chain::Mainnet);
  }
}

