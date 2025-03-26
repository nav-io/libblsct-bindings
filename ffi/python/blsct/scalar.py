import blsct
from .managed_obj import ManagedObj
from typing import Any, Self, override

class Scalar(ManagedObj):
  @staticmethod
  def random() -> Self:
    rv = blsct.gen_random_scalar()
    scalar = Scalar(rv.value)
    blsct.free_obj(rv)
    return scalar

  @staticmethod
  def from_int(n: int) -> Self:
    rv = blsct.gen_scalar(n)
    scalar = Scalar(rv.value)
    blsct.free_obj(rv)
    return scalar

  def to_hex(self) -> str:
    return blsct.scalar_to_hex(self.value())

  def to_int(self) -> int:
    return  blsct.scalar_to_uint64(self.value())

  @override
  def value(self) -> Any:
    return blsct.cast_to_scalar(self.obj)

  @classmethod
  def default_obj(cls) -> Any:
    rv = blsct.gen_scalar(0)
    return rv.value

