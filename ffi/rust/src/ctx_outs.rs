use crate::{
  ctx_out::CTxOut,
  ffi::{
    are_ctx_outs_equal,
    get_ctx_out_at,
    get_ctx_outs_size,
  },
  macros::{
    impl_value_raw_const_obj,
  },
};
use std::ffi::c_void;

/* obj is an opaque pointer to:
 
   struct BlsctCTxOuts {
     std::vector<CTxOut>* vec;
   };
*/
#[derive(Debug)]
pub struct CTxOuts {
  obj: *const c_void,
}

impl CTxOuts {
  pub fn get_ctx_out_at(&self, i: usize) -> Result<CTxOut, &str> {
    if i >= self.len() {
      return Err("index out of range");
    }
    let obj = unsafe { get_ctx_out_at(self.value(), i) };
    Ok(obj.into())
  }

  pub fn len(&self) -> usize {
    unsafe { get_ctx_outs_size(self.value()) }
  }

  impl_value_raw_const_obj!();
}

impl From<*const c_void> for CTxOuts {
  fn from(obj: *const c_void) -> CTxOuts {
    CTxOuts { obj }
  }
}

impl PartialEq for CTxOuts {
  fn eq(&self, other: &Self) -> bool {
    unsafe { are_ctx_outs_equal(self.value(), other.value()) }
  }
}

