import blsct
from lib.address import Address, AddressEncoding
from lib.double_public_key import DoublePublicKey
from lib.point import Point
from lib.public_key import PublicKey
from lib.scalar import Scalar

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
