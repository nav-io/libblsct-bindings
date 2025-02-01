import blsct
from lib.address import Address, AddressEncoding
from lib.double_public_key import DoublePublicKey
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
dpk = DoublePublicKey(pk1, pk2)
print(dpk)

with DoublePublicKey(PublicKey(), PublicKey()) as dpk:
  print(dpk)

# Address
pk1 = PublicKey()
pk2 = PublicKey()
dpk = DoublePublicKey(pk1, pk2)

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





