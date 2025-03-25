import blsct
from ..managed_obj import ManagedObj
from typing import Any, Self, override

class ScalarBasedKey(ManagedObj):
  @override
  def value(self) -> Any:
    return blsct.cast_to_scalar(self.obj)

  @override
  def default(self) -> Self:
    name = self.__class__.__name__
    raise NotImplementedError(f"{name}.default()")

  def to_hex(self) -> str:
    return blsct.scalar_to_hex(self.value())

