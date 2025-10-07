pub struct CTxIn();

/*
use crate::{
  blsct_obj::BlsctObj,
  blsct_serde::BlsctSerde, 
  ffi::{
    BlsctOutPoint,
    BlsctRetVal,
    BlsctScalar,
    BlsctCTxIn,
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
pub struct CTxIn {
  obj: BlsctObj<CTxIn, BlsctCTxIn>,
}

impl_clone!(CTxIn);
impl_display!(CTxIn);
impl_from_retval!(CTxIn);

impl CTxIn {
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

  impl_value!(CTxIn, BlsctCTxIn);
}

impl BlsctSerde for CTxIn {
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

impl From<BlsctObj<CTxIn, BlsctCTxIn>> for CTxIn {
  fn from(obj: BlsctObj<CTxIn, BlsctCTxIn>) -> CTxIn {
    CTxIn { obj }
  }
}

impl PartialEq for CTxIn {
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

  fn gen_tx_in(amount: u64) -> CTxIn {
    let spending_key = {
      let child_key = ChildKey::random();
      child_key.to_tx_key().to_spending_key()
    };
    let out_point = {
      let ctx_id = CTxId::random();
      OutPoint::new(&ctx_id, 56)
    };
    let token_id = TokenId::default();
    CTxIn::new(
      amount,
      42,
      &spending_key,
      &token_id,
      &out_point,
      false,
      false,
    )
  }

  #[test]
  fn test_amount() {
    init();
    let tx_in = gen_tx_in(123);
    let amount = tx_in.amount();
    assert_eq!(amount, 123);
  }
}
*/

/*
export class CTxIn extends ManagedObj {
  constructor(obj: any) {
    super(obj)
  }

  override value(): any {
    return castToCTxIn(this.obj)
  }

  /** Returns the transaction ID of the previous output being spent.
   * @returns The transaction ID of the previous output.
   */
  getPrevOutHash(): CTxId {
    const obj = getCTxInPrevOutHash(this.value())
    return CTxId.fromObj(obj)
  }

  /** Returns the index of the previous output being spent.
   * @returns The index of the previous output.
   */
  getPrevOutN(): number {
    return getCTxInPrevOutN(this.value())
  }

  /** Returns the `scriptSig` of the input.
   * @returns The `scriptSig`.
   */
  getScriptSig(): Script {
    const obj = getCTxInScriptSig(this.value())
    return Script.fromObj(obj)
  }

  /** Returns the sequence number of the input.
   * @returns The sequence number.
   */
  getSequence(): number {
    return getCTxInSequence(this.value())
  }

  /** Returns the `scriptWitness` of the input.
   * @returns The `scriptWitness`.
   */
  getScriptWitness(): Script {
    const obj = getCTxInScriptWitness(this.value())
    return Script.fromObj(obj)
  }

  override serialize(): string {
    const buf = castToUint8_tPtr(this.value())
    return toHex(buf, this.size())
  }

  /** Deserializes a `CTxIn` from its hexadecimal representation.
   * @param hex - The hexadecimal string to deserialize.
   * @returns A new `CTxIn` instance.
   */
  static deserialize(
    this: new (obj: any) => CTxIn,
    hex: string
  ): CTxIn {
    if (hex.length % 2 !== 0) {
      hex = `0${hex}`
    }
    const obj = hexToMallocedBuf(hex)
    const x = new CTxIn(obj)
    x.objSize = hex.length / 2 
    return x
  }
}
*/
