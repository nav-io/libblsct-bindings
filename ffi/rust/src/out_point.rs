use crate::{
  blsct_obj::BlsctObj,
  blsct_serde::BlsctSerde, 
  ctx_id::CTxId,
  ffi::{
    BlsctOutPoint,
    BlsctRetVal,
    deserialize_out_point,
    gen_out_point,
    get_out_point_n,
    serialize_out_point,
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
pub struct OutPoint {
  obj: BlsctObj<OutPoint, BlsctOutPoint>,
}

impl_from_retval!(OutPoint);
impl_display!(OutPoint);
impl_clone!(OutPoint);

impl OutPoint {
  pub fn new(ctx_id: &CTxId, index: u32) -> Self {
    let rv = unsafe { gen_out_point(ctx_id.value() as *const c_char, index) };
    BlsctObj::from_retval(rv).unwrap().into()
  }

  pub fn index(&self) -> u32 {
    unsafe { get_out_point_n(self.value()) }
  }

  impl_value!(OutPoint, BlsctOutPoint);
}

impl BlsctSerde for OutPoint {
  unsafe fn serialize(ptr: *const u8, _: usize) -> *const i8 {
    serialize_out_point(ptr as *const BlsctOutPoint)
  }

  unsafe fn deserialize(hex: *const c_char) -> *mut BlsctRetVal {
    deserialize_out_point(hex)
  }
}

impl PartialEq for OutPoint {
  fn eq(&self, other: &Self) -> bool {
    let self_n = unsafe { get_out_point_n(self.value()) };
    let other_n = unsafe { get_out_point_n(other.value()) };
    self.obj == other.obj && self_n == other_n
  }
}

impl From<BlsctObj<OutPoint, BlsctOutPoint>> for OutPoint {
  fn from(obj: BlsctObj<OutPoint, BlsctOutPoint>) -> OutPoint {
    OutPoint { obj }
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::{
    ctx_id::CTxId,
    initializer::init,
  };

  #[test]
  fn test_index() {
    init();
    let ctx_id = CTxId::random();
    let index = 3;
    let a = OutPoint::new(&ctx_id, index);
    assert_eq!(a.index(), 3);
  }

  #[test]
  fn test_deser() {
    init();
    let ctx_id = CTxId::random();
    let index = 3;
    let a = OutPoint::new(&ctx_id, index);
    let hex = bincode::serialize(&a).unwrap();
    let b = bincode::deserialize::<OutPoint>(&hex).unwrap();
    assert_eq!(a, b);
  }
}

