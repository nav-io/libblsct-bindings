use crate::{
  blsct_obj::BlsctObj,
  blsct_serde::BlsctSerde, 
  ffi::{
    BlsctCTxId,
    BlsctRetVal,
    CTX_ID_SIZE,
    deserialize_ctx_id,
    serialize_ctx_id,
  },
  macros::{
    impl_clone,
    impl_display,
    impl_from_retval,
    impl_value,
  },
};
use rand::Rng;
use serde::{Deserialize, Serialize};
use std::{
  ffi::c_char,
  ptr,
};

#[derive(Debug, Deserialize, Serialize, Eq)]
pub struct CTxId {
  obj: BlsctObj<CTxId, BlsctCTxId>,
}

impl_from_retval!(CTxId);
impl_display!(CTxId);
impl_clone!(CTxId);

impl CTxId {
  pub fn random() -> CTxId {
    // create a random vector of size CTX_ID_SIZE
    let mut rng = rand::rng();
    let mut buf = vec![0u8; CTX_ID_SIZE];
    rng.fill(&mut buf[..]);

    // copy vec to malloced buf
    let c_obj = unsafe { libc::malloc(CTX_ID_SIZE) as *mut BlsctCTxId };
    assert!(!c_obj.is_null(), "malloc failed");
    unsafe {
      ptr::copy_nonoverlapping(buf.as_ptr(), c_obj as *mut u8, CTX_ID_SIZE);
    }

    let obj = BlsctObj::from_c_obj(c_obj);
    obj.into()
  }

  impl_value!(CTxId, BlsctCTxId);
}

impl BlsctSerde for CTxId {
  unsafe fn serialize(ptr: *const u8) -> *const i8 {
    serialize_ctx_id(ptr as *const BlsctCTxId)
  }

  unsafe fn deserialize(hex: *const c_char) -> *mut BlsctRetVal {
    deserialize_ctx_id(hex)
  }
}

impl From<BlsctObj<CTxId, BlsctCTxId>> for CTxId {
  fn from(obj: BlsctObj<CTxId, BlsctCTxId>) -> CTxId {
    CTxId { obj }
  }
}

impl PartialEq for CTxId {
  fn eq(&self, other: &Self) -> bool {
    self.obj == other.obj
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::initializer::init;

  #[test]
  fn test_deser() {
    init();

    let a = CTxId::random();
    let hex = bincode::serialize(&a).unwrap();
    let b = bincode::deserialize::<CTxId>(&hex).unwrap();
    assert!(a == b);
  }
}


