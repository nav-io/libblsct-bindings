use crate::{
  blsct_obj::BlsctObj,
  blsct_serde::BlsctSerde, 
  ffi::{
    BlsctPubKey,
    BlsctRetVal,
    calc_nonce,
    gen_random_public_key,
    get_public_key_point,
    malloc,
    point_to_public_key,
    POINT_SIZE,
    PUBLIC_KEY_SIZE,
    scalar_to_pub_key,
    serialize_point,
  },
  keys::child_key_desc::tx_key_desc::view_key::ViewKey,
  point::Point,
  scalar::Scalar,
};
use crate::macros::{
  impl_display,
  impl_from_retval,
  impl_value,
};
use serde::{Deserialize, Serialize};

#[derive(PartialEq, Eq, Debug, Deserialize, Serialize)]
pub struct PublicKey {
  obj: BlsctObj<PublicKey, BlsctPubKey>,
}

impl_from_retval!(PublicKey);
impl_display!(PublicKey);

impl PublicKey {
  pub fn random() -> Result<Self, &'static str> {
    Self::from_retval(unsafe { gen_random_public_key() })
  }

  pub fn generate_nonce(&self, view_key: &ViewKey) -> Self {
    let blsct_point = unsafe {
      calc_nonce(self.value(), view_key.value())
    };
    let obj = BlsctObj::from_c_obj(blsct_point);
    let point: Point = obj.into();
    (&point).into()
  }

  impl_value!(PublicKey, BlsctPubKey);
}

// since de/ser functions for PublicKey don't exist in libblsct,
// we implement them here
impl BlsctSerde for PublicKey {
  unsafe fn serialize(ptr: *const u8) -> *const i8 {
    // serialize the PublicKey as a Point
    let point = get_public_key_point(ptr as *const BlsctPubKey);
    serialize_point(point)
  }

  unsafe fn deserialize(hex: *const i8) -> *mut BlsctRetVal {
    // hex is a serialized Point
    let hex_c_str = std::ffi::CStr::from_ptr(hex as *const i8);
    let hex_str = hex_c_str.to_str().unwrap();
    let bytes = hex::decode(hex_str).unwrap();

    let mut buf = [0u8; POINT_SIZE];
    buf.copy_from_slice(&bytes);

    // convert Point back to PublicKey
    let blsct_pub_key = unsafe { point_to_public_key(&buf) };

    let rv_ptr = malloc(std::mem::size_of::<BlsctRetVal>()) as *mut BlsctRetVal;
    if rv_ptr.is_null() {
      panic!("Failed to allocate memory for BlsctRetVal");
    }

    *rv_ptr = BlsctRetVal {
      result: 0,
      value: blsct_pub_key as *const std::ffi::c_void,
      value_size: PUBLIC_KEY_SIZE,
    };
    rv_ptr
  }
}

impl From<&PublicKey> for Point {
  fn from(pub_key: &PublicKey) -> Point {
    let blsct_point = unsafe { get_public_key_point(pub_key.value()) };
    let obj = BlsctObj::from_c_obj(blsct_point);
    obj.into()
  }
}

impl From<BlsctObj<PublicKey, BlsctPubKey>> for PublicKey {
  fn from(obj: BlsctObj<PublicKey, BlsctPubKey>) -> PublicKey {
    PublicKey { obj }
  }
}

impl From<&Point> for PublicKey {
  fn from(point: &Point) -> PublicKey {
    let blsct_pub_key = unsafe { point_to_public_key(point.value()) };
    let obj = BlsctObj::from_c_obj(blsct_pub_key);
    obj.into()
  }
}

impl From<&Scalar> for PublicKey {
  fn from(scalar: &Scalar) -> PublicKey {
    let blsct_pub_key = unsafe { scalar_to_pub_key(scalar.value()) };
    let obj = BlsctObj::from_c_obj(blsct_pub_key);
    obj.into()
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::{
    ffi::init,
    keys::child_key::ChildKey,
  };
  use bincode;

  #[test]
  fn test_random() {
    init();

    let _: PublicKey = PublicKey::random().unwrap();
  }

  #[test]
  fn test_generate_nonce() {
    init();

    let pub_key = PublicKey::random().unwrap();
    let seed = Scalar::random().unwrap();
    let child_key = ChildKey::from_seed(&seed);
    let view_key = child_key.to_tx_key().to_view_key();
    let _: PublicKey = pub_key.generate_nonce(&view_key);
  }

  #[test]
  fn test_from_scalar() {
    init();

    let scalar = Scalar::random().unwrap();
    let _: PublicKey = (&scalar).into();
  }

  #[test]
  fn test_from_point() {
    init();

    let point = Point::random().unwrap();
    let _: PublicKey = (&point).into();
  }

  #[test]
  fn test_to_point() {
    init();

    let pub_key = PublicKey::random().unwrap();
    let _: Point = (&pub_key).into();
  }

  #[test]
  fn test_eq() {
    init();

    let (a, b) = {
      loop {
        let a = PublicKey::random().unwrap();
        let b = PublicKey::random().unwrap();
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

    let a = PublicKey::random().unwrap();
    let hex = bincode::serialize(&a).unwrap();
    let b = bincode::deserialize::<PublicKey>(&hex).unwrap();

    assert!(a == b);
  }
}

