use crate::{
  ctx::CTx,
  ctx_id::CTxId,
  ffi::TxOutputType,
  keys::child_key::ChildKey,
  out_point::OutPoint,
  keys::public_key::PublicKey,
  sub_addr::SubAddr,
  sub_addr_id::SubAddrId,
  token_id::TokenId,
  tx_in::TxIn,
  tx_out::TxOut,
};

pub fn gen_ctx() -> CTx {
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

