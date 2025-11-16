use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Eq)]
pub struct AmountRecoveryRes {
  pub is_succ: bool,
  pub amount: u64,
  pub msg: String,
}

impl AmountRecoveryRes {
  pub fn new(is_succ: bool, amount: u64, msg: &str) -> Self {
    AmountRecoveryRes {
      is_succ,
      amount,
      msg: msg.to_string(),
    }
  }
}

impl PartialEq for AmountRecoveryRes {
  fn eq(&self, other: &Self) -> bool {
    self.is_succ == other.is_succ 
    && self.amount == other.amount
    && self.msg == other.msg
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::initializer::init;

  #[test]
  fn test_deser() {
    init();
    let is_succ = true;
    let amount = 12345u64;
    let msg = "navio";
    let a = AmountRecoveryRes::new(is_succ, amount, msg);
    let hex = bincode::serialize(&a).unwrap();
    let b = bincode::deserialize::<AmountRecoveryRes>(&hex).unwrap();
    assert_eq!(a, b);
  }
}

