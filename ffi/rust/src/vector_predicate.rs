use crate::{
  blsct_obj::BlsctObj,
  blsct_serde::BlsctSerde, 
  ffi::{
    BlsctRetVal,
    BlsctVectorPredicate,
    deserialize_vector_predicate,
    are_vector_predicate_equal,
    serialize_vector_predicate,
  },
  macros::{
    impl_clone,
    impl_display,
    impl_from_retval,
    impl_size,
    impl_value,
  },
};
use serde::{Deserialize, Serialize};
use std::ffi::c_char;

#[derive(Debug, Deserialize, Serialize, Eq)]
pub struct VectorPredicate {
  obj: BlsctObj<VectorPredicate, BlsctVectorPredicate>,
}

impl_from_retval!(VectorPredicate);
impl_display!(VectorPredicate);
impl_clone!(VectorPredicate);

impl VectorPredicate {
  impl_size!();
  impl_value!(BlsctVectorPredicate);
}

impl BlsctSerde for VectorPredicate {
  unsafe fn serialize(
    ptr: *const u8,
    obj_size: usize,
  ) -> *const i8 {
    serialize_vector_predicate(
      ptr as *const BlsctVectorPredicate,
      obj_size,
    )
  }

  unsafe fn deserialize(
    hex: *const c_char,
  ) -> *mut BlsctRetVal {
    deserialize_vector_predicate(hex)
  }
}

impl PartialEq for VectorPredicate {
  fn eq(&self, other: &Self) -> bool {
    unsafe {
      are_vector_predicate_equal(
        self.value(),
        self.size(),
        other.value(),
        other.size(),
      ) != 0
    }
  }
}

impl From<BlsctObj<VectorPredicate, BlsctVectorPredicate>> for VectorPredicate {
  fn from(obj: BlsctObj<VectorPredicate, BlsctVectorPredicate>) -> VectorPredicate {
    VectorPredicate { obj }
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::{
    initializer::init,
  };
  use std::ffi::c_void;

  fn gen_vector_predicate(n: u8) -> VectorPredicate {
    const OBJ_SIZE: usize = 5;

    let c_obj = unsafe {
      let c_obj = libc::malloc(OBJ_SIZE) as *mut BlsctVectorPredicate;
      for i in 0..OBJ_SIZE {
        *c_obj.add(i) = n;
      }
      c_obj
    };
    let obj: BlsctObj<VectorPredicate, BlsctVectorPredicate> =
      BlsctObj::from_c_obj_and_size(
        c_obj as *mut c_void, 
        OBJ_SIZE,
      );
    obj.into()
  }

  #[test]
  fn test_eq() {
    init();
    let a = gen_vector_predicate(1);
    let b = gen_vector_predicate(1);
    let c = gen_vector_predicate(2);

    assert_eq!(a, a);
    assert_eq!(b, b);
    assert_eq!(c, c);

    assert_eq!(a, b);
    assert_ne!(a, c);
    assert_ne!(b, c);
  }

  #[test]
  fn test_deser() {
    init();
    let a = gen_vector_predicate(2);
    let hex = bincode::serialize(&a).unwrap();
    let b = bincode::deserialize::<VectorPredicate>(&hex).unwrap();
    assert_eq!(a, b);
  }
}


