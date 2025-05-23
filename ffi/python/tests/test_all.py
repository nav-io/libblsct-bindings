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
  Tx,
  TxId,
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

  rp1 = RangeProof.build([456], nonce1, 'navcoin', token_id_1)
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
  sig = Signature.generate(priv_key, msg)
  print(f"Signature {sig}")

  pub_key = PublicKey.from_scalar(priv_key)
  is_sig_valid = sig.verify(msg, pub_key)
  print(f"sig verification: {is_sig_valid}")
  assert(is_sig_valid == True)

def test_key_derivation():
  seed = Scalar()
  print(f"Seed: {seed}")

  child_key = ChildKey.from_scalar(seed)
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

  priv_spending_key = PrivSpendingKey.generate(
    blinding_pub_key,
    view_key,
    spending_key,
    account,
    address,
  )
  print(f"priv_spending_key: {priv_spending_key.serialize()}")

  view_tag = ViewTag.generate(blinding_pub_key, view_key)
  print(f"view_tag: {view_tag}")

  spending_pub_key = PublicKey.from_scalar(spending_key)
  print(f"spending_pub_key: {spending_pub_key}")

  hash_id = HashId.generate(
    blinding_pub_key,
    spending_pub_key,
    view_key,
  )
  print(f"hash_id: {hash_id.to_hex()}")

  nonce = PublicKey.generate_nonce(blinding_pub_key, view_key)
  print(f"nonce: {nonce}")

  sub_addr_id = SubAddrId.generate(account, address)
  print(f"sub_addr_id: {sub_addr_id}")

  sub_addr = SubAddr.generate(view_key, spending_pub_key, sub_addr_id)
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
  ChildKey()
  DoublePublicKey()
  PrivSpendingKey()
  PublicKey()
  ViewKey()
  ViewTag()

def test_tx():
  num_tx_in = 1
  num_tx_out = 1
  default_fee = 200000
  fee = (num_tx_in + num_tx_out) * default_fee
  out_amount = 10000
  in_amount = fee + out_amount
  out_amount = out_amount

  # tx in
  tx_id = TxId.deserialize(secrets.token_hex(32))
  print(f"tx_id: {tx_id}")

  gamma = 100
  spending_key = SpendingKey(12)
  token_id = TokenId()
  out_index = 0
  out_point = OutPoint.generate(tx_id, out_index)
  tx_in = TxIn.generate(
    in_amount,
    gamma,
    spending_key,
    token_id,
    out_point,
  )

  # tx out
  pk1 = PublicKey()
  pk2 = PublicKey()
  dpk = DoublePublicKey.from_public_keys(pk1, pk2)
  sub_addr = SubAddr.from_double_public_key(dpk)

  tx_out = TxOut.generate(
    sub_addr,
    out_amount,
    'test-txout',
  )

  # tx
  tx = Tx.generate(
    [tx_in],
    [tx_out],
  )

  tx_hex = tx.serialize()
  print(f"tx_hex: {tx_hex}")

  tx2 = Tx.deserialize(tx_hex)
  tx2_hex = tx2.serialize()
  assert(tx_hex == tx2_hex)

  deser_tx_id = tx2.get_tx_id()
  print(f"tx_id (deser): {deser_tx_id}")

  tx_ins = tx2.get_tx_ins()
  print(f"# of txIns: {len(tx_ins)}")

  tx_outs = tx2.get_tx_outs()
  print(f"# of txOuts: {len(tx_outs)}")

  print("<tx in>")
  for tx_in in tx_ins: 
    print(f"prev_out_hash: {tx_in.get_prev_out_hash()}")
    print(f"prev_out_n: {tx_in.get_prev_out_n()}")
    print(f"scipt_sig: {tx_in.get_script_sig().to_hex()}")
    print(f"sequence: {tx_in.get_sequence()}")
    print(f"scipt_witness: {tx_in.get_script_witness().to_hex()}")

  print(f"<tx out>")
  for tx_out in tx_outs:
    print(f"value: {tx_out.get_value()}")
    print(f"script_pub_key: {tx_out.get_script_pub_key().to_hex()}")
    print(f"token_id: token={tx_out.get_token_id().token()}, subid={tx_out.get_token_id().subid()}")

    print(f"spending_key: {tx_out.get_spending_key()}")
    print(f"ephemeral_key: {tx_out.get_ephemeral_key()}")
    print(f"blinding_key: {tx_out.get_blinding_key()}")
    print(f"view_tag: {tx_out.get_view_tag()}")

    print(f"range_proof.A: {tx_out.get_range_proof_A().serialize()}")
    print(f"range_proof.B: {tx_out.get_range_proof_B().serialize()}")
    print(f"range_Proof.r_prime: {tx_out.get_range_proof_r_prime()}")
    print(f"range_proof.s_prime: {tx_out.get_range_proof_s_prime()}")
    print(f"range_proof.delta_prime: {tx_out.get_range_proof_delta_prime()}")
    print(f"range_proof.alpha_hat: {tx_out.get_range_proof_alpha_hat()}")
    print(f"range_proof.tau_x: {tx_out.get_range_proof_tau_x()}")

