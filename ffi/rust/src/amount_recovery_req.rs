use crate::{
  point::Point,
  range_proof::RangeProof,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Eq)]
pub struct AmountRecoveryReq {
  pub range_proof: RangeProof,
  pub nonce: Point,
}

impl AmountRecoveryReq {
  pub fn new(range_proof: &RangeProof, nonce: &Point) -> Self {
    AmountRecoveryReq {
      range_proof: range_proof.clone(),
      nonce: nonce.clone(),
    }
  }
}

impl PartialEq for AmountRecoveryReq {
  fn eq(&self, other: &Self) -> bool {
    self.range_proof == other.range_proof && self.nonce == other.nonce
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::{
    initializer::init,
    token_id::TokenId,
  };

  #[test]
  fn test_deser() {
    init();
    let values = vec![123u64];
    let nonce = Point::random();
    let token_id = TokenId::default();
    let rp = RangeProof::new(&values, &nonce, "navio", &token_id).unwrap();

    let nonce = Point::random();

    let a = AmountRecoveryReq::new(&rp, &nonce);
    let hex = bincode::serialize(&a).unwrap();
    let b = bincode::deserialize::<AmountRecoveryReq>(&hex).unwrap();
    assert_eq!(a, b);
  }
}

