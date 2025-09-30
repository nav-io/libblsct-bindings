use crate::{
  blsct_obj::BlsctObj,
  blsct_serde::BlsctSerde, 
  ffi::{
    BlsctSubAddr,
    BlsctRetVal,
    derive_sub_address,
    serialize_sub_addr,
    deserialize_sub_addr,
  },
  macros::{
    impl_clone,
    impl_display,
    impl_from_retval,
    impl_value,
  },
  keys::{
    public_key::PublicKey,
    child_key_desc::tx_key_desc::view_key::ViewKey,
  },
  sub_addr_id::SubAddrId,
};
use serde::{Deserialize, Serialize};
use std::ffi::c_char;

#[derive(Debug, Deserialize, Serialize, Eq)]
pub struct SubAddr {
  obj: BlsctObj<SubAddr, BlsctSubAddr>,
}

impl_from_retval!(SubAddr);
impl_display!(SubAddr);
impl_clone!(SubAddr);

impl SubAddr {
  pub fn new(
    view_key: &ViewKey,
    spending_pub_key: &PublicKey,
    sub_addr_id: &SubAddrId,
  ) -> Self {
    let blsct_sub_addr = unsafe { derive_sub_address(
      view_key.value(),
      spending_pub_key.value(),
      sub_addr_id.value(),
    )};
    BlsctObj::from_c_obj(blsct_sub_addr).into()
  }

  impl_value!(SubAddr, BlsctSubAddr);
}

impl BlsctSerde for SubAddr {
  unsafe fn serialize(ptr: *const u8, _: usize) -> *const i8 {
    serialize_sub_addr(ptr as *const BlsctSubAddr)
  }

  unsafe fn deserialize(hex: *const c_char) -> *mut BlsctRetVal {
    deserialize_sub_addr(hex)
  }
}

impl PartialEq for SubAddr {
  fn eq(&self, other: &Self) -> bool {
    self.obj == other.obj 
  }
}

impl From<BlsctObj<SubAddr, BlsctSubAddr>> for SubAddr {
  fn from(obj: BlsctObj<SubAddr, BlsctSubAddr>) -> SubAddr {
    SubAddr { obj }
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::{
    keys::double_public_key::DoublePublicKey,
    initializer::init,
    util::gen_random_view_key,
  };

  #[test]
  fn test_from_dpk() {
    init();
    let dpk = DoublePublicKey::random();
    let _: SubAddr = dpk.into();
  }

  #[test]
  fn test_eq() {
    init();
    let spending_pub_key = PublicKey::random();
    let view_key = gen_random_view_key();
    let sub_addr_id_a = SubAddrId::new(123, 456);
    let sub_addr_id_b = SubAddrId::new(234, 567);

    let a = SubAddr::new(&view_key, &spending_pub_key, &sub_addr_id_a);
    let b = SubAddr::new(&view_key, &spending_pub_key, &sub_addr_id_b);

    assert!(a == a);
    assert!(a != b);
    assert!(b != a);
    assert!(b == b);
  }

  #[test]
  fn test_deser() {
    init();
    let spending_pub_key = PublicKey::random();
    let view_key = gen_random_view_key();
    let sub_addr_id = SubAddrId::new(123, 456);
    
    let a = SubAddr::new(
      &view_key,
      &spending_pub_key,
      &sub_addr_id,
    );
    let hex = bincode::serialize(&a).unwrap();
    let b = bincode::deserialize::<SubAddr>(&hex).unwrap();
    assert_eq!(a, b);
  }
}

