use crate::{
  blsct_obj::BlsctObj,
  blsct_serde::BlsctSerde, 
  ffi::{
    BlsctKeyId,
    BlsctRetVal,
    calc_key_id,
    deserialize_key_id,
    serialize_key_id,
  },
  keys::{
    child_key::ChildKey,
    child_key_desc::tx_key_desc::view_key::ViewKey,
    public_key::PublicKey,
  },
  macros::{
    impl_clone,
    impl_display,
    impl_from_retval,
    impl_value,
  },
  scalar::Scalar,
};
use serde::{Deserialize, Serialize};
use std::ffi::c_char;

#[derive(Debug, Deserialize, Serialize, Eq)]
pub struct HashId {
  obj: BlsctObj<HashId, BlsctKeyId>,
}

impl_from_retval!(HashId);
impl_display!(HashId);
impl_clone!(HashId);

impl HashId {
  pub fn new(
    blinding_pub_key: &PublicKey,
    spending_pub_key: &PublicKey,
    view_key: &ViewKey,
  ) -> Self {
    let blsct_key_id = unsafe { calc_key_id(
      blinding_pub_key.value(),
      spending_pub_key.value(),
      view_key.value(),
    )};
    BlsctObj::from_c_obj(blsct_key_id).into()
  }

  pub fn random() -> Self {
    let blinding_pub_key = PublicKey::random();
    let spending_pub_key = PublicKey::random();
    let view_key = {
      let seed = Scalar::random();
      let child_key = ChildKey::from_seed(&seed);
      child_key.to_tx_key().to_view_key() 
    };
    Self::new(
      &blinding_pub_key,
      &spending_pub_key,
      &view_key,
    )
  }

  impl_value!(HashId, BlsctKeyId);
}

impl BlsctSerde for HashId {
  unsafe fn serialize(ptr: *const u8, _: usize) -> *const i8 {
    serialize_key_id(ptr as *const BlsctKeyId)
  }

  unsafe fn deserialize(hex: *const c_char) -> *mut BlsctRetVal {
    deserialize_key_id(hex)
  }
}

impl PartialEq for HashId {
  fn eq(&self, other: &Self) -> bool {
    self.obj == other.obj 
  }
}

impl From<BlsctObj<HashId, BlsctKeyId>> for HashId {
  fn from(obj: BlsctObj<HashId, BlsctKeyId>) -> HashId {
    HashId { obj }
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::initializer::init;

  #[test]
  fn test_eq() {
    init();
    let (a, b) = {
      loop {
        let a = HashId::random();
        let b = HashId::random();
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
    let a = HashId::random();
    let hex = bincode::serialize(&a).unwrap();
    let b = bincode::deserialize::<HashId>(&hex).unwrap();
    assert_eq!(a, b);
  }
}

