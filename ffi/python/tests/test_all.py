from blsct import (
  Address,
  AddressEncoding,
  AmountRecoveryReq,
  BlindingKey,
  ChildKey,
  DoublePublicKey,
  HashId,
  OutPoint,
  Point,
  PrivSpendingKey,
  PublicKey,
  RangeProof,
  Scalar,
  Signature,
  SpendingKey,
  SubAddr,
  SubAddrId,
  TokenId,
  TokenKey,
  Ctx,
  CtxId,
  TxIn,
  TxOut,
  TxKey,
  ViewKey,
  ViewTag,
)

import secrets

def test_scalar():
  s1 = Scalar.random()
  print(s1)
  print(f"Scalar({s1.serialize()})")

  s2 = Scalar.random()
  assert(s1 != s2), "Random scalars should not be equal"
  assert(s1 == s1), "The same scalar should be equal"
  assert(s2 == s2), "The same scalar should be equal"

  s3 = Scalar.deserialize(s1.serialize())
  assert(s1 == s3), "Deserializing serialized Scalar should produce the original Scalar"

def test_point():
  p1 = Point.random()
  print(p1)

  p2 = Point.random()
  assert(p1 != p2), "Random Points should not be equal"
  assert(p1 == p1), "The same Point should be equal"
  assert(p2 == p2), "The same Point should be equal"

  p3 = Point.deserialize(p1.serialize())
  assert(p1 == p3), "Deserializing serialized Point should produce the original Point"

  p4 = Point.base()
  assert p4.is_valid(), "Base Point should be valid"

def test_public_key():
  pk1 = PublicKey.random()
  print(pk1)

  pk2 = PublicKey.random()
  assert(pk1 != pk2), "Random PublicKey should not be equal"
  assert(pk1 == pk1), "The same PublicKey should be equal"
  assert(pk2 == pk2), "The same PublicKey should be equal"

  pk3 = PublicKey.deserialize(pk1.serialize())
  assert(pk1 == pk3), "Deserializing serialized value should produce the original value"

def test_double_public_key():
  pk1 = PublicKey()
  pk2 = PublicKey()
  dpk = DoublePublicKey.from_public_keys(pk1, pk2)
  print(dpk)

  with DoublePublicKey.from_public_keys(PublicKey.random(), PublicKey.random()) as dpk:
    print(dpk)

def test_address():
  pk1 = PublicKey()
  pk2 = PublicKey()
  dpk = DoublePublicKey.from_public_keys(pk1, pk2)

  enc_addr = Address.encode(dpk, AddressEncoding.Bech32)
  print(f"Address: {enc_addr}")

  dec_dpk = Address.decode(enc_addr)
  print(f"Decoded Address: {dec_dpk}")

  assert enc_addr == Address.encode(dec_dpk, AddressEncoding.Bech32), "Address encoding/decoding not working"

def test_token_id():
  token_id_1 = TokenId()
  print(token_id_1)

  token_id_2 = TokenId.from_token(123)
  print(token_id_2)

  token_id_3 = TokenId.from_token_and_subid(123, 456)
  print(token_id_3)

  assert(token_id_3.token() == 123)
  assert(token_id_3.subid() == 456)

def test_range_proof():
  nonce1 = Point()
  token_id_1 = TokenId()

  rp1 = RangeProof([456], nonce1, 'navcoin', token_id_1)
  assert(RangeProof.verify_proofs([rp1]) == True)

  req1 = AmountRecoveryReq(rp1, nonce1)
  rec_res1 = RangeProof.recover_amounts([req1])
  for i, x in enumerate(rec_res1):
    print(f"Recovered amount {i}: {x}")

  assert(rec_res1[0].is_succ == True)
  assert(rec_res1[0].message == "navcoin")
  assert(rec_res1[0].amount == 456)

  # TODO fix:
  # - amount recovery fails for multiple requests. always the last request is set to [0] and the remaining elements all becomes False
  # - verification fails for non-default tokens 

  # nonce2 = Point.random()
  # token_id_2 = TokenId.from_token(2)
  #
  # rp2 = RangeProof.build([123], nonce2, 'navio', token_id_2)
  # assert(RangeProof.verify_proofs([rp2]) == True)
  #
  # req2 = AmountRecoveryReq(rp2, nonce2)
  # rec_res2 = RangeProof.recover_amounts([req2, req1])
  # for i, x in enumerate(rec_res2):
  #   print(f"Recovered amount {i}: {x}")
  #
  # assert(rec_res2[0].is_succ == True)
  # assert(rec_res2[0].message == "navcoin")
  # assert(rec_res2[0].amount == 456)
  # assert(rec_res2[1].is_succ == True)
  # assert(rec_res2[1].message == "navio")
  # assert(rec_res2[1].amount == 123)
  #
  # for i, x in enumerate(res):
  #   print(f"Recovered amount {i}: {x}")

def test_sig_gen_verify():
  msg = "navio"
  priv_key = Scalar.random()
  sig = Signature(priv_key, msg)
  print(f"Signature {sig}")

  pub_key = PublicKey.from_scalar(priv_key)
  is_sig_valid = sig.verify(msg, pub_key)
  print(f"sig verification: {is_sig_valid}")
  assert(is_sig_valid == True)

def test_key_derivation():
  seed = Scalar()
  print(f"Seed: {seed}")

  child_key = ChildKey(seed)
  print(f"ChildKey: {child_key.serialize()}")

  blinding_key = child_key.to_blinding_key()
  print(f"BlindingKey: {blinding_key.serialize()}")

  token_key = child_key.to_token_key()
  print(f"TokenKey: {token_key.serialize()}")

  tx_key = child_key.to_tx_key()
  print(f"TxKey: {tx_key.serialize()}")

  view_key = tx_key.to_view_key()
  print(f"ViewKey: {view_key.serialize()}")

  spending_key = tx_key.to_spending_key()
  print(f"SpendingKey: {spending_key.serialize()}")

  blinding_pub_key = PublicKey.from_scalar(blinding_key)
  print(f"blinding_pub_key: {blinding_pub_key}")

  account = 123
  address = 456

  priv_spending_key = PrivSpendingKey(
    blinding_pub_key,
    view_key,
    spending_key,
    account,
    address,
  )
  print(f"priv_spending_key: {priv_spending_key.serialize()}")

  view_tag = ViewTag(blinding_pub_key, view_key)
  print(f"view_tag: {view_tag}")

  spending_pub_key = PublicKey.from_scalar(spending_key)
  print(f"spending_pub_key: {spending_pub_key}")

  hash_id = HashId(
    blinding_pub_key,
    spending_pub_key,
    view_key,
  )
  print(f"hash_id: {hash_id}")

  nonce = PublicKey.generate_nonce(blinding_pub_key, view_key)
  print(f"nonce: {nonce}")

  sub_addr_id = SubAddrId(account, address)
  print(f"sub_addr_id: {sub_addr_id}")

  sub_addr = SubAddr(view_key, spending_pub_key, sub_addr_id)
  print(f"sub_addr: {sub_addr}")

  dpk = DoublePublicKey.from_keys_and_acct_addr(
    view_key,
    spending_pub_key,
    account,
    address,
  )
  print(f"dpk: {dpk}")

  # test also direct instantiation
  SpendingKey()
  ViewKey()
  BlindingKey()
  TokenKey()
  TxKey()
  ChildKey(Scalar())
  DoublePublicKey()
  PrivSpendingKey(PublicKey(), ViewKey(), SpendingKey(), 1, 2)
  PublicKey()
  ViewKey()
  ViewTag(PublicKey(), ViewKey())

def test_tx():
  num_tx_in = 1
  num_tx_out = 1
  default_fee = 200000
  fee = (num_tx_in + num_tx_out) * default_fee
  out_amount = 10000
  in_amount = fee + out_amount
  out_amount = out_amount

  # tx in
  ctx_id = CtxId.deserialize(secrets.token_hex(32))
  print(f"ctx_id: {ctx_id}")

  gamma = 100
  spending_key = SpendingKey(12)
  token_id = TokenId()
  out_index = 0
  out_point = OutPoint(ctx_id, out_index)
  tx_in = TxIn(
    in_amount,
    gamma,
    spending_key,
    token_id,
    out_point,
  )
  print(f"tx_in.amount: {tx_in.get_amount()}")
  print(f"tx_in.gamma: {tx_in.get_gamma()}")
  print(f"tx_in.spending_key: {tx_in.get_spending_key()}")
  print(f"tx_in.token_id: {tx_in.get_token_id()}")
  print(f"tx_in.out_point: {tx_in.get_out_point()}")
  print(f"tx_in.staked_commitment: {tx_in.get_staked_commitment()}")
  print(f"tx_in.rbf: {tx_in.get_rbf()}")

  # tx out
  pk1 = PublicKey()
  pk2 = PublicKey()
  dpk = DoublePublicKey.from_public_keys(pk1, pk2)
  sub_addr = SubAddr.from_double_public_key(dpk)

  tx_out = TxOut(
    sub_addr,
    out_amount,
    'test-txout',
  )
  print(f"tx_out.destination: {tx_out.get_destination()}")
  print(f"tx_out.amount: {tx_out.get_amount()}")
  print(f"tx_out.memo: {tx_out.get_memo()}")
  print(f"tx_out.token_id: {tx_out.get_token_id()}")
  print(f"tx_out.min_stake: {tx_out.get_min_stake()}")

  # tx
  ctx = Ctx(
    [tx_in],
    [tx_out],
  )

  ctx_hex = ctx.serialize()
  print(f"ctx_hex: {ctx_hex}")

  ctx2 = Ctx.deserialize(ctx_hex)
  ctx2_hex = ctx2.serialize()
  assert(ctx_hex == ctx2_hex)

  deser_ctx_id = ctx2.get_ctx_id()
  print(f"ctx_id (deser): {deser_ctx_id}")

  ctx_ins = ctx2.get_ctx_ins()
  print(f"# of ctx_ins: {len(ctx_ins)}")

  ctx_outs = ctx2.get_ctx_outs()
  print(f"# of ctx_outs: {len(ctx_outs)}")

  print("<ctx in>")
  for ctx_in in ctx_ins: 
    print(f"prev_out_hash: {ctx_in.get_prev_out_hash()}")
    print(f"prev_out_n: {ctx_in.get_prev_out_n()}")
    print(f"scipt_sig: {ctx_in.get_script_sig()}")
    print(f"sequence: {ctx_in.get_sequence()}")
    print(f"scipt_witness: {ctx_in.get_script_witness()}")

  print(f"<ctx out>")
  for ctx_out in ctx_outs:
    print(f"value: {ctx_out.get_value()}")
    print(f"script_pub_key: {ctx_out.get_script_pub_key()}")
    print(f"token_id: token={ctx_out.get_token_id().token()}, subid={ctx_out.get_token_id().subid()}")

    blsct_data = ctx_out.blsct_data()
    print(f"spending_key: {blsct_data.get_spending_key()}")
    print(f"ephemeral_key: {blsct_data.get_ephemeral_key()}")
    print(f"blinding_key: {blsct_data.get_blinding_key()}")
    print(f"view_tag: {blsct_data.get_view_tag()}")

    rp = blsct_data.get_range_proof()
    print(f"range_proof.A: {rp.get_A().serialize()}")
    print(f"range_proof.A: {rp.get_A_wip().serialize()}")
    print(f"range_proof.B: {rp.get_B().serialize()}")
    print(f"range_Proof.r_prime: {rp.get_r_prime()}")
    print(f"range_proof.s_prime: {rp.get_s_prime()}")
    print(f"range_proof.delta_prime: {rp.get_delta_prime()}")
    print(f"range_proof.alpha_hat: {rp.get_alpha_hat()}")
    print(f"range_proof.tau_x: {rp.get_tau_x()}")

