use crate::{point::Point, range_proof::RangeProof, token_id::TokenId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Eq)]
pub struct AmountRecoveryReq {
  pub range_proof: RangeProof,
  pub nonce: Point,
  pub token_id: Option<TokenId>,
}

impl AmountRecoveryReq {
  pub fn new(range_proof: &RangeProof, nonce: &Point) -> Self {
    AmountRecoveryReq {
      range_proof: range_proof.clone(),
      nonce: nonce.clone(),
      token_id: None,
    }
  }

  pub fn new_with_token_id(range_proof: &RangeProof, nonce: &Point, token_id: &TokenId) -> Self {
    AmountRecoveryReq {
      range_proof: range_proof.clone(),
      nonce: nonce.clone(),
      token_id: Some(token_id.clone()),
    }
  }
}

impl PartialEq for AmountRecoveryReq {
  fn eq(&self, other: &Self) -> bool {
    self.range_proof == other.range_proof
      && self.nonce == other.nonce
      && self.token_id == other.token_id
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::{initializer::init, token_id::TokenId};

  #[test]
  fn test_deser() {
    init();
    let values = vec![123u64];
    let nonce = Point::random().unwrap();
    let token_id = TokenId::default().unwrap();
    let rp = RangeProof::new(&values, &nonce, "navio", &token_id).unwrap();

    let nonce = Point::random().unwrap();

    let a = AmountRecoveryReq::new_with_token_id(&rp, &nonce, &token_id);
    let hex = bincode::serialize(&a).unwrap();
    let b = bincode::deserialize::<AmountRecoveryReq>(&hex).unwrap();
    assert_eq!(a, b);
  }
}
