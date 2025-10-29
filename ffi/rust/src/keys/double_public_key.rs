use crate::{
  blsct_obj::{self, BlsctObj},
  blsct_serde::BlsctSerde,
  ffi::{
    BlsctDoublePubKey,
    BlsctRetVal,
    BlsctSubAddr,
    deserialize_dpk,
    dpk_to_sub_addr,
    gen_double_pub_key,
    gen_dpk_with_keys_acct_addr,
    serialize_dpk,
  },
  sub_addr::SubAddr,
  macros::{
    impl_clone,
    impl_display,
    impl_from_retval,
    impl_value,
  },
  keys::{
    child_key_desc::tx_key_desc::view_key::ViewKey,
    public_key::PublicKey,
  },
};
use std::ffi::c_char;
use serde::{Deserialize, Serialize};

#[derive(PartialEq, Eq, Debug, Deserialize, Serialize)]
pub struct DoublePublicKey {
  obj: BlsctObj<DoublePublicKey, BlsctDoublePubKey>,
}

impl_from_retval!(DoublePublicKey);
impl_display!(DoublePublicKey);
impl_clone!(DoublePublicKey);

impl From<BlsctObj<DoublePublicKey, BlsctDoublePubKey>> for DoublePublicKey {
  fn from(obj: BlsctObj<DoublePublicKey, BlsctDoublePubKey>) -> DoublePublicKey {
    DoublePublicKey { obj }
  }
}

impl From<DoublePublicKey> for SubAddr {
  fn from(dpk: DoublePublicKey) -> SubAddr {
    let rv = unsafe { dpk_to_sub_addr(dpk.value()) };
    BlsctObj::<SubAddr, BlsctSubAddr>::from_retval(rv).unwrap().into()
  }
}

impl DoublePublicKey {
  impl_value!(BlsctDoublePubKey);

  pub fn from_public_keys<'a>(
    pk1: &PublicKey,
    pk2: &PublicKey,
  ) -> Result<Self, blsct_obj::Error<'a>> {
    let rv = unsafe {
      gen_double_pub_key(pk1.value(), pk2.value())
    };
    let obj = BlsctObj::from_retval(rv)?;
    Ok(obj.into())
  }

  pub fn from_keys_acct_addr(
    view_key: &ViewKey,
    spending_pub_key: &PublicKey,
    account: i64,
    address: u64,
  ) -> Self {
    let dpk = unsafe {
      gen_dpk_with_keys_acct_addr(
        view_key.value(),
        spending_pub_key.value(),
        account,
        address,
      )
    };
    let obj = BlsctObj::from_c_obj(dpk);
    obj.into()
  }

  pub fn random<'a>() -> Result<Self, blsct_obj::Error<'a>> { 
    let pk1 = PublicKey::random()?;
    let pk2 = PublicKey::random()?;
    Self::from_public_keys(&pk1, &pk2)
  }
}

impl BlsctSerde for DoublePublicKey {
  unsafe fn serialize(ptr: *const u8, _: usize) -> *const i8 {
    serialize_dpk(ptr as *const BlsctDoublePubKey)
  }

  unsafe fn deserialize(hex: *const c_char) -> *mut BlsctRetVal {
    deserialize_dpk(hex)
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
  fn test_random() {
    init();
    let _: PublicKey = PublicKey::random().unwrap();
  }

  #[test]
  fn test_from_public_keys() {
    init();
    let a = PublicKey::random().unwrap();
    let b = PublicKey::random().unwrap();
    let _: DoublePublicKey = 
      DoublePublicKey::from_public_keys(&a, &b).unwrap();
  }

  #[test]
  fn test_from_keys_acct_addr() {
    init();
    let child_key = ChildKey::random().unwrap();
    let tx_key = child_key.to_tx_key();
    let view_key = tx_key.to_view_key();
    let pub_key = PublicKey::random().unwrap();

    DoublePublicKey::from_keys_acct_addr(
      &view_key,
      &pub_key,
      123,
      456,
    );
  }

  #[test]
  fn test_eq() {
    init();
    let (a, b) = {
      loop {
        let a = DoublePublicKey::random().unwrap();
        let b = DoublePublicKey::random().unwrap();
        if a != b {
          break (a, b);
        }
      }
    };
    assert!(a == a);
    assert!(a != b);
    assert!(b != a);
    assert!(b == b);
  }

  #[test]
  fn test_deser() {
    init();
    let a = DoublePublicKey::random().unwrap();
    let hex = bincode::serialize(&a).unwrap();
    let b = bincode::deserialize::<DoublePublicKey>(&hex).unwrap();

    assert_eq!(a, b);
  }
}
