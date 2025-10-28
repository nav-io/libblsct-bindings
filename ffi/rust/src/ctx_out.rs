use crate::{
  blsct_obj::BlsctObj,
  ffi::{
    are_ctx_out_equal,
    BlsctScript,
    BlsctTokenId,
    BlsctVectorPredicate,
    get_ctx_out_script_pub_key,
    get_ctx_out_token_id,
    get_ctx_out_value,
    get_ctx_out_vector_predicate,
  },
  macros::impl_value_raw_const_obj,
  script::Script,
  token_id::TokenId,
  vector_predicate::VectorPredicate,
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

  pub fn vector_predicate(&self) -> Result<VectorPredicate, String> {
    let rv = unsafe { get_ctx_out_vector_predicate(self.value()) };
    let obj = BlsctObj::<VectorPredicate, BlsctVectorPredicate>::from_retval(rv)?;
    Ok(obj.into())
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
  fn test_out_value() {
    init();
    let ctx_out = get_ctx_out();
    let out_value = ctx_out.out_value();
    println!("OutValue={out_value}");
  }

  #[test]
  fn test_script_pub_key() {
    init();
    let ctx_out = get_ctx_out();
    let script_pub_key = ctx_out.script_pub_key();
    println!("ScriptPubKey={script_pub_key}");
  }

  #[test]
  fn test_token_id() {
    init();
    let ctx_out = get_ctx_out();
    let token_id = ctx_out.token_id();
    println!("TokenId: {}, {}", token_id.token(), token_id.subid());
  }

  #[test]
  fn test_vector_predicate() {
    init();
    let ctx_out = get_ctx_out();
    let vector_predicate = ctx_out.vector_predicate();
    println!("VectorPredicate={vector_predicate:?}");
  }
}

