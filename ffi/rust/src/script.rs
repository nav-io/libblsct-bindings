use crate::{
  blsct_obj::BlsctObj,
  blsct_serde::BlsctSerde, 
  ffi::{
    BlsctScript,
    BlsctRetVal,
    deserialize_script,
    SCRIPT_SIZE,
    serialize_script,
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
pub struct Script {
  obj: BlsctObj<Script, BlsctScript>,
}

impl_from_retval!(Script);
impl_display!(Script);
impl_clone!(Script);

impl Script {
  pub fn new(blsct_script: *mut BlsctScript) -> Self {
    BlsctObj::from_c_obj(blsct_script).into()
  }

  pub fn random() -> Self {
    let blsct_script = gen_random_malloced_buf::<SCRIPT_SIZE>();
    let obj = BlsctObj::from_c_obj(blsct_script);
    obj.into()
  }

  impl_value!(BlsctScript);
}

impl BlsctSerde for Script {
  unsafe fn serialize(ptr: *const u8, _: usize) -> *const i8 {
    serialize_script(ptr as *const BlsctScript)
  }

  unsafe fn deserialize(hex: *const c_char) -> *mut BlsctRetVal {
    deserialize_script(hex)
  }
}

impl PartialEq for Script {
  fn eq(&self, other: &Self) -> bool {
    self.obj == other.obj 
  }
}

impl From<BlsctObj<Script, BlsctScript>> for Script {
  fn from(obj: BlsctObj<Script, BlsctScript>) -> Script {
    Script { obj }
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::initializer::init;

  #[test]
  fn test_new() {
    init();
    let blsct_script = gen_random_malloced_buf::<SCRIPT_SIZE>();
    let _ = Script::new(blsct_script);
  }

  #[test]
  fn test_random() {
    init();
    let _ = Script::random();
  }

  #[test]
  fn test_eq() {
    init();
    let (a, b) = {
      loop {
        let a = Script::random();
        let b = Script::random();
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
    let a = Script::random();
    let hex = bincode::serialize(&a).unwrap();
    let b = bincode::deserialize::<Script>(&hex).unwrap();
    assert_eq!(a, b);
  }
}

