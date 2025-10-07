use crate::{
  blsct_obj::BlsctObj,
  blsct_serde::BlsctSerde, 
  ctx_id::CTxId,
  ffi::{
    add_to_tx_in_vec,
    add_to_tx_out_vec,
    BlsctRetVal,
    BlsctCTx,
    BlsctCTxId,
    BlsctCTxIns,
    BlsctCTxOuts,
    BLSCT_IN_AMOUNT_ERROR,
    BLSCT_OUT_AMOUNT_ERROR,
    build_ctx,
    create_tx_in_vec,
    create_tx_out_vec,
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
    impl_value,
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
  ptr::NonNull,
};

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
  ) -> Result<Self, String> {
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
        return Err("Building ctx failed. Failed to allocate memory to rv".to_string());
      }

      let clean_up = || {
        delete_tx_in_vec(vp_tx_ins);
        delete_tx_out_vec(vp_tx_outs);
        free_obj(rv as *mut c_void);
      };

      if (*rv).result == 0 {
        let ser_ctx = NonNull::<u8>::new((*rv).ser_ctx).unwrap();
        let obj = BlsctObj::<CTx, BlsctCTx>::new(ser_ctx, (*rv).ser_ctx_size);
        clean_up();
        Ok(obj.into())

      } else {
        let msg = {
          match (*rv).result {
            BLSCT_IN_AMOUNT_ERROR => {
              let in_index = (*rv).in_amount_err_index;
              format!("Building ctx failed. tx_ins[{in_index}] has an invalid amount")
            },
            BLSCT_OUT_AMOUNT_ERROR => {
              let out_index = (*rv).out_amount_err_index;
              format!("Building ctx failed. tx_outs[{out_index}] has an invalid amount")
            },
            err_code => {
              format!("Building ctx failed. error code = {err_code}")
            }
          }
        };
        clean_up();
        Err(msg)
      } 
    }
  }

  pub fn get_ctx_id(&self) -> CTxId {
    let rv = unsafe { 
      let c_str_hex = get_ctx_id(self.value(), self.obj.size());
      deserialize_ctx_id(c_str_hex)
    };
    let obj = BlsctObj::<CTxId, BlsctCTxId>::from_retval(rv).unwrap();
    obj.into()
  }

  pub fn get_ctx_ins(&self) -> *const BlsctCTxIns {
    unsafe { get_ctx_ins(self.value(), self.obj.size()) }
  }

  pub fn get_ctx_outs(&self) -> *const BlsctCTxOuts {
    unsafe { get_ctx_outs(self.value(), self.obj.size()) }
  }

  impl_value!(CTx, BlsctCTx);
}

impl BlsctSerde for CTx {
  unsafe fn serialize(ptr: *const u8, size: usize) -> *const i8 {
    serialize_ctx(ptr, size)
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
    ctx_id::CTxId,
    ffi::{
      get_ctx_ins_size,
      get_ctx_outs_size,
      TxOutputType,
    },
    initializer::init,
    keys::child_key::ChildKey,
    out_point::OutPoint,
    keys::public_key::PublicKey,
    sub_addr::SubAddr,
    sub_addr_id::SubAddrId,
    token_id::TokenId,
  };

  fn gen_ctx() -> CTx {
    let spending_key = ChildKey::random().to_tx_key().to_spending_key();
    let out_point = {
      let ctx_id = CTxId::random();
      OutPoint::new(&ctx_id, 0)
    };
    let num_tx_in = 1;
    let num_tx_out = 1;
    let default_fee = 200000;
    let fee = (num_tx_in + num_tx_out) * default_fee;
    let out_amount = 10000;
    let in_amount = fee + out_amount;

    let tx_in = TxIn::new(
      in_amount, 
      100,
      &spending_key,
      &TokenId::default(), 
      &out_point,
      false, 
      false
    );

    let destination = {
      let view_key = ChildKey::random().to_tx_key().to_view_key();
      let spending_pub_key = PublicKey::random();
      let sub_addr_id = SubAddrId::new(67, 78);
      SubAddr::new(
        &view_key,
        &spending_pub_key, 
        &sub_addr_id,
      )
    };
    let tx_out = TxOut::new(
      &destination, 
      out_amount, 
      "navio",
      &TokenId::default(), 
      TxOutputType::Normal,
      0,
    );

    let tx_ins = vec![tx_in];
    let tx_outs = vec![tx_out];
    CTx::new(&tx_ins, &tx_outs).unwrap()
  }

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
    let ctx_ins_size = unsafe { get_ctx_ins_size(ctx_ins) };
    assert_eq!(ctx_ins_size, 1);
  }

  #[test]
  fn test_get_ctx_outs() {
    init();
    let ctx = gen_ctx();
    let ctx_outs = ctx.get_ctx_outs();
    let ctx_outs_size = unsafe { get_ctx_outs_size(ctx_outs) };
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

