use crate::{
  blsct_obj::{BlsctObj, self},
  blsct_serde::BlsctSerde, 
  ctx_id::CTxId,
  ctx_ins::CTxIns,
  ctx_outs::CTxOuts,
  ffi::{
    add_to_tx_in_vec,
    add_to_tx_out_vec,
    BlsctRetVal,
    BlsctCTx,
    BlsctCTxId,
    BLSCT_IN_AMOUNT_ERROR,
    BLSCT_OUT_AMOUNT_ERROR,
    build_ctx,
    create_tx_in_vec,
    create_tx_out_vec,
    delete_ctx,
    delete_tx_in_vec,
    delete_tx_out_vec,
    deserialize_ctx,
    deserialize_ctx_id,
    free_obj,
    get_ctx_id,
    get_ctx_ins,
    get_ctx_outs,
    serialize_ctx,
  },
  macros::{
    impl_clone,
    impl_display,
  },
  tx_in::TxIn,
  tx_out::TxOut,
};
use serde::{Deserialize, Serialize};
use std::{
  ffi::{
    c_char,
    c_void,
  },
  fmt,
  ptr::NonNull,
};

#[derive(Debug, PartialEq, Eq)]
pub enum Error {
  FailedToAllocateMemory,
  InAmountError(usize),
  OutAmountError(usize),
  FailedToBuildCTx(u8),
}

impl std::error::Error for Error {}

impl fmt::Display for Error {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    match self {
      Error::FailedToAllocateMemory =>
        write!(f, "Failed to allocate memory for CTx"),
      Error::InAmountError(index) =>
        write!(f, "Invalid in-amount found at {index}"),
      Error::OutAmountError(index) =>
        write!(f, "Invalid out-amount found at {index}"),
      Error::FailedToBuildCTx(e) =>
        write!(f, "Failed to build CTx: {e}"),
    }
  }
}

#[derive(Debug, Deserialize, Serialize, Eq)]
pub struct CTx {
  obj: BlsctObj<CTx, BlsctCTx>,
}

impl_display!(CTx);
impl_clone!(CTx);

impl CTx {
  pub fn new(
    tx_ins: &Vec<TxIn>,
    tx_outs: &Vec<TxOut>
  ) -> Result<Self, Error> {
    unsafe {
      let vp_tx_ins = create_tx_in_vec();
      let vp_tx_outs = create_tx_out_vec();

      for tx_in in tx_ins {
        add_to_tx_in_vec(vp_tx_ins, tx_in.value());
      }
      for tx_out in tx_outs {
        add_to_tx_out_vec(vp_tx_outs, tx_out.value());
      }
      let rv = build_ctx(vp_tx_ins, vp_tx_outs);
      if rv.is_null() {
        delete_tx_in_vec(vp_tx_ins);
        delete_tx_out_vec(vp_tx_outs);
        return Err(Error::FailedToAllocateMemory);
      }

      let clean_up = || {
        delete_tx_in_vec(vp_tx_ins);
        delete_tx_out_vec(vp_tx_outs);
        free_obj(rv as *mut c_void);
      };

      if (*rv).result == 0 {
        let vp_ctx = NonNull::<u8>::new((*rv).ctx as *mut u8).unwrap();
        let obj = BlsctObj::<CTx, BlsctCTx>::new_with_deallocator(vp_ctx, 0, Some(delete_ctx)); // size will not be used

        clean_up();
        Ok(obj.into())

      } else {
        let e = {
          match (*rv).result {
            BLSCT_IN_AMOUNT_ERROR => {
              let index = (*rv).in_amount_err_index;
              Error::InAmountError(index)
            },
            BLSCT_OUT_AMOUNT_ERROR => {
              let index = (*rv).out_amount_err_index;
              Error::OutAmountError(index)
            },
            err_code => {
              Error::FailedToBuildCTx(err_code)
            }
          }
        };
        clean_up();
        Err(e)
      } 
    }
  }

  pub fn get_ctx_id<'a>(&self) -> Result<CTxId, blsct_obj::Error<'a>> {
    let rv = unsafe { 
      let c_str_hex = get_ctx_id(self.value());
      deserialize_ctx_id(c_str_hex)
    };
    let obj = BlsctObj::<CTxId, BlsctCTxId>::from_retval(rv)?;
    Ok(obj.into())
  }

  pub fn get_ctx_ins(&self) -> CTxIns {
    let obj = unsafe { get_ctx_ins(self.value()) };
    obj.into()
  }

  pub fn get_ctx_outs(&self) -> CTxOuts {
    let obj = unsafe { get_ctx_outs(self.value()) };
    obj.into()
  }

  // not using impl_void_ptr_value!() to return *mut c_void
  // to avoid const_cast
  pub fn value(&self) -> *mut c_void {
    self.obj.as_ptr() as *mut c_void
  }
}

impl BlsctSerde for CTx {
  unsafe fn serialize(ptr: *const u8, _: usize) -> *const i8 {
    serialize_ctx(ptr as *mut c_void)
  }

  unsafe fn deserialize(hex: *const c_char) -> *mut BlsctRetVal {
    deserialize_ctx(hex)
  }
}

impl From<BlsctObj<CTx, BlsctCTx>> for CTx {
  fn from(obj: BlsctObj<CTx, BlsctCTx>) -> CTx {
    CTx { obj }
  }
}

impl PartialEq for CTx {
  fn eq(&self, other: &Self) -> bool {
    self.obj == other.obj
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::{
    ffi::{
      get_ctx_ins_size,
      get_ctx_outs_size,
    },
    initializer::init,
    test_util::gen_ctx,
  };

  #[test]
  fn test_get_ctx_id() {
    init();
    let ctx = gen_ctx();
    let _ = ctx.get_ctx_id();
  }

  #[test]
  fn test_get_ctx_ins() {
    init();
    let ctx = gen_ctx();
    let ctx_ins = ctx.get_ctx_ins();
    let ctx_ins_size = unsafe { get_ctx_ins_size(ctx_ins.value()) };
    assert_eq!(ctx_ins_size, 1);
  }

  #[test]
  fn test_get_ctx_outs() {
    init();
    let ctx = gen_ctx();
    let ctx_outs = ctx.get_ctx_outs();
    let ctx_outs_size = unsafe { get_ctx_outs_size(ctx_outs.value()) };
    assert_eq!(ctx_outs_size, 3);
  }

  #[test]
  fn test_deser() {
    init();
    let a = gen_ctx();
    let hex = bincode::serialize(&a).unwrap();
    let b = bincode::deserialize::<CTx>(&hex).unwrap();
    assert_eq!(a, b);
  }
}

