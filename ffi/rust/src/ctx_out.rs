use std::ffi::c_void;

#[derive(Debug)]
pub struct CTxOut {
  obj: *const c_void,
}

impl From<*const c_void> for CTxOut {
  fn from(obj: *const c_void) -> CTxOut {
    CTxOut { obj }
  }
}

