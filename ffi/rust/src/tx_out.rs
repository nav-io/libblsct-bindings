use crate::{
  blsct_obj::BlsctObj,
  blsct_serde::BlsctSerde, 
  ffi::{
    BlsctRetVal,
    BlsctScalar,
    BlsctSubAddr,
    BlsctTxOut,
    BlsctTokenId,
    buf_to_malloced_hex_c_str,

    build_tx_out,
    get_tx_out_destination,
    get_tx_out_amount,
    get_tx_out_memo,
    get_tx_out_token_id,
    get_tx_out_output_type,
    get_tx_out_min_stake,

    hex_to_malloced_buf,
    succ,
    TxOutputType,
  },
  keys::child_key_desc::tx_key_desc::spending_key::SpendingKey,
  macros::{
    impl_clone,
    impl_display,
    impl_from_retval,
    impl_value,
  },
  out_point::OutPoint,
  scalar::Scalar,
  sub_addr::SubAddr,
  token_id::TokenId,
};
use serde::{Deserialize, Serialize};
use std::ffi::{
  c_char,
  c_void,
  CStr,
};

#[derive(Debug, Deserialize, Serialize, Eq)]
pub struct TxOut {
  obj: BlsctObj<TxOut, BlsctTxOut>,
}

impl_clone!(TxOut);
impl_display!(TxOut);
impl_from_retval!(TxOut);

impl TxOut {
  pub fn new(
    destination: &SubAddr,
    amount: u64,
    memo: &str,
    token_id: &TokenId,  
    output_type: TxOutputType,
    min_stake: u64,
  ) -> Self {
    let rv = unsafe { build_tx_out(
      destination.value(),
      amount,
      memo.as_ptr() as *const c_char,
      token_id.value(),
      output_type,
      min_stake,
    )};

    BlsctObj::from_retval(rv).unwrap().into()
  }

  pub fn destination(&self) -> SubAddr {
    let obj = unsafe {
      get_tx_out_destination(self.value())
    } as *mut BlsctSubAddr;
    BlsctObj::<SubAddr, BlsctSubAddr>::from_c_obj(obj).into()
  }

  pub fn amount(&self) -> u64 {
    unsafe { get_tx_out_amount(self.value()) }
  }

  pub fn memo(&self) -> String {
    let c_str = unsafe {
      let ptr = get_tx_out_memo(self.value());
      CStr::from_ptr(ptr)
    };
    c_str.to_str().expect("Malformed c-string found").to_string()
  }

  pub fn token_id(&self) -> TokenId {
    let obj = unsafe {
      get_tx_out_token_id(self.value())
    } as *mut BlsctTokenId;
    BlsctObj::<TokenId, BlsctTokenId>::from_c_obj(obj).into()
  }

  pub fn output_type(&self) -> TxOutputType {
    unsafe { get_tx_out_output_type(self.value()) }
  }
  pub fn min_stake(&self) -> u64 {
    unsafe { get_tx_out_min_stake(self.value()) }
  }

  impl_value!(TxOut, BlsctTxOut);
}

impl BlsctSerde for TxOut {
  unsafe fn serialize(ptr: *const u8, size: usize) -> *const i8 {
    buf_to_malloced_hex_c_str(ptr, size) as *const i8
  }

  unsafe fn deserialize(hex: *const c_char) -> *mut BlsctRetVal {
    let buf = hex_to_malloced_buf(hex);
    let len = CStr::from_ptr(hex).to_str()
      .expect("Malformed c-string found").len() / 2;
    succ(buf as *mut c_void, len) 
  }
}

impl From<BlsctObj<TxOut, BlsctTxOut>> for TxOut {
  fn from(obj: BlsctObj<TxOut, BlsctTxOut>) -> TxOut {
    TxOut { obj }
  }
}

impl PartialEq for TxOut {
  fn eq(&self, other: &Self) -> bool {
    self.destination() == other.destination()
      && self.amount() == other.amount()
      && self.memo() == other.memo()
      && self.token_id() == other.token_id()
      && self.output_type() == other.output_type()
      && self.min_stake() == other.min_stake()
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::{
    initializer::init,
    sub_addr::SubAddrId,
    token_id::TokenId,
    keys::{
      child_key::ChildKey,
      public_key::PublicKey,
    },
  };

  fn gen_tx_out(
  ) -> TxOut {
    let destination = {
      let view_key = ChildKey::random().to_tx_key().to_view_key();
      let sub_addr_id = SubAddrId::new(123, 456);
      let spending_pub_key = PublicKey::random();
      SubAddr::new(
        &view_key,
        &spending_pub_key, 
        &sub_addr_id
      )
    };
    let token_id = TokenId::defatul();
    TxOut::new(
      &destination,
      123,
      "navio",
      &token_id,  
      TxOutputType::Normal,
      0,
    )
  }

  #[test]
  fn test_eq() {
    init();

    //let a = gen_tx_id(123, &spending_key, &out_point);
    //let b = gen_tx_id(456, &spending_key, &out_point);
    assert!(a == a);
    assert!(a != b);
    assert!(b != a);
    assert!(b == b);
  }

  #[test]
  fn test_deser() {
    init();

    //let a = gen_tx_id(123, &spending_key, &out_point);
    let hex = bincode::serialize(&a).unwrap();
    let b = bincode::deserialize::<TxOut>(&hex).unwrap();
    assert_eq!(a, b);
  }
}

