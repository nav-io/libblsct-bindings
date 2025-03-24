import blsct
from .managed_obj import ManagedObj
from .scalar import Scalar
from typing import Self, override

class PublicKey(ManagedObj):
  def __init__(self, obj):
    super().__init__(obj)

  @staticmethod
  def random() -> Self:
    rv = blsct.gen_random_public_key()
    pk = PublicKey(rv.value)
    blsct.free_obj(rv)
    return pk

  @staticmethod
  def from_scalar(scalar: Scalar) -> Self:
    blsct_pub_key = blsct.scalar_to_pub_key(scalar.value())
    return PublicKey(blsct_pub_key)

  @override
  def value(self):
    return blsct.cast_to_pub_key(self.obj)

  @override
  def default(self) -> Self:
    return PublicKey.random()

