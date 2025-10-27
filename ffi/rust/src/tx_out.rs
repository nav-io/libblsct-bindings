use crate::{
  blsct_obj::BlsctObj,
  blsct_serde::BlsctSerde, 
  ffi::{
    BlsctRetVal,
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
  macros::{
    impl_clone,
    impl_display,
    impl_from_retval,
    impl_value,
  },
  sub_addr::SubAddr,
  token_id::TokenId,
};
use serde::{Deserialize, Serialize};
use std::ffi::{
  c_char,
  c_void,
  CStr,
  CString,
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
    let memo_c_str = CString::new(memo)
      .expect("Failed to convert memo to c-str");

    let rv = unsafe { build_tx_out(
      destination.value(),
      amount,
      memo_c_str.as_ptr(),
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

  impl_value!(BlsctTxOut);
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
    keys::{
      child_key::ChildKey,
      public_key::PublicKey,
    },
    sub_addr_id::SubAddrId,
    token_id::TokenId,
  };

  fn gen_tx_out(sub_addr_id: &SubAddrId) -> TxOut {
    let destination = {
      let view_key = ChildKey::random().to_tx_key().to_view_key();
      let spending_pub_key = PublicKey::random();
      SubAddr::new(
        &view_key,
        &spending_pub_key, 
        &sub_addr_id
      )
    };
    let token_id = TokenId::default();

    TxOut::new(
      &destination,
      123,
      "navio",
      &token_id,  
      TxOutputType::Normal,
      5,
    )
  }

  #[test]
  fn test_destination() {
    init();
    let sub_addr_id = SubAddrId::new(123, 456);
    let tx_out = gen_tx_out(&sub_addr_id);
    let _dest = tx_out.destination();
  }

  #[test]
  fn test_amount() {
    init();
    let sub_addr_id = SubAddrId::new(123, 456);
    let tx_out = gen_tx_out(&sub_addr_id);
    let amount = tx_out.amount();
    assert_eq!(amount, 123);
  }

  #[test]
  fn test_memo() {
    init();
    let sub_addr_id = SubAddrId::new(123, 456);
    let tx_out = gen_tx_out(&sub_addr_id);
    let memo = tx_out.memo();
    assert_eq!(&memo, "navio");
  }

  #[test]
  fn test_token_id() {
    init();
    let sub_addr_id = SubAddrId::new(123, 456);
    let tx_out = gen_tx_out(&sub_addr_id);
    let token_id = tx_out.token_id();
    assert_eq!(token_id, TokenId::default());
  }

  #[test]
  fn test_output_type() {
    init();
    let sub_addr_id = SubAddrId::new(123, 456);
    let tx_out = gen_tx_out(&sub_addr_id);
    let output_type = tx_out.output_type();
    assert_eq!(output_type, TxOutputType::Normal);
  }

  #[test]
  fn test_min_stake() {
    init();
    let sub_addr_id = SubAddrId::new(123, 456);
    let tx_out = gen_tx_out(&sub_addr_id);
    let min_stake = tx_out.min_stake();
    assert_eq!(min_stake, 5);
  }

  #[test]
  fn test_eq() {
    init();

    let a = {
      let sub_addr_id = SubAddrId::new(123, 456);
      gen_tx_out(&sub_addr_id)
    };
    let b = {
      let sub_addr_id = SubAddrId::new(234, 567);
      gen_tx_out(&sub_addr_id)
    };

    assert!(a == a);
    assert!(a != b);
    assert!(b != a);
    assert!(b == b);
  }

  #[test]
  fn test_deser() {
    init();

    let a = {
      let sub_addr_id = SubAddrId::new(123, 456);
      gen_tx_out(&sub_addr_id)
    };
    let hex = bincode::serialize(&a).unwrap();
    let b = bincode::deserialize::<TxOut>(&hex).unwrap();
    assert_eq!(a, b);
  }
}

