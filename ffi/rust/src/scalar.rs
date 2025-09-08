use crate::blsct_obj::BlsctObj;
use crate::blsct_serde::BlsctSerde;
use crate::ffi::{
  BlsctRetVal,
  BlsctScalar,
  deserialize_scalar,
  gen_scalar,
  gen_random_scalar,
  is_scalar_equal,
  scalar_to_uint64,
  serialize_scalar,
};
use crate::macros::impl_from_retval;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct Scalar {
  obj: BlsctObj<Scalar>,
}

impl_from_retval!(Scalar);

impl Scalar {
  pub fn new(n: u64) -> Result<Self, &'static str> {
    Self::from_retval(unsafe { gen_scalar(n) })
  }

  pub fn random() -> Result<Self, &'static str> {
    Self::from_retval(unsafe { gen_random_scalar() })
  }
}

impl BlsctSerde for Scalar {
  unsafe fn serialize(ptr: *const u8) -> *const i8 {
    serialize_scalar(ptr as *const BlsctScalar)
  }

  unsafe fn deserialize(hex: *const i8) -> *mut BlsctRetVal {
    deserialize_scalar(hex)
  }
}

impl From<Scalar> for u64 {
  fn from(scalar: Scalar) -> u64 {
    let blsct_scalar = scalar.obj.as_ptr() as *const BlsctScalar;
    unsafe { scalar_to_uint64(blsct_scalar) }
  }
}

impl PartialEq for Scalar {
  fn eq(&self, other: &Self) -> bool {
    unsafe { is_scalar_equal(
      self.obj.as_ptr() as *const BlsctScalar,
      other.obj.as_ptr() as *const BlsctScalar
    ) != 0 }
  }
}

impl Eq for Scalar {}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::ffi::init;
  use bincode;

  #[test]
  fn test_new() {
    init();

    let scalar = Scalar::new(123).unwrap();
    let scalar_u64: u64 = scalar.into();
    
    assert!(scalar_u64 == 123);
  }

  #[test]
  fn test_random() {
    init();

    let mut prev: u64 = 0;
    let mut dup_tolerance = 5;

    for _ in 0..1000 {
      let scalar = Scalar::random().unwrap();
      let scalar_u64: u64 = scalar.into();
      
      if prev == scalar_u64 {
        dup_tolerance -= 1;
        if dup_tolerance == 0 {
          panic!("random scalar generated the same value too many times");
        }
      } else {
        assert!(scalar_u64 != prev);
        prev = scalar_u64;
      }
    }
  }

  #[test]
  fn test_from() {
    init();

    let scalar = Scalar::new(12345).unwrap();
    let x: u64 = scalar.into();
    assert!(x == 12345);
  }

  #[test]
  fn test_eq() {
    init();

    let a = Scalar::new(123).unwrap();
    let b = Scalar::new(456).unwrap();

    assert!(a == a);
    assert!(a != b);
    assert!(b != a);
    assert!(b == b);
  }

  #[test]
  fn test_deser() {
    init();

    let a = Scalar::new(12345).unwrap();
    let hex = bincode::serialize(&a).unwrap();
    let b = bincode::deserialize::<Scalar>(&hex).unwrap();
    assert!(a == b);
  }
}

