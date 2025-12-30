use crate::ffi::{
  from_tx_key_to_spending_key,
  from_tx_key_to_view_key,
};

crate::macros::impl_key!(TxKey);

impl TxKey {
  pub fn to_spending_key(&self) -> Scalar {
    let blsct_scalar = unsafe { from_tx_key_to_spending_key(self.0.value()) };
    let obj = BlsctObj::from_c_obj(blsct_scalar);
    obj.into()
  }

  pub fn to_view_key(&self) -> Scalar {
    let blsct_scalar = unsafe { from_tx_key_to_view_key(self.0.value()) };
    let obj = BlsctObj::from_c_obj(blsct_scalar);
    obj.into()
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::{
    initializer::init,
    keys::child_key::ChildKey,
  };

  fn get_tx_key() -> TxKey {
    init();
    let child_key = ChildKey::random().unwrap();
    child_key.to_tx_key()
  }

  #[test]
  fn test_to_spending_key() {
    init();
    let tx_key = get_tx_key();
    tx_key.to_spending_key();
  }

  #[test]
  fn test_to_view_key() {
    init();
    let tx_key = get_tx_key();
    tx_key.to_view_key();
  }
}

