use crate::blsct_obj::BlsctObj;
use crate::blsct_serde::BlsctSerde;
use crate::ffi::{
  BlsctPoint,
  BlsctRetVal,
  deserialize_point,
  gen_base_point,
  gen_random_point,
  is_point_equal,
  serialize_point,
};
use crate::macros::impl_from_retval;
use crate::scalar::Scalar;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct Point {
  obj: BlsctObj<Point>,
}

impl_from_retval!(Point);

impl Point {
  pub fn base() -> Result<Self, &'static str> {
    Self::from_retval(unsafe { gen_base_point() })
  }

  pub fn random() -> Result<Self, &'static str> {
    Self::from_retval(unsafe { gen_random_point() })
  }

  pub fn is_valid(&self) -> boolean {
    return is_valid_point(self.obj)
  }
}

impl From<Scalar> for Point {
  fn from(scalar: &Scalar) -> Point {
    let obj = point_from_scalar(scalar.obj);
    Point { obj }
  }
}

  override toString(): string {
    const s = pointToStr(this.value())
    return `Point(${s})`
  }


impl BlsctSerde for Point {
  unsafe fn serialize(ptr: *const u8) -> *const i8 {
    serialize_point(ptr as *const BlsctPoint)
  }

  unsafe fn deserialize(hex: *const i8) -> *mut BlsctRetVal {
    deserialize_point(hex)
  }
}
impl PartialEq for Point {
  fn eq(&self, other: &Self) -> bool {
    unsafe { is_point_equal(
      self.obj.as_ptr() as *const BlsctPoint,
      other.obj.as_ptr() as *const BlsctPoint
    ) != 0 }
  }
}

impl Eq for Point {}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::ffi::init;
  use bincode;

  #[test]
  fn test_base() {
    init();
  }

  #[test]
  fn test_random() {
    init();

    let mut prev: Point = Point::base().unwrap();
    let mut dup_tolerance = 5;

    for _ in 0..1000 {
      let x = Point::random().unwrap();
      
      if prev == x {
        dup_tolerance -= 1;
        if dup_tolerance == 0 {
          panic!("Point.random() generated the same point too many times");
        }
      } else {
        assert!(x != prev);
        prev = x;
      }
    }
  }

  #[test]
  fn test_eq() {
    init();

    let (a, b) = {
      loop {
        let a = Point::random().unwrap();
        let b = Point::random().unwrap();
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

    let a = Point::base().unwrap();
    let hex = bincode::serialize(&a).unwrap();
    let b = bincode::deserialize::<Point>(&hex).unwrap();
    assert!(a == b);
  }
}

