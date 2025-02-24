#!/usr/bin/env python3

import blsct
from lib.address import Address, AddressEncoding
from lib.double_public_key import DoublePublicKey
from lib.key_derivation import ChildKey
from lib.key_derivation import BlindingKey
from lib.key_derivation import TokenKey
from lib.key_derivation import TxKey
from lib.key_derivation import SpendingKey
from lib.key_derivation import ViewKey
from lib.key_derivation import KeyId
from lib.key_derivation import Nonce
from lib.key_derivation import PrivSpendingKey
from lib.key_derivation import SubAddr
from lib.key_derivation import SubAddrId
from lib.key_derivation import ViewTag
from lib.point import Point
from lib.public_key import PublicKey
from lib.range_proof import AmountRecoveryReq, RangeProof
from lib.scalar import Scalar
from lib.signature import Signature
from lib.token_id import TokenId
from lib.tx.out_point import OutPoint
from lib.tx.sub_address import SubAddress
from lib.tx.tx_in import TxIn
from lib.tx.tx_out import TxOut
from lib.tx.tx import Tx

import secrets

blsct.init()

# Scalar
s = Scalar.random()
print(s)
print(f"Scalar({s.to_hex()})")

with Scalar.from_int(1) as one:
  print(one)

# Point
pt = Point.random()
print(pt)

with Point.random() as pt:
  print(pt)

# PublicKey
pk = PublicKey()
print(pk)

with PublicKey.random() as pk:
  print(pk)

# DoublePublicKey
pk1 = PublicKey()
pk2 = PublicKey()
dpk = DoublePublicKey.from_public_keys(pk1, pk2)
print(dpk)

with DoublePublicKey.from_public_keys(PublicKey(), PublicKey()) as dpk:
  print(dpk)

# Address
pk1 = PublicKey()
pk2 = PublicKey()
dpk = DoublePublicKey.from_public_keys(pk1, pk2)

enc_addr = Address.encode(dpk, AddressEncoding.Bech32)
print(f"Address: {enc_addr}")

dec_dpk = Address.decode(enc_addr)
print(f"Decoded Address: {dec_dpk}")

assert enc_addr == Address.encode(dec_dpk, AddressEncoding.Bech32), "Address encoding/decoding not working"

# TokenId
token_id_1 = TokenId.default()
print(token_id_1)

token_id_2 = TokenId.from_token(123)
print(token_id_2)

token_id_3 = TokenId.from_token_and_subid(123, 456)
print(token_id_3)

# RangeProof
nonce1 = Point.random()

token_id = TokenId.default()
rp1 = RangeProof([456], nonce1, 'navcoin', token_id)
#rp2 = RangeProof([123, 456], nonce2, 'rp2')

rp_verify_res1 = RangeProof.verify_proofs([rp1])
print(f"single-amount RangeProof verify: {rp_verify_res1}")

# rp_verify_res2 = RangeProof.verify_proofs([rp2])
# print(f"2-amount RangeProof verify: {rp_verify_res2}")

req = AmountRecoveryReq(rp1, nonce1)
res = RangeProof.recover_amounts([req])
for i, x in enumerate(res):
    print(f"Recovered amount {i}: {x}")

# Signature generation/verification
msg = "navio"
priv_key = Scalar.random()
sig = Signature(priv_key, msg)
print(f"Signature {sig}")

pub_key = PublicKey.from_scalar(priv_key)
is_sig_valid = sig.verify(msg, pub_key)
print(f"sig verification: {is_sig_valid}")

# Key derivation
seed = Scalar.random()
print(f"Seed: {seed}")

child_key = ChildKey(seed)
print(f"ChildKey: {child_key.to_hex()}")

blinding_key = child_key.to_blinding_key()
print(f"BlindingKey: {blinding_key.to_hex()}")

token_key = child_key.to_token_key()
print(f"TokenKey: {token_key.to_hex()}")

tx_key = child_key.to_tx_key()
print(f"TxKey: {tx_key.to_hex()}")

view_key = tx_key.to_view_key()
print(f"ViewKey: {view_key.to_hex()}")

spending_key = tx_key.to_spending_key()
print(f"SpendingKey: {spending_key.to_hex()}")

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
print(f"priv_spending_key: {priv_spending_key.to_hex()}")

view_tag = ViewTag(blinding_pub_key, view_key)
print(f"view_tag: {view_tag}")

spending_pub_key = PublicKey.from_scalar(spending_key)
print(f"spending_pub_key: {spending_pub_key}")

hash_id = KeyId(
  blinding_pub_key,
  spending_pub_key,
  view_key,
)
print(f"hash_id: {hash_id.to_hex()}")

nonce = Nonce(blinding_pub_key, view_key)
print(f"nonce: {nonce}")

sub_addr_id = SubAddrId(account, address)
print(f"sub_addr_id: {sub_addr_id}")

sub_addr = SubAddr(view_key, spending_pub_key, sub_addr_id)
print(f"sub_addr: {sub_addr}")

dpk = DoublePublicKey.from_view_key_spending_pub_key_acct_addr(
  view_key,
  spending_pub_key,
  account,
  address,
)
print(f"dpk: {dpk}")

# Tx related
num_tx_in = 1
num_tx_out = 1
default_fee = 200000
fee = (num_tx_in + num_tx_out) * default_fee
out_amount = 10000
in_amount = fee + out_amount
out_amount = out_amount

# tx in
tx_id = secrets.token_hex(32)
print(f"tx_id: {tx_id}")

gamma = 100
spending_key = Scalar.from_int(12)
token_id = TokenId.default()
out_index = 0
out_point = OutPoint(tx_id, out_index)

tx_in = TxIn.from_fields(
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
sub_addr = SubAddress.from_dpk(dpk)

tx_out = TxOut.from_fields(
  sub_addr,
  out_amount,
  'test-txout',
)

# tx
tx = Tx.from_tx_ins_tx_outs(
  [tx_in],
  [tx_out],
)

tx_hex = tx.serialize()
print(f"tx_hex: {tx_hex}")

tx2 = Tx.deserialize(tx_hex)
tx2_hex = tx2.serialize()
assert(tx_hex == tx2_hex)

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
  print(f"token_id: token={tx_out.get_token_id().get_token()}, subid={tx_out.get_token_id().get_subid()}")
 
  print(f"spending_key: {tx_out.get_spending_key()}")
  print(f"ephemeral_key: {tx_out.get_ephemeral_key()}")
  print(f"blinding_key: {tx_out.get_blinding_key()}")
  print(f"view_tag: {tx_out.get_view_tag()}")

  print(f"range_proof.A: {tx_out.get_range_proof_A().to_hex()}")
  print(f"range_proof.B: {tx_out.get_range_proof_B().to_hex()}")
  print(f"range_Proof.r_prime: {tx_out.get_range_proof_r_prime()}")
  print(f"range_proof.s_prime: {tx_out.get_range_proof_s_prime()}")
  print(f"range_proof.delta_prime: {tx_out.get_range_proof_delta_prime()}")
  print(f"range_proof.alpha_hat: {tx_out.get_range_proof_alpha_hat()}")
  print(f"range_proof.tau_x: {tx_out.get_range_proof_tau_x()}")

