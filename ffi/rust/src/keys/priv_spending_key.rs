use crate::{
  ffi::calc_priv_spending_key,
  keys::{
    child_key_desc::tx_key_desc::spending_key::SpendingKey,
    public_key::PublicKey,
  },
};

crate::macros::impl_key!(PrivSpendingKey);

impl PrivSpendingKey {
  pub fn new(
    blinding_pub_key: PublicKey,
    view_key: Scalar,
    spending_key: SpendingKey,
    account: i64,
    address: u64,
  ) -> Self {
    let priv_spending_key = unsafe {
      calc_priv_spending_key(
        blinding_pub_key.value(),
        view_key.value(),
        spending_key.value(),
        account,
        address,
      )
    };
    let obj = BlsctObj::from_c_obj(priv_spending_key);
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

  #[test]
  fn test_new() {
    init();
    let child_key = ChildKey::random().unwrap();
    let tx_key = child_key.to_tx_key();
    let view_key = tx_key.to_view_key();
    let spending_key = tx_key.to_spending_key();
    let blinding_pub_key = PublicKey::random().unwrap();

    let _: PrivSpendingKey = PrivSpendingKey::new(
      blinding_pub_key,
      view_key,
      spending_key,
      123,
      456,
    );
  }
}
