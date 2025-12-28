use crate::{
  blsct_obj,
  ffi::calc_view_tag,
  keys::public_key::PublicKey,
  util::gen_random_view_key,
  scalar::Scalar,
};
use serde::{Deserialize, Serialize};


#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
pub struct ViewTag {
  value: u64
}

impl ViewTag {
  pub fn new(
    blinding_pub_key: &PublicKey,
    view_key: &Scalar,
  ) -> Self {
    let value = unsafe {
      calc_view_tag(blinding_pub_key.value(), view_key.value()) 
    };
    ViewTag { value }
  }

  pub fn random<'a>() -> Result<Self, blsct_obj::Error<'a>> {
    let blinding_pub_key = PublicKey::random()?;
    let view_key = gen_random_view_key()?;
    Ok(Self::new(&blinding_pub_key, &view_key))
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::{
    initializer::init,
    util::gen_random_view_key,
  };

  #[test]
  fn test_new() {
    init();
    let blinding_pub_key = PublicKey::random().unwrap();
    let view_key = gen_random_view_key().unwrap();
    let _ = ViewTag::new(&blinding_pub_key, &view_key);
  }

  #[test]
  fn test_random() {
    init();
    let _ = ViewTag::random();
  }

  #[test]
  fn test_deser() {
    init();
    let a = ViewTag::random().unwrap();
    let hex = bincode::serialize(&a).unwrap();
    let b = bincode::deserialize::<ViewTag>(&hex).unwrap();
    assert_eq!(a, b);
  }
}

