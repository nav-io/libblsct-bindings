import blsct
from .managed_obj import ManagedObj
from .public_key import PublicKey
from typing import Self, override

class DoublePublicKey(ManagedObj):
  def __init__(self, obj):
    super().__init__(obj)

  @staticmethod
  def from_public_keys(pk1: PublicKey, pk2: PublicKey) -> Self:
    rv = blsct.gen_double_pub_key(pk1.value(), pk2.value())
    dpk = DoublePublicKey(rv.value)
    blsct.free_obj(rv)
    return dpk

  @override
  def value(self):
    return blsct.cast_to_dpk(self.obj)

  @override
  def default(self) -> Self:
    pk1 = PublicKey()
    pk2 = PublicKey()
    return DoublePublicKey.from_public_keys(pk1, pk2)
