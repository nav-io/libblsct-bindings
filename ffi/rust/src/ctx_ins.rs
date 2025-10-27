use std::ffi::c_void;
use crate::{
  ctx_in::CTxIn,
  ffi::{
    are_ctx_ins_equal,
    get_ctx_in_at,
    get_ctx_ins_size,
  },
  macros::{
    impl_value_raw_const_obj,
  },
};

/* obj is an opaque pointer to:
 
   struct BlsctCTxIns {
     std::vector<CTxIn>* vec;
   };
*/
#[derive(Debug, Eq)]
pub struct CTxIns {
  obj: *const c_void,
}

impl CTxIns {
  pub fn get_ctx_in_at(&self, i: usize) -> Result<CTxIn, &str> {
    if i >= self.len() {
      return Err("index out of range");
    }
    let obj = unsafe { get_ctx_in_at(self.value(), i) };
    Ok(obj.into())
  }

  pub fn len(&self) -> usize {
    unsafe { get_ctx_ins_size(self.value()) }
  }

  impl_value_raw_const_obj!();
}

impl From<*const c_void> for CTxIns {
  fn from(obj: *const c_void) -> CTxIns {
    CTxIns { obj }
  }
}

impl PartialEq for CTxIns {
  fn eq(&self, other: &Self) -> bool {
    unsafe { are_ctx_ins_equal(self.value(), other.value()) }
  }
}

