use crate::{
  blsct_obj::BlsctObj,
  blsct_serde::BlsctSerde, 
  ffi::{
    BlsctSubAddrId,
    BlsctRetVal,
    deserialize_sub_addr_id,
    gen_sub_addr_id,
    get_sub_addr_id_account,
    get_sub_addr_id_address,
    serialize_sub_addr_id,
  },
  macros::{
    impl_clone,
    impl_display,
    impl_from_retval,
    impl_value,
  },
};
use serde::{Deserialize, Serialize};
use std::ffi::c_char;

#[derive(Debug, Deserialize, Serialize, Eq)]
pub struct SubAddrId {
  obj: BlsctObj<SubAddrId, BlsctSubAddrId>,
}

impl_from_retval!(SubAddrId);
impl_display!(SubAddrId);
impl_clone!(SubAddrId);

impl SubAddrId {
  pub fn new(
    account: i64,
    address: u64,
  ) -> Self {
    let blsct_key_id = unsafe { gen_sub_addr_id(account, address) };
    BlsctObj::from_c_obj(blsct_key_id).into()
  }

  pub fn account(self) -> i64 {
    unsafe { get_sub_addr_id_account(self.value()) }
  }

  pub fn address(self) -> u64 {
    unsafe { get_sub_addr_id_address(self.value()) }
  }

  impl_value!(SubAddrId, BlsctSubAddrId);
}

impl BlsctSerde for SubAddrId {
  unsafe fn serialize(ptr: *const u8, _: usize) -> *const i8 {
    serialize_sub_addr_id(ptr as *const BlsctSubAddrId)
  }

  unsafe fn deserialize(hex: *const c_char) -> *mut BlsctRetVal {
    deserialize_sub_addr_id(hex)
  }
}

impl PartialEq for SubAddrId {
  fn eq(&self, other: &Self) -> bool {
    self.obj == other.obj 
  }
}

impl From<BlsctObj<SubAddrId, BlsctSubAddrId>> for SubAddrId {
  fn from(obj: BlsctObj<SubAddrId, BlsctSubAddrId>) -> SubAddrId {
    SubAddrId { obj }
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::initializer::init;

  #[test]
  fn test_account() {
    init();
    let a = SubAddrId::new(123, 456);
    assert_eq!(a.account(), 123);
  }

  #[test]
  fn test_address() {
    init();
    let a = SubAddrId::new(123, 456);
    assert_eq!(a.address(), 456);
  }

  #[test]
  fn test_eq() {
    init();
    let a = SubAddrId::new(123, 456);
    let b = SubAddrId::new(234, 567);

    assert!(a == a);
    assert!(a != b);
    assert!(b != a);
    assert!(b == b);
  }

  #[test]
  fn test_deser() {
    init();
    let a = SubAddrId::new(123, 456);
    let hex = bincode::serialize(&a).unwrap();
    let b = bincode::deserialize::<SubAddrId>(&hex).unwrap();
    assert_eq!(a, b);
  }
}

