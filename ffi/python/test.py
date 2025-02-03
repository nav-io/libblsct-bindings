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

blsct.init()

# Scalar
s = Scalar.random()
print(s)
print(f"Scalar({s.to_hex()})")

with Scalar(1) as one:
  print(one)

# Point
pt = Point()
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
token_id_1 = TokenId()
print(token_id_1)

token_id_2 = TokenId.from_token(123)
print(token_id_2)

token_id_3 = TokenId.from_token_and_subid(123, 456)
print(token_id_3)

# RangeProof
nonce1 = Point()

token_id = TokenId()
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
