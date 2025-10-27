use crate::{
  blsct_obj::BlsctObj,
  ffi::{
    are_ctx_out_equal,
    BlsctScript,
    BlsctTokenId,
    get_ctx_out_script_pub_key,
    get_ctx_out_token_id,
    get_ctx_out_value,
    get_ctx_out_vector_predicate,
  },
  macros::impl_value_raw_const_obj,
  script::Script,
  token_id::TokenId,
};
use std::ffi::c_void;

#[derive(Debug)]
pub struct CTxOut {
  obj: *const c_void,
}

impl CTxOut {
  pub fn out_value(&self) -> u64 {
    unsafe { get_ctx_out_value(self.value()) }
  }

  pub fn script_pub_key(&self) -> Script {
    let c_obj = unsafe { get_ctx_out_script_pub_key(self.value()) };
    BlsctObj::<Script, BlsctScript>::from_c_obj(
      c_obj as *mut BlsctScript
    ).into()
  }

  pub fn token_id(&self) -> TokenId {
    let c_obj = unsafe { get_ctx_out_token_id(self.value()) };
    BlsctObj::<TokenId, BlsctTokenId>::from_c_obj(
      c_obj as *mut BlsctTokenId
    ).into()
  }

  // TODO handle varying size
  pub fn vector_predicate(&self) -> TokenId {
    let c_obj = unsafe { get_ctx_out_token_id(self.value()) };
    BlsctObj::<TokenId, BlsctTokenId>::from_c_obj(
      c_obj as *mut BlsctTokenId
    ).into()
  }

  impl_value_raw_const_obj!();
}

impl From<*const c_void> for CTxOut {
  fn from(obj: *const c_void) -> CTxOut {
    CTxOut { obj }
  }
}

impl PartialEq for CTxOut {
  fn eq(&self, other: &Self) -> bool {
    unsafe { are_ctx_out_equal(self.value(), other.value()) }
  }
}

impl Eq for CTxOut {}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::{
    initializer::init,
    test_util::gen_ctx,
  };
  
  fn get_ctx_out() -> CTxOut {
    let ctx = gen_ctx();
    let ctx_outs = ctx.get_ctx_outs();
    let ctx_out = ctx_outs.get_ctx_out_at(0).unwrap();
    ctx_out
  }

  #[test]
  fn test_prev_out_hash() {
    init();
    let ctx_out = get_ctx_out();
    //let _ = ctx_in.prev_out_hash();
  }
}

