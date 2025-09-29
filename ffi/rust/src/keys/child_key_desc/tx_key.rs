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

macro_rules! impl_tx_key_desc_deser_test {
  ($derive_method:ident, $target_ty:path) => {
    #[test]
    fn test_deser() {
      use crate::keys::child_key::ChildKey;
      use bincode;

      crate::initializer::init();

      let seed = Scalar::random();
      let child_key = ChildKey::from_seed(&seed);
      let tx_key = child_key.to_tx_key();

      let a: $target_ty = tx_key.$derive_method();
      let hex = bincode::serialize(&a).unwrap();
      let b: $target_ty = bincode::deserialize::<$target_ty>(&hex).unwrap();

      assert_eq!(a, b);
    }
  };
}

pub(crate) use impl_tx_key_desc_deser_test;

#[cfg(test)]
mod tests {
  use super::*;
  use crate::{
    initializer::init,
    keys::child_key::ChildKey,
  };

  fn get_tx_key() -> TxKey {
    let seed = Scalar::random();
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

crate::keys::child_key::impl_child_key_desc_deser_test!(
  to_tx_key,
  TxKey
);

