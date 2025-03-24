import blsct
from typing import Any
from ..managed_obj import ManagedObj
from ..scalar import Scalar

class ScalarBasedKey(ManagedObj):
  def __init__(self, scalar: Scalar):
    super().__init__(scalar)

  def cast_to_src_type(self) -> Any:
    return blsct.cast_to_scalar(self.obj)

  def to_hex(self) -> str:
    return blsct.scalar_to_hex(self.cast_to_src_type())

