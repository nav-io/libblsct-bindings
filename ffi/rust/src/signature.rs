use crate::{
  blsct_obj::BlsctObj,
  blsct_serde::BlsctSerde, 
  ffi::{
    BlsctSignature,
    BlsctRetVal,
    deserialize_signature,
    serialize_signature,
    SIGNATURE_SIZE,
  },
  macros::{
    impl_clone,
    impl_display,
    impl_from_retval,
    impl_value,
  },
  util::gen_random_malloced_buf,
};
use serde::{Deserialize, Serialize};
use std::ffi::c_char;

#[derive(Debug, Deserialize, Serialize, Eq)]
pub struct Signature {
  obj: BlsctObj<Signature, BlsctSignature>,
}

impl_from_retval!(Signature);
impl_display!(Signature);
impl_clone!(Signature);

impl Signature {
  pub fn new(blsct_signature: *mut BlsctSignature) -> Self {
    BlsctObj::from_c_obj(blsct_signature).into()
  }

  pub fn random() -> Self {
    let blsct_signature = gen_random_malloced_buf::<SIGNATURE_SIZE>();
    let obj = BlsctObj::from_c_obj(blsct_signature);
    obj.into()
  }

  impl_value!(BlsctSignature);
}

impl BlsctSerde for Signature {
  unsafe fn serialize(ptr: *const u8, _: usize) -> *const i8 {
    serialize_signature(ptr as *const BlsctSignature)
  }

  unsafe fn deserialize(hex: *const c_char) -> *mut BlsctRetVal {
    deserialize_signature(hex)
  }
}

impl PartialEq for Signature {
  fn eq(&self, other: &Self) -> bool {
    self.obj == other.obj 
  }
}

impl From<BlsctObj<Signature, BlsctSignature>> for Signature {
  fn from(obj: BlsctObj<Signature, BlsctSignature>) -> Signature {
    Signature { obj }
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::initializer::init;

  #[test]
  fn test_new() {
    init();
    let blsct_signature = gen_random_malloced_buf::<SIGNATURE_SIZE>();
    let _ = Signature::new(blsct_signature);
  }

  #[test]
  fn test_random() {
    init();
    let _ = Signature::random();
  }

  #[test]
  fn test_eq() {
    init();
    let (a, b) = {
      loop {
        let a = Signature::random();
        let b = Signature::random();
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
    let a = Signature::random();
    let hex = bincode::serialize(&a).unwrap();
    let b = bincode::deserialize::<Signature>(&hex).unwrap();
    assert_eq!(a, b);
  }
}


