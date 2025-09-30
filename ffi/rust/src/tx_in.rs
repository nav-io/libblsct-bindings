use crate::{
  blsct_obj::BlsctObj,
  blsct_serde::BlsctSerde, 
  ffi::{
    BlsctOutPoint,
    BlsctRetVal,
    BlsctScalar,
    BlsctTxIn,
    BlsctTokenId,
    buf_to_malloced_hex_c_str,
    build_tx_in,
    get_tx_in_amount,
    get_tx_in_gamma,
    get_tx_in_spending_key,
    get_tx_in_token_id,
    get_tx_in_out_point,
    get_tx_in_rbf,
    get_tx_in_staked_commitment,
    hex_to_malloced_buf,
    succ,
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
  token_id::TokenId,
};
use serde::{Deserialize, Serialize};
use std::ffi::{
  c_char,
  c_void,
  CStr,
};

#[derive(Debug, Deserialize, Serialize, Eq)]
pub struct TxIn {
  obj: BlsctObj<TxIn, BlsctTxIn>,
}

impl_clone!(TxIn);
impl_display!(TxIn);
impl_from_retval!(TxIn);

impl TxIn {
  pub fn new(
    amount: u64,
    gamma: u64,
    spending_key: &SpendingKey,
    token_id: &TokenId,
    out_point: &OutPoint,
    is_staked_commitment: bool,
    is_rbf: bool,
  ) -> Self {
    let rv = unsafe { build_tx_in(
      amount,
      gamma,
      spending_key.value(),
      token_id.value(),
      out_point.value(),
      is_staked_commitment,
      is_rbf,
    )};

    BlsctObj::from_retval(rv).unwrap().into()
  }

  pub fn amount(&self) -> u64 {
    unsafe { get_tx_in_amount(self.value()) }
  }

  pub fn gamma(&self) -> u64 {
    unsafe { get_tx_in_gamma(self.value()) }
  }

  pub fn spending_key(&self) -> SpendingKey {
    let rv = unsafe { get_tx_in_spending_key(self.value()) };
    BlsctObj::<Scalar, BlsctScalar>::from_c_obj(rv).into()
  }

  pub fn token_id(&self) -> TokenId {
    let rv = unsafe { get_tx_in_token_id(self.value()) };
    BlsctObj::<TokenId, BlsctTokenId>::from_c_obj(rv).into()
  }

  pub fn out_point(&self) -> OutPoint {
    let rv = unsafe { get_tx_in_out_point(self.value()) };
    BlsctObj::<OutPoint, BlsctOutPoint>::from_c_obj(rv).into()
  }

  pub fn is_staked_commitment(&self) -> bool {
    unsafe { get_tx_in_staked_commitment(self.value()) }
  }

  pub fn is_rbf(&self) -> bool {
    unsafe { get_tx_in_rbf(self.value()) }
  }

  impl_value!(TxIn, BlsctTxIn);
}

impl BlsctSerde for TxIn {
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

impl From<BlsctObj<TxIn, BlsctTxIn>> for TxIn {
  fn from(obj: BlsctObj<TxIn, BlsctTxIn>) -> TxIn {
    TxIn { obj }
  }
}

impl PartialEq for TxIn {
  fn eq(&self, other: &Self) -> bool {
    self.amount() == other.amount()
      && self.gamma() == other.gamma()
      && self.spending_key() == other.spending_key()
      && self.token_id() == other.token_id()
      && self.out_point() == other.out_point()
      && self.is_staked_commitment() == other.is_staked_commitment()
      && self.is_rbf() == other.is_rbf()
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::{
    ctx_id::CTxId,
    initializer::init,
    keys::child_key::ChildKey,
    out_point::OutPoint,
    token_id::TokenId,
  };

  fn gen_tx_id(
    amount: u64,
    spending_key: &SpendingKey,
    out_point: &OutPoint,
  ) -> TxIn {
    let token_id = &TokenId::default();
    TxIn::new(
      amount,
      42,
      spending_key,
      token_id,
      out_point,
      false,
      false,
    )
  }

  fn gen_random_tx_id() -> TxIn {
    let spending_key = {
      let child_key = ChildKey::random();
      child_key.to_tx_key().to_spending_key()
    };
    let out_point = OutPoint::new(&CTxId::random(), 2);
    gen_tx_id(123, &spending_key, &out_point)
  }

  #[test]
  fn test_amount() {
    init();
    let tx_id = gen_random_tx_id();
    let _ = tx_id.amount();
  }

  #[test]
  fn test_gamma() {
    init();
    let tx_id = gen_random_tx_id();
    let _ = tx_id.gamma();
  }

  #[test]
  fn test_spending_key() {
    init();
    let tx_id = gen_random_tx_id();
    let _ = tx_id.spending_key();
  }

  #[test]
  fn test_token_id() {
    init();
    let tx_id = gen_random_tx_id();
    let _ = tx_id.token_id();
  }

  #[test]
  fn test_out_point() {
    init();
    let tx_id = gen_random_tx_id();
    let _ = tx_id.out_point();
  }

  #[test]
  fn test_is_staked_commitment() {
    init();
    let tx_id = gen_random_tx_id();
    let _ = tx_id.is_staked_commitment();
  }

  #[test]
  fn test_is_rbf() {
    init();
    let tx_id = gen_random_tx_id();
    let _ = tx_id.is_rbf();
  }

  #[test]
  fn test_eq() {
    init();
    let spending_key = {
      let child_key = ChildKey::random();
      child_key.to_tx_key().to_spending_key()
    };
    let out_point = OutPoint::new(&CTxId::random(), 2);

    let a = gen_tx_id(123, &spending_key, &out_point);
    let b = gen_tx_id(456, &spending_key, &out_point);
    assert!(a == a);
    assert!(a != b);
    assert!(b != a);
    assert!(b == b);
  }

  #[test]
  fn test_deser() {
    init();
    let spending_key = {
      let child_key = ChildKey::random();
      child_key.to_tx_key().to_spending_key()
    };
    let out_point = OutPoint::new(&CTxId::random(), 2);

    let a = gen_tx_id(123, &spending_key, &out_point);
    let hex = bincode::serialize(&a).unwrap();
    let b = bincode::deserialize::<TxIn>(&hex).unwrap();
    assert_eq!(a, b);
  }
}

