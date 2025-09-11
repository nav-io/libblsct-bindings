use crate::{
  ffi::{
    from_tx_key_to_spending_key,
    from_tx_key_to_view_key,
  },
  keys::child_key_desc::tx_key_desc::{
    spending_key::SpendingKey,
    view_key::ViewKey,
  },
};

crate::macros::impl_key!(TxKey);

impl TxKey {
  pub fn to_spending_key(&self) -> SpendingKey {
    let blsct_scalar = unsafe { from_tx_key_to_spending_key(self.0.value()) };
    let obj = BlsctObj::from_c_obj(blsct_scalar);
    obj.into()
  }

  pub fn to_view_key(&self) -> ViewKey {
    let blsct_scalar = unsafe { from_tx_key_to_view_key(self.0.value()) };
    let obj = BlsctObj::from_c_obj(blsct_scalar);
    obj.into()
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::{
    ffi::init,
    keys::child_key::ChildKey,
  };

  fn get_tx_key() -> TxKey {
    let seed = Scalar::random().unwrap();
    let child_key = ChildKey::from_seed(&seed);
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

