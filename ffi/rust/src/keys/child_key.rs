use crate::{
  blsct_obj::BlsctObj,
  ffi::{
    BlsctScalar,
    from_child_key_to_blinding_key,
    from_child_key_to_token_key,
    from_child_key_to_tx_key,
    from_seed_to_child_key,
  },
  scalar::Scalar,
  keys::child_key_desc::{
    blinding_key::BlindingKey,
    token_key::TokenKey,
    tx_key::TxKey,
  },
};

pub struct ChildKey(Scalar);

impl ChildKey {
  pub fn from_seed(seed: &Scalar) -> Self {
    let blsct_scalar = unsafe { from_seed_to_child_key(seed.value()) };
    let obj = BlsctObj::from_c_obj(blsct_scalar);
    ChildKey(obj.into())
  }

  pub fn value(&self) -> *const BlsctScalar {
    self.0.value()
  }

  pub fn to_blinding_key(&self) -> BlindingKey {
    let blsct_scalar = unsafe { from_child_key_to_blinding_key(self.0.value()) };
    let obj = BlsctObj::from_c_obj(blsct_scalar);
    obj.into()
  }

  pub fn to_token_key(&self) -> TokenKey {
    let blsct_scalar = unsafe { from_child_key_to_token_key(self.0.value()) };
    let obj = BlsctObj::from_c_obj(blsct_scalar);
    obj.into()
  }

  pub fn to_tx_key(&self) -> TxKey {
    let blsct_scalar = unsafe { from_child_key_to_tx_key(self.0.value()) };
    let obj = BlsctObj::from_c_obj(blsct_scalar);
    obj.into()
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::ffi::init;

  #[test]
  fn test_from_seed() {
    init();
    let seed = Scalar::random().unwrap();
    ChildKey::from_seed(&seed);
  }

  #[test]
  fn test_to_blinding_key() {
    init();
    let seed = Scalar::random().unwrap();
    let child_key = ChildKey::from_seed(&seed);
    child_key.to_blinding_key();
  }

  #[test]
  fn test_to_token_key() {
    init();
    let seed = Scalar::random().unwrap();
    let child_key = ChildKey::from_seed(&seed);
    child_key.to_token_key();
  }

  #[test]
  fn test_to_tx_key() {
    init();
    let seed = Scalar::random().unwrap();
    let child_key = ChildKey::from_seed(&seed);
    child_key.to_tx_key();
  }
}

